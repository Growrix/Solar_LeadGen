/**
 * Lead Purchase Workflow
 * 
 * Authority: DOC/Guidelines/SYSTEM DESIGN/SYSTEM_CONSTITUTION.md Article V
 * Purpose: Explicit workflow for installer purchasing a lead
 * 
 * Workflow: Trigger → Validate → Apply Rules → Change State → Emit Event → Side Effects
 */

import { prisma } from '@/lib/prisma';
import { transitionLeadState, LEAD_STATES } from '@/lib/domain/state-machines';
import { recordDomainEvent } from '@/lib/events/domain-event-logger';
import { createLogger } from '@/lib/logger';
import { createNotification } from '@/lib/notifications/notification-service';

const logger = createLogger({ workflow: 'LeadPurchase' });

export interface LeadPurchaseInput {
  leadId: string;
  installerId: string;
  installerRole: string;
  amount: number;
  paymentIntentId?: string;
}

export interface LeadPurchaseResult {
  success: boolean;
  leadId: string;
  message: string;
}

/**
 * Execute lead purchase workflow
 * 
 * @param input Purchase details
 * @returns Result with success status
 */
export async function executeLeadPurchase(input: LeadPurchaseInput): Promise<LeadPurchaseResult> {
  logger.info('Lead purchase workflow initiated', { leadId: input.leadId, installerId: input.installerId });

  try {
    // Step 1: Validate - Load lead and verify state
    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
      include: {
        homeowner: { select: { id: true, email: true, name: true } },
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status !== LEAD_STATES.APPROVED) {
      throw new Error(`Lead must be in APPROVED state, currently ${lead.status}`);
    }

    // Step 2: Apply Rules - Check if installer already owns lead
    const existingPurchase = await prisma.leadPurchase.findFirst({
      where: {
        leadId: input.leadId,
        installerId: input.installerId,
      },
    });

    if (existingPurchase) {
      throw new Error('Installer already purchased this lead');
    }

    // Step 3: Change State - Transition lead to PURCHASED
    await transitionLeadState(
      input.leadId,
      lead.status as any,
      LEAD_STATES.PURCHASED,
      {
        actorId: input.installerId,
        actorRole: input.installerRole,
        reason: 'Lead purchased by installer',
        metadata: { amount: input.amount, paymentIntentId: input.paymentIntentId },
      }
    );

    // Step 4: Apply Business Logic - Create lead purchase record
    const purchase = await prisma.leadPurchase.create({
      data: {
        leadId: input.leadId,
        installerId: input.installerId,
        amount: input.amount,
        paymentIntentId: input.paymentIntentId,
        purchasedAt: new Date(),
      },
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: input.leadId },
      data: { status: LEAD_STATES.PURCHASED },
    });

    logger.info('Lead purchase completed', { leadId: input.leadId, purchaseId: purchase.id });

    // Step 5: Emit Domain Event
    await recordDomainEvent({
      eventType: 'LEAD_PURCHASED',
      entityType: 'Lead',
      entityId: input.leadId,
      actorId: input.installerId,
      actorRole: input.installerRole,
      metadata: {
        purchaseId: purchase.id,
        amount: input.amount,
        homeownerId: lead.homeownerId,
      },
    });

    // Step 6: Side Effects - Send notifications
    await sendLeadPurchaseNotifications(input.leadId, input.installerId, lead.homeownerId);

    return {
      success: true,
      leadId: input.leadId,
      message: 'Lead purchased successfully',
    };
  } catch (error) {
    logger.error('Lead purchase workflow failed', error, { leadId: input.leadId });
    throw error;
  }
}

/**
 * Send notifications for lead purchase (side effect)
 */
async function sendLeadPurchaseNotifications(
  leadId: string,
  installerId: string,
  homeownerId: string
): Promise<void> {
  try {
    // Notify homeowner
    await createNotification({
      recipientUserId: homeownerId,
      role: 'HOMEOWNER',
      actionType: 'INSTALLER_RESPONDED',
      messageKey: 'homeowner.installer.responded',
      routeKey: 'homeowner.dashboard.preview_request',
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
        actionType: 'LEAD_PURCHASED',
        messageKey: 'admin.lead.purchased',
        routeKey: 'admin.lead.manage',
        routeParams: { leadId },
      });
    }

    logger.info('Lead purchase notifications sent', { leadId, installerId, homeownerId });
  } catch (error) {
    logger.error('Failed to send lead purchase notifications', error, { leadId });
    // Don't throw - notification failures shouldn't break the workflow
  }
}
