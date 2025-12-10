/**
 * Pusher Client-Side Hook
 * 
 * Purpose: Subscribe to real-time Pusher channels in React components
 * Used for: Receiving chat messages, status updates, notifications in UI
 * 
 * Why a custom hook?
 * - Manages Pusher connection lifecycle (connect/disconnect)
 * - Automatically cleans up subscriptions on unmount
 * - Provides type-safe event handling
 * - Reusable across components
 * 
 * Usage Example - Chat Messages:
 * 
 *   const { subscribe } = usePusher();
 *   
 *   useEffect(() => {
 *     const unsubscribe = subscribe(`lead-${leadId}-chat`, 'new-message', (data) => {
 *       setMessages(prev => [...prev, data]);
 *     });
 *     
 *     return unsubscribe; // Cleanup on unmount
 *   }, [leadId]);
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_PUSHER_KEY: Your Pusher key (must start with NEXT_PUBLIC_ for client-side)
 * - NEXT_PUBLIC_PUSHER_CLUSTER: Your Pusher cluster (e.g.,"us2")
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import PusherClient from 'pusher-js';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
  console.error('NEXT_PUBLIC_PUSHER_KEY environment variable is required');
}
if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  console.error('NEXT_PUBLIC_PUSHER_CLUSTER environment variable is required');
}

/**
 * Custom hook for Pusher client-side subscriptions
 * 
 * Returns:
 * - subscribe: Function to subscribe to a channel and event
 * - isConnected: Boolean indicating connection status
 */
export function usePusher() {
  const pusherRef = useRef<PusherClient | null>(null);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  // Initialize Pusher client on first use
  useEffect(() => {
    if (!pusherRef.current && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      pusherRef.current = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_KEY,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        }
      );

      // Connection state logging (development only)
      if (process.env.NODE_ENV === 'development') {
        pusherRef.current.connection.bind('connected', () => {
          console.log('✅ [Pusher] Connected');
        });
        pusherRef.current.connection.bind('disconnected', () => {
          console.log('❌ [Pusher] Disconnected');
        });
        pusherRef.current.connection.bind('error', (error: any) => {
          console.error('❌ [Pusher] Connection error:', error);
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (pusherRef.current) {
        // Unsubscribe from all channels
        subscriptionsRef.current.forEach((channel) => {
          pusherRef.current?.unsubscribe(channel.name);
        });
        subscriptionsRef.current.clear();

        // Disconnect Pusher
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []);

  /**
   * Subscribe to a Pusher channel and event
   * 
   * @param channelName - The channel name (e.g.,"lead-123-chat")
   * @param eventName - The event name (e.g.,"new-message")
   * @param callback - Function called when event is received
   * @returns Unsubscribe function to cleanup subscription
   * 
   * Example:
   *   const unsubscribe = subscribe('lead-123-chat', 'new-message', (data) => {
   *     console.log('New message:', data);
   *   });
   *   // Later: unsubscribe();
   */
  const subscribe = useCallback(
    (channelName: string, eventName: string, callback: (data: any) => void) => {
      if (!pusherRef.current) {
        console.error('Pusher client not initialized');
        return () => {};
      }

      // Get or create channel subscription
      let channel = subscriptionsRef.current.get(channelName);
      if (!channel) {
        channel = pusherRef.current.subscribe(channelName);
        subscriptionsRef.current.set(channelName, channel);

        if (process.env.NODE_ENV === 'development') {
          console.log(`📡 [Pusher] Subscribed to channel: ${channelName}`);
        }
      }

      // Bind event handler
      channel.bind(eventName, callback);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🎧 [Pusher] Listening to event: ${eventName} on ${channelName}`);
      }

      // Return unsubscribe function
      return () => {
        channel.unbind(eventName, callback);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔇 [Pusher] Unbound event: ${eventName} from ${channelName}`);
        }
      };
    },
    []
  );

  /**
   * Check if Pusher is connected
   */
  const isConnected = pusherRef.current?.connection.state === 'connected';

  return {
    subscribe,
    isConnected,
  };
}

/**
 * Helper hook for subscribing to chat messages
 * 
 * Usage:
 *   const { messages } = useChatMessages(leadId);
 */
export function useChatMessages(leadId: string, onMessage?: (message: any) => void) {
  const { subscribe } = usePusher();

  useEffect(() => {
    if (!leadId) return;

    const unsubscribe = subscribe(`lead-${leadId}-chat`, 'new-message', (data) => {
      if (onMessage) {
        onMessage(data);
      }
    });

    return unsubscribe;
  }, [leadId, subscribe, onMessage]);
}

/**
 * Helper hook for subscribing to status updates
 * 
 * Usage:
 *   useStatusUpdates(leadId, (status) => {
 *     console.log('Status changed to:', status.newStatus);
 *   });
 */
export function useStatusUpdates(leadId: string, onUpdate?: (status: any) => void) {
  const { subscribe } = usePusher();

  useEffect(() => {
    if (!leadId) return;

    const unsubscribe = subscribe(`lead-${leadId}-status`, 'status-update', (data) => {
      if (onUpdate) {
        onUpdate(data);
      }
    });

    return unsubscribe;
  }, [leadId, subscribe, onUpdate]);
}

/**
 * Helper hook for subscribing to notifications
 * 
 * Usage:
 *   useNotifications(userId, (notification) => {
 *     toast.info(notification.message);
 *   });
 */
export function useNotifications(userId: string, onNotification?: (notification: any) => void) {
  const { subscribe } = usePusher();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribe(
      `user-${userId}-notifications`,
      'new-notification',
      (data) => {
        if (onNotification) {
          onNotification(data);
        }
      }
    );

    return unsubscribe;
  }, [userId, subscribe, onNotification]);
}
