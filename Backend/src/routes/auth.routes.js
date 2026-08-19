import { Router } from "express";
import { getMeController, userLoginController, userRegisterController, verifyEmail } from "../controllers/auth.controllers.js";
import { loginValidator, registerValidator } from "../validator/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";


const authRouter = Router();

// register route -- {username, email, password}
authRouter.post("/register", registerValidator, userRegisterController);

// login route -- {email, password}
authRouter.post("/login", loginValidator, userLoginController);

// getme route to get user data
authRouter.get('/get-me', authUser ,getMeController);

// for email verification
authRouter.get('/verify-email', verifyEmail)

export default authRouter