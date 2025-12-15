/**
 * Chat Type Definitions
 * 
 * Purpose: TypeScript types for real-time chat between homeowners and installers
 * Used for: WebSocket messages, API requests/responses, UI state
 * 
 * Chat Flow:
 * 1. Installer purchases lead → Chat channel created
 * 2. Either party sends message → Saved to DB + broadcast via Pusher
 * 3. Recipient receives notification → Opens chat → Marks as read
 * 4. Messages persist in database for audit trail
 */

import { ChatMessage, UserRole } from '@prisma/client';

/**
 * Send message input
 * Used when user sends a new chat message
 */
export interface SendMessageInput {
  leadId: string;
  message: string;
  // senderId and senderRole are inferred from session
}

/**
 * Chat message with sender details
 * Used when displaying messages in UI
 */
export interface ChatMessageWithSender extends ChatMessage {
  senderName: string;
  senderImage?: string;
  senderCompany?: string; // For installers
}

/**
 * Chat conversation
 * Complete chat thread for a lead
 */
export interface ChatConversation {
  leadId: string;
  messages: ChatMessageWithSender[];
  participants: {
    homeowner: {
      id: string;
      name: string;
      image?: string;
    };
    installer: {
      id: string;
      name: string;
      company?: string;
      image?: string;
    };
  };
  unreadCount: number;
  lastMessageAt?: Date;
}

/**
 * Pusher chat event
 * Real-time message broadcast via Pusher Channels
 * Channel: lead-{leadId}-chat
 */
export interface PusherChatEvent {
  messageId: string;
  leadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Mark messages as read input
 */
export interface MarkMessagesReadInput {
  leadId: string;
  messageIds: string[];
}

/**
 * Chat metadata (for notifications)
 */
export interface ChatMetadata {
  leadId: string;
  unreadCount: number;
  lastMessage: {
    senderId: string;
    senderName: string;
    message: string;
    createdAt: Date;
  } | null;
}

/**
 * Typing indicator event
 * Real-time typing status via Pusher
 */
export interface TypingIndicatorEvent {
  leadId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
