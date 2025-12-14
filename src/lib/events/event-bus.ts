/**
 * Event Bus - In-Memory Implementation
 * 
 * Purpose: Lightweight event bus for decoupling side effects from business logic
 * Authority: DOC/Architecture/EVENT-ORCHESTRATION.md
 * 
 * Implementation Notes:
 * - In-memory only (events not persisted)
 * - Synchronous handler execution (blocking)
 * - No retry logic (handler failures logged only)
 * - Production-ready for Phase 1 (foundation)
 * 
 * Future Enhancements (Phase 3+):
 * - Event persistence to database
 * - Async handler execution with worker threads
 * - Dead-letter queue for failed handlers
 * - Event replay capability
 */

import { DomainEvent, EventHandler, EventMetadata } from './types';

// Simple CUID generator (fallback if @paralleldrive/cuid2 not installed)
function generateCuid(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Simple in-memory event bus
 */
class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private eventLog: DomainEvent[] = []; // In-memory event history (capped at 1000)
  private readonly MAX_LOG_SIZE = 1000;

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
   * Emit a domain event
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

    // Add to event log (capped at MAX_LOG_SIZE)
    this.eventLog.push(fullEvent);
    if (this.eventLog.length > this.MAX_LOG_SIZE) {
      this.eventLog.shift(); // Remove oldest event
    }

    console.log(`📡 [EventBus] Emitting ${fullEvent.type} for ${fullEvent.aggregateType}#${fullEvent.aggregateId}`);

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
   * Get recent events from in-memory log
   * 
   * @param limit - Number of events to return
   * @returns Recent events (newest first)
   */
  getRecentEvents(limit: number = 10): DomainEvent[] {
    return this.eventLog.slice(-limit).reverse();
  }

  /**
   * Get events by type from in-memory log
   * 
   * @param eventType - Event type to filter by
   * @returns Events matching type (newest first)
   */
  getEventsByType(eventType: string): DomainEvent[] {
    return this.eventLog.filter(e => e.type === eventType).reverse();
  }

  /**
   * Get events by aggregate ID from in-memory log
   * 
   * @param aggregateId - Aggregate ID to filter by
   * @returns Events for this aggregate (chronological order)
   */
  getEventsByAggregateId(aggregateId: string): DomainEvent[] {
    return this.eventLog.filter(e => e.aggregateId === aggregateId);
  }

  /**
   * Clear all registered handlers (for testing)
   */
  clear(): void {
    this.handlers.clear();
    this.eventLog = [];
    console.log(`🧹 [EventBus] Cleared all handlers and events`);
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
