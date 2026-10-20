import { io } from "socket.io-client";

let socket;

export const initializeSocketConnection = () => {
    if (!socket) {
        socket = io("http://localhost:3000", {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });
    }

    return socket;
};