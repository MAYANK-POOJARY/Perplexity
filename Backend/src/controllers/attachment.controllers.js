import crypto from "crypto";
import mongoose from "mongoose";
import { PDFParse } from "pdf-parse";
import attachmentModel from "../models/attachment.model.js";
import chunkModel from "../models/chunk.model.js";
import { IMAGE_TYPES, PDF_TYPE } from "../middleware/upload.middleware.js";
import { uploadToImageKit, deleteFromImageKit, getSignedUrl } from "../services/imagekit.service.js";
import { chunkPages, embedTexts, vectorToBuffer } from "../services/rag.service.js";

const MAX_FULL_TEXT_CHARS = 30000;   // a document up to this size is given to the AI whole. Longer ones are searched.
const MAX_PDF_PAGES = 300;           // the most pages we read from one PDF
const MAX_CHUNKS = 1000;             // the most pieces we index from one document

const IMAGE_EXTENSIONS = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
};

// the first bytes of a real image file are fixed, so we can check the file is what it claims to be
function looksLikeImage(buffer, mimeType) {
    const hex = buffer.subarray(0, 12).toString("hex");
    const ascii = buffer.subarray(0, 12).toString("latin1");
    if (mimeType === "image/png") return hex.startsWith("89504e47");
    if (mimeType === "image/jpeg") return hex.startsWith("ffd8ff");
    if (mimeType === "image/gif") return ascii.startsWith("GIF8");
    if (mimeType === "image/webp") return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
    return false;
}

// reads a PDF page by page: [{ num, text }]
async function readPdfPages(buffer, name) {
    // every real PDF starts with "%PDF-"
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        throw new Error(`"${name}" is not a valid PDF`);
    }

    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    let result;
    try {
        result = await parser.getText({ first: MAX_PDF_PAGES });
    } catch (error) {
        console.error("PDF read failed:", error);
        throw new Error(`"${name}" could not be read. It may be damaged or password-protected`);
    } finally {
        await parser.destroy().catch(() => {});
    }

    const pages = Array.isArray(result.pages) && result.pages.length
        ? result.pages.map((page, i) => ({ num: page.num ?? i + 1, text: page.text ?? "" }))
        : [{ num: null, text: result.text ?? "" }];

    const note = result.total > MAX_PDF_PAGES
        ? `Only the first ${MAX_PDF_PAGES} of ${result.total} pages were read`
        : "";

    return { pages, note };
}

// Reads a text file or PDF and decides how the AI will use it:
//   short  -> mode "full":   the whole text is kept and given to the AI directly
//   long   -> mode "search": cut into pieces, each piece turned into numbers (an "embedding")
async function prepareDocument(file, isPdf) {
    let pages;
    let note = "";

    if (isPdf) {
        ({ pages, note } = await readPdfPages(file.buffer, file.originalname));
    } else {
        if (file.buffer.includes(0)) {   // a zero byte means binary data, not text
            throw new Error(`"${file.originalname}" does not look like a text file`);
        }
        pages = [{ num: null, text: file.buffer.toString("utf8") }];
    }

    const fullText = pages.map((page) => page.text).join("\n\n").trim();

    if (!fullText) {
        throw new Error(
            isPdf
                ? `"${file.originalname}" has no readable text. It may be a scan made of pictures`
                : `"${file.originalname}" is empty`
        );
    }

    if (fullText.length <= MAX_FULL_TEXT_CHARS) {
        return { mode: "full", text: fullText, note, chunks: [] };
    }

    // long document: build the searchable pieces
    let chunks = chunkPages(pages);

    if (chunks.length > MAX_CHUNKS) {
        chunks = chunks.slice(0, MAX_CHUNKS);
        const lastPage = chunks[chunks.length - 1].page;
        note = lastPage
            ? `Only the first ${lastPage} pages could be searched`
            : "Only the first part of this file could be searched";
    }

    const vectors = await embedTexts(chunks.map((chunk) => chunk.text));
    chunks.forEach((chunk, i) => {
        chunk.embedding = vectorToBuffer(vectors[i]);
    });

    return { mode: "search", text: "", note, chunks };
}

// what the browser is allowed to know about an attachment (never the ImageKit ids or the text)
export function toPublicAttachment(attachment) {
    return {
        id: attachment._id,
        name: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        kind: attachment.kind,
    };
}

