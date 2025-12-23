/**
 * Written Quote Accept Done-Deal API
 *
 * POST /api/written-quotes/[id]/accept
 * Step 2 of handshake: other party accepts a pending done-deal request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteAcceptRoute' });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `accept-${Date.now()}`;
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
      return NextResponse.json({ error: 'You are not authorized to accept this quote' }, { status: 403 });
    }

    if (writtenQuote.negotiationStatus === 'AGREED' || writtenQuote.negotiationStatus === 'REJECTED' || writtenQuote.purchasedAt) {
      return NextResponse.json({ error: 'This negotiation is already closed.' }, { status: 403 });
    }

    if (writtenQuote.negotiationStatus !== 'PENDING_ACCEPTANCE') {
      return NextResponse.json({ error: 'No pending done-deal request to accept.' }, { status: 400 });
    }

    const proposerId = writtenQuote.agreedBy;
    if (!proposerId) {
      return NextResponse.json({ error: 'Missing proposer for pending done-deal.' }, { status: 400 });
    }

    if (proposerId === auth.userId) {
      return NextResponse.json({ error: 'You cannot accept your own done-deal request.' }, { status: 400 });
    }

    const agreedAmount =
      writtenQuote.agreedAmount ??
      writtenQuote.installerRevisedAmount ??
      writtenQuote.homeownerCounterAmount ??
      writtenQuote.finalTotal ??
      writtenQuote.amount;

    const updatedQuote = await prisma.writtenQuote.update({
      where: { id },
      data: {
        negotiationStatus: 'AGREED',
        agreedAmount,
        // Overwrite agreedBy with the accepting user (final acceptance)
        agreedBy: auth.userId,
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
        agreedAmount,
        acceptedBy: auth.userId,
      },
    });

    logger.info('Done-deal accepted successfully', {
      writtenQuoteId: id,
      acceptedBy: auth.userId,
      agreedAmount,
      correlationId,
    });

    return NextResponse.json(
      {
        success: true,
        agreedAmount,
        message: 'Done-deal accepted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Done-deal accept failed', error, { correlationId });
    return NextResponse.json({ error: 'Failed to accept done-deal' }, { status: 500 });
  }
}
