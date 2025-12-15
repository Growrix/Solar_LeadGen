/**
 * Written Quote Offer API
 * 
 * POST /api/written-quotes/[id]/offer - Installer makes counter-offer
 * Phase 4.16.2 - Sprint 2D (T-WQ-210)
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteOffer' });

interface OfferRequest {
  price: number;
  notes?: string;
}

/**
 * POST /api/written-quotes/[id]/offer
 * Installer makes counter-offer in negotiation
 * 
 * @access Installer only (must own the quote)
 * @body OfferRequest
 * @returns 200 OK + Updated quote
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = request.headers.get('x-correlation-id') || `wq-offer-${Date.now()}`;
  
  try {
    const auth = await requireRole('INSTALLER');
    const body: OfferRequest = await request.json();
    const quoteId = params.id;
    
    logger.info('Written quote counter-offer initiated', { 
      quoteId,
      installerId: auth.userId,
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
        lead: {
          include: {
            homeowner: {
              select: { id: true, email: true, name: true }
            }
          }
        },
        installer: {
          select: { id: true, companyName: true }
        }
      }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Written quote not found' },
        { status: 404 }
      );
    }

    // Verify installer owns this quote
    if (quote.installerId !== auth.userId) {
      logger.warn('Unauthorized access attempt', { 
        quoteId, 
        installerId: auth.userId, 
        ownerId: quote.installerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You do not have permission to modify this quote' },
        { status: 403 }
      );
    }

    // Verify it's installer's turn
    if (quote.currentStatus !== 'INSTALLER_TURN') {
      return NextResponse.json(
        { error: `Cannot make offer. Current status: ${quote.currentStatus}` },
        { status: 400 }
      );
    }

    // Update quote
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id: quoteId },
      data: {
        currentPrice: body.price,
        currentStatus: 'HOMEOWNER_TURN',
        lastActionBy: 'installer',
        lastActionAt: new Date()
      }
    });

    // Create event
    await prisma.writtenQuoteEvent.create({
      data: {
        writtenQuoteId: quoteId,
        actorId: auth.userId,
        actorRole: 'installer',
        action: 'offer',
        priceOffered: body.price,
        notes: body.notes || null
      }
    });

    // Notify homeowner
    await createNotification({
      userId: quote.homeownerId,
      type: NotificationType.LEAD_UPDATE,
      title: 'Counter-Offer Received',
      message: `${quote.installer.companyName || 'The installer'} has counter-offered at $${body.price.toLocaleString()}. Review the updated quote.`,
      actionUrl: `/homeowner/leads/${quote.leadId}`,
      actionLabel: 'Review Offer',
      metadata: {
        leadId: quote.leadId,
        writtenQuoteId: quoteId,
        installerId: auth.userId,
        price: body.price
      }
    });

    logger.info('Counter-offer submitted successfully', {
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
