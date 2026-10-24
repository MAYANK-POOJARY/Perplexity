import { param } from "express-validator";
import { validate } from "./auth.validator.js";   // the same "if something is wrong, answer 400" helper the auth routes use
import { MAX_FILES } from "../middleware/upload.middleware.js";

export const MAX_MESSAGE_LENGTH = 4000;   // characters in one message

// a real MongoDB id: exactly 24 characters, 0-9 and a-f
const isId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

// ---- for normal HTTP routes: checks the ":chatId" / ":id" part of the address ----

export const chatIdValidator = [
    param("chatId").isMongoId().withMessage("Invalid chat id"),
    validate,
];

export const attachmentIdValidator = [
    param("id").isMongoId().withMessage("Invalid file id"),
    validate,
];

// ---- for the socket: checks what the browser sends with "chat:send" ----
// (express-validator only works on HTTP requests, so this one is a plain function)
// Returns a message to show the user, or null when everything is fine.
export function validateSendPayload({ message, chatId, regenerate, attachmentIds }) {
    if (chatId != null && !isId(chatId)) return "Chat not found";

    if (regenerate) {
        if (!chatId) return "Chat not found";
    } else {
        if (typeof message !== "string" || !message.trim()) return "Message is required";
        if (message.trim().length > MAX_MESSAGE_LENGTH) {
            return `Message is too long (the limit is ${MAX_MESSAGE_LENGTH} characters)`;
        }
    }

    if (!Array.isArray(attachmentIds) || attachmentIds.length > MAX_FILES || !attachmentIds.every(isId)) {
        return "Invalid attachments";
    }

    return null;
}