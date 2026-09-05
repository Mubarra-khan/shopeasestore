async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || "no-reply@shopease.local";

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const payload = {
    from,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Password reset email delivery failed:", {
      provider: "resend",
      status: response.status,
      error: result.message || result,
    });
    throw new Error(result.message || `Resend API error: ${response.status}`);
  }

  console.log("Password reset email SMTP result:", {
    provider: "resend",
    messageId: result.id,
    status: response.status,
  });
}

module.exports = { sendEmail };
