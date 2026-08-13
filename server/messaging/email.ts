import nodemailer from "nodemailer";
import { MessageRequest } from "./types";

function getEmailConfig() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Email config missing");
  }

  return {
    host,
    user,
    pass,
  };
}

let sender: nodemailer.Transporter | undefined;

// built on first send, not at import — a missing config fails the send
// (caught upstream), instead of crashing every module that imports this
function getSender() {
  if (!sender) {
    const config = getEmailConfig();
    sender = nodemailer.createTransport({
      host: config.host,
      port: 465,
      secure: true,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
  return sender;
}

export async function sendEmail({ to, subject, text, html }: MessageRequest) {
  await getSender().sendMail({
    from: "SoftwareHouse <varsling@softwarehouse.no>",
    to,
    subject,
    text,
    html,
  });
}
