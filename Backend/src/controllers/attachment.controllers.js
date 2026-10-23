import crypto from "crypto";
import mongoose from "mongoose";
import { PDFParse } from "pdf-parse";
import attachmentModel from "../models/attachment.model.js";
import { IMAGE_TYPES, PDF_TYPE } from "../middleware/upload.middleware.js";
import { uploadToImageKit, deleteFromImageKit, getSignedUrl } from "../services/imagekit.service.js";

const MAX_TEXT_CHARS = 30000;   // the AI reads at most this much of one document
const MAX_PDF_PAGES = 30;       // we only read the first pages of a PDF

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

// cuts long text and TELLS the AI it was cut, so it doesn't pretend it read everything
function limitText(text) {
    if (text.length <= MAX_TEXT_CHARS) return text;
    return text.slice(0, MAX_TEXT_CHARS) + "\n\n[The rest of this file was cut off because it is too long]";
}

// reads the text out of a PDF
async function readPdfText(buffer, name) {
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

    let text = (result.text ?? "").trim();
    if (!text) {
        throw new Error(`"${name}" has no readable text. It may be a scan made of pictures`);
    }
    if (result.total > MAX_PDF_PAGES) {
        text += `\n\n[Only the first ${MAX_PDF_PAGES} of ${result.total} pages were read]`;
    }
    return text;
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

    // 1) check EVERY file before anything is uploaded
    let prepared;
    try {
        prepared = await Promise.all(files.map(async (file) => {
            const isImage = IMAGE_TYPES.includes(file.mimetype);
            const isPdf = file.mimetype === PDF_TYPE;
            let text = "";

            if (isImage) {
                if (!looksLikeImage(file.buffer, file.mimetype)) {
                    throw new Error(`"${file.originalname}" is not a valid ${file.mimetype} image`);
                }
            } else if (isPdf) {
                text = limitText(await readPdfText(file.buffer, file.originalname));
            } else {
                if (file.buffer.includes(0)) {   // a zero byte means binary data, not text
                    throw new Error(`"${file.originalname}" does not look like a text file`);
                }
                text = limitText(file.buffer.toString("utf8"));
            }

            // Images and PDFs keep their real extension, so ImageKit serves them as what they are.
            // Other text files are always stored as .txt, so a browser shows them as plain text
            // and an uploaded .html file can never run as a web page.
            const extension = isImage ? IMAGE_EXTENSIONS[file.mimetype] : isPdf ? ".pdf" : ".txt";

            return { file, isImage, text, storedName: `${crypto.randomUUID()}${extension}` };
        }));
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }

    // 2) send them to ImageKit and save a record for each
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
                text: item.text,
            });
            savedIds.push(attachment._id);
            saved.push(attachment);
        }

        return res.status(201).json({ attachments: saved.map(toPublicAttachment) });
    } catch (error) {
        console.error("Upload failed:", error);

        // all or nothing: undo what already went through
        await Promise.all(uploadedFileIds.map(deleteFromImageKit));
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

// used when a chat is deleted: remove the files from ImageKit and their records from the database
export async function deleteAttachmentsOfMessages(messageIds) {
    const attachments = await attachmentModel.find({ message: { $in: messageIds } });

    await Promise.all(attachments.map((attachment) => deleteFromImageKit(attachment.fileId)));
    await attachmentModel.deleteMany({ _id: { $in: attachments.map((a) => a._id) } });
}