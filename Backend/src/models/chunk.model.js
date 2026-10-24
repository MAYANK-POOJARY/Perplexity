import mongoose from "mongoose";

// One small piece of a long document, with its "meaning numbers" (embedding), ready to be searched.
const chunkSchema = new mongoose.Schema({
    attachment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attachment",
        required: true,
        index: true
    },
    index: { type: Number, required: true },   // position inside the document (0 = the beginning)
    page: { type: Number, default: null },     // page number (PDFs only)
    text: { type: String, required: true },
    embedding: { type: Buffer, required: true } // 1024 numbers stored as raw bytes
});

const chunkModel = mongoose.model("chunk", chunkSchema);

export default chunkModel;