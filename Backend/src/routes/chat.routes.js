import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { deleteChat, getChats, getMessages } from "../controllers/chat.controllers.js";

const chatRouter = Router();


chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, getMessages);

chatRouter.delete("/delete/:chatId", authUser, deleteChat);

export default chatRouter;
