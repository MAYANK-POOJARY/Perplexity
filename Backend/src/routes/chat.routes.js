import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { deleteChat, getChats, getMessages } from "../controllers/chat.controllers.js";
import { uploadFiles } from "../middleware/upload.middleware.js";
import { uploadAttachments, getAttachmentFile } from "../controllers/attachment.controllers.js";

const chatRouter = Router();


chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, getMessages);

chatRouter.delete("/delete/:chatId", authUser, deleteChat);

chatRouter.post("/attachments", authUser, uploadFiles, uploadAttachments);

chatRouter.get("/attachments/:id", authUser, getAttachmentFile);

export default chatRouter;
