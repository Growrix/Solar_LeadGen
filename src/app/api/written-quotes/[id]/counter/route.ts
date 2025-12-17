/**
 * Written Quote Counter API
 * 
 * POST /api/written-quotes/[id]/counter - Homeowner makes counter-offer
 * Phase 4.16.2 - Sprint 2D (T-WQ-211)
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteCounter' });

interface CounterRequest {
  price: number;
  notes?: string;
}

/**
 * POST /api/written-quotes/[id]/counter
 * Homeowner makes counter-offer in negotiation
 * 
 * @access Homeowner only (must own the lead)
 * @body CounterRequest
 * @returns 200 OK + Updated quote
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = request.headers.get('x-correlation-id') || `wq-counter-${Date.now()}`;
  
  try {
    const auth = await requireRole('HOMEOWNER');
    const body: CounterRequest = await request.json();
    const quoteId = params.id;
    
    logger.info('Homeowner counter-offer initiated', { 
      quoteId,
      homeownerId: auth.userId,
      newPrice: body.price,
      correlationId 
    });

    // Validate price
    if (!body.price || body.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    // Fetch quote with relations
    const quote = await prisma.writtenQuote.findUnique({
      where: { id: quoteId },
      include: {
        lead: true,
        installer: {
          select: { id: true, email: true, companyName: true }
        }
      }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Written quote not found' },
        { status: 404 }
      );
    }

    // Verify homeowner owns this quote's lead
    if (quote.homeownerId !== auth.userId) {
      logger.warn('Unauthorized access attempt', { 
        quoteId, 
        homeownerId: auth.userId, 
        ownerId: quote.homeownerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You do not have permission to modify this quote' },
        { status: 403 }
      );
    }

    // Verify it's homeowner's turn
    if (quote.currentStatus !== 'HOMEOWNER_TURN') {
      return NextResponse.json(
        { error: `Cannot make counter-offer. Current status: ${quote.currentStatus}` },
        { status: 400 }
      );
    }

    // Update quote
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id: quoteId },
      data: {
        currentPrice: body.price,
        currentStatus: 'INSTALLER_TURN',
        lastActionBy: 'homeowner',
        lastActionAt: new Date()
      }
    });

    // Create event
    await prisma.writtenQuoteEvent.create({
      data: {
        writtenQuoteId: quoteId,
        actorId: auth.userId,
        actorRole: 'homeowner',
        action: 'counter',
        priceOffered: body.price,
        notes: body.notes || null
      }
    });

    // TODO: Refactor to use new notification service interface (recipientUserId, role, actionType, messageKey, routeKey)
    // await createNotification({
    //   userId: quote.installerId,
    //   type: NotificationType.LEAD_UPDATE,
    //   title: 'Homeowner Counter-Offer',
    //   message: `The homeowner has counter-offered at $${body.price.toLocaleString()}. Review and respond to continue negotiation.`,
    //   actionUrl: `/installer/leads/${quote.leadId}`,
    //   actionLabel: 'Review Counter',
    //   metadata: {
    //     leadId: quote.leadId,
    //     writtenQuoteId: quoteId,
    //     homeownerId: auth.userId,
    //     price: body.price
    //   }
    // });

    logger.info('Homeowner counter-offer submitted successfully', {
      quoteId,
      newPrice: body.price,
      correlationId
    });

    return NextResponse.json({ 
      success: true, 
      quote: updatedQuote,
      message: 'Counter-offer submitted successfully'
    });

  } catch (error) {
    logger.error('Failed to submit counter-offer', { error, correlationId });
    return NextResponse.json(
      { error: 'Failed to submit counter-offer' },
      { status: 500 }
    );
  }
}
