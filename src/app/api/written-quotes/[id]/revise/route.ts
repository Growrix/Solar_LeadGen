/**
 * Written Quote Revise API
 * 
 * PATCH /api/written-quotes/[id]/revise
 * Installer revises quote (unlimited times)
 * 
 * Phase 13W - Negotiation flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import type { ReviseQuoteRequest } from '@/types/written-quote';
import { createLogger } from '@/lib/logger';
import { expireNegotiationIfNeeded } from '@/lib/written-quotes/negotiation-window';

const logger = createLogger({ context: 'WrittenQuoteReviseRoute' });

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `revise-${Date.now()}`;
  const { id } = await context.params;
  
  try {
    // Installer only can revise
    const auth = await requireRole('INSTALLER');

    const body: ReviseQuoteRequest = await request.json();
    
    logger.info('Quote revision initiated', { 
      writtenQuoteId: id,
      installerId: auth.userId,
      revisedAmount: body.revisedAmount,
      correlationId 
    });

    // Validate revised amount
    if (!body.revisedAmount || body.revisedAmount <= 0) {
      logger.warn('Invalid revised amount', { revisedAmount: body.revisedAmount, correlationId });
      return NextResponse.json(
        { error: 'Revised amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch written quote with lead info
    const writtenQuote = await prisma.writtenQuote.findUnique({
      where: { id },
      include: {
        lead: {
          select: { homeownerId: true }
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

    // Verify installer owns this quote
    if (writtenQuote.installerId !== auth.userId) {
      logger.warn('Unauthorized revise attempt', { 
        writtenQuoteId: id,
        installerId: auth.userId,
        quoteInstallerId: writtenQuote.installerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to revise this quote' },
        { status: 403 }
      );
    }

    // Negotiation is closed once agreed/rejected/purchased
    if (writtenQuote.negotiationStatus === 'AGREED' || writtenQuote.negotiationStatus === 'REJECTED' || writtenQuote.negotiationStatus === 'NEGOTIATION_EXPIRED' || writtenQuote.purchasedAt) {
      return NextResponse.json(
        { error: 'This negotiation is closed and cannot be revised.' },
        { status: 403 }
      );
    }

    // Done-deal handshake in progress: lock negotiation until accepted/rejected
    if (writtenQuote.negotiationStatus === 'PENDING_ACCEPTANCE') {
      return NextResponse.json(
        { error: 'A done-deal is pending acceptance. Negotiation is temporarily locked.' },
        { status: 403 }
      );
    }

    // Limits: homeowner counters max 3; installer revisions max 4; max 7 total negotiation turns
    if ((writtenQuote as any).installerRevisionCount >= 4) {
      return NextResponse.json(
        { error: 'Revision limit reached (4 total). The deal must be finalized or rejected.' },
        { status: 403 }
      );
    }

    if ((writtenQuote as any).negotiationTurnCount >= 7) {
      return NextResponse.json(
        { error: 'Negotiation limit reached (7 total turns). The deal must be finalized or rejected.' },
        { status: 403 }
      );
    }

    // Update quote with revised amount (unlimited revisions allowed)
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id },
      data: {
        installerRevisedAmount: body.revisedAmount,
        installerRevisedAt: new Date(),
        negotiationStatus: 'INSTALLER_RESPONDED',
        installerRevisionCount: { increment: 1 },
        negotiationTurnCount: { increment: 1 },
      }
    });

    logger.info('Quote revised successfully', { 
      writtenQuoteId: id,
      installerId: auth.userId,
      revisedAmount: body.revisedAmount,
      correlationId 
    });

    // Notify homeowner of revised quote
    await createNotification({
      recipientUserId: writtenQuote.lead.homeownerId,
      actionType: NotificationType.BID_SUBMITTED, // TODO: Create QUOTE_REVISED type
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.written_quote.revised',
      routeKey: 'homeowner.requests',
      routeParams: { 
        leadId: writtenQuote.leadId
      },
      metadata: {
        revisedAmount: body.revisedAmount,
        message: body.message
      }
    });

    logger.debug('Homeowner notification sent', { homeownerId: writtenQuote.lead.homeownerId });

    return NextResponse.json(
      {
        success: true,
        message: 'Quote revised successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Quote revision failed', error, { correlationId });
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to revise quote' },
      { status: 500 }
    );
  }
}
