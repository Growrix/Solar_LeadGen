/**
 * Mutation History Logger
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article IV.3
 * Purpose: Immutable history tracking for all state changes
 */

import { prisma } from '@/lib/prisma';

export interface RecordMutationInput {
  entityType: 'Lead' | 'Bid' | 'Purchase';
  entityId: string;
  actorId?: string;
  actorRole?: string;
  previousState?: string;
  nextState: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Record a mutation/state change to immutable history
 * 
 * @param input Mutation details
 * @returns Created history record
 */
export async function recordMutation(input: RecordMutationInput) {
  try {
    const data = {
      actorId: input.actorId,
      actorRole: input.actorRole,
      previousState: input.previousState,
      nextState: input.nextState,
      reason: input.reason,
      metadata: input.metadata || {},
    };

    let record;

    switch (input.entityType) {
      case 'Lead':
        record = await prisma.leadHistory.create({
          data: { leadId: input.entityId, ...data },
        });
        break;
      case 'Bid':
        record = await prisma.bidHistory.create({
          data: { bidId: input.entityId, ...data },
        });
        break;
      case 'Purchase':
        record = await prisma.purchaseHistory.create({
          data: { purchaseId: input.entityId, ...data },
        });
        break;
    }

    console.log(`📜 [Mutation History] ${input.entityType} ${input.entityId}: ${input.previousState || 'INITIAL'} → ${input.nextState}`);
    return record;
  } catch (error) {
    console.error('[Mutation History] Failed to record:', error);
    throw error;
  }
}

/**
 * Get mutation history for an entity
 * 
 * @param entityType Entity type
 * @param entityId Entity ID
 * @returns Array of history records
 */
export async function getMutationHistory(
  entityType: 'Lead' | 'Bid' | 'Purchase',
  entityId: string
) {
  switch (entityType) {
    case 'Lead':
      return prisma.leadHistory.findMany({
        where: { leadId: entityId },
        orderBy: { timestamp: 'asc' },
      });
    case 'Bid':
      return prisma.bidHistory.findMany({
        where: { bidId: entityId },
        orderBy: { timestamp: 'asc' },
      });
    case 'Purchase':
      return prisma.purchaseHistory.findMany({
        where: { purchaseId: entityId },
        orderBy: { timestamp: 'asc' },
      });
  }
}
