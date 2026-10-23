import { generateChatTitle, streamResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js"
import mongoose from "mongoose";
import attachmentModel from "../models/attachment.model.js";
import { MAX_FILES } from "../middleware/upload.middleware.js";
import { toPublicAttachment, deleteAttachmentsOfMessages } from "./attachment.controllers.js";


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

    const messages = await messageModel
        .find({ chat: chatId })
        .sort({ createdAt: 1 })
        .populate("attachments")

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages.map((message) => ({
            ...message.toObject(),
            attachments: message.attachments.map(toPublicAttachment),   // only safe fields go to the browser
        }))
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

    const messageIds = await messageModel.distinct("_id", { chat: chatId })
    await deleteAttachmentsOfMessages(messageIds)

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

// how many past messages the AI gets to see. Older ones stay in the database, the AI just doesn't read them.
const MAX_HISTORY_MESSAGES = 20;

async function getRecentMessages(chatId, excludeId) {
    const filter = { chat: chatId };
    if (excludeId) filter._id = { $ne: excludeId };   // regenerate: don't show the AI its own old answer

    // newest first, take 20, then flip back into normal order
    const recent = await messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(MAX_HISTORY_MESSAGES)
        .populate("attachments");   // the AI needs the files (text / image links) of each message
    recent.reverse();

    // the window may start in the middle of a conversation. Some AI providers dislike a
    // conversation that begins with the AI talking, so drop leading AI messages.
    while (recent.length && recent[0].role === "ai") recent.shift();

    return recent;
}

// turns a technical error into a message a user can understand
function userFacingError(error) {
    if (error?.status === 429) {
        const seconds = Number(error.headers?.get?.("retry-after")) || 30;
        return `The AI service is busy right now (usage limit reached). Please try again in about ${seconds} seconds.`;
    }
    return "Something went wrong while generating the response. Please try again.";
}

export async function streamMessage(socket, { message, chatId, tempId, regenerate, attachmentIds = [] } = {}) {
    const userId = socket.data.user.id;   // set by the login check from Step 1
    let chat;
    let fullText = "";
    let previousAnswerId = null;   // regenerate: the old answer that the new one will replace
    let savedMessage = null;
    const sources = [];   // links found by web searches, shown as cards under the answer

    // one helper to report any problem to the browser
    const fail = (text) =>
        socket.emit("chat:error", { tempId, chatId: chat?._id ?? chatId, message: text });

    if (!regenerate && (typeof message !== "string" || !message.trim())) return fail("Message is required");
    if (regenerate && !chatId) return fail("Chat not found");
    if (
        !Array.isArray(attachmentIds) ||
        attachmentIds.length > MAX_FILES ||
        !attachmentIds.every((id) => mongoose.isValidObjectId(id))
    ) return fail("Invalid attachments");
    if (isRateLimited(userId)) return fail("You're sending messages too fast. Please slow down.");

    // if the browser disconnects mid-answer, stop the AI call instead of wasting tokens
    const controller = new AbortController();
    const onDisconnect = () => controller.abort();
    socket.once("disconnect", onDisconnect);
    socket.data.abortController = controller;   // so "chat:stop" can find it

    // Saves the answer. When regenerating, the old answer is removed only AFTER the new one is stored,
    // so a failure can never leave the chat without any answer.
    const saveAnswer = async () => {
        if (savedMessage) return savedMessage;   // never save twice
        savedMessage = await messageModel.create({
            chat: chat._id,
            content: fullText,
            role: "ai",
            sources,
        });
        if (previousAnswerId) await messageModel.deleteOne({ _id: previousAnswerId });
        await chatModel.updateOne({ _id: chat._id }, { $set: { updatedAt: new Date() } });
        return savedMessage;
    };

    try {
        // check the attachments FIRST, so a bad request can't leave an empty new chat behind
        let attachments = [];
        if (!regenerate && attachmentIds.length) {
            attachments = await attachmentModel.find({
                _id: { $in: attachmentIds },
                user: userId,       // only your own files
                message: null,      // that were not sent before
            });
            if (attachments.length !== new Set(attachmentIds.map(String)).size) {
                return fail("Some attachments were not found or were already used");
            }
        }

        // find the existing chat, or create a new one
        if (chatId) {
            chat = await chatModel.findOne({ _id: chatId, user: userId });
            if (!chat) return fail("Chat not found");
        } else {
            chat = await chatModel.create({ user: userId });   // title defaults to "New Chat"
        }

        if (regenerate) {
            // the newest message must be an AI answer. We remember it but do NOT delete it yet.
            const last = await messageModel.findOne({ chat: chat._id }).sort({ createdAt: -1 });
            if (!last || last.role !== "ai") return fail("Nothing to regenerate");
            previousAnswerId = last._id;
        } else {
            const userMessage = await messageModel.create({
                chat: chat._id,
                content: message.trim(),
                role: "user",
                attachments: attachments.map((a) => a._id),
            });

            // mark the files as used by this message
            if (attachments.length) {
                await attachmentModel.updateMany(
                    { _id: { $in: attachments.map((a) => a._id) } },
                    { message: userMessage._id }
                );
            }

            // 1) tell the browser: "your message is saved, here are the real ids"
            socket.emit("chat:created", {
                tempId,
                chat,
                userMessage: {
                    ...userMessage.toObject(),
                    attachments: attachments.map(toPublicAttachment),
                },
            });

            // 2) new chat? generate the title IN PARALLEL so it doesn't delay the answer
            if (!chatId) {
                generateChatTitle(message)
                    .then(async (title) => {
                        await chatModel.updateOne({ _id: chat._id }, { title });
                        socket.emit("chat:title", { chatId: chat._id, title });
                    })
                    .catch((err) => console.error("Title generation failed:", err));
            }
        }

        // 3) stream the answer: each piece is sent to the browser immediately
        const messages = await getRecentMessages(chat._id, previousAnswerId);

        await streamResponse(
            messages,
            (token) => {
                fullText += token;
                socket.emit("chat:token", { chatId: chat._id, token });
            },
            controller.signal,
            (found) => {
                // keep each link once, even if the AI searches twice
                for (const source of found) {
                    if (!sources.some((s) => s.url === source.url)) sources.push(source);
                }
                socket.emit("chat:sources", { chatId: chat._id, sources });
            }
        );

        if (!fullText.trim()) throw new Error("The AI returned an empty response");

        // 4) the full answer is known now, so save it in MongoDB
        const aiMessage = await saveAnswer();

        socket.emit("chat:done", { tempId, chatId: chat._id, aiMessage });
    } catch (error) {
        const stopped = controller.signal.aborted;   // Stop button or closed tab
        if (!stopped) console.error("Streaming failed:", error);

        // keep whatever was written, even if the answer ended early (Stop, closed tab or an error)
        if (chat && fullText.trim()) {
            try {
                await saveAnswer();
            } catch (saveError) {
                console.error("Saving the partial answer failed:", saveError);
            }
        }

        if (stopped) {
            socket.emit("chat:stopped", { tempId });   // does nothing if the browser is gone
        } else {
            fail(userFacingError(error));
        }
    } finally {
        socket.off("disconnect", onDisconnect);   // clean up the listener
        if (socket.data.abortController === controller) socket.data.abortController = null;
    }
}