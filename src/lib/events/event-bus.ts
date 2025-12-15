/**
 * Event Bus - DB-Persisted Implementation
 * 
 * Purpose: Event bus with durable event storage for auditability
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article VII
 * Updated: 2025-12-14 - Added database persistence for constitutional compliance
 * 
 * Implementation Notes:
 * - Events persisted to database via domain-event-logger
 * - Synchronous handler execution (blocking)
 * - No retry logic (handler failures logged only)
 * - In-memory handlers for real-time side effects
 * 
 * Future Enhancements:
 * - Async handler execution with worker threads
 * - Dead-letter queue for failed handlers
 * - Event replay capability
 */

import { DomainEvent, EventHandler, EventMetadata } from './types';
import { recordDomainEvent } from './domain-event-logger';

// Simple CUID generator (fallback if @paralleldrive/cuid2 not installed)
function generateCuid(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Event bus with DB persistence
 */
class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Register an event handler
   * 
   * @param eventType - Event type to listen for (e.g., 'lead.approved')
   * @param handler - Handler function to execute
   * 
   * @example
   * eventBus.on('lead.approved', async (event) => {
   *   await sendEmail({ to: event.data.homeownerEmail, ... });
   * });
   */
  on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    console.log(`📡 [EventBus] Registered handler for ${eventType}`);
  }

  /**
   * Emit a domain event (persists to DB + notifies handlers)
   * 
   * @param event - Partial event (id, timestamp auto-generated)
   * @returns Promise that resolves when all handlers complete
   * 
   * @example
   * await eventBus.emit({
   *   type: 'lead.approved',
   *   aggregateId: leadId,
   *   aggregateType: 'Lead',
   *   data: { leadId, homeownerEmail },
   *   metadata: { userId, userRole: 'ADMIN', source: 'api' }
   * });
   */
  async emit<T = any>(event: Omit<DomainEvent<T>, 'id'> & { metadata: Omit<EventMetadata, 'timestamp'> }): Promise<void> {
    // Generate event ID and timestamp
    const fullEvent: DomainEvent<T> = {
      ...event,
      id: generateCuid(),
      metadata: {
        ...event.metadata,
        timestamp: new Date(),
      },
    };

    console.log(`📡 [EventBus] Emitting ${fullEvent.type} for ${fullEvent.aggregateType}#${fullEvent.aggregateId}`);

    // Persist event to database for auditability (Constitution Article VII)
    try {
      await recordDomainEvent({
        eventType: fullEvent.type,
        entityType: fullEvent.aggregateType,
        entityId: fullEvent.aggregateId,
        actorId: fullEvent.metadata.userId,
        actorRole: fullEvent.metadata.userRole,
        metadata: fullEvent.data as Record<string, any>,
      });
    } catch (error) {
      console.error(`❌ [EventBus] Failed to persist event ${fullEvent.type}:`, error);
      // Continue with handler execution even if persistence fails
    }

    // Get handlers for this event type
    const handlers = this.handlers.get(fullEvent.type) || [];

    if (handlers.length === 0) {
      console.warn(`⚠️ [EventBus] No handlers registered for ${fullEvent.type}`);
      return;
    }

    // Execute all handlers (synchronous, sequential)
    for (const handler of handlers) {
      try {
        await handler(fullEvent);
        console.log(`✅ [EventBus] Handler executed successfully for ${fullEvent.type}`);
      } catch (error) {
        console.error(`❌ [EventBus] Handler failed for ${fullEvent.type}:`, error);
        // Don't throw - handler failures shouldn't break event emission
        // Future: Move failed events to dead-letter queue
      }
    }
  }

  /**
   * Clear all registered handlers (for testing)
   */
  clear(): void {
    this.handlers.clear();
    console.log(`🧹 [EventBus] Cleared all handlers`);
  }

  /**
   * Get handler count for an event type
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Export type for testing
export type { EventBus };
