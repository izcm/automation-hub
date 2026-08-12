import nodemailer from "nodemailer";

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

const config = getEmailConfig();

const sender = nodemailer.createTransport({
  host: config.host,
  port: 465,
  secure: false,
  auth: {
    user: config.user,
    pass: config.pass,
  },
});

type SendEmailArgs = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailArgs) {
  await sender.sendMail({
    from: "SoftwareHouse <varsling@softwarehouse.no>",
    to,
    subject,
    text,
    html,
  });
}
