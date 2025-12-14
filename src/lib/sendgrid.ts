/**
 * SendGrid Email Client Singleton
 * 
 * Purpose: Send transactional emails (notifications, alerts, OTP codes)
 * Used for: Email notifications alongside Pusher real-time notifications
 * 
 * Why singleton pattern?
 * - Reuses SendGrid instance across requests
 * - Centralizes email configuration
 * - Consistent email formatting
 * 
 * Usage:
 *   import { sendEmail } from '@/lib/sendgrid';
 *   
 *   await sendEmail({
 *     to: 'user@example.com',
 *     subject: 'New Lead Available',
 *     text: 'A new lead has been assigned to you.',
 *     html: '<p>A new lead has been assigned to you.</p>'
 *   });
 * 
 * Environment Variables Required:
 * - SENDGRID_API_KEY: Your SendGrid API key (starts with SG.)
 * - SENDGRID_FROM_EMAIL: Default sender email (e.g., noreply@solarmatch.com)
 */

import sgMail from '@sendgrid/mail';
import { buildFullUrl } from '@/lib/config/app-url';
import { logEmailDelivery } from '@/lib/audit/email-delivery-logger';

// Validate environment variables at startup
if (!process.env.SENDGRID_API_KEY) {
  console.warn('⚠️ [SendGrid] SENDGRID_API_KEY not configured - emails will not be sent');
} else {
  // Initialize SendGrid with API key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const DEFAULT_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@solarmatch.com';

// Test harness: capture emails during e2e runs to verify triggers without
// calling external SendGrid service. Enabled when NODE_ENV==='test' or
// PLAYWRIGHT_TEST==='1'.
type CapturedEmail = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  timestamp: number;
};

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST === '1';
const emailCaptureStore: CapturedEmail[] = [];

export function __getCapturedEmails(): CapturedEmail[] {
  return emailCaptureStore;
}

export function __clearCapturedEmails(): void {
  emailCaptureStore.length = 0;
}

/**
 * Email message interface
 */
export interface EmailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  recipientRole?: 'ADMIN' | 'INSTALLER' | 'HOMEOWNER'; // New: recipient's role
  actorEmail?: string; // New: actual sender's email (homeowner or installer)
}

/**
 * Send a single email via SendGrid
 * 
 * @param message - Email message details
 * @returns Promise that resolves when email is sent
 * 
 * Example:
 *   await sendEmail({
 *     to: 'installer@example.com',
 *     subject: 'New Lead Available',
 *     text: 'A new lead has been assigned to you.',
 *     html: '<p>A new lead has been assigned to you.</p>'
 *   });
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ [SendGrid] Email not sent (API key not configured):', message.subject);
    // In test mode, still capture the intent to send for verification
    if (!isTestEnv) return;
  }

  try {
    // Dynamic sender logic based on recipient role
    // ALWAYS use verified sender email (SENDGRID_FROM_EMAIL) as the "from" address
    // For admin emails, we'll include actorEmail in the email body content instead
    const fromEmail = message.from || DEFAULT_FROM_EMAIL;
    
    console.log(`📧 [SendGrid] Raw input - recipientRole: ${message.recipientRole}, actorEmail: ${message.actorEmail}, to: ${message.to}`);
    
    let providerMessageId: string | undefined;
    
    if (isTestEnv) {
      emailCaptureStore.push({
        to: message.to,
        from: fromEmail,
        subject: message.subject,
        text: message.text,
        html: message.html || message.text,
        timestamp: Date.now(),
      });
    } else {
      const response = await sgMail.send({
        to: message.to,
        from: fromEmail,
        subject: message.subject,
        text: message.text,
        html: message.html || message.text,
      });
      
      // Extract SendGrid message ID for audit logging
      providerMessageId = response[0]?.headers?.['x-message-id'] as string | undefined;
    }
    
    // Log email delivery for audit trail
    await logEmailDelivery({
      recipientEmail: Array.isArray(message.to) ? message.to[0] : message.to,
      recipientRole: message.recipientRole,
      subject: message.subject,
      messageType: 'transactional',
      provider: 'sendgrid',
      providerMessageId,
      metadata: {
        actorEmail: message.actorEmail,
        htmlLength: message.html?.length || 0,
        textLength: message.text?.length || 0,
      },
    });

    const logVerb = isTestEnv ? 'captured' : 'sent';
    console.log(`✅ [SendGrid] Email ${logVerb} to ${message.to} from ${fromEmail}: ${message.subject}`);
  } catch (error) {
    console.error('❌ [SendGrid] Failed to send email:', error);
    
    // Log failed delivery attempt
    await logEmailDelivery({
      recipientEmail: Array.isArray(message.to) ? message.to[0] : message.to,
      recipientRole: message.recipientRole,
      subject: message.subject,
      messageType: 'transactional',
      provider: 'sendgrid',
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    
    throw error;
  }
}

/**
 * Send email notification for new lead creation
 * 
 * @param adminEmail - Admin email address
 * @param leadDetails - Lead information
 */
