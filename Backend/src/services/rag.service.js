import { CohereEmbeddings } from "@langchain/cohere";
import config from "../config/config.js";
import messageModel from "../models/message.model.js";
import attachmentModel from "../models/attachment.model.js";
import chunkModel from "../models/chunk.model.js";

// Which embedding model turns text into numbers. It must stay the SAME for every document and every question.
// Use "embed-multilingual-v3.0" if your documents are not in English.
const EMBEDDING_MODEL = "embed-english-v3.0";

const embeddings = new CohereEmbeddings({
    apiKey: config.COHERE_API_KEY,
    model: EMBEDDING_MODEL,
    batchSize: 96,       // the most texts Cohere accepts in one request
    maxConcurrency: 2,   // don't send every batch at once (free keys have rate limits)
    maxRetries: 5,
});

export const CHUNK_SIZE = 1200;     // characters per piece (roughly one or two paragraphs)
export const CHUNK_OVERLAP = 150;   // each piece repeats the end of the previous one, so a sentence is never lost at the cut

// Cuts one long text into pieces of about `size` characters.
// We try to cut at a paragraph, then a line, then a sentence, then a space, so pieces don't end mid-word.
export function splitIntoChunks(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const clean = text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!clean) return [];

    const chunks = [];
    let start = 0;

    while (start < clean.length) {
        let end = Math.min(start + size, clean.length);

        if (end < clean.length) {
            // look for a natural place to cut in the last 30% of this piece
            const searchFrom = start + Math.floor(size * 0.7);
            const window = clean.slice(searchFrom, end);
            for (const separator of ["\n\n", "\n", ". ", " "]) {
                const position = window.lastIndexOf(separator);
                if (position !== -1) {
                    end = searchFrom + position + separator.length;
                    break;
                }
            }
        }

        const piece = clean.slice(start, end).trim();
        if (piece) chunks.push(piece);

        if (end >= clean.length) break;
        start = Math.max(end - overlap, start + 1);   // step back a little (overlap), but always move forward
    }

    return chunks;
}

// pages: [{ num, text }]  ->  [{ index, page, text }]  (every piece remembers which page it came from)
export function chunkPages(pages) {
    const chunks = [];

    for (const page of pages) {
        for (const text of splitIntoChunks(page.text)) {
            chunks.push({ page: page.num, text });
        }
    }

    chunks.forEach((chunk, index) => {
        chunk.index = index;
    });

    return chunks;
}

// text -> numbers (one list of numbers per text). Throws an error that is safe to show to the user.
export async function embedTexts(texts) {
    try {
        return await embeddings.embedDocuments(texts);
    } catch (error) {
        console.error("Embedding failed:", error);

        const status = error?.status ?? error?.statusCode;
        const busy = status === 429 || String(error?.message).includes("429");

        const friendly = new Error(
            busy
                ? "The document service is busy right now. Please try again in a minute."
                : "Could not process this document right now. Please try again."
        );
        friendly.httpStatus = 503;
        throw friendly;
    }
}

// A list of 1024 numbers takes 4 KB as a Float32 Buffer, about a third of storing it as a normal array in MongoDB.
export function vectorToBuffer(vector) {
    return Buffer.from(new Float32Array(vector).buffer);
}

