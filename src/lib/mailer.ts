import { Resend } from 'resend';

/**
 * Mailer abstraction for sending authentication emails
 * Provider-agnostic interface for email verification and password reset
 * 
 * Currently uses Resend (as per research.md recommendation)
 * Can be swapped for SendGrid or SMTP without changing call sites
 */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@solarmatch.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a generic email
 * @param options - Email options (to, subject, html)
 * @returns Promise resolving to success status
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn('[Mailer] RESEND_API_KEY not configured. Email would be sent to:', options.to);
    console.log('[Mailer] Subject:', options.subject);
    console.log('[Mailer] Preview:', options.html.substring(0, 200) + '...');
    return true; // Return success in dev mode for testing
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('[Mailer] Failed to send email:', error);
    return false;
  }
}

/**
 * Send email verification link
 * @param email - User's email address
 * @param token - Verification token
 * @param userName - User's name (optional)
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  userName?: string
): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify/confirm?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SolarMatch</h1>
      </div>
      <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
        <p>Hi${userName ? ` ${userName}` : ''},</p>
        <p>Thank you for signing up with SolarMatch! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 5px; word-break: break-all; font-size: 13px; color: #555;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;"><strong>This link will expire in 30 minutes.</strong></p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">If you didn't create an account with SolarMatch, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - SolarMatch',
    html,
  });
}

/**
 * Send password reset link
 * @param email - User's email address
 * @param token - Reset token
 * @param userName - User's name (optional)
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName?: string
): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SolarMatch</h1>
      </div>
      <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
        <p>Hi${userName ? ` ${userName}` : ''},</p>
        <p>We received a request to reset your password for your SolarMatch account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 5px; word-break: break-all; font-size: 13px; color: #555;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;"><strong>This link will expire in 30 minutes.</strong></p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - SolarMatch',
    html,
  });
}
