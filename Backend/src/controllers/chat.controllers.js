import { generateChatTitle, streamResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js"


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

// all the new things 

// ---------------------------------------------------------------------------
// STREAMING VERSION (used by Socket.IO instead of the REST route above)
// ---------------------------------------------------------------------------

// Sockets skip express-rate-limit, so we keep a small limiter here: 20 messages / minute / user
const rateBuckets = new Map();

function isRateLimited(userId) {
    const now = Date.now();
    const recent = (rateBuckets.get(userId) || []).filter((t) => now - t < 60 * 1000);
    const limited = recent.length >= 20;
    if (!limited) recent.push(now);
    rateBuckets.set(userId, recent);
    return limited;
}

export async function streamMessage(socket, { message, chatId, tempId } = {}) {
    const userId = socket.data.user.id;   // set by the login check from Step 1
    let chat;
    let fullText = "";

    // one helper to report any problem to the browser
    const fail = (text) =>
        socket.emit("chat:error", { tempId, chatId: chat?._id ?? chatId, message: text });

    if (typeof message !== "string" || !message.trim()) return fail("Message is required");
    if (isRateLimited(userId)) return fail("You're sending messages too fast. Please slow down.");

    // if the browser disconnects mid-answer, stop the AI call instead of wasting tokens
    const controller = new AbortController();
    const onDisconnect = () => controller.abort();
    socket.once("disconnect", onDisconnect);

    try {
        // find the existing chat, or create a new one
        if (chatId) {
            chat = await chatModel.findOne({ _id: chatId, user: userId });
            if (!chat) return fail("Chat not found");
        } else {
            chat = await chatModel.create({ user: userId });   // title defaults to "New Chat"
        }

        const userMessage = await messageModel.create({
            chat: chat._id,
            content: message.trim(),
            role: "user",
        });

        // 1) tell the browser: "your message is saved, here are the real ids"
        socket.emit("chat:created", { tempId, chat, userMessage });

        // 2) new chat? generate the title IN PARALLEL so it doesn't delay the answer
        if (!chatId) {
            generateChatTitle(message)
                .then(async (title) => {
                    await chatModel.updateOne({ _id: chat._id }, { title });
                    socket.emit("chat:title", { chatId: chat._id, title });
                })
                .catch((err) => console.error("Title generation failed:", err));
        }

        // 3) stream the answer: each piece is sent to the browser immediately
        const messages = await messageModel.find({ chat: chat._id }).sort({ createdAt: 1 });

        await streamResponse(
            messages,
            (token) => {
                fullText += token;
                socket.emit("chat:token", { chatId: chat._id, token });
            },
            controller.signal
        );

        if (!fullText.trim()) throw new Error("The AI returned an empty response");

        // 4) the full answer is known now, so save it in MongoDB
        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: fullText,
            role: "ai",
        });
        await chatModel.updateOne({ _id: chat._id }, { $set: { updatedAt: new Date() } });

        socket.emit("chat:done", { tempId, chatId: chat._id, aiMessage });
    } catch (error) {
        if (controller.signal.aborted) {
            // the user left: keep whatever was generated so far
            if (chat && fullText.trim()) {
                await messageModel.create({ chat: chat._id, content: fullText, role: "ai" });
            }
            return;
        }
        console.error("Streaming failed:", error);
        fail("Something went wrong while generating the response. Please try again.");
    } finally {
        socket.off("disconnect", onDisconnect);   // clean up the listener
    }
}