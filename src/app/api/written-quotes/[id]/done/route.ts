/**
 * Written Quote Done API
 * 
 * POST /api/written-quotes/[id]/done - Homeowner accepts or rejects quote
 * Phase 4.16.2 - Sprint 2D (T-WQ-212)
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteDone' });

interface DoneRequest {
  action: 'accept' | 'reject';
  notes?: string;
}

/**
 * POST /api/written-quotes/[id]/done
 * Homeowner accepts or rejects the written quote (final action)
 * 
 * @access Homeowner only (must own the lead)
 * @body DoneRequest
 * @returns 200 OK + Final quote status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = request.headers.get('x-correlation-id') || `wq-done-${Date.now()}`;
  
  try {
    const auth = await requireRole('HOMEOWNER');
    const body: DoneRequest = await request.json();
    const quoteId = params.id;
    
    logger.info('Written quote finalization initiated', { 
      quoteId,
      homeownerId: auth.userId,
      action: body.action,
      correlationId 
    });

    // Validate action
    if (!body.action || !['accept', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
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
        { error: 'You do not have permission to finalize this quote' },
        { status: 403 }
      );
    }

    // Verify quote is not already finalized
    if (quote.currentStatus === 'ACCEPTED' || quote.currentStatus === 'REJECTED') {
      return NextResponse.json(
        { error: `Quote already ${quote.currentStatus.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Verify it's homeowner's turn
    if (quote.currentStatus !== 'HOMEOWNER_TURN') {
      return NextResponse.json(
        { error: `Cannot finalize quote. Current status: ${quote.currentStatus}` },
        { status: 400 }
      );
    }

    const now = new Date();
    const finalStatus = body.action === 'accept' ? 'ACCEPTED' : 'REJECTED';

    // Update quote
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id: quoteId },
      data: {
        currentStatus: finalStatus,
        lastActionBy: 'homeowner',
        lastActionAt: now,
        acceptedAt: body.action === 'accept' ? now : null,
        rejectedAt: body.action === 'reject' ? now : null
      }
    });

    // Create event
    await prisma.writtenQuoteEvent.create({
      data: {
        writtenQuoteId: quoteId,
        actorId: auth.userId,
        actorRole: 'homeowner',
        action: body.action,
        priceOffered: null,
        notes: body.notes || (body.action === 'accept' ? 'Quote accepted' : 'Quote rejected')
      }
    });

    // Notify installer
    const notificationTitle = body.action === 'accept' 
      ? 'Written Quote Accepted! 🎉' 
      : 'Written Quote Declined';
    
    const notificationMessage = body.action === 'accept'
      ? `Great news! The homeowner has accepted your written quote of $${quote.currentPrice.toLocaleString()}. You can now proceed with the installation.`
      : `The homeowner has declined your written quote. Thank you for your participation.`;

    // Notify installer of final decision
    await createNotification({
      recipientUserId: quote.installerId,
      role: 'INSTALLER' as any,
      actionType: body.action === 'accept' ? ('QUOTE_ACCEPTED' as any) : ('QUOTE_REJECTED' as any),
      messageKey: body.action === 'accept' ? ('installer.written_quote.accepted' as any) : ('installer.written_quote.rejected' as any),
      routeKey: 'installer.leads' as any,
      routeParams: { leadId: quote.leadId },
      metadata: {
        leadId: quote.leadId,
        writtenQuoteId: quoteId,
        homeownerId: auth.userId,
        finalPrice: quote.currentPrice,
        action: body.action
      }
    });

    logger.info('Written quote finalized successfully', {
      quoteId,
      action: body.action,
      finalStatus,
      finalPrice: quote.currentPrice,
      correlationId
    });

    return NextResponse.json({ 
      success: true, 
      quote: updatedQuote,
      message: `Quote ${body.action}ed successfully`
    });

  } catch (error) {
    logger.error('Failed to finalize written quote', { error, correlationId });
    return NextResponse.json(
      { error: 'Failed to finalize written quote' },
      { status: 500 }
    );
  }
}
