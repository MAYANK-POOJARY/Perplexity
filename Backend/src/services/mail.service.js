import nodemailer from "nodemailer";
import config from "../config/config.js";

// creating a transporter for sending the mail
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        type: "OAuth2",
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    }
})

transporter.verify()
    .then(() => console.log("The transporter is ready to send emails"))
    .catch((err) => console.error("Email transporter verification failed", err))


export async function sendEmail({to, subject, html, text}){
    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    const details = await transporter.sendMail(mailOptions);
    console.log("Email sent:", details)
}