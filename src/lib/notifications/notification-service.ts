// Central notification service
// Single entry point for creating normalized notifications

import { prisma } from '@/lib/prisma';
import { NotificationType, UserRole } from '@prisma/client';
import { MessageKey, getNotificationText } from './message-catalog';
import { RouteKey, RouteParams } from './route-resolver';

export interface CreateNotificationInput {
  recipientUserId: string;
  role: UserRole;
  actionType: NotificationType;
  messageKey: MessageKey;
  routeKey: RouteKey;
  routeParams?: RouteParams;
  metadata?: Record<string, any>;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    const { title, message } = getNotificationText(input.messageKey);

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
