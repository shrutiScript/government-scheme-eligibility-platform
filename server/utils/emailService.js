import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

/**
 * Creates and configures the Nodemailer SMTP transporter.
 * Supports Gmail (with 16-character App Password) and custom SMTP servers.
 */
export const createEmailTransporter = () => {
  const service = process.env.EMAIL_SERVICE;
  const host = process.env.EMAIL_HOST || (service === 'gmail' ? 'smtp.gmail.com' : undefined);
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const isSecure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('\n[Email Service Warning] ⚠️ EMAIL_USER or EMAIL_PASSWORD is not set in server/.env.');
    console.warn('[Email Service Warning] Real email delivery requires valid credentials (e.g. Gmail App Password).\n');
  }

  const transportConfig = {
    auth: {
      user: user || '',
      pass: pass ? pass.replace(/\s+/g, '') : '' // Strip whitespace from 16-char app passwords
    },
    tls: {
      rejectUnauthorized: false // Avoid local certificate rejection
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  };

  if (service && service.toLowerCase() === 'gmail' && (!host || host.includes('gmail'))) {
    transportConfig.service = 'gmail';
  } else {
    transportConfig.host = host || 'smtp.gmail.com';
    transportConfig.port = port;
    transportConfig.secure = isSecure;
  }

  return nodemailer.createTransport(transportConfig);
};

/**
 * Verifies SMTP connection health on startup or test.
 */
export const verifyEmailConnection = async () => {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (!user || !pass) {
      return {
        configured: false,
        message: 'EMAIL_USER or EMAIL_PASSWORD not set in server/.env'
      };
    }

    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log(`[Email Service] ✅ SMTP Connection verified successfully for: ${user}`);
    return { configured: true, message: 'SMTP connection verified successfully' };
  } catch (error) {
    console.error('[Email Service] ❌ SMTP Connection verification failed:', error.message);
    return { configured: false, error: error.message };
  }
};

/**
 * Sends Password Reset OTP Verification Email
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.otp - 6-digit numeric OTP
 * @param {string} [params.userName] - Recipient name (optional)
 * @param {number} [params.expiryMinutes=10] - Expiry time in minutes
 * @returns {Promise<Object>} info
 */
export const sendPasswordResetOtpEmail = async ({
  to,
  otp,
  userName = 'User',
  expiryMinutes = 10
}) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  const fromAddress = process.env.EMAIL_FROM || (user ? `SchemeSetu Portal <${user}>` : 'SchemeSetu Portal <no-reply@schemesetu.gov.in>');

  if (!user || !pass) {
    const errMsg = 'Email delivery failed: EMAIL_USER and EMAIL_PASSWORD (App Password) must be configured in server/.env.';
    console.error(`[Email Service Error] ❌ ${errMsg}`);
    throw new Error(errMsg);
  }

  const transporter = createEmailTransporter();

  // Plain Text Version (As strictly required by User specification)
  const textContent = `Hello,

Your password reset verification code is:

${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not request a password reset, please ignore this email.

Regards,
SchemeSetu Team`;

  // HTML Version (Styled with SchemeSetu theme for modern email clients)
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SchemeSetu Password Reset Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="520px" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0c2338; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Scheme<span style="color: #e07a10;">Setu</span>
              </h1>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Government Scheme Eligibility Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 700;">
                Password Reset Verification Code
              </h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 13px; line-height: 1.6;">
                Hello${userName && userName !== 'User' ? ` <strong>${userName}</strong>` : ''},
              </p>
              <p style="margin: 0 0 24px; color: #475569; font-size: 13px; line-height: 1.6;">
                We received a request to reset your password for your <strong>SchemeSetu</strong> account. Use the verification code below to complete the reset process:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #0c2338; border-radius: 12px; padding: 16px 36px; text-align: center;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #0c2338; letter-spacing: 8px;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning Banner -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; color: #b45309; font-size: 12px; font-weight: 600;">
                  ⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>.
                </p>
              </div>

              <p style="margin: 20px 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized activity.
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

              <p style="margin: 0; color: #334155; font-size: 13px; font-weight: 600;">
                Regards,<br />
                <span style="color: #0c2338;">SchemeSetu Team</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  console.log(`[Email Service] 📧 Attempting to send password reset OTP to: ${to}`);

  const mailOptions = {
    from: fromAddress,
    to: to.trim().toLowerCase(),
    subject: 'SchemeSetu Password Reset Verification Code',
    text: textContent,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] ✅ Verification email delivered successfully to ${to}! Message ID: ${info.messageId}`);
  return info;
};

export default {
  createEmailTransporter,
  verifyEmailConnection,
  sendPasswordResetOtpEmail
};
