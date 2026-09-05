const nodemailer = require("nodemailer");
const dns = require("dns");

let transporter = null;
let createPromise = null;

async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!createPromise) {
    createPromise = (async () => {
      const host = process.env.EMAIL_HOST;

      if (!host) {
        throw new Error("EMAIL_HOST environment variable is not set");
      }

      const { address: ipv4Address } = await dns.promises.lookup(host, { family: 4 });

      console.log("SMTP IPv4 resolution:", {
        host,
        resolvedIPv4: ipv4Address,
        port: Number(process.env.EMAIL_PORT) || 587,
      });

      const emailConfig = {
        host: ipv4Address,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        servername: host,
        auth: process.env.EMAIL_USER && process.env.EMAIL_PASS
          ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
          : undefined,
        connectionTimeout: 10000,
        socketTimeout: 10000,
      };

      transporter = nodemailer.createTransport(emailConfig);
      return transporter;
    })().catch((error) => {
      createPromise = null;
      throw error;
    });
  }

  return createPromise;
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || "no-reply@shopease.local";
  const transport = await getTransporter();

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
