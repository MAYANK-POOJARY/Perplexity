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
    text: { type: String, default: "" },              // documents: the extracted text the AI will read
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
        default: null                                  // stays null until the message is actually sent
    }
}, { timestamps: true });

const attachmentModel = mongoose.model("attachment", attachmentSchema);

export default attachmentModel;