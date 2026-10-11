import { generateChatTitle, generateResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js"

export async function sendMessage(req,res){
    const {message, chatId} = req.body;

    let title = null, chat = null;

    if(!chatId){
        title = await generateChatTitle(message);
        chat = await chatModel.create({
        user: req.user.id,
        title
    })
    }

    const currentChatId = chatId || chat._id;
    

    const userMessage = await messageModel.create({
        chat: currentChatId,
        content: message,
        role: "user"
    }) 

    console.log(chat);
    console.log(chatId)
    
    const messages = await messageModel.find({chat: currentChatId})

    const response = await generateResponse(messages);

    const aiMessage = await messageModel.create({
        chat: currentChatId,
        content: response,
        role: "ai"
    }) 


    res.status(200).json({
        title,
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

    const chat = await chatModel.find({
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

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}