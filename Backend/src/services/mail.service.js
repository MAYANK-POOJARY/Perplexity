import nodemailer from "nodemailer";
import config from "../config/config.js";

// Why not SMTP? Hosts like Render's free plan block the SMTP ports (25, 465, 587).
// The Gmail API is a normal HTTPS request (port 443), so it works everywhere. We only reuse the same
// Google credentials you already have (client id, client secret, refresh token).

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const REQUEST_TIMEOUT_MS = 15000;

// Nodemailer is only used to BUILD the email text (headers, HTML, encoding of special characters).
// It does not send anything: this transport just returns the finished message.
const messageBuilder = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });

// The access token is a short-lived (about 1 hour) pass that we get in exchange for the refresh token.
// We keep it in memory and reuse it, so we don't ask Google for a new one on every email.
let cachedToken = null; // { value, expiresAt }

async function getAccessToken() {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 60 * 1000) return cachedToken.value;

    const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: config.GOOGLE_CLIENT_ID,
            client_secret: config.GOOGLE_CLIENT_SECRET,
            refresh_token: config.GOOGLE_REFRESH_TOKEN,
            grant_type: "refresh_token",
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.access_token) {
        // "invalid_grant" is what Google answers when the refresh token expired or was revoked
        const hint = data.error === "invalid_grant"
            ? " The refresh token is expired or revoked: create a new GOOGLE_REFRESH_TOKEN."
            : "";
        throw new Error(`Google token request failed (${response.status} ${data.error || "unknown"}).${hint}`);
    }

    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
    return cachedToken.value;
}

export async function initializeMailService() {
    try {
        await getAccessToken();
        console.log("Email service is ready to send mail.");
    } catch (error) {
        console.error("Email service is not ready to send mail:", error.message);
    }
}

export async function sendEmail({ to, subject, html, text }) {
    // 1) build the complete email text
    const built = await messageBuilder.sendMail({
        from: `Perplexity <${config.GOOGLE_USER}>`,
        to,
        subject,
        html,
        text,
    });

    // The Gmail API wants the whole message as "base64url" text (base64 with - and _ instead of + and /)
    const raw = built.message.toString("base64url");

    // 2) send it
    const response = await fetch(SEND_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) cachedToken = null; // the saved token was refused: ask for a fresh one next time
        throw new Error(`Gmail send failed (${response.status}): ${data.error?.message || "unknown error"}`);
    }

    console.log("Email sent, Gmail message id:", data.id);
}