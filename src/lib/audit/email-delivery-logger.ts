/**
 * Email Delivery Audit Logger
 * 
 * Purpose: Track email delivery outcomes for compliance, debugging, and analytics
 * Authority: DOC/AUDIT-REPORTS/System/UNIVERSAL-SYSTEM-AUDIT-2025-12-14.md (Phase 4)
 * 
 * Background:
 * - Previous system logged to console only (no persistence)
 * - Spam reports went untracked
 * - No visibility into delivery failures
 * - Debugging required SendGrid dashboard access
 * 
 * Solution:
 * - Persist all email attempts to database
 * - Track provider response (message ID, status)
 * - Enable search by recipient, type, status
 * - Support webhook updates (delivered, bounced, spam)
 */

import { prisma } from '@/lib/prisma';
import { EmailDeliveryStatus, UserRole } from '@prisma/client';

export interface LogEmailDeliveryInput {
  recipientEmail: string;
  recipientRole?: UserRole;
  recipientUserId?: string;
  subject: string;
  messageType: string;
  notificationId?: string;
  provider?: string;
  providerMessageId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateEmailDeliveryInput {
  id: string;
  status: EmailDeliveryStatus;
  deliveredAt?: Date;
  bouncedAt?: Date;
  spamReportedAt?: Date;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Log an email delivery attempt
 * 
 * @param input - Email delivery details
 * @returns Created EmailDelivery record
 * 
 * @example
 * const delivery = await logEmailDelivery({
 *   recipientEmail: 'user@example.com',
 *   recipientRole: 'HOMEOWNER',
 *   recipientUserId: 'user_123',
 *   subject: 'New Lead Available',
 *   messageType: 'lead-notification',
 *   provider: 'sendgrid',
 *   providerMessageId: 'sg_abc123',
 *   metadata: { templateId: 'lead-approved' }
 * });
 */
export async function logEmailDelivery(input: LogEmailDeliveryInput) {
  try {
    const delivery = await prisma.emailDelivery.create({
      data: {
        recipientEmail: input.recipientEmail,
        recipientRole: input.recipientRole,
        recipientUserId: input.recipientUserId,
        subject: input.subject,
        messageType: input.messageType,
        notificationId: input.notificationId,
        provider: input.provider || 'sendgrid',
        providerMessageId: input.providerMessageId,
        status: 'SENT', // Initially mark as SENT (can be updated via webhook)
        metadata: input.metadata || {},
      },
    });

    console.log(`📧 [Email Audit] Logged delivery ${delivery.id} to ${input.recipientEmail} (${input.messageType})`);
    return delivery;
  } catch (error) {
    console.error('❌ [Email Audit] Failed to log email delivery:', error);
    // Don't throw - logging failure shouldn't break email sending
    return null;
  }
}

/**
 * Update email delivery status (typically from webhook)
 * 
 * @param input - Update details
 * @returns Updated EmailDelivery record
 * 
 * @example
 * await updateEmailDeliveryStatus({
 *   id: 'delivery_123',
 *   status: 'BOUNCED',
 *   bouncedAt: new Date(),
 *   errorMessage: 'Mailbox does not exist',
 *   errorCode: '550'
 * });
 */
export async function updateEmailDeliveryStatus(input: UpdateEmailDeliveryInput) {
  try {
    const delivery = await prisma.emailDelivery.update({
      where: { id: input.id },
      data: {
        status: input.status,
        deliveredAt: input.deliveredAt,
        bouncedAt: input.bouncedAt,
        spamReportedAt: input.spamReportedAt,
        errorMessage: input.errorMessage,
        errorCode: input.errorCode,
      },
    });

    console.log(`📧 [Email Audit] Updated delivery ${input.id} to ${input.status}`);
    return delivery;
  } catch (error) {
    console.error('❌ [Email Audit] Failed to update email delivery:', error);
    return null;
  }
}

/**
 * Update email delivery status by provider message ID
 * 
 * @param providerMessageId - Provider's message ID (SendGrid, Resend, etc.)
 * @param status - New delivery status
 * @param errorMessage - Optional error message
 * @returns Updated EmailDelivery record
 * 
 * @example
 * // SendGrid webhook handler
 * await updateEmailDeliveryByMessageId('sg_abc123', 'BOUNCED', 'Invalid mailbox');
 */
export async function updateEmailDeliveryByMessageId(
  providerMessageId: string,
  status: EmailDeliveryStatus,
  errorMessage?: string
) {
  try {
    const delivery = await prisma.emailDelivery.findFirst({
      where: { providerMessageId },
    });

    if (!delivery) {
      console.warn(`⚠️ [Email Audit] No delivery found for message ID: ${providerMessageId}`);
      return null;
    }

    return await updateEmailDeliveryStatus({
      id: delivery.id,
      status,
      deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      bouncedAt: status === 'BOUNCED' ? new Date() : undefined,
      spamReportedAt: status === 'SPAM_REPORT' ? new Date() : undefined,
      errorMessage,
    });
  } catch (error) {
    console.error('❌ [Email Audit] Failed to update by message ID:', error);
    return null;
  }
}

/**
 * Get recent delivery failures for monitoring
 * 
 * @param limit - Number of recent failures to return
 * @returns Array of failed deliveries
 */
export async function getRecentDeliveryFailures(limit: number = 10) {
  return await prisma.emailDelivery.findMany({
    where: {
      status: {
        in: ['BOUNCED', 'SPAM_REPORT', 'FAILED'],
      },
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
}

/**
 * Get delivery statistics by message type
 * 
 * @param messageType - Email message type
 * @param since - Start date for statistics
 * @returns Delivery stats
 */
export async function getDeliveryStats(messageType?: string, since?: Date) {
  const where = {
    ...(messageType && { messageType }),
    ...(since && { sentAt: { gte: since } }),
  };

  const [total, delivered, bounced, spam, failed] = await Promise.all([
    prisma.emailDelivery.count({ where }),
    prisma.emailDelivery.count({ where: { ...where, status: 'DELIVERED' } }),
    prisma.emailDelivery.count({ where: { ...where, status: 'BOUNCED' } }),
    prisma.emailDelivery.count({ where: { ...where, status: 'SPAM_REPORT' } }),
    prisma.emailDelivery.count({ where: { ...where, status: 'FAILED' } }),
  ]);

  return {
    total,
    delivered,
    bounced,
    spam,
    failed,
    deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
  };
}