export async function uploadAttachments(req, res) {
    const files = req.files || [];

    if (files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded", success: false });
    }

    // 1) check and read EVERY file before anything is uploaded
    let prepared;
    try {
        prepared = await Promise.all(files.map(async (file) => {
            const isImage = IMAGE_TYPES.includes(file.mimetype);
            const isPdf = file.mimetype === PDF_TYPE;

            let doc = { mode: "full", text: "", note: "", chunks: [] };

            if (isImage) {
                if (!looksLikeImage(file.buffer, file.mimetype)) {
                    throw new Error(`"${file.originalname}" is not a valid ${file.mimetype} image`);
                }
            } else {
                doc = await prepareDocument(file, isPdf);
            }

            // Images and PDFs keep their real extension, so ImageKit serves them as what they are.
            // Other text files are always stored as .txt, so a browser shows them as plain text
            // and an uploaded .html file can never run as a web page.
            const extension = isImage ? IMAGE_EXTENSIONS[file.mimetype] : isPdf ? ".pdf" : ".txt";

            return { file, isImage, doc, storedName: `${crypto.randomUUID()}${extension}` };
        }));
    } catch (error) {
        return res.status(error.httpStatus || 400).json({ message: error.message, success: false });
    }

    // 2) send them to ImageKit and save a record (and the searchable pieces) for each
    const uploadedFileIds = [];
    const savedIds = [];

    try {
        const saved = [];

        for (const item of prepared) {
            const { fileId, filePath } = await uploadToImageKit(item.file.buffer, item.storedName);
            uploadedFileIds.push(fileId);

            const attachment = await attachmentModel.create({
                user: req.user.id,
                originalName: item.file.originalname,
                fileId,
                filePath,
                mimeType: item.file.mimetype,
                size: item.file.size,
                kind: item.isImage ? "image" : "document",
                mode: item.doc.mode,
                text: item.doc.text,
                note: item.doc.note,
            });
            savedIds.push(attachment._id);
            saved.push(attachment);

            if (item.doc.chunks.length) {
                await chunkModel.insertMany(
                    item.doc.chunks.map((chunk) => ({
                        attachment: attachment._id,
                        index: chunk.index,
                        page: chunk.page,
                        text: chunk.text,
                        embedding: chunk.embedding,
                    }))
                );
            }
        }

        return res.status(201).json({ attachments: saved.map(toPublicAttachment) });
    } catch (error) {
        console.error("Upload failed:", error);

        // all or nothing: undo what already went through
        await Promise.all(uploadedFileIds.map(deleteFromImageKit));
        await chunkModel.deleteMany({ attachment: { $in: savedIds } });
        await attachmentModel.deleteMany({ _id: { $in: savedIds } });

        return res.status(502).json({ message: "Could not store the file. Please try again.", success: false });
    }
}

// GET /api/chats/attachments/:id
// Only the owner gets a link. The browser is sent to a signed ImageKit link that works for 5 minutes.
export async function getAttachmentFile(req, res) {
    const { id } = req.params;

    const attachment = mongoose.isValidObjectId(id)
        ? await attachmentModel.findOne({ _id: id, user: req.user.id })
        : null;

    if (!attachment || !attachment.filePath) {
        return res.status(404).json({ message: "File not found", success: false });
    }

    res.set("Cache-Control", "private, no-store");              // never reuse an old (expired) link
    res.set("Cross-Origin-Resource-Policy", "cross-origin");    // lets the frontend (another port) show images
    res.redirect(getSignedUrl(attachment.filePath));
}

// Removes the stored file (ImageKit) and the searchable pieces of attachments.
// The database records themselves are removed by the caller.
export async function removeAttachmentFiles(attachments) {
    await Promise.all(
        attachments.filter((attachment) => attachment.fileId).map((attachment) => deleteFromImageKit(attachment.fileId))
    );
    await chunkModel.deleteMany({ attachment: { $in: attachments.map((attachment) => attachment._id) } });
}

// DELETE /api/chats/attachments/:id
// The user took a file out of the input box before sending. Only files that were NOT sent can be removed this way.
export async function deleteUnsentAttachment(req, res) {
    const { id } = req.params;

    // one atomic step: find it AND delete it, but only if it is yours and still unsent.
    // If the message is being sent at this very moment, this finds nothing and the file stays.
    const attachment = mongoose.isValidObjectId(id)
        ? await attachmentModel.findOneAndDelete({ _id: id, user: req.user.id, message: null })
        : null;

    if (!attachment) {
        return res.status(404).json({ message: "File not found, or it was already sent", success: false });
    }

    await removeAttachmentFiles([attachment]);
    return res.status(200).json({ success: true });
}

// used when a chat is deleted: remove the files from ImageKit and their records from the database
export async function deleteAttachmentsOfMessages(messageIds) {
    const attachments = await attachmentModel.find({ message: { $in: messageIds } });

    await removeAttachmentFiles(attachments);
    await attachmentModel.deleteMany({ _id: { $in: attachments.map((attachment) => attachment._id) } });
}