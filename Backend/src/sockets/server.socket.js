import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import config from "../config/config.js";
import { streamMessage } from "../controllers/chat.controllers.js";


export function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: config.CLIENT_URL,
            credentials: true,
        }
    })

    console.log("Socket.io server is RUNNING")

    // Runs once per connection, BEFORE "connection" fires.
    // Calling next() accepts the connection; next(new Error(...)) rejects it.
    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");

            if (!cookies.token) return next(new Error("Unauthorized"));

            // same check as your auth.middleware.js
            socket.data.user = jwt.verify(cookies.token, config.JWT_SECRET);
            next();
        } catch (error) {
            next(new Error("Unauthorized"));
        }
    })

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id + " (" + socket.data.user.username + ")");

        // the browser says "chat:send" -> we stream the answer back as "chat:token" events
        socket.on("chat:send", (payload) => {
            // the browser is not trusted: the payload must be a plain object ({ message, chatId, ... })
            if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
                return socket.emit("chat:error", { message: "Invalid request" });
            }

            // streamMessage is async. Socket.IO does not wait for it or catch its errors,
            // so any error we forget to handle must be caught HERE or it can crash the whole server.
            streamMessage(socket, payload).catch((error) => {
                console.error("chat:send failed unexpectedly:", error);
                socket.emit("chat:error", {
                    tempId: payload.tempId,
                    chatId: payload.chatId,
                    message: "Something went wrong while generating the response. Please try again.",
                });
            });
        })
        
        socket.on("chat:stop", () => socket.data.abortController?.abort())

        socket.on("disconnect", () => {
            console.log("A user disconnected: " + socket.id)
        })
    })
}
