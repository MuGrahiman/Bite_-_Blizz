/**
 * Email Service
 * Nodemailer wrapper with HTML templates
 */

const nodemailer = require("nodemailer");
const env = require("../config/env");

// Create transporter (assumes mailer.config exists or configure here)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.mailerMail,
    pass: env.mailerToken,
  },
});

// Verify transporter on startup
transporter.verify((err) => {
  if (err) {
    console.error("Email transporter failed:", err.message);
  } else {
    console.log("Email transporter ready");
  }
});

// Base email template
const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #e74c3c; margin: 0; font-size: 28px; }
    .content { margin-bottom: 30px; }
    .button { display: inline-block; padding: 14px 28px; background: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #c0392b; }
    .footer { text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px; border-top: 1px solid #ecf0f1; padding-top: 20px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; color: #856404; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍳 Cooking Blog</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent from Cooking Blog. If you didn't request this, please ignore it.</p>
      <p>© ${new Date().getFullYear()} Cooking Blog. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${env.baseUrl}/verify-email?token=${token}`;
  console.log("🚀 ~ sendVerificationEmail ~ verifyUrl:", verifyUrl)

  const html = baseTemplate(
    "Verify Your Email",
    `
    <h2>Welcome, ${name}!</h2>
    <p>Thank you for joining Cooking Blog. Please verify your email address to get started.</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
    </div>
    <div class="warning">
      <strong>⏰ This link expires in 24 hours.</strong>
    </div>
    <p>Or copy and paste this link:</p>
    <p style="word-break: break-all; color: #3498db;">${verifyUrl}</p>
    `
  );

  await transporter.sendMail({
    from: `"Cooking Blog" <${env.mailerMail}>`,
    to: email,
    subject: "Verify Your Cooking Blog Account",
    html,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${env.baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log("🚀 ~ sendPasswordResetEmail ~ resetUrl:", resetUrl)

  const html = baseTemplate(
    "Reset Your Password",
    `
    <h2>Hello, ${name}</h2>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <div class="warning">
      <strong>⏰ This link expires in 1 hour.</strong><br>
      If you didn't request this, ignore this email. Your password won't change.
    </div>
    <p>Or copy and paste this link:</p>
    <p style="word-break: break-all; color: #3498db;">${resetUrl}</p>
    `
  );

  await transporter.sendMail({
    from: `"Cooking Blog" <${env.mailerMail}>`,
    to: email,
    subject: "Password Reset Request",
    html,
  });
};

// Generic send mail (wrapper for your existing usage)
const sendMail = async (email, subject, html) => {
  await transporter.sendMail({
    from: `"Cooking Blog" <${env.mailerMail}>`,
    to: email,
    subject,
    html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMail,
};