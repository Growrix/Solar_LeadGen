/**
 * State Machine Guards
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article IV.2
 * Purpose: Enforce valid state transitions for core entities
 * 
 * State machines prevent:
 * - Invalid state jumps
 * - Inconsistent behavior
 * - Unauditable changes
 */

import { recordMutation } from '@/lib/audit/mutation-history-logger';
import { recordDomainEvent } from '@/lib/events/domain-event-logger';

// Lead States (from prisma schema - LeadStatus enum)
export const LEAD_STATES = {
  DRAFT: 'DRAFT',
  PENDING_PHONE: 'PENDING_PHONE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  PURCHASED: 'PURCHASED',
  QUOTED: 'QUOTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  FLAGGED: 'FLAGGED',
} as const;

export type LeadState = (typeof LEAD_STATES)[keyof typeof LEAD_STATES];

// Bid States (custom - not in schema, but implied by business logic)
export const BID_STATES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export type BidState = (typeof BID_STATES)[keyof typeof BID_STATES];

// Purchase States (custom - representing lead purchase lifecycle)
export const PURCHASE_STATES = {
  INITIATED: 'INITIATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  DELIVERED: 'DELIVERED',
  REFUNDED: 'REFUNDED',
} as const;

export type PurchaseState = (typeof PURCHASE_STATES)[keyof typeof PURCHASE_STATES];

/**
 * Define allowed state transitions for Lead
 */
const LEAD_TRANSITIONS: Record<LeadState, LeadState[]> = {
  [LEAD_STATES.DRAFT]: [LEAD_STATES.PENDING_PHONE, LEAD_STATES.CANCELLED],
  [LEAD_STATES.PENDING_PHONE]: [LEAD_STATES.PENDING_APPROVAL, LEAD_STATES.CANCELLED],
  [LEAD_STATES.PENDING_APPROVAL]: [LEAD_STATES.APPROVED, LEAD_STATES.REJECTED, LEAD_STATES.CANCELLED],
  [LEAD_STATES.APPROVED]: [LEAD_STATES.PURCHASED, LEAD_STATES.EXPIRED, LEAD_STATES.CANCELLED],
  [LEAD_STATES.PURCHASED]: [LEAD_STATES.QUOTED, LEAD_STATES.EXPIRED, LEAD_STATES.CANCELLED],
  [LEAD_STATES.QUOTED]: [LEAD_STATES.ACCEPTED, LEAD_STATES.REJECTED, LEAD_STATES.EXPIRED],
  [LEAD_STATES.ACCEPTED]: [LEAD_STATES.CANCELLED], // Terminal state (or can be cancelled)
  [LEAD_STATES.REJECTED]: [], // Terminal state
  [LEAD_STATES.EXPIRED]: [], // Terminal state
  [LEAD_STATES.CANCELLED]: [], // Terminal state
  [LEAD_STATES.FLAGGED]: [LEAD_STATES.APPROVED, LEAD_STATES.REJECTED, LEAD_STATES.CANCELLED],
};

/**
 * Define allowed state transitions for Bid
 */
const BID_TRANSITIONS: Record<BidState, BidState[]> = {
  [BID_STATES.DRAFT]: [BID_STATES.SUBMITTED],
  [BID_STATES.SUBMITTED]: [BID_STATES.UNDER_REVIEW, BID_STATES.EXPIRED],
  [BID_STATES.UNDER_REVIEW]: [BID_STATES.ACCEPTED, BID_STATES.REJECTED, BID_STATES.EXPIRED],
  [BID_STATES.ACCEPTED]: [], // Terminal state
  [BID_STATES.REJECTED]: [], // Terminal state
  [BID_STATES.EXPIRED]: [], // Terminal state
};

/**
 * Define allowed state transitions for Purchase
 */
const PURCHASE_TRANSITIONS: Record<PurchaseState, PurchaseState[]> = {
  [PURCHASE_STATES.INITIATED]: [PURCHASE_STATES.PAYMENT_PENDING, PURCHASE_STATES.REFUNDED],
  [PURCHASE_STATES.PAYMENT_PENDING]: [PURCHASE_STATES.PAYMENT_COMPLETED, PURCHASE_STATES.REFUNDED],
  [PURCHASE_STATES.PAYMENT_COMPLETED]: [PURCHASE_STATES.DELIVERED, PURCHASE_STATES.REFUNDED],
  [PURCHASE_STATES.DELIVERED]: [PURCHASE_STATES.REFUNDED],
  [PURCHASE_STATES.REFUNDED]: [], // Terminal state
};

