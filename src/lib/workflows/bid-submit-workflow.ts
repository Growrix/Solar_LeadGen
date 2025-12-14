/**
 * Bid Submit Workflow
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article V
 * Purpose: Explicit workflow for installer submitting a bid
 * 
 * Workflow: Trigger → Validate → Apply Rules → Change State → Emit Event → Side Effects
 */

import { prisma } from '@/lib/prisma';
import { transitionBidState, BID_STATES } from '@/lib/domain/state-machines';
import { recordDomainEvent } from '@/lib/events/domain-event-logger';
import { createLogger } from '@/lib/logger';
import { createNotification } from '@/lib/notifications/notification-service';

const logger = createLogger({ workflow: 'BidSubmit' });

export interface BidSubmitInput {
  bidId: string;
  installerId: string;
  installerRole: string;
  bidData: any; // Bid details from form
}

export interface BidSubmitResult {
  success: boolean;
  bidId: string;
  message: string;
}

/**
 * Execute bid submit workflow
 * 
 * @param input Bid submission details
 * @returns Result with success status
 */
export async function executeBidSubmit(input: BidSubmitInput): Promise<BidSubmitResult> {
  logger.info('Bid submit workflow initiated', { bidId: input.bidId, installerId: input.installerId });

  try {
    // Step 1: Validate - Load bid and verify ownership
    const bid = await prisma.bid.findUnique({
      where: { id: input.bidId },
      include: {
        lead: {
          include: {
            homeowner: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.installerId !== input.installerId) {
      throw new Error('Unauthorized: Installer does not own this bid');
    }

    // Step 2: Apply Rules - Verify lead is in valid state for bidding
    if (!['APPROVED', 'PURCHASED'].includes(bid.lead.status)) {
      throw new Error(`Cannot submit bid: Lead is in ${bid.lead.status} state`);
    }

    // Step 3: Change State - Transition bid to SUBMITTED
    await transitionBidState(
      input.bidId,
      BID_STATES.DRAFT,
      BID_STATES.SUBMITTED,
      {
        actorId: input.installerId,
        actorRole: input.installerRole,
        reason: 'Bid submitted by installer',
        metadata: { leadId: bid.leadId },
      }
    );

    // Step 4: Apply Business Logic - Update bid with submission data
    const updatedBid = await prisma.bid.update({
      where: { id: input.bidId },
      data: {
        ...input.bidData,
        submittedAt: new Date(),
      },
    });

    logger.info('Bid submitted successfully', { bidId: input.bidId, leadId: bid.leadId });

    // Step 5: Emit Domain Event
    await recordDomainEvent({
      eventType: 'BID_SUBMITTED',
      entityType: 'Bid',
      entityId: input.bidId,
      actorId: input.installerId,
      actorRole: input.installerRole,
      metadata: {
        leadId: bid.leadId,
        homeownerId: bid.lead.homeownerId,
        bidAmount: updatedBid.finalTotal,
      },
    });

    // Step 6: Side Effects - Send notifications
    await sendBidSubmitNotifications(input.bidId, bid.leadId, input.installerId, bid.lead.homeownerId);

    return {
      success: true,
      bidId: input.bidId,
      message: 'Bid submitted successfully',
    };
  } catch (error) {
    logger.error('Bid submit workflow failed', error, { bidId: input.bidId });
    throw error;
  }
}

/**
 * Send notifications for bid submission (side effect)
 */
async function sendBidSubmitNotifications(
  bidId: string,
  leadId: string,
  installerId: string,
  homeownerId: string
): Promise<void> {
  try {
    // Notify homeowner
    await createNotification({
      recipientUserId: homeownerId,
      role: 'HOMEOWNER',
      actionType: 'RESPONSES_AVAILABLE',
      messageKey: 'homeowner.bid.received',
      routeKey: 'homeowner.requests',
      routeParams: { leadId },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        recipientUserId: admin.id,
        role: 'ADMIN',
        actionType: 'BID_SUBMITTED',
        messageKey: 'admin.bid.submitted',
        routeKey: 'admin.dashboard',
        routeParams: { bidId },
        metadata: { leadId, installerId },
      });
    }

    logger.info('Bid submit notifications sent', { bidId, leadId, installerId, homeownerId });
  } catch (error) {
    logger.error('Failed to send bid submit notifications', error, { bidId });
    // Don't throw - notification failures shouldn't break the workflow
  }
}
