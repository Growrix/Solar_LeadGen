/**
 * Lead State Machine Service
 * 
 * Purpose: Manage lead lifecycle state transitions with validation
 * Used for: Status updates, workflow enforcement, business rules
 * 
 * State Machine Flow:
 * DRAFT → PENDING_PHONE → PENDING_APPROVAL → APPROVED → PURCHASED → QUOTED → ACCEPTED/REJECTED
 *                                          ↓
 *                                      FLAGGED (admin review)
 *                                          ↓
 *                                      EXPIRED/CANCELLED
 * 
 * Why a state machine?
 * - Enforces valid state transitions (can't skip steps)
 * - Centralizes business logic (one place to understand workflow)
 * - Prevents invalid operations (can't quote an unpurchased lead)
 * - Audits all state changes automatically
 */

import { LeadStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from './audit-logger';

/**
 * Valid state transitions
 * Key: current status → Array of allowed next statuses
 */
const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  DRAFT: ['PENDING_PHONE', 'CANCELLED'],
  PENDING_PHONE: ['PENDING_APPROVAL', 'DRAFT', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'FLAGGED', 'CANCELLED'],
  APPROVED: ['PURCHASED', 'EXPIRED', 'FLAGGED'],
  PURCHASED: ['QUOTED', 'EXPIRED', 'CANCELLED'],
  QUOTED: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  ACCEPTED: [], // Terminal state
  REJECTED: [], // Terminal state
  EXPIRED: [], // Terminal state
  CANCELLED: [], // Terminal state
  FLAGGED: ['PENDING_APPROVAL', 'CANCELLED'], // Admin can unflag or cancel
};

/**
 * Transition lead to new status
 * 
 * @param leadId - Lead ID
 * @param newStatus - Target status
 * @param userId - User performing the transition (for audit log)
 * @param reason - Optional reason for transition
 * @returns Updated lead
 * @throws Error if transition is invalid
 * 
 * Example:
 *   await transitionLeadStatus(leadId, 'APPROVED', adminId, 'Phone verified and documents checked');
 */
