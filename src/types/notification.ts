/**
 * Notification Type Definitions
 * 
 * Purpose: TypeScript types for real-time notifications
 * Used for: Pusher events, notification center, email notifications
 * 
 * Notification Flow:
 * 1. Action occurs (new lead, quote submitted, etc.)
 * 2. Notification saved to database
 * 3. Real-time broadcast via Pusher to user-{userId}-notifications channel
 * 4. Email sent via SendGrid as async fallback
 * 5. User can mark as read/unread in notification center
 */

import { Notification, NotificationType } from '@prisma/client';

/**
 * Create notification input (internal use)
 * Used by backend services to create notifications
 */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Notification with formatted data
 * Used when displaying in notification center
 */
export interface NotificationWithFormatting extends Notification {
  timeAgo: string; //"5 minutes ago","2 hours ago", etc.
  icon: string; // Icon name for UI
  color: string; // Color for UI (success, warning, error, info)
}

/**
 * Pusher notification event
 * Real-time notification broadcast
 * Channel: user-{userId}-notifications
 */
export interface PusherNotificationEvent {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string; // ISO 8601
}

/**
 * Mark notifications as read input
 */
export interface MarkNotificationsReadInput {
  notificationIds: string[];
}

/**
 * Notification preferences (future feature)
 */
export interface NotificationPreferences {
  email: {
    newLead: boolean;
    leadPurchased: boolean;
    newQuote: boolean;
    newMessage: boolean;
    quoteAccepted: boolean;
    system: boolean;
  };
  push: {
    newLead: boolean;
    leadPurchased: boolean;
    newQuote: boolean;
    newMessage: boolean;
    quoteAccepted: boolean;
    system: boolean;
  };
  inApp: {
    newLead: boolean;
    leadPurchased: boolean;
    newQuote: boolean;
    newMessage: boolean;
    quoteAccepted: boolean;
    system: boolean;
  };
}

/**
 * Notification summary (for notification center badge)
 */
export interface NotificationSummary {
  unreadCount: number;
  byType: Record<NotificationType, number>;
  latestNotifications: Notification[];
}

/**
 * Email notification template data
 * Used by SendGrid service to render emails
 */
export interface EmailNotificationData {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  preheader?: string; // Preview text in email clients
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}