/**
 * Transition context for audit trail
 */
export interface TransitionContext {
  actorId?: string;
  actorRole?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Guard Lead state transition
 * 
 * @param entityId Lead ID
 * @param currentState Current state
 * @param nextState Desired next state
 * @param context Actor and reason
 * @returns true if transition is valid
 * @throws Error if transition is forbidden
 */
export async function transitionLeadState(
  entityId: string,
  currentState: LeadState,
  nextState: LeadState,
  context: TransitionContext
): Promise<boolean> {
  const allowedTransitions = LEAD_TRANSITIONS[currentState];

  if (!allowedTransitions.includes(nextState)) {
    throw new Error(
      `Invalid Lead state transition: ${currentState} → ${nextState}. Allowed: ${allowedTransitions.join(', ')}`
    );
  }

  // Record mutation history (Constitution Article IV.3)
  await recordMutation({
    entityType: 'Lead',
    entityId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    previousState: currentState,
    nextState,
    reason: context.reason,
    metadata: context.metadata,
  });

  // Emit domain event (Constitution Article VII)
  await recordDomainEvent({
    eventType: 'LEAD_STATE_CHANGED',
    entityType: 'Lead',
    entityId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    metadata: {
      previousState: currentState,
      nextState,
      reason: context.reason,
      ...context.metadata,
    },
  });

  return true;
}

/**
 * Guard Bid state transition
 * 
 * @param entityId Bid ID
 * @param currentState Current state
 * @param nextState Desired next state
 * @param context Actor and reason
 * @returns true if transition is valid
 * @throws Error if transition is forbidden
 */
export async function transitionBidState(
  entityId: string,
  currentState: BidState,
  nextState: BidState,
  context: TransitionContext
): Promise<boolean> {
  const allowedTransitions = BID_TRANSITIONS[currentState];

  if (!allowedTransitions.includes(nextState)) {
    throw new Error(
      `Invalid Bid state transition: ${currentState} → ${nextState}. Allowed: ${allowedTransitions.join(', ')}`
    );
  }

  // Record mutation history (Constitution Article IV.3)
  await recordMutation({
    entityType: 'Bid',
    entityId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    previousState: currentState,
    nextState,
    reason: context.reason,
    metadata: context.metadata,
  });

  // Emit domain event (Constitution Article VII)
  await recordDomainEvent({
    eventType: 'BID_STATE_CHANGED',
    entityType: 'Bid',
    entityId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    metadata: {
      previousState: currentState,
      nextState,
      reason: context.reason,
      ...context.metadata,
    },
  });

  return true;
}

/**
 * Guard Purchase state transition
 * 
 * @param entityId Purchase ID
 * @param currentState Current state
 * @param nextState Desired next state
 * @param context Actor and reason
 * @returns true if transition is valid
 * @throws Error if transition is forbidden
 */
export async function transitionPurchaseState(
  entityId: string,
  currentState: PurchaseState,
  nextState: PurchaseState,
  context: TransitionContext
): Promise<boolean> {
  const allowedTransitions = PURCHASE_TRANSITIONS[currentState];

  if (!allowedTransitions.includes(nextState)) {
    throw new Error(
      `Invalid Purchase state transition: ${currentState} → ${nextState}. Allowed: ${allowedTransitions.join(', ')}`
    );
  }

  // Record mutation history (Constitution Article IV.3)
  await recordMutation({
    entityType: 'Purchase',
    entityId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    previousState: currentState,
    nextState,
    reason: context.reason,
    metadata: context.metadata,
  });

  // Emit domain event (Constitution Article VII)
  await recordDomainEvent({
    eventType: 'PURCHASE_STATE_CHANGED',
    entityType: 'Purchase',
    entityId,
    actorId: context.actorId,
    actorRole: context.actorRole,
    metadata: {
      previousState: currentState,
      nextState,
      reason: context.reason,
      ...context.metadata,
    },
  });

  return true;
}
