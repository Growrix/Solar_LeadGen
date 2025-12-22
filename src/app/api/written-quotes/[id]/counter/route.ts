/**
 * Written Quote Counter Offer API
 * 
 * PATCH /api/written-quotes/[id]/counter
 * Homeowner submits counter offer (1-time limit)
 * 
 * Phase 13W - Negotiation flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import type { CounterOfferRequest } from '@/types/written-quote';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteCounterRoute' });

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `counter-${Date.now()}`;
  const { id } = await context.params;
  
  try {
    // Homeowner only can counter
    const auth = await requireRole('HOMEOWNER');

    const body: CounterOfferRequest = await request.json();
    
    logger.info('Counter offer submission initiated', { 
      writtenQuoteId: id,
      homeownerId: auth.userId,
      counterAmount: body.counterAmount,
      correlationId 
    });

    // Validate counter amount
    if (!body.counterAmount || body.counterAmount <= 0) {
      logger.warn('Invalid counter amount', { counterAmount: body.counterAmount, correlationId });
      return NextResponse.json(
        { error: 'Counter amount must be greater than 0' },
        { status: 400 }
      );
    }

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

    // Verify homeowner owns this lead
    if (writtenQuote.lead.homeownerId !== auth.userId) {
      logger.warn('Unauthorized counter attempt', { 
        writtenQuoteId: id,
        homeownerId: auth.userId,
        leadHomeownerId: writtenQuote.lead.homeownerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to counter this quote' },
        { status: 403 }
      );
    }

    // Check if already countered (1-time limit)
    if (writtenQuote.homeownerCounterAt) {
      logger.warn('Duplicate counter attempt', { 
        writtenQuoteId: id,
        homeownerId: auth.userId,
        previousCounterAt: writtenQuote.homeownerCounterAt,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You have already submitted a counter offer (1 time limit)' },
        { status: 403 }
      );
    }

    // Check if already agreed
    if (writtenQuote.negotiationStatus === 'AGREED') {
      logger.warn('Counter attempt on agreed quote', { 
        writtenQuoteId: id,
        correlationId 
      });
      return NextResponse.json(
        { error: 'Cannot counter an already agreed quote' },
        { status: 403 }
      );
    }

    // Update quote with counter offer
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id },
      data: {
        homeownerCounterAmount: body.counterAmount,
        homeownerCounterAt: new Date(),
        negotiationStatus: 'HOMEOWNER_COUNTERED'
      }
    });

    logger.info('Counter offer submitted successfully', { 
      writtenQuoteId: id,
      homeownerId: auth.userId,
      counterAmount: body.counterAmount,
      correlationId 
    });

    // Notify installer of counter offer
    await createNotification({
      recipientUserId: writtenQuote.installer.id,
      actionType: NotificationType.BID_SUBMITTED, // TODO: Create COUNTER_OFFER_RECEIVED type
      role: UserRole.INSTALLER,
      messageKey: 'installer.bid.received',
      routeKey: 'installer.dashboard',
      routeParams: { 
        leadId: writtenQuote.leadId
      },
      metadata: {
        counterAmount: body.counterAmount,
        message: body.message
      }
    });

    logger.debug('Installer notification sent', { installerId: writtenQuote.installer.id });

    return NextResponse.json(
      {
        success: true,
        message: 'Counter offer submitted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Counter offer submission failed', error, { correlationId });
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to submit counter offer' },
      { status: 500 }
    );
  }
}
