import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import { emailHtml, renderVerificationPage } from "../views/auth.view.js";
import config from "../config/config.js";

// httpOnly -> JavaScript in the browser can't read the token (protects against XSS)
// secure   -> only sent over HTTPS in production
// sameSite -> "none" is needed in production when frontend and backend are on different domains
const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, same as the JWT
};

export const userRegisterController = async (req, res) => {
  const { username, password } = req.body;
  const email = req.body.email.toLowerCase();

  // finding if the user is present based on their email or username
  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User with this email or username already exists.",
      success: false,
      err: "User already exists",
    });
  }

  // putting the data of the user onto the database
  const user = await userModel.create({ username, email, password });

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    config.JWT_SECRET,
    { expiresIn: "1d" },
  );

  // sending email to the given email address
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Perplexity!",
      html: emailHtml({ username, emailVerificationToken }),
    });
  } catch (error) {
    // if the email can't be sent, remove the account so the user can simply try again
    await userModel.findByIdAndDelete(user._id);
    console.error("Verification email failed:", error);

    return res.status(500).json({
      message: "We couldn't send the verification email. Please try again.",
      success: false,
      err: "Email delivery failed",
    });
  }

  res.status(201).json({
    message: "User registered successfully.",
    success: true,
    user: {
      user_id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

export const userLoginController = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  // checking if the user exists in the db
  const user = await userModel.findOne({ email }).select("+password");

  const invalidCredentials = () =>
    res.status(400).json({
      message: "Invalid email or password",
      success: false,
      err: "Invalid credentials",
    });

  if (!user) return invalidCredentials();

  // checking if the passwords match
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) return invalidCredentials();

  // checking if the user is verified before using the services
  if (!user.verified) {
    return res.status(403).json({
      message:
        "Please verify your email before logging in. Check your inbox for the link.",
      success: false,
      err: "Email not verified",
    });
  }

  // creating a token containing the user data
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // setting the token in the cookies
  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    message: "Login Successful",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

export const userLogoutController = (req, res) => {
  // clearCookie must use the same options (except maxAge) that were used to set it
  const { maxAge, ...clearOptions } = cookieOptions;
  res.clearCookie("token", clearOptions);

  return res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
};

export const getMeController = async (req, res) => {
  const userId = req.user.id;

  // checking if the user is present in the db
  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }

  res.status(200).json({
    message: "User details fetched successfully",
    success: true,
    user,
  });
};

export async function verifyEmail(req, res) {
  // extracting the parameters sent in the url
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).send(
        renderVerificationPage({
          eyebrow: "Verification failed",
          title: "Account not found.",
          message:
            "We couldn't find an account for this link. Please register again.",
          icon: "!",
        }),
      );
    }

    if (user.verified === true) {
      return res.send(
        renderVerificationPage({
          eyebrow: "Account already active",
          title: "You’re already verified.",
          message:
            "Your email address has already been confirmed. You can continue straight to your Perplexity account.",
          icon: "✓",
        }),
      );
    }

    user.verified = true;

    await user.save();

    return res.send(
      renderVerificationPage({
        eyebrow: "Email confirmed",
        title: "You’re all set.",
        message:
          "Your email has been verified successfully. Your Perplexity workspace is ready when you are.",
        icon: "✓",
      }),
    );
  } catch (err) {
    return res.status(400).send(
      renderVerificationPage({
        eyebrow: "Verification failed",
        title: "Link invalid or expired.",
        message:
          "This verification link is no longer valid. Please register again to get a new one.",
        icon: "!",
      }),
    );
  }
}