export async function sendNewLeadNotification(
  adminEmail: string,
  leadDetails: {
    leadId: string;
    homeownerName: string;
    propertyPostcode: string;
    quoteType: string;
  }
): Promise<void> {
  await sendEmail({
    to: adminEmail,
    subject: `New Lead Submitted: ${leadDetails.homeownerName}`,
    text: `
A new lead has been submitted and is awaiting your review.

Lead ID: ${leadDetails.leadId}
Homeowner: ${leadDetails.homeownerName}
Postcode: ${leadDetails.propertyPostcode}
Quote Type: ${leadDetails.quoteType}

Please review and approve this lead in the admin dashboard:
${buildFullUrl(`/admin/leads/${leadDetails.leadId}`)}
    `.trim(),
    html: `
<h2>New Lead Submitted</h2>
<p>A new lead has been submitted and is awaiting your review.</p>
<table>
  <tr><td><strong>Lead ID:</strong></td><td>${leadDetails.leadId}</td></tr>
  <tr><td><strong>Homeowner:</strong></td><td>${leadDetails.homeownerName}</td></tr>
  <tr><td><strong>Postcode:</strong></td><td>${leadDetails.propertyPostcode}</td></tr>
  <tr><td><strong>Quote Type:</strong></td><td>${leadDetails.quoteType}</td></tr>
</table>
<p><a href="${buildFullUrl(`/admin/leads/${leadDetails.leadId}`)}">View Lead in Dashboard</a></p>
    `.trim(),
  });
}

/**
 * Send email notification for lead approval
 * 
 * @param homeownerEmail - Homeowner email address
 * @param leadDetails - Lead information
 */
export async function sendLeadApprovedNotification(
  homeownerEmail: string,
  leadDetails: {
    leadId: string;
    homeownerName: string;
  }
): Promise<void> {
  await sendEmail({
    to: homeownerEmail,
    subject: 'Your Quote Request Has Been Approved',
    text: `
Hi ${leadDetails.homeownerName},

Great news! Your solar quote request has been approved and is now visible to verified installers.

You will receive notifications when installers express interest in your project.

View your request status:
${buildFullUrl(`/homeowner/leads/${leadDetails.leadId}`)}

Best regards,
The SolarMatch Team
    `.trim(),
    html: `
<h2>Quote Request Approved! ✅</h2>
<p>Hi ${leadDetails.homeownerName},</p>
<p>Great news! Your solar quote request has been approved and is now visible to verified installers.</p>
<p>You will receive notifications when installers express interest in your project.</p>
<p><a href="${buildFullUrl(`/homeowner/leads/${leadDetails.leadId}`)}">View Request Status</a></p>
<p>Best regards,<br>The SolarMatch Team</p>
    `.trim(),
  });
}

/**
 * Send email notification for lead purchase
 * 
 * @param homeownerEmail - Homeowner email address
 * @param leadDetails - Lead and installer information
 */
export async function sendLeadPurchasedNotification(
  homeownerEmail: string,
  leadDetails: {
    leadId: string;
    homeownerName: string;
    installerName: string;
    installerCompany: string;
  }
): Promise<void> {
  await sendEmail({
    to: homeownerEmail,
    subject: 'An Installer Is Interested in Your Project',
    text: `
Hi ${leadDetails.homeownerName},

Good news! An installer has purchased your lead and will be in touch shortly.

Installer: ${leadDetails.installerName} (${leadDetails.installerCompany})

They now have access to your contact details and project information. You can chat with them directly through the platform.

View your lead:
${buildFullUrl(`/homeowner/leads/${leadDetails.leadId}`)}

Best regards,
The SolarMatch Team
    `.trim(),
    html: `
<h2>Installer Interested! 🎉</h2>
<p>Hi ${leadDetails.homeownerName},</p>
<p>Good news! An installer has purchased your lead and will be in touch shortly.</p>
<p><strong>Installer:</strong> ${leadDetails.installerName} (${leadDetails.installerCompany})</p>
<p>They now have access to your contact details and project information. You can chat with them directly through the platform.</p>
<p><a href="${buildFullUrl(`/homeowner/leads/${leadDetails.leadId}`)}">View Your Lead</a></p>
<p>Best regards,<br>The SolarMatch Team</p>
    `.trim(),
  });
}

/**
 * Send email notification for new chat message
 * 
 * @param recipientEmail - Recipient email address
 * @param messageDetails - Message and lead information
 */
export async function sendChatMessageNotification(
  recipientEmail: string,
  messageDetails: {
    leadId: string;
    senderName: string;
    message: string;
    recipientName: string;
  }
): Promise<void> {
  await sendEmail({
    to: recipientEmail,
    subject: `New Message from ${messageDetails.senderName}`,
    text: `
Hi ${messageDetails.recipientName},

You have a new message from ${messageDetails.senderName}:

"${messageDetails.message}"

Reply in the chat:
${buildFullUrl(`/leads/${messageDetails.leadId}`)}

Best regards,
The SolarMatch Team
    `.trim(),
    html: `
<h2>New Message 💬</h2>
<p>Hi ${messageDetails.recipientName},</p>
<p>You have a new message from <strong>${messageDetails.senderName}</strong>:</p>
<blockquote style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0;">
  ${messageDetails.message}
</blockquote>
<p><a href="${buildFullUrl(`/leads/${messageDetails.leadId}`)}">Reply in Chat</a></p>
<p>Best regards,<br>The SolarMatch Team</p>
    `.trim(),
  });
}
