import { generateChatTitle, generateResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js"

export async function sendMessage(req,res){
    const { message, chatId } = req.body;

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            message: "Message is required"
        })
    }

    let chat;

    if (chatId) {
        chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        })

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            })
        }
    } else {
        const title = await generateChatTitle(message);
        chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    const userMessage = await messageModel.create({
        chat: chat._id,
        content: message.trim(),
        role: "user"
    }) 
    
    const messages = await messageModel.find({ chat: chat._id })

    const response = await generateResponse(messages);

    const aiMessage = await messageModel.create({
        chat: chat._id,
        content: response,
        role: "ai"
    }) 
    chat.updatedAt = new Date();
    await chat.save();


    res.status(200).json({
        message: "Message sent successfully",
        title: chat.title,
        chat,
        userMessage,
        aiMessage
    })
}



export async function getChats(req, res){
    const user = req.user;
    const chats = await chatModel.find({user: user.id});

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}


export async function getMessages(req, res){
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if(!chat){
        return res.status(404).json({
            message:"Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}


export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    await messageModel.deleteMany({
        chat: chatId
    })

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}