/**
 * Domain Event Types
 * 
 * Purpose: Type-safe event definitions for event-driven architecture
 * Authority: DOC/Architecture/EVENT-ORCHESTRATION.md
 */

import { UserRole } from '@prisma/client';

/**
 * Base domain event interface
 */
export interface DomainEvent<T = any> {
  id: string;                    // Unique event ID
  type: string;                  // Event type (e.g., 'lead.approved')
  aggregateId: string;           // Entity ID (e.g., leadId)
  aggregateType: string;         // Entity type (e.g., 'Lead')
  data: T;                       // Event payload
  metadata: EventMetadata;       // Event metadata
}

/**
 * Event metadata (who, when, where)
 */
export interface EventMetadata {
  userId?: string;               // Actor who triggered event
  userRole?: UserRole;           // Actor's role
  timestamp: Date;               // When event occurred
  source: string;                // Where event originated (e.g., 'api', 'webhook', 'cron')
  correlationId?: string;        // For tracing related events
}

/**
 * Event handler function
 */
export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

/**
 * Lead event data types
 */
export interface LeadCreatedData {
  leadId: string;
  homeownerEmail: string;
  propertyPostcode: string;
  quoteType: string;
}

export interface LeadApprovedData {
  leadId: string;
  homeownerEmail: string;
  propertyPostcode: string;
  approvedBy: string;
}

export interface LeadPurchasedData {
  leadId: string;
  installerId: string;
  installerEmail: string;
  homeownerEmail: string;
  purchaseAmount: number;
}

export interface LeadRejectedData {
  leadId: string;
  homeownerEmail: string;
  reason: string;
  rejectedBy: string;
}

/**
 * Bid event data types
 */
export interface BidSubmittedData {
  bidId: string;
  leadId: string;
  installerId: string;
  installerEmail: string;
  bidAmount: number;
}

export interface BidSelectedData {
  bidId: string;
  leadId: string;
  winnerId: string;
  winnerEmail: string;
  loserIds: string[];
}

export interface BidPurchasedData {
  bidId: string;
  leadId: string;
  installerId: string;
  purchaseAmount: number;
}

/**
 * User event data types
 */
export interface UserRegisteredData {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UserVerifiedData {
  userId: string;
  email: string;
}

export interface UserDeactivatedData {
  userId: string;
  email: string;
  reason: string;
  deactivatedBy: string;
}

/**
 * Event type constants
 */
export const EventTypes = {
  // Lead events
  LEAD_CREATED: 'lead.created',
  LEAD_APPROVED: 'lead.approved',
  LEAD_PURCHASED: 'lead.purchased',
  LEAD_REJECTED: 'lead.rejected',
  
  // Bid events
  BID_SUBMITTED: 'bid.submitted',
  BID_SELECTED: 'bid.selected',
  BID_PURCHASED: 'bid.purchased',
  
  // User events
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  USER_DEACTIVATED: 'user.deactivated',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];
