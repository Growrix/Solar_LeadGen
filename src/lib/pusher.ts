/**
 * Pusher Server-Side Client Singleton
 * 
 * Purpose: Real-time messaging and notifications via Pusher Channels
 * Used for: Chat messages, status updates, notifications
 * 
 * Why singleton pattern?
 * - Reuses connection across requests (more efficient)
 * - Prevents multiple Pusher instances
 * - Centralizes configuration
 * 
 * Usage:
 *   import { pusherServer } from '@/lib/pusher';
 *   
 *   // Trigger real-time event
 *   await pusherServer.trigger('lead-123-chat', 'new-message', {
 *     message: 'Hello!',
 *     senderId: 'user-456',
 *     timestamp: new Date()
 *   });
 * 
 * Environment Variables Required:
 * - PUSHER_APP_ID: Your Pusher app ID
 * - PUSHER_KEY: Your Pusher key  
 * - PUSHER_SECRET: Your Pusher secret
 * - PUSHER_CLUSTER: Your Pusher cluster (e.g.,"us2")
 */

import Pusher from 'pusher';

// Validate environment variables at startup (optional for build-time)
const hasRequiredEnvVars = !!(
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
);

if (!hasRequiredEnvVars && process.env.NODE_ENV !== 'production') {
  console.warn('[Pusher] Environment variables not configured. Real-time features will be disabled.');
}

/**
 * Pusher server-side client singleton
 * 
 * Channel naming conventions:
 * - Chat: `lead-{leadId}-chat`
 * - Notifications: `user-{userId}-notifications`
 * - Status: `lead-{leadId}-status`
 * 
 * Event naming conventions:
 * - new-message: New chat message sent
 * - status-update: Lead status changed
 * - new-notification: New notification for user
 */
export const pusherServer = hasRequiredEnvVars
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true, // Always use encrypted connections
    })
  : null as any; // Fallback for build-time when env vars aren't set

/**
 * Helper function to trigger chat message event
 * 
 * @param leadId - The lead ID
 * @param message - The message data
 */
export async function triggerChatMessage(
  leadId: string,
  message: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: Date;
  }
) {
  await pusherServer.trigger(`lead-${leadId}-chat`, 'new-message', message);
}

/**
 * Helper function to trigger status update event
 * 
 * @param leadId - The lead ID
 * @param status - The new status
 */
export async function triggerStatusUpdate(
  leadId: string,
  status: {
    newStatus: string;
    previousStatus: string;
    updatedBy: string;
    timestamp: Date;
  }
) {
  await pusherServer.trigger(`lead-${leadId}-status`, 'status-update', status);
}

/**
 * Helper function to trigger notification event
 * 
 * @param userId - The user ID to send notification to
 * @param notification - The notification data
 */
export async function triggerNotification(
  userId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: Date;
  }
) {
  await pusherServer.trigger(
    `user-${userId}-notifications`,
    'new-notification',
    notification
  );
}
