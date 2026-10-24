import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authUser } from "../middleware/auth.middleware.js";
import { deleteChat, getChats, getMessages } from "../controllers/chat.controllers.js";
import { uploadFiles } from "../middleware/upload.middleware.js";
import { uploadAttachments, getAttachmentFile, deleteUnsentAttachment } from "../controllers/attachment.controllers.js";
import { attachmentIdValidator, chatIdValidator } from "../validator/chat.validator.js";

const chatRouter = Router();

// Uploads cost storage, document-reading time and AI calls: at most 10 upload requests per user every 10 minutes.
// It is placed BEFORE the file handling, so a refused request does no work at all.
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  message: {
    success: false,
    message: "You're uploading too fast. Please wait a few minutes and try again.",
  },
});


chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, chatIdValidator, getMessages);

chatRouter.delete("/delete/:chatId", authUser, chatIdValidator, deleteChat);

chatRouter.post("/attachments", authUser, uploadLimiter, uploadFiles, uploadAttachments);

chatRouter.get("/attachments/:id", authUser, attachmentIdValidator, getAttachmentFile);

chatRouter.delete("/attachments/:id", authUser, attachmentIdValidator, deleteUnsentAttachment);

export default chatRouter;
