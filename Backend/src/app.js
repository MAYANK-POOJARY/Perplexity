import express from "express";
import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import cookiePaser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import config from "./config/config.js";

const app = express();

// On Render, requests reach us through a proxy. Trust ONE proxy so that req.ip is the visitor's real address
// (the rate limiters count per IP) and so req.secure is correct. Only in production: locally there is no proxy.
if (config.IS_PRODUCTION) app.set("trust proxy", 1);

// Files stored in ImageKit are shown with <img>, so the browser must be allowed to load images from there.
let imageKitOrigin = null;
try {
  imageKitOrigin = new URL(config.IMAGEKIT_URL_ENDPOINT).origin;
} catch {
  // not a valid URL: images from ImageKit just won't be allowed
}

app.use(
  helmet({
    contentSecurityPolicy: {
      // helmet's normal rules (scripts only from our own server, ...) plus the things this app really uses:
      directives: {
        "img-src": ["'self'", "data:", ...(imageKitOrigin ? [imageKitOrigin] : [])],
        "connect-src": ["'self'", "ws:", "wss:"],   // Socket.IO (WebSocket) connection to our own server
        // "upgrade-insecure-requests" would break plain http://localhost, so it is only used in production
        "upgrade-insecure-requests": config.IS_PRODUCTION ? [] : null,
      },
    },
  }),
);
app.use(express.json());
app.use(cookiePaser());
app.use(morgan("dev"));
app.use(
  cors({
    // the frontend address from the environment (not hard-coded). In production the frontend is served
    // by this same server, so browsers don't need CORS at all; this is for `npm run dev` (port 5173).
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// 1) no route matched: answer in JSON like the rest of the API (Express would send an HTML page)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", success: false });
});

// 2) error handler: runs when ANY route throws or rejects (Express 5 forwards async errors here).
// It must be the LAST app.use(), and it must have exactly 4 parameters.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  // two users registering the same email/username at the same moment: the unique index rejects the second one
  if (err.code === 11000) {
    return res.status(409).json({
      message: "User with this email or username already exists.",
      success: false,
    });
  }

  // err.expose is true only for errors that are safe to show (e.g. "invalid JSON body" -> 400)
  const status = err.expose && err.status ? err.status : 500;
  if (status === 500) console.error("Unhandled error:", err);

  res.status(status).json({
    message: status === 500 ? "Something went wrong on our side. Please try again." : err.message,
    success: false,
  });
});

export default app;