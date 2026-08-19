import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookiePaser from 'cookie-parser'

const app = express();

app.use(express.json())
app.use(cookiePaser())


app.use("/api/auth", authRouter)


export default app;