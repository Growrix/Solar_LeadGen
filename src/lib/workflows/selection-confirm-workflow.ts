/**
 * Selection Confirm Workflow
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article V
 * Purpose: Explicit workflow for homeowner selecting winning bid
 * 
 * Workflow: Trigger → Validate → Apply Rules → Change State → Emit Event → Side Effects
 */

import { prisma } from '@/lib/prisma';
import { transitionLeadState, transitionBidState, LEAD_STATES, BID_STATES } from '@/lib/domain/state-machines';
import { recordDomainEvent } from '@/lib/events/domain-event-logger';
import { createLogger } from '@/lib/logger';
import { createNotification } from '@/lib/notifications/notification-service';

const logger = createLogger({ workflow: 'SelectionConfirm' });

export interface SelectionConfirmInput {
  leadId: string;
  winningBidId: string;
  homeownerId: string;
  homeownerRole: string;
}

export interface SelectionConfirmResult {
  success: boolean;
  leadId: string;
  winningBidId: string;
  message: string;
}

/**
 * Execute selection confirm workflow
 * 
 * @param input Selection details
 * @returns Result with success status
 */
export async function executeSelectionConfirm(input: SelectionConfirmInput): Promise<SelectionConfirmResult> {
  logger.info('Selection confirm workflow initiated', { leadId: input.leadId, winningBidId: input.winningBidId });

  try {
    // Step 1: Validate - Load lead and verify ownership
    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      include: {
        bids: {
          include: {
            installer: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.homeownerId !== input.homeownerId) {
      throw new Error('Unauthorized: Homeowner does not own this lead');
    }

    // Step 2: Apply Rules - Verify lead is in valid state for selection
    if (lead.status !== LEAD_STATES.QUOTED) {
      throw new Error(`Cannot select winner: Lead must be in QUOTED state, currently ${lead.status}`);
    }

    // Verify winning bid exists and belongs to this lead
    const winningBid = lead.bids.find((b) => b.id === input.winningBidId);

    if (!winningBid) {
      throw new Error('Winning bid not found or does not belong to this lead');
    }

    // Step 3: Change State - Transition lead to ACCEPTED
    await transitionLeadState(
      input.leadId,
      lead.status as any,
      LEAD_STATES.ACCEPTED,
      {
        actorId: input.homeownerId,
        actorRole: input.homeownerRole,
        reason: 'Winner selected by homeowner',
        metadata: { winningBidId: input.winningBidId, installerId: winningBid.installerId },
      }
    );

    // Step 4: Change State - Transition winning bid to ACCEPTED
    await transitionBidState(
      input.winningBidId,
      BID_STATES.SUBMITTED,
      BID_STATES.ACCEPTED,
      {
        actorId: input.homeownerId,
        actorRole: input.homeownerRole,
        reason: 'Selected as winner by homeowner',
        metadata: { leadId: input.leadId },
      }
    );

    // Step 5: Change State - Transition losing bids to REJECTED
    const losingBids = lead.bids.filter((b) => b.id !== input.winningBidId);

    for (const losingBid of losingBids) {
      await transitionBidState(
        losingBid.id,
        BID_STATES.SUBMITTED,
        BID_STATES.REJECTED,
        {
          actorId: input.homeownerId,
          actorRole: input.homeownerRole,
          reason: 'Not selected by homeowner',
          metadata: { leadId: input.leadId, winningBidId: input.winningBidId },
        }
      );
    }

    // Step 6: Apply Business Logic - Update database
    await prisma.lead.update({
      where: { id: input.leadId },
      data: {
        status: LEAD_STATES.ACCEPTED,
      },
    });

    logger.info('Selection confirmed', { leadId: input.leadId, winningBidId: input.winningBidId });

    // Step 7: Emit Domain Event
    await recordDomainEvent({
      eventType: 'SELECTION_CONFIRMED',
      entityType: 'Lead',
      entityId: input.leadId,
      actorId: input.homeownerId,
      actorRole: input.homeownerRole,
      metadata: {
        winningBidId: input.winningBidId,
        installerId: winningBid.installerId,
        losingBidIds: losingBids.map((b) => b.id),
      },
    });

    // Step 8: Side Effects - Send notifications
    await sendSelectionConfirmNotifications(
      input.leadId,
      input.winningBidId,
      winningBid.installerId,
      losingBids.map((b) => b.installerId)
    );

    return {
      success: true,
      leadId: input.leadId,
      winningBidId: input.winningBidId,
      message: 'Selection confirmed successfully',
    };
  } catch (error) {
    logger.error('Selection confirm workflow failed', error, { leadId: input.leadId });
    throw error;
  }
}

/**
 * Send notifications for selection confirmation (side effect)
 */
async function sendSelectionConfirmNotifications(
  leadId: string,
  winningBidId: string,
  winnerId: string,
  loserIds: string[]
): Promise<void> {
  try {
    // Notify winner
    await createNotification({
      recipientUserId: winnerId,
      role: 'INSTALLER',
      actionType: 'BID_WON',
      messageKey: 'installer.bid.won',
      routeKey: 'installer.leads',
      routeParams: { leadId },
    });

    // Notify losers
    for (const loserId of loserIds) {
      await createNotification({
        recipientUserId: loserId,
        role: 'INSTALLER',
        actionType: 'BID_OUTCOME_NOT_SELECTED',
        messageKey: 'installer.bid.outcome.other',
        routeKey: 'installer.leads',
        routeParams: { leadId },
      });
    }

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        recipientUserId: admin.id,
        role: 'ADMIN',
        actionType: 'SELECTION_CONFIRMED',
        messageKey: 'admin.bid.winner.selected',
        routeKey: 'admin.dashboard',
        routeParams: { leadId },
        metadata: { winningBidId, winnerId },
      });
    }

    logger.info('Selection confirm notifications sent', { leadId, winningBidId, winnerId });
  } catch (error) {
    logger.error('Failed to send selection confirm notifications', error, { leadId });
    // Don't throw - notification failures shouldn't break the workflow
  }
}
