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

// returns the existing connection (or undefined if not connected yet)
export const getSocket = () => socket;

// call this on logout so the next login doesn't reuse the old user's connection
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = undefined;
    }
};  