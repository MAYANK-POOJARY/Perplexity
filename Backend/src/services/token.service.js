import jwt from "jsonwebtoken";
import config from "../config/config.js";

// moved here from auth.controllers.js
export const cookieOptions = {
  httpOnly: true,
  secure: config.IS_PRODUCTION,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, same as the JWT
};

// creates the JWT and puts it in the "token" cookie
export function setAuthCookie(res, user) {
  const token = jwt.sign(
    { id: user._id, username: user.username },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("token", token, cookieOptions);
}