export async function transitionLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  userId: string,
  reason?: string
): Promise<void> {
  // Get current lead
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { status: true },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  const currentStatus = lead.status;

  // Check if transition is valid
  if (!isValidTransition(currentStatus, newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
      `Allowed transitions from ${currentStatus}: ${VALID_TRANSITIONS[currentStatus].join(', ')}`
    );
  }

  // Prepare update data
  const updateData: any = {
    status: newStatus,
    updatedAt: new Date(),
  };

  // Set timestamps based on status
  if (newStatus === 'APPROVED') {
    updateData.approvedAt = new Date();
    // Set expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    updateData.expiresAt = expiresAt;
  }

  if (newStatus === 'PURCHASED') {
    updateData.purchasedAt = new Date();
  }

  // Update lead status
  await prisma.lead.update({
    where: { id: leadId },
    data: updateData,
  });

  // Create audit log
  await createAuditLog({
    action: 'lead_status_changed',
    entityType: 'lead',
    entityId: leadId,
    leadId,
    userId,
    metadata: {
      oldStatus: currentStatus,
      newStatus,
      reason,
    },
  });

  // Trigger notifications based on status change
  await triggerStatusChangeNotifications(leadId, currentStatus, newStatus);

  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ [LeadState] Lead ${leadId}: ${currentStatus} → ${newStatus}`);
  }
}

/**
 * Check if transition is valid
 * 
 * @param from - Current status
 * @param to - Target status
 * @returns True if transition is allowed
 */
export function isValidTransition(from: LeadStatus, to: LeadStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get all allowed next statuses for a lead
 * 
 * @param currentStatus - Current lead status
 * @returns Array of allowed next statuses
 * 
 * Example:
 *   const nextStatuses = getAllowedNextStatuses('PENDING_APPROVAL');
 *   // Returns: ['APPROVED', 'FLAGGED', 'CANCELLED']
 */
export function getAllowedNextStatuses(currentStatus: LeadStatus): LeadStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Trigger notifications based on status change
 * 
 * @param leadId - Lead ID
 * @param oldStatus - Previous status
 * @param newStatus - New status
 */
async function triggerStatusChangeNotifications(
  leadId: string,
  oldStatus: LeadStatus,
  newStatus: LeadStatus
): Promise<void> {
  // Import notification service to avoid circular dependency
  const { createNotification } = await import('./notification-service');
  const { triggerStatusUpdate } = await import('@/lib/pusher');
  const { sendLeadApprovedNotification } = await import('@/lib/sendgrid');

  // Get lead details for notifications
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      homeowner: true,
      installer: true,
    },
  });

  if (!lead) return;

  // Notify homeowner when lead is approved
  if (newStatus === 'APPROVED') {
    await createNotification({
      userId: lead.homeownerId,
      type: 'LEAD_APPROVED',
      title: 'Lead Approved!',
      message: 'Your solar lead request has been approved and is now visible to installers.',
      actionUrl: `/homeowner/leads/${leadId}`,
      metadata: { leadId },
    });

    // Send email notification
    if (lead.homeowner.email) {
      await sendLeadApprovedNotification(lead.homeowner.email, {
        homeownerName: lead.homeowner.name || 'there',
        leadId: lead.id,
      });
    }
  }

  // Notify homeowner when lead is purchased
  if (newStatus === 'PURCHASED' && lead.installer) {
    await createNotification({
      userId: lead.homeownerId,
      type: 'LEAD_PURCHASED',
      title: 'Your Lead Was Purchased!',
      message: `${lead.installer.companyName || lead.installer.name} is now working on your quote.`,
      actionUrl: `/homeowner/leads/${leadId}`,
      metadata: { leadId, installerId: lead.installerId },
    });
  }

  // Notify installer when quote is accepted
  if (newStatus === 'ACCEPTED' && lead.installer) {
    await createNotification({
      userId: lead.installerId!,
      type: 'QUOTE_ACCEPTED',
      title: 'Quote Accepted!',
      message: `${lead.homeowner.name} accepted your quote for ${lead.location}.`,
      actionUrl: `/installer/leads/${leadId}`,
      metadata: { leadId },
    });
  }

  // Notify installer when quote is rejected
  if (newStatus === 'REJECTED' && lead.installer) {
    await createNotification({
      userId: lead.installerId!,
      type: 'QUOTE_REJECTED',
      title: 'Quote Not Accepted',
      message: `${lead.homeowner.name} did not accept your quote for ${lead.location}.`,
      actionUrl: `/installer/leads/${leadId}`,
      metadata: { leadId },
    });
  }

  // Broadcast status update via Pusher
  await triggerStatusUpdate(leadId, {
    previousStatus: oldStatus,
    newStatus,
    updatedBy: 'system',
    timestamp: new Date(),
  });
}

/**
 * Check if lead has expired
 * 
 * @param leadId - Lead ID
 * @returns True if lead is expired
 */
export async function checkLeadExpiry(leadId: string): Promise<boolean> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { status: true, expiresAt: true },
  });

  if (!lead || !lead.expiresAt) return false;

  const isExpired = new Date() > lead.expiresAt;

  if (isExpired && lead.status !== 'EXPIRED') {
    // Auto-expire lead
    await transitionLeadStatus(leadId, 'EXPIRED', 'system', 'Lead expired after 30 days');
  }

  return isExpired;
}

/**
 * Batch check for expired leads (cron job)
 * 
 * Usage: Call this from a scheduled task every hour
 * Example: /api/cron/check-expired-leads (protected by cron secret)
 */
export async function checkAllExpiredLeads(): Promise<number> {
  const expiredLeads = await prisma.lead.findMany({
    where: {
      status: { in: ['APPROVED', 'PURCHASED', 'QUOTED'] },
      expiresAt: { lt: new Date() },
    },
    select: { id: true },
  });

  let expiredCount = 0;

  for (const lead of expiredLeads) {
    try {
      await transitionLeadStatus(lead.id, 'EXPIRED', 'system', 'Auto-expired by cron job');
      expiredCount++;
    } catch (error) {
      console.error(`❌ [LeadState] Failed to expire lead ${lead.id}:`, error);
    }
  }

  if (process.env.NODE_ENV === 'development' && expiredCount > 0) {
    console.log(`✅ [LeadState] Expired ${expiredCount} lead(s)`);
  }

  return expiredCount;
}
