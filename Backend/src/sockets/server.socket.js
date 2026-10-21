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
        socket.on("chat:send", (payload) => streamMessage(socket, payload))
        socket.on("chat:stop", () => socket.data.abortController?.abort())

        socket.on("disconnect", () => {
            console.log("A user disconnected: " + socket.id)
        })
    })
}
