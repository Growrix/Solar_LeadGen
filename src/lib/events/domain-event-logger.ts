/**
 * Domain Event Logger
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article VII
 * Purpose: Durable persistence of all critical domain events for auditability
 * 
 * Previous system: In-memory event log with no persistence
 * New system: Database-backed event storage with queryable history
 */

import { prisma } from '@/lib/prisma';

export interface RecordDomainEventInput {
  eventType: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actorRole?: string;
  metadata?: Record<string, any>;
}

/**
 * Record a domain event to persistent storage
 * 
 * @param input Event details
 * @returns Created DomainEvent record
 * 
 * @example
 * await recordDomainEvent({
 *   eventType: 'LEAD_PURCHASED',
 *   entityType: 'Lead',
 *   entityId: lead.id,
 *   actorId: installer.id,
 *   actorRole: 'INSTALLER',
 *   metadata: { amount: 150, leadType: 'RESIDENTIAL' }
 * });
 */
export async function recordDomainEvent(input: RecordDomainEventInput) {
  try {
    const event = await prisma.domainEvent.create({
      data: {
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        metadata: input.metadata || {},
      },
    });

    console.log(`📋 [Domain Event] ${input.eventType} recorded for ${input.entityType}:${input.entityId}`);
    return event;
  } catch (error) {
    console.error('[Domain Event Logger] Failed to record event:', error);
    throw error;
  }
}

/**
 * Query domain events by entity
 * 
 * @param entityType Entity type (e.g., "Lead", "Bid")
 * @param entityId Entity ID
 * @returns Array of domain events
 */
export async function getDomainEvents(entityType: string, entityId: string) {
  return prisma.domainEvent.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });
}

/**
 * Query domain events by actor
 * 
 * @param actorId Actor user ID
 * @returns Array of domain events
 */
export async function getDomainEventsByActor(actorId: string) {
  return prisma.domainEvent.findMany({
    where: {
      actorId,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Query domain events by type
 * 
 * @param eventType Event type (e.g., "LEAD_PURCHASED")
 * @param limit Max records to return
 * @returns Array of domain events
 */
export async function getDomainEventsByType(eventType: string, limit = 100) {
  return prisma.domainEvent.findMany({
    where: {
      eventType,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}
