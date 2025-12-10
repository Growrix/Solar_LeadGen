/**
 * Shared lead utility functions that can be used on both client and server
 */

import { LeadStatus } from '@prisma/client';

/**
 * Check if a lead can be cancelled
 * A lead can be cancelled if it has not been purchased yet
 */
export function canCancelLead(lead: { status: LeadStatus | string }): boolean {
  return lead.status !== LeadStatus.PURCHASED && lead.status !== 'PURCHASED';
}

/**
 * Check if a lead can be edited
 * A lead can only be edited if it's still in PENDING_APPROVAL status
 */
export function canEditLead(lead: { status: LeadStatus | string }): boolean {
  return lead.status === LeadStatus.PENDING_APPROVAL || lead.status === 'PENDING_APPROVAL';
}
