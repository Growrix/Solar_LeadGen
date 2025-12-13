// Central notification service
// Single entry point for creating normalized notifications

import { prisma } from '@/lib/prisma';
import { NotificationType, UserRole } from '@prisma/client';
import { MessageKey, getNotificationText } from './message-catalog';
import { RouteKey, RouteParams } from './route-resolver';
import { sendEmail } from '@/lib/sendgrid';
import { triggerNotification } from '@/lib/pusher';

export interface CreateNotificationInput {
  recipientUserId: string;
  role: UserRole;
  actionType: NotificationType;
  messageKey: MessageKey;
  routeKey: RouteKey;
  routeParams?: RouteParams;
  metadata?: Record<string, any>;
}

/**
 * Determine if notification type should trigger email
 * Based on audit report findings (Phase 8, T102)
 */
function shouldSendEmail(type: NotificationType): boolean {
  const emailNotificationTypes: NotificationType[] = [
    // Admin notifications
    'NEW_LEAD',
    'LEAD_PURCHASED',
    'BID_SUBMITTED',        // Admin gets email when bid submitted
    
    // Homeowner notifications
    'LEAD_APPROVED',
    'REQUEST_RECEIVED',     // Homeowner request received (approved)
    'INSTALLER_RESPONDED',  // Installer purchased lead
    'SELECTION_CONFIRMED',  // Homeowner selected winner
    
    // Installer notifications
    'NEW_OPPORTUNITY',      // Lead assigned to installer
    'BID_WON',              // Winner notification
    'BID_LOST',             // Loser notification (legacy)
    'BID_OUTCOME_NOT_SELECTED', // New loser notification type
    'PURCHASE_CONFIRMED',   // Purchase confirmation
    'BID_PURCHASE_COMPLETED', // Bid purchase completed
    
    // Generic/shared
    'NEW_QUOTE',
    'QUOTE_ACCEPTED',
    'PAYMENT_RECEIVED',
  ];

  return emailNotificationTypes.includes(type);
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  userId: string,
  title: string,
  message: string,
  routeKey?: string
): Promise<void> {
  try {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      console.warn(`⚠️ [Notification Service] No email found for user ${userId}`);
      return;
    }

    // Build action URL from route key
    const actionUrl = routeKey
      ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${routeKey}`
      : undefined;

    await sendEmail({
      to: user.email,
      subject: title,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1A1A1A;">
          <h2 style="color: #FFFFFF; margin-bottom: 20px;">${title}</h2>
          <p style="color: #F5F5F5; line-height: 1.6; margin-bottom: 20px;">${message}</p>
          ${actionUrl ? `
            <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2C2C2C; color: #FFFFFF; text-decoration: none; border-radius: 6px; border: 1px solid #404040;">
              View Details
            </a>
          ` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #2C2C2C;">
          <p style="color: #A3A3A3; font-size: 14px; margin-top: 20px;">
            This is an automated notification from Solar Match. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `,
    });

    console.log(`✅ [Notification Service] Email sent to ${user.email} for notification type: ${title}`);
  } catch (error) {
    console.error('❌ [Notification Service] Failed to send email:', error);
    // Don't throw - email failures shouldn't break notification creation
  }
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    const { title, message } = getNotificationText(input.messageKey);

    // 1. Create database notification
    const notification = await prisma.notification.create({
      data: {
        userId: input.recipientUserId,
        role: input.role,
        type: input.actionType,
        title,
        message,
        messageKey: input.messageKey,
        routeKey: input.routeKey,
        routeParams: input.routeParams || {},
        metadata: input.metadata || {},
        isRead: false,
      },
    });

    console.log(`🔔 [Notification Service] Created notification ${notification.id} for user ${input.recipientUserId}`);

    // 2. Send Pusher real-time notification (async, non-blocking)
    try {
      await triggerNotification(input.recipientUserId, {
        id: notification.id,
        type: input.actionType,
        title,
        message,
        timestamp: notification.createdAt,
      });
    } catch (pusherError) {
      console.error('⚠️ [Notification Service] Pusher failed (non-critical):', pusherError);
    }

    // 3. Send email notification (for important notifications)
    if (shouldSendEmail(input.actionType)) {
      await sendEmailNotification(
        input.recipientUserId,
        title,
        message,
        input.routeKey
      );
    }

    return notification;
  } catch (error) {
    console.error('[Notification Service] Error creating notification:', error);
    throw error;
  }
}

export async function createBulkNotifications(inputs: CreateNotificationInput[]) {
  try {
    const notifications = await Promise.all(inputs.map((input) => createNotification(input)));
    console.log(`🔔 [Notification Service] Created ${notifications.length} notifications`);
    return notifications;
  } catch (error) {
    console.error('[Notification Service] Error creating bulk notifications:', error);
    throw error;
  }
}

// Legacy compatibility wrapper
export async function createLegacyNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Record<string, any>
) {
  console.warn('[Notification Service] Using legacy notification creation. Please migrate to new service.');
  
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      actionUrl,
      metadata,
      isRead: false,
    },
  });
}
