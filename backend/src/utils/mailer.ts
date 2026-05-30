import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromAddress = process.env.SMTP_FROM || "no-reply@example.com";

if (!smtpHost || !smtpUser) {
  // don't throw here; allow the app to run but mailer will fail at send time
  console.warn("SMTP not fully configured; email sending may fail");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
});

export const sendMail = async (to: string, subject: string, html: string, text?: string) => {
  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
    text,
  });
  return info;
};
