/**
 * Written Quote Agreement API
 * 
 * POST /api/written-quotes/[id]/agree
 * Either installer or homeowner can finalize the negotiation ("Done Deal")
 * 
 * Phase 13W - Negotiation flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import type { AgreeQuoteRequest } from '@/types/written-quote';
import { createLogger } from '@/lib/logger';
import { expireNegotiationIfNeeded } from '@/lib/written-quotes/negotiation-window';

const logger = createLogger({ context: 'WrittenQuoteAgreeRoute' });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `agree-${Date.now()}`;
  const { id } = await context.params;
  
  try {
    // Both installer and homeowner can agree
    const auth = await requireAuth();

    const body: AgreeQuoteRequest = await request.json();
    
    logger.info('Quote agreement initiated', { 
      writtenQuoteId: id,
      userId: auth.userId,
      role: auth.role,
      correlationId 
    });

    // Fetch written quote with lead info
    const writtenQuote = await prisma.writtenQuote.findUnique({
      where: { id },
      include: {
        lead: {
          select: { homeownerId: true }
        },
        installer: {
          select: { id: true, email: true }
        }
      }
    });

    if (!writtenQuote) {
      logger.warn('Written quote not found', { writtenQuoteId: id, correlationId });
      return NextResponse.json(
        { error: 'Written quote not found' },
        { status: 404 }
      );
    }

    // Phase 13W.4: Expiry enforcement
    const { expired } = await expireNegotiationIfNeeded(id);
    if (expired) {
      return NextResponse.json(
        { error: 'Negotiation has expired and is now closed.' },
        { status: 403 }
      );
    }

    // Verify user is either installer or homeowner of this quote
    const isInstaller = writtenQuote.installerId === auth.userId;
    const isHomeowner = writtenQuote.lead.homeownerId === auth.userId;

    if (!isInstaller && !isHomeowner) {
      logger.warn('Unauthorized agree attempt', { 
        writtenQuoteId: id,
        userId: auth.userId,
        installerId: writtenQuote.installerId,
        homeownerId: writtenQuote.lead.homeownerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to finalize this quote' },
        { status: 403 }
      );
    }

    // Negotiation is closed once agreed/rejected/purchased
    if (writtenQuote.negotiationStatus === 'AGREED' || writtenQuote.negotiationStatus === 'REJECTED' || writtenQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || writtenQuote.purchasedAt) {
      logger.warn('Duplicate agree attempt', { 
        writtenQuoteId: id,
        correlationId 
      });
      return NextResponse.json(
        { error: 'This negotiation is already closed.' },
        { status: 403 }
      );
    }

    // If a done-deal has already been requested, negotiation is locked until accepted/rejected
    if (writtenQuote.negotiationStatus === 'PENDING_ACCEPTANCE') {
      return NextResponse.json(
        { error: 'A done-deal is already pending acceptance.' },
        { status: 403 }
      );
    }

    // Calculate final agreed amount (last price is authoritative based on timestamp)
    let agreedAmount = writtenQuote.finalTotal || writtenQuote.amount;
    let lastActivityTime = writtenQuote.createdAt.getTime();

    if (writtenQuote.installerRevisedAt && writtenQuote.installerRevisedAmount) {
      const t = new Date(writtenQuote.installerRevisedAt).getTime();
      if (t > lastActivityTime) {
        lastActivityTime = t;
        agreedAmount = writtenQuote.installerRevisedAmount;
      }
    }

    if (writtenQuote.homeownerCounterAt && writtenQuote.homeownerCounterAmount) {
      const t = new Date(writtenQuote.homeownerCounterAt).getTime();
      if (t > lastActivityTime) {
        lastActivityTime = t;
        agreedAmount = writtenQuote.homeownerCounterAmount;
      }
    }

    // Step 1: Request a done-deal. The other party must accept or reject.
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id },
      data: {
        negotiationStatus: 'PENDING_ACCEPTANCE',
        agreedAmount,
        agreedAt: new Date(),
        // While pending, store the proposer in agreedBy (accept endpoint overwrites this with acceptor).
        agreedBy: auth.userId
      }
    });

    logger.info('Done-deal requested successfully', { 
      writtenQuoteId: id,
      proposedBy: auth.userId,
      agreedAmount,
      correlationId 
    });

    // Notify the other party
    const otherPartyId = isInstaller ? writtenQuote.lead.homeownerId : writtenQuote.installer.id;
    const otherPartyRole = isInstaller ? UserRole.HOMEOWNER : UserRole.INSTALLER;

    await createNotification({
      recipientUserId: otherPartyId,
      actionType: NotificationType.BID_SUBMITTED, // TODO: Create QUOTE_AGREED type
      role: otherPartyRole,
      messageKey: isInstaller ? 'homeowner.request.received' : 'installer.bid.received',
      routeKey: isInstaller ? 'homeowner.requests' : 'installer.leads',
      routeParams: { 
        leadId: writtenQuote.leadId
      },
      metadata: {
        agreedAmount,
        proposedBy: auth.userId
      }
    });

    logger.debug('Other party notification sent', { 
      recipientId: otherPartyId,
      role: otherPartyRole 
    });

    return NextResponse.json(
      {
        success: true,
        agreedAmount,
        message: 'Done-deal requested successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Quote agreement failed', error, { correlationId });
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to finalize quote' },
      { status: 500 }
    );
  }
}
