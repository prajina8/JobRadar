import nodemailer from "nodemailer";

let cachedTransporter;

function getTransporter() {
  if (cachedTransporter !== undefined) return cachedTransporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    cachedTransporter = null;
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    secure: Number(EMAIL_PORT) === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });

  return cachedTransporter;
}

export async function sendOtpEmail(to, otp) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@smartjob.local";

  const subject = "Your SmartJob password reset code";
  const text = `Your SmartJob password reset code is ${otp}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:420px;margin:auto;">
      <h2 style="color:#542746;">SmartJob password reset</h2>
      <p>Use this code to reset your password. It expires in 10 minutes.</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#542746;">${otp}</p>
      <p style="color:#686168;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  if (!transporter) {
    
    console.warn(
      `EMAIL_HOST/EMAIL_USER/EMAIL_PASS not set — printing OTP instead of emailing it.\n` +
        `Password reset code for ${to}: ${otp}`
    );
    return { delivered: false };
  }

  await transporter.sendMail({ from, to, subject, text, html });
  return { delivered: true };
}