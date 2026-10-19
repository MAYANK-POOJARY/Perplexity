import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authUser } from "../middleware/auth.middleware.js";
import {
  deleteChat,
  getChats,
  getMessages,
  sendMessage,
} from "../controllers/chat.controllers.js";

const chatRouter = Router();

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  message: {
    success: false,
    message: "You're sending messages too fast. Please slow down.",
  },
});

chatRouter.post("/message", authUser, messageLimiter, sendMessage);

chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, getMessages);

chatRouter.delete("/delete/:chatId", authUser, deleteChat);

export default chatRouter;