export function bufferToVector(buffer) {
    // copy first: a Buffer read from the database may not start at a "4-byte aligned" position
    return new Float32Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

// 1 = same meaning, 0 = unrelated
export function cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// ---------------------------------------------------------------------------
// SEARCH: used when a question is asked in a chat that has long documents attached
// ---------------------------------------------------------------------------

const TOP_K = 6;                  // how many best-matching pieces to give the AI
const INTRO_CHUNKS = 2;           // plus the first pieces of every document (title, summary, contents)
const MIN_SCORE = 0.3;            // below this the question is not about the documents, so the AI gets no excerpts
const MAX_CONTEXT_CHARS = 10000;  // most text we hand to the AI as "excerpts"

// Chooses the pieces to show the AI and writes them as one block of text ("" when nothing matches).
//   documents:    [{ _id, originalName, note }]
//   scoredChunks: [{ chunk: { _id, attachment, index, page, text }, score }]  (every piece of those documents)
export function buildExcerptContext(documents, scoredChunks) {
    const ranked = [...scoredChunks].sort((a, b) => b.score - a.score);

    // nothing matches: the question is not about these documents, so show nothing
    if (ranked.length === 0 || ranked[0].score < MIN_SCORE) return "";

    // priority 1: the best matches. priority 2: the beginning of each document
    const candidates = [
        ...ranked.slice(0, TOP_K).filter((item) => item.score >= MIN_SCORE),
        ...ranked.filter((item) => item.chunk.index < INTRO_CHUNKS),
    ];

    const chosen = new Map();   // a Map, so the same piece is never added twice
    let used = 0;
    for (const { chunk } of candidates) {
        const id = String(chunk._id);
        if (chosen.has(id) || used + chunk.text.length > MAX_CONTEXT_CHARS) continue;
        chosen.set(id, chunk);
        used += chunk.text.length;
    }

    // write them in reading order: document by document, start to end
    const documentOrder = new Map(documents.map((doc, i) => [String(doc._id), i]));
    const documentById = new Map(documents.map((doc) => [String(doc._id), doc]));

    const pieces = [...chosen.values()].sort(
        (a, b) =>
            documentOrder.get(String(a.attachment)) - documentOrder.get(String(b.attachment)) ||
            a.index - b.index
    );

    const notes = documents
        .filter((doc) => doc.note && pieces.some((chunk) => String(chunk.attachment) === String(doc._id)))
        .map((doc) => `Note about ${doc.originalName}: ${doc.note}.`);

    const body = pieces
        .map((chunk) => {
            const doc = documentById.get(String(chunk.attachment));
            const where = chunk.page ? `${doc.originalName}, page ${chunk.page}` : doc.originalName;
            return `(${where})\n${chunk.text}`;
        })
        .join("\n\n");

    // the example shows the AI exactly how to write a source
    const firstDoc = documentById.get(String(pieces[0].attachment));
    const example = pieces.some((chunk) => chunk.page) ? `${firstDoc.originalName}, page N` : firstDoc.originalName;

    return [
        "[Excerpts from the attached documents. These are only the parts that best match the question, not the whole documents.]",
        ...notes,
        "",
        body,
        `[End of excerpts. Whenever you use something from them, put its source right after it, like (${example}). Do this even if the user did not ask for page numbers.]`,
    ].join("\n");
}

// Finds the parts of the long documents in this chat that match the question.
// Returns "" when the chat has no long documents (and then makes no embedding call at all).
export async function findRelevantExcerpts(chatId, question) {
    // 1) which long documents were attached anywhere in this chat?
    const messageIds = await messageModel.distinct("_id", { chat: chatId });
    const documents = await attachmentModel
        .find({ message: { $in: messageIds }, mode: "search" })
        .select("originalName note")
        .sort({ createdAt: 1 });

    if (documents.length === 0) return "";

    // 2) the question as numbers
    const queryVector = await embeddings.embedQuery(question);

    // 3) compare it with every piece of those documents
    const chunks = await chunkModel.find({ attachment: { $in: documents.map((doc) => doc._id) } });
    const scored = chunks.map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryVector, bufferToVector(chunk.embedding)),
    }));

    // for tuning: shows the question and its best scores. Remove the // while you calibrate, put it back afterwards.
    // console.log(`Document search for "${question.slice(0, 60)}" -> best scores:`, scored.map((s) => s.score).sort((a, b) => b - a).slice(0, 5).map((n) => n.toFixed(2)).join(" "));

    return buildExcerptContext(documents, scored);
}