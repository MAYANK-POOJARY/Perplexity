import express from "express";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import cookiePaser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import path from "path"
import config from "./config/config.js";
import passport from "./config/passport.js";

const app = express();

// Files stored in ImageKit are shown with <img>, so the browser must be allowed to load images from there.
let imageKitOrigin = null;
try {
  imageKitOrigin = new URL(config.IMAGEKIT_URL_ENDPOINT).origin;
} catch {
  // not a valid URL: images from ImageKit just won't be allowed
}

app.use(helmet({
   contentSecurityPolicy: {
      // helmet's normal rules (scripts only from our own server, ...) plus the things this app really uses:
      directives: {
        "img-src": ["'self'", "data:", ...(imageKitOrigin ? [imageKitOrigin] : [])],
        "connect-src": ["'self'", "ws:", "wss:"],   // Socket.IO (WebSocket) connection to our own server
        // "upgrade-insecure-requests" would break plain http://localhost, so it is only used in production
        "upgrade-insecure-requests": config.IS_PRODUCTION ? [] : null,
      },
    }
}));
app.use(express.json());
app.use(cookiePaser());
app.use(morgan("dev"));
app.use(cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

app.use(express.static("public"));
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve("public", "index.html"));
});

export default app;