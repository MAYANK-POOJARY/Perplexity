import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat",
        required: true
    },
    content:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:["user", "ai"],
        required: true
    },
    sources: [{
        _id: false,        // we don't need a separate id for each link
        title: String,
        url: String
    }],
    attachments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "attachment"
    }]
},{
    timestamps: true
})

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;