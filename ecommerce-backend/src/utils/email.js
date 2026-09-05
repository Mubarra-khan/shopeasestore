const nodemailer = require("nodemailer");

const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    : undefined,
  connectionTimeout: 10000,
  socketTimeout: 10000,
};

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || "no-reply@shopease.local";
  const transport = getTransporter();

  const result = await transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  console.log("Password reset email SMTP result:", {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
    response: result.response,
  });
}

module.exports = { sendEmail };
