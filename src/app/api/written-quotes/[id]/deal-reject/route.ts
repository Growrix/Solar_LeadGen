/**
 * Written Quote Reject Done-Deal API
 *
 * POST /api/written-quotes/[id]/deal-reject
 * Rejects (declines) a pending done-deal request; negotiation re-opens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteDealRejectRoute' });

function deriveNegotiationStatusAfterDealReject(writtenQuote: {
  homeownerCounterAt: Date | null;
  installerRevisedAt: Date | null;
}): string {
  const homeownerAt = writtenQuote.homeownerCounterAt?.getTime() ?? 0;
  const installerAt = writtenQuote.installerRevisedAt?.getTime() ?? 0;

  if (homeownerAt === 0 && installerAt === 0) return 'PENDING';
  return homeownerAt >= installerAt ? 'HOMEOWNER_COUNTERED' : 'INSTALLER_RESPONDED';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `deal-reject-${Date.now()}`;
  const { id } = await context.params;

  try {
    const auth = await requireAuth();

    const writtenQuote = await prisma.writtenQuote.findUnique({
      where: { id },
      include: {
        lead: { select: { homeownerId: true } },
        installer: { select: { id: true } },
      },
    });

    if (!writtenQuote) {
      return NextResponse.json({ error: 'Written quote not found' }, { status: 404 });
    }

    const isInstaller = writtenQuote.installerId === auth.userId;
    const isHomeowner = writtenQuote.lead.homeownerId === auth.userId;

    if (!isInstaller && !isHomeowner) {
      return NextResponse.json({ error: 'You are not authorized to reject this deal' }, { status: 403 });
    }

    if (writtenQuote.negotiationStatus === 'AGREED' || writtenQuote.negotiationStatus === 'REJECTED' || writtenQuote.purchasedAt) {
      return NextResponse.json({ error: 'This negotiation is already closed.' }, { status: 403 });
    }

    if (writtenQuote.negotiationStatus !== 'PENDING_ACCEPTANCE') {
      return NextResponse.json({ error: 'No pending done-deal request to reject.' }, { status: 400 });
    }

    const proposerId = writtenQuote.agreedBy;
    if (!proposerId) {
      return NextResponse.json({ error: 'Missing proposer for pending done-deal.' }, { status: 400 });
    }

    if (proposerId === auth.userId) {
      return NextResponse.json({ error: 'You cannot reject your own done-deal request.' }, { status: 400 });
    }

    const nextStatus = deriveNegotiationStatusAfterDealReject({
      homeownerCounterAt: writtenQuote.homeownerCounterAt,
      installerRevisedAt: writtenQuote.installerRevisedAt,
    });

    await prisma.writtenQuote.update({
      where: { id },
      data: {
        negotiationStatus: nextStatus,
        agreedAmount: null,
        agreedAt: null,
        agreedBy: null,
      },
    });

    const otherPartyId = isInstaller ? writtenQuote.lead.homeownerId : writtenQuote.installer.id;
    const otherPartyRole = isInstaller ? UserRole.HOMEOWNER : UserRole.INSTALLER;

    await createNotification({
      recipientUserId: otherPartyId,
      actionType: NotificationType.BID_SUBMITTED,
      role: otherPartyRole,
      messageKey: isInstaller ? 'homeowner.request.received' : 'installer.bid.received',
      routeKey: isInstaller ? 'homeowner.requests' : 'installer.leads',
      routeParams: { leadId: writtenQuote.leadId },
      metadata: {
        rejectedBy: auth.userId,
      },
    });

    logger.info('Done-deal rejected; negotiation reopened', {
      writtenQuoteId: id,
      rejectedBy: auth.userId,
      nextStatus,
      correlationId,
    });

    return NextResponse.json({ success: true, message: 'Done-deal rejected' }, { status: 200 });
  } catch (error) {
    logger.error('Done-deal reject failed', error, { correlationId });
    return NextResponse.json({ error: 'Failed to reject done-deal' }, { status: 500 });
  }
}
