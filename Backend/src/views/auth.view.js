
export function emailHtml({username, emailVerificationToken}){
    return `
            <div style="margin:0;padding:32px 16px;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#17202a;">
                <div style="max-width:520px;margin:0 auto;padding:36px 32px;background:#ffffff;border:1px solid #e4eaf1;border-radius:12px;">
                    <p style="margin:0 0 28px;color:#17202a;font-size:20px;font-weight:700;">perplexity<span style="color:#3d9bea;">.</span></p>
                    <h1 style="margin:0;color:#17202a;font-size:26px;font-weight:700;line-height:1.25;">Verify your email</h1>
                    <p style="margin:16px 0 0;color:#667587;font-size:15px;line-height:1.6;">Hi ${username}, thanks for creating your Perplexity account. Please confirm your email address to continue.</p>
                    <p style="margin:28px 0;text-align:center;">
                        <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}" style="display:inline-block;padding:13px 22px;border-radius:8px;background:#3d9bea;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Verify email</a>
                    </p>
                    <p style="margin:0;color:#9aa6b2;font-size:12px;line-height:1.5;">If you did not create this account, you can ignore this email.</p>
                </div>
            </div>
            `
} 

export function renderVerificationPage({eyebrow, title, message, icon}){
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Perplexity</title>
    <style>
        :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; color: #f3f7ff; background: radial-gradient(circle at 50% 0, #163763 0, #07111f 52%, #040a12 100%); }
        main { width: min(100%, 560px); position: relative; overflow: hidden; padding: 48px 42px 42px; border: 1px solid rgba(116, 173, 255, .2); border-radius: 24px; background: rgba(10, 24, 42, .92); box-shadow: 0 24px 70px rgba(0, 0, 0, .35); text-align: center; }
        main::before { content: ""; position: absolute; width: 220px; height: 220px; top: -130px; right: -80px; border-radius: 50%; background: rgba(48, 139, 255, .2); }
        .brand { position: relative; margin-bottom: 42px; color: #f3f7ff; font-size: 18px; font-weight: 800; letter-spacing: -.4px; }
        .brand span { display: inline-block; width: 9px; height: 9px; margin-right: 7px; border-radius: 50%; background: #47a8ff; box-shadow: 0 0 16px rgba(71, 168, 255, .75); vertical-align: 2px; }
        .icon { position: relative; display: grid; place-items: center; width: 76px; height: 76px; margin: 0 auto 28px; border: 8px solid rgba(71, 168, 255, .14); border-radius: 50%; color: #63b7ff; background: rgba(25, 91, 165, .25); box-shadow: 0 0 32px rgba(36, 132, 235, .18); font-size: 34px; font-weight: 700; }
        .eyebrow { display: block; width: 100%; margin: 0 auto 12px; color: #76baff; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-align: center; text-transform: uppercase; }
        h1 { margin: 0; color: #f3f7ff; font-size: clamp(30px, 6vw, 42px); line-height: 1.08; letter-spacing: -1.5px; }
        p { max-width: 410px; margin: 18px auto 30px; color: #a8b9ce; font-size: 16px; line-height: 1.65; }
        a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px; border-radius: 12px; color: #061321; background: #66b9ff; font-size: 14px; font-weight: 750; text-decoration: none; transition: transform .2s ease, background .2s ease; }
        a:hover { transform: translateY(-2px); background: #91ceff; }
        small { display: block; margin-top: 30px; color: #71859d; font-size: 12px; }
        @media (max-width: 480px) { main { padding: 36px 24px 30px; border-radius: 20px; } .brand { margin-bottom: 34px; } }
    </style>
</head>
<body>
    <main>
        <div class="brand"><span></span>perplexity</div>
        <div class="icon" aria-hidden="true">${icon}</div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="http://localhost:5173/login">Continue to Perplexity <span aria-hidden="true">&nbsp;→</span></a>
        <small>You can safely close this window after continuing.</small>
    </main>
</body>
</html>`;
}