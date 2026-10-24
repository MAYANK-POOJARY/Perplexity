import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    originalName: { type: String, required: true },   // what the user called the file
    fileId: { type: String, required: true },         // ImageKit's id for the file (needed to delete it)
    filePath: { type: String, required: true },       // where the file lives inside ImageKit (needed to open it)
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    kind: { type: String, enum: ["image", "document"], required: true },
    // "full"   = short document: its whole text is stored in `text` and given to the AI directly
    // "search" = long document: cut into pieces (see the chunk model) and the AI only gets the pieces that match the question
    mode: { type: String, enum: ["full", "search"], default: "full" },
    text: { type: String, default: "" },
    note: { type: String, default: "" },              // e.g. "Only the first 300 of 450 pages were read"
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
        default: null                                  // stays null until the message is actually sent
    }
}, { timestamps: true });

const attachmentModel = mongoose.model("attachment", attachmentSchema);

export default attachmentModel;