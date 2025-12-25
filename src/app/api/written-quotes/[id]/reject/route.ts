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
import { expireNegotiationIfNeeded } from '@/lib/written-quotes/negotiation-window';

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

    const isHomeowner = writtenQuote.lead.homeownerId === auth.userId;
    const isInstaller = writtenQuote.installerId === auth.userId;

    if (!isHomeowner && !isInstaller) {
      logger.warn('Unauthorized reject attempt', { 
        writtenQuoteId: id,
        userId: auth.userId,
        homeownerId: writtenQuote.lead.homeownerId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You are not authorized to reject this quote' },
        { status: 403 }
      );
    }

    const expireResult = await expireNegotiationIfNeeded(id);
    if (expireResult.expired) {
      logger.warn('Cannot reject expired negotiation', { writtenQuoteId: id, correlationId });
      return NextResponse.json(
        { error: 'Negotiation has expired and is now closed.' },
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
    const updatedQuote = await (prisma.writtenQuote as any).update({
      where: { id },
      data: {
        negotiationStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectedByRole: isInstaller ? UserRole.INSTALLER : UserRole.HOMEOWNER,
        rejectionReason: body.reason || null
      }
    });

    logger.info('Quote rejected successfully', { 
      writtenQuoteId: id,
      reason: body.reason,
      correlationId 
    });

    // Notify the other party about rejection
    if (isHomeowner) {
      await createNotification({
        recipientUserId: writtenQuote.installer.id,
        actionType: NotificationType.QUOTE_REJECTED,
        role: UserRole.INSTALLER,
        messageKey: 'installer.written_quote.rejected',
        routeKey: 'installer.leads',
        routeParams: {
          leadId: writtenQuote.leadId,
        },
        metadata: {
          rejectedBy: 'HOMEOWNER',
          reason: body.reason,
          location: writtenQuote.lead.location,
          postcode: writtenQuote.lead.postcode,
        },
      });

      logger.debug('Installer rejection notification sent', {
        recipientId: writtenQuote.installer.id,
      });
    } else if (isInstaller) {
      await createNotification({
        recipientUserId: writtenQuote.lead.homeownerId,
        actionType: NotificationType.QUOTE_REJECTED,
        role: UserRole.HOMEOWNER,
        messageKey: 'homeowner.written_quote.rejected',
        routeKey: 'homeowner.requests',
        routeParams: {
          leadId: writtenQuote.leadId,
        },
        metadata: {
          rejectedBy: 'INSTALLER',
          reason: body.reason,
          location: writtenQuote.lead.location,
          postcode: writtenQuote.lead.postcode,
        },
      });

      logger.debug('Homeowner rejection notification sent', {
        recipientId: writtenQuote.lead.homeownerId,
      });
    }

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
