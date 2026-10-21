import { io } from "socket.io-client";
import { API_URL } from "../../../lib/env";

let socket;

export const initializeSocketConnection = () => {
    if (!socket) {
        socket = io(API_URL, {
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