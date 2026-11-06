import config from "../config/config.js";

// Dark palette (same values as the :root.dark theme)
const C = {
    canvas: "#0b0d13",
    surface: "#12141f",
    border: "#1e2330",
    text: "#f1f5f9",
    muted: "#94a3b8",
    primary: "#6366f1",
    primaryHover: "#4f46e5",
    primaryText: "#ffffff",
};

// Escape user-provided values before putting them inside HTML
const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export function emailHtml({ username, emailVerificationToken }) {
    const verifyUrl = `${config.SERVER_URL}/api/auth/verify-email?token=${encodeURIComponent(emailVerificationToken)}`;

    return `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background:${C.canvas};">
    <div bgcolor="${C.canvas}" style="margin:0;padding:32px 16px;background:${C.canvas};font-family:Arial,Helvetica,sans-serif;color:${C.text};">
        <div bgcolor="${C.surface}" style="max-width:520px;margin:0 auto;padding:36px 32px;background:${C.surface};border:1px solid ${C.border};border-radius:12px;">
            <p style="margin:0 0 28px;color:${C.text};font-size:20px;font-weight:700;">perplexity<span style="color:${C.primary};">.</span></p>
            <h1 style="margin:0;color:${C.text};font-size:26px;font-weight:700;line-height:1.25;">Verify your email</h1>
            <p style="margin:16px 0 0;color:${C.muted};font-size:15px;line-height:1.6;">Hi ${escapeHtml(username)}, thanks for creating your Perplexity account. Please confirm your email address to continue.</p>
            <p style="margin:28px 0;text-align:center;">
                <a href="${verifyUrl}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:${C.primary};color:${C.primaryText};font-size:14px;font-weight:700;text-decoration:none;">Verify email</a>
            </p>
            <p style="margin:0;color:${C.muted};font-size:12px;line-height:1.5;opacity:0.8;">If you did not create this account, you can ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
}

export function renderVerificationPage({ eyebrow, title, message, icon }) {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Perplexity</title>
    <style>
        :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; color: ${C.text}; background: ${C.canvas}; }
        main { width: min(100%, 560px); position: relative; overflow: hidden; padding: 48px 42px 42px; border: 1px solid ${C.border}; border-radius: 24px; background: ${C.surface}; box-shadow: 0 24px 70px rgba(0, 0, 0, .45); text-align: center; }
        main::before { content: ""; position: absolute; width: 220px; height: 220px; top: -130px; right: -80px; border-radius: 50%; background: rgba(99, 102, 241, .15); }
        .brand { position: relative; margin-bottom: 42px; color: ${C.text}; font-size: 18px; font-weight: 800; letter-spacing: -.4px; }
        .brand span { display: inline-block; width: 9px; height: 9px; margin-right: 7px; border-radius: 50%; background: ${C.primary}; box-shadow: 0 0 16px rgba(99, 102, 241, .75); vertical-align: 2px; }
        .icon { position: relative; display: grid; place-items: center; width: 76px; height: 76px; margin: 0 auto 28px; border: 8px solid rgba(99, 102, 241, .14); border-radius: 50%; color: ${C.primary}; background: rgba(99, 102, 241, .15); box-shadow: 0 0 32px rgba(99, 102, 241, .18); font-size: 34px; font-weight: 700; }
        .eyebrow { display: block; width: 100%; margin: 0 auto 12px; color: ${C.primary}; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-align: center; text-transform: uppercase; }
        h1 { margin: 0; color: ${C.text}; font-size: clamp(30px, 6vw, 42px); line-height: 1.08; letter-spacing: -1.5px; }
        p { max-width: 410px; margin: 18px auto 30px; color: ${C.muted}; font-size: 16px; line-height: 1.65; }
        a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px; border-radius: 12px; color: ${C.primaryText}; background: ${C.primary}; font-size: 14px; font-weight: 750; text-decoration: none; transition: transform .2s ease, background .2s ease; }
        a:hover { transform: translateY(-2px); background: ${C.primaryHover}; }
        small { display: block; margin-top: 30px; color: ${C.muted}; opacity: .7; font-size: 12px; }
        @media (max-width: 480px) { main { padding: 36px 24px 30px; border-radius: 20px; } .brand { margin-bottom: 34px; } }
    </style>
</head>
<body>
    <main>
        <div class="brand"><span></span>Perplexity</div>
        <div class="icon" aria-hidden="true">${icon}</div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="${config.CLIENT_URL}/login">Continue to Perplexity <span aria-hidden="true">&nbsp;→</span></a>
        <small>You can safely close this window after continuing.</small>
    </main>
</body>
</html>`;
}