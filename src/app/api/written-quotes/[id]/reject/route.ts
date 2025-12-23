/**
 * Written Quote Rejection API
 * 
 * POST /api/written-quotes/[id]/reject
 * Homeowner rejects the negotiated price
 * 
 * Phase 13W.2 - Purchase & Reject flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuoteRejectRoute' });

interface RejectRequest {
  reason?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `reject-${Date.now()}`;
  const { id } = await context.params;
  
  try {
    // Only homeowner can reject
    const auth = await requireAuth();

    let body: RejectRequest = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }
    
    logger.info('Quote rejection initiated', { 
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
          select: { 
            homeownerId: true,
            location: true,
            postcode: true
          }
        },
        installer: {
          select: { id: true, email: true, companyName: true }
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

    // Verify user is the homeowner of this quote
    const isHomeowner = writtenQuote.lead.homeownerId === auth.userId;

    if (!isHomeowner) {
      logger.warn('Unauthorized reject attempt', { 
        writtenQuoteId: id,
        userId: auth.userId,
        homeownerId: writtenQuote.lead.homeownerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'Only the homeowner can reject this quote' },
        { status: 403 }
      );
    }

    // Check if already rejected
    if (writtenQuote.negotiationStatus === 'REJECTED') {
      logger.warn('Duplicate reject attempt', { 
        writtenQuoteId: id,
        correlationId 
      });
      return NextResponse.json(
        { error: 'Quote has already been rejected' },
        { status: 403 }
      );
    }

    // Check if already agreed/purchased
    if (writtenQuote.negotiationStatus === 'AGREED' || writtenQuote.purchasedAt) {
      logger.warn('Cannot reject finalized quote', { 
        writtenQuoteId: id,
        status: writtenQuote.negotiationStatus,
        correlationId 
      });
      return NextResponse.json(
        { error: 'Cannot reject a finalized or purchased quote' },
        { status: 403 }
      );
    }

    // Update quote to REJECTED status
    const updatedQuote = await prisma.writtenQuote.update({
      where: { id },
      data: {
        negotiationStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: body.reason || null
      }
    });

    logger.info('Quote rejected successfully', { 
      writtenQuoteId: id,
      reason: body.reason,
      correlationId 
    });

    // Notify the installer about rejection
    await createNotification({
      recipientUserId: writtenQuote.installer.id,
      actionType: NotificationType.QUOTE_REJECTED, // Existing type for quote rejection
      role: UserRole.INSTALLER,
      messageKey: 'installer.bid.outcome.other', // "This bid was awarded to another installer"
      routeKey: 'installer.leads',
      routeParams: { 
        leadId: writtenQuote.leadId
      },
      metadata: {
        reason: body.reason,
        location: writtenQuote.lead.location,
        postcode: writtenQuote.lead.postcode
      }
    });

    logger.debug('Installer rejection notification sent', { 
      recipientId: writtenQuote.installer.id 
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Quote rejected successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Quote rejection failed', error, { correlationId });
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to reject quote' },
      { status: 500 }
    );
  }
}
