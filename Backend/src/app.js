import express from "express";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import cookiePaser from 'cookie-parser'
import morgan from 'morgan'
import cors from "cors"

const app = express();

app.use(express.json());
app.use(cookiePaser());
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}))



app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);


export default app;