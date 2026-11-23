import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getMeController,
  userLoginController,
  userRegisterController,
  userLogoutController,
  verifyEmail,
  googleCallbackController,
} from "../controllers/auth.controllers.js";
import {
  loginValidator,
  registerValidator,
} from "../validator/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";
import passport from "passport";
import config from "../config/config.js";

const authRouter = Router();

// max 20 login/register attempts per IP every 15 minutes (slows brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

// register route -- {username, email, password}
authRouter.post("/register", authLimiter, registerValidator, userRegisterController);

// login route -- {email, password}
authRouter.post("/login", authLimiter, loginValidator, userLoginController);

// logout route -- clears the auth cookie
authRouter.post("/logout", userLogoutController);

// getme route to get user data
authRouter.get("/get-me", authUser, getMeController);

// for email verification
authRouter.get("/verify-email", verifyEmail);

// starts the Google flow: sends the browser to Google's consent screen
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

// Google sends the user back here
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.CLIENT_URL}/login?error=google`,
  }),
  googleCallbackController,
);

export default authRouter;
