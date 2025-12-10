/**
 * Notification Service
 * 
 * Purpose: Create and deliver notifications via multiple channels
 * Used for: Real-time alerts, email notifications, notification center
 * 
 * Notification Channels:
 * 1. Database: Store all notifications for notification center
 * 2. Pusher: Real-time delivery (<2 seconds) to active users
 * 3. SendGrid: Email fallback for offline users
 * 
 * Why multiple channels?
 * - Real-time: Users see updates instantly (Pusher)
 * - Async fallback: Users get email if offline (SendGrid)
 * - Persistent: Users can review past notifications (Database)
 * - Reliability: If Pusher fails, email still works
 */

import { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { triggerNotification } from '@/lib/pusher';
import { sendEmail } from '@/lib/sendgrid';
import { CreateNotificationInput } from '@/types/notification';

/**
 * Create and deliver notification
 * 
 * @param data - Notification data
 * @returns Created notification
 * 
 * Example:
 *   await createNotification({
 *     userId: installerId,
 *     type: 'NEW_LEAD',
 *     title: 'New Lead Available!',
 *     message: 'A new residential lead in Manchester (M1 1AA) is now available.',
 *     actionUrl: '/installer/leads',
 *     metadata: { leadId, postcode: 'M1 1AA' },
 *   });
 */
export async function createNotification(
  data: CreateNotificationInput
): Promise<void> {
  try {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        isRead: false,
        createdAt: new Date(),
      },
    });

    // 2. Send real-time notification via Pusher
    await triggerNotification(data.userId, {
      id: notification.id,
      type: data.type,
      title: data.title,
      message: data.message,
      timestamp: notification.createdAt,
    });

    // 3. Send email notification (for important notifications)
    if (shouldSendEmail(data.type)) {
      await sendEmailNotification(data);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔔 [Notification] ${data.type} → User ${data.userId}`);
    }
  } catch (error) {
    console.error('❌ [Notification] Failed to create notification:', error);
    // Don't throw - notifications shouldn't break main flow
  }
}

/**
 * Determine if notification type should trigger email
 * 
 * @param type - Notification type
 * @returns True if email should be sent
 */
function shouldSendEmail(type: NotificationType): boolean {
  const emailNotificationTypes: NotificationType[] = [
    'NEW_LEAD',
    'LEAD_PURCHASED',
    'LEAD_APPROVED',
    'NEW_QUOTE',
    'QUOTE_ACCEPTED',
    'PAYMENT_RECEIVED',
    'BID_WON',        // ✅ T186: Send email to winner
    'BID_LOST',       // ✅ T186: Send email to losers
  ];

  return emailNotificationTypes.includes(type);
}

/**
 * Send email notification
 * 
 * @param data - Notification data
 */
async function sendEmailNotification(data: CreateNotificationInput): Promise<void> {
  try {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) return;

    const actionUrl = data.actionUrl
      ? `${process.env.NEXTAUTH_URL}${data.actionUrl}`
      : undefined;

    await sendEmail({
      to: user.email,
      subject: data.title,
      text: data.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFFFFF;">${data.title}</h2>
          <p style="color: #F5F5F5; line-height: 1.6;">${data.message}</p>
          ${actionUrl ? `
            <a href="${actionUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #1A1A1A; color: white; text-decoration: none; border-radius: 6px; border: 1px solid #2C2C2C;">
              View Details
            </a>
          ` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #2C2C2C;">
          <p style="color: #A3A3A3; font-size: 14px;">
            This is an automated notification from Solar Match. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ [Notification] Failed to send email:', error);
  }
}

/**
 * Get user notifications (paginated)
 * 
 * @param userId - User ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of notifications per page
 * @returns Paginated notifications
 * 
 * Example:
 *   const notifications = await getUserNotifications(userId, 1, 20);
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  pageSize: number = 20
) {
  const skip = (page - 1) * pageSize;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({
      where: { userId },
    }),
  ]);

  return {
    notifications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasMore: skip + notifications.length < total,
  };
}

/**
 * Get unread notification count
 * 
 * @param userId - User ID
 * @returns Number of unread notifications
 * 
 * Example:
 *   const unreadCount = await getUnreadCount(userId);
 *   // Used for notification badge: <Badge>{unreadCount}</Badge>
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark notifications as read
 * 
 * @param notificationIds - Array of notification IDs
 * @returns Number of notifications marked as read
 * 
 * Example:
 *   await markAsRead([notification1.id, notification2.id]);
 */
export async function markAsRead(notificationIds: string[]): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Mark all notifications as read for a user
 * 
 * @param userId - User ID
 * @returns Number of notifications marked as read
 * 
 * Example:
 *   await markAllAsRead(userId);
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Delete old notifications (cleanup job)
 * 
 * @param daysOld - Delete notifications older than this many days
 * @returns Number of notifications deleted
 * 
 * Usage: Call from cron job to clean up old notifications
 * Example: Delete notifications older than 90 days
 */
export async function deleteOldNotifications(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      isRead: true, // Only delete read notifications
    },
  });

  if (process.env.NODE_ENV === 'development' && result.count > 0) {
    console.log(`🗑️ [Notification] Deleted ${result.count} old notification(s)`);
  }

  return result.count;
}

/**
 * Get notification summary (for notification center badge)
 * 
 * @param userId - User ID
 * @returns Summary with unread count and latest notifications
 * 
 * Example:
 *   const summary = await getNotificationSummary(userId);
 *   // Returns: { unreadCount: 5, latestNotifications: [...] }
 */
export async function getNotificationSummary(userId: string) {
  const [unreadCount, latestNotifications] = await Promise.all([
    getUnreadCount(userId),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    unreadCount,
    latestNotifications,
  };
}

/**
 * Batch create notifications (for bulk operations)
 * 
 * @param notifications - Array of notification data
 * @returns Number of notifications created
 * 
 * Example:
 *   // Notify all installers of new lead
 *   const installers = await prisma.user.findMany({ where: { role: 'INSTALLER' } });
 *   await batchCreateNotifications(
 *     installers.map(installer => ({
 *       userId: installer.id,
 *       type: 'NEW_LEAD',
 *       title: 'New Lead Available!',
 *       message: 'A new residential lead in Manchester is now available.',
 *       actionUrl: '/installer/leads',
 *     }))
 *   );
 */
export async function batchCreateNotifications(
  notifications: CreateNotificationInput[]
): Promise<number> {
  let created = 0;

  for (const notification of notifications) {
    try {
      await createNotification(notification);
      created++;
    } catch (error) {
      console.error('❌ [Notification] Failed to create notification:', error);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔔 [Notification] Created ${created}/${notifications.length} notification(s)`);
  }

  return created;
}
