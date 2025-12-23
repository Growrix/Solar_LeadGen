/**
 * Written Quote Purchase API (Dev Mode)
 * 
 * POST /api/written-quotes/[id]/purchase
 * Installer pays to unlock contact details after quote is AGREED
 * 
 * Phase 13W.2 - Purchase & Reject flow
 * Mirrors: /api/bids/[bidId]/purchase/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification, createBulkNotifications } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'WrittenQuotePurchaseRoute' });

/**
 * POST /api/written-quotes/[id]/purchase
 * Installer purchases quote to unlock contact details
 * 
 * @access Installer only (must own the quote)
 * @body {} (dev mode: no payment processing)
 * @returns 200 OK + Full lead details with contact info
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const correlationId = request.headers.get('x-correlation-id') || `wq-purchase-${Date.now()}`;
  const { id } = await context.params;
  
  try {
    // Only installer can purchase
    const auth = await requireRole('INSTALLER');
    
    logger.info('Written quote purchase initiated', { writtenQuoteId: id, installerId: auth.userId, correlationId });

    // Fetch written quote with lead and homeowner data
    const writtenQuote = await prisma.writtenQuote.findUnique({
      where: { id },
      include: {
        lead: {
          include: {
            homeowner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        installer: {
          select: { id: true, email: true, companyName: true, phone: true }
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

    // Validate installer owns this quote
    if (writtenQuote.installerId !== auth.userId) {
      logger.warn('Unauthorized purchase attempt', { 
        writtenQuoteId: id, 
        quoteOwnerId: writtenQuote.installerId, 
        requesterId: auth.userId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You do not have permission to purchase this quote' },
        { status: 403 }
      );
    }

    // Validate quote is AGREED
    if (writtenQuote.negotiationStatus !== 'AGREED') {
      logger.warn('Invalid quote status for purchase', { 
        writtenQuoteId: id, 
        status: writtenQuote.negotiationStatus,
        correlationId 
      });
      return NextResponse.json(
        { error: 'This quote has not been finalized yet. Wait for the homeowner to accept.' },
        { status: 403 }
      );
    }

    // Check if already purchased
    if (writtenQuote.purchasedAt) {
      logger.warn('Quote already purchased', { 
        writtenQuoteId: id,
        purchasedAt: writtenQuote.purchasedAt,
        correlationId 
      });
      return NextResponse.json(
        { error: 'This quote has already been purchased' },
        { status: 403 }
      );
    }

    // TODO: Dev mode - skip payment processing
    // In production, integrate Stripe payment here
    logger.debug('DEV MODE: Skipping payment processing', { writtenQuoteId: id, amount: writtenQuote.agreedAmount });

    // Use transaction to update quote and lead atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update written quote with payment timestamp
      const purchasedQuote = await tx.writtenQuote.update({
        where: { id },
        data: {
          purchasedAt: new Date(),
          status: 'PURCHASED'
        }
      });

      // Update lead status to PURCHASED
      const updatedLead = await tx.lead.update({
        where: { id: writtenQuote.leadId },
        data: {
          status: 'PURCHASED',
          purchasedAt: new Date(),
          installerId: auth.userId
        },
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      return { purchasedQuote, updatedLead };
    });

    logger.info('Written quote purchase completed', {
      writtenQuoteId: id,
      leadId: writtenQuote.leadId,
      installerId: auth.userId,
      amount: writtenQuote.agreedAmount,
      correlationId
    });

    // Send notifications
    logger.info('Sending written quote purchase notifications', { writtenQuoteId: id, leadId: writtenQuote.leadId, correlationId });
    
    // Get admin users
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });

    // Notification 1: Homeowner notification
    await createNotification({
      recipientUserId: writtenQuote.lead.homeownerId,
      actionType: NotificationType.PURCHASE_CONFIRMED, // Installer confirmed
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.installer.confirmed',
      routeKey: 'homeowner.requests',
      routeParams: { leadId: writtenQuote.leadId },
      metadata: {
        installerName: writtenQuote.installer.companyName,
        agreedAmount: writtenQuote.agreedAmount
      }
    });

    // Notification 2: Installer confirmation
    await createNotification({
      recipientUserId: auth.userId,
      actionType: NotificationType.PURCHASE_CONFIRMED,
      role: UserRole.INSTALLER,
      messageKey: 'installer.bid.payment.success',
      routeKey: 'installer.leads',
      routeParams: { leadId: writtenQuote.leadId }
    });

    // Notification 3: Admin notifications
    if (admins.length > 0) {
      await createBulkNotifications(
        admins.map(admin => ({
          recipientUserId: admin.id,
          actionType: NotificationType.LEAD_PURCHASED,
          role: UserRole.ADMIN,
          messageKey: 'admin.bid.payment.completed',
          routeKey: 'admin.dashboard',
          routeParams: { leadId: writtenQuote.leadId, writtenQuoteId: id },
          metadata: {
            actorEmail: writtenQuote.installer.email,
            leadId: writtenQuote.leadId,
            writtenQuoteId: id,
            agreedAmount: writtenQuote.agreedAmount
          }
        }))
      );
    }

    // Return full lead details with unmasked contact info
    return NextResponse.json({
      success: true,
      message: 'Contact details unlocked',
      lead: {
        id: result.updatedLead.id,
        homeowner: {
          name: result.updatedLead.homeowner.name,
          phone: result.updatedLead.homeowner.phone,
          email: result.updatedLead.homeowner.email
        },
        address: result.updatedLead.address,
        location: result.updatedLead.location,
        postcode: result.updatedLead.postcode,
        state: result.updatedLead.state,
        propertyType: result.updatedLead.propertyType,
        roofType: result.updatedLead.roofType,
        energyBill: result.updatedLead.energyBill,
        billType: result.updatedLead.billType,
        budgetRange: result.updatedLead.budgetRange,
        desiredOffset: result.updatedLead.desiredOffset,
        batteryRequired: result.updatedLead.batteryRequired,
        batteryCapacity: result.updatedLead.batteryCapacity,
        timeframe: result.updatedLead.timeframe,
        additionalNotes: result.updatedLead.additionalNotes,
        quoteData: result.updatedLead.quoteData,
        purchasedAt: result.updatedLead.purchasedAt?.toISOString()
      },
      installer: {
        name: writtenQuote.installer.companyName,
        email: writtenQuote.installer.email,
        phone: writtenQuote.installer.phone
      },
      agreedAmount: writtenQuote.agreedAmount
    });

  } catch (error) {
    logger.error('Written quote purchase failed', error, { writtenQuoteId: id, correlationId });
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to purchase quote' },
      { status: 500 }
    );
  }
}
