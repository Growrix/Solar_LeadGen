/**
 * Bid Purchase API (Dev Mode)
 * 
 * POST /api/bids/[bidId]/purchase - Winner pays to unlock contact details
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 * Uses: requireRole from @/lib/auth/authorization
 * Uses: createLogger from @/lib/logger for structured logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification, createBulkNotifications } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'BidPurchaseRoute' });

/**
 * POST /api/bids/[bidId]/purchase
 * Winning installer purchases lead to unlock contact details
 * 
 * @access Installer only (must be bid winner)
 * @body {} (dev mode: no payment processing)
 * @returns 200 OK + Full lead details with contact info
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bidId: string } }
) {
  const correlationId = request.headers.get('x-correlation-id') || `bid-purchase-${Date.now()}`;
  
  try {
    // Constitutional Article VI: Zero-trust authorization
    const auth = await requireRole('INSTALLER');
    const { bidId } = params;
    
    logger.info('Bid purchase initiated', { bidId, installerId: auth.userId, correlationId });

    // Fetch bid with lead and homeowner data
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
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
          select: { id: true, email: true, companyName: true }
        }
      }
    });

    if (!bid) {
      logger.warn('Bid not found', { bidId, correlationId });
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    // Validate installer owns this bid
    if (bid.installerId !== auth.userId) {
      logger.warn('Unauthorized bid purchase attempt', { 
        bidId, 
        bidOwnerId: bid.installerId, 
        requesterId: auth.userId,
        correlationId 
      });
      return NextResponse.json(
        { error: 'You do not have permission to purchase this bid' },
        { status: 403 }
      );
    }

    // Validate bid status is SELECTED
    if (bid.status !== 'SELECTED') {
      logger.warn('Invalid bid status for purchase', { 
        bidId, 
        status: bid.status,
        correlationId 
      });
      return NextResponse.json(
        { error: 'This bid has not been selected as winner' },
        { status: 403 }
      );
    }

    // TODO: Dev mode - skip payment processing
    // In production, integrate Stripe payment here:
    // - Validate paymentMethodId from request body
    // - Create payment intent with bid.finalTotal
    // - Handle payment success/failure
    logger.debug('DEV MODE: Skipping payment processing', { bidId, amount: bid.finalTotal });

    // Use transaction to update bid and lead atomically
    const result = await prisma.$transaction(async (tx) => {
      // T198: Update bid with payment timestamp
      const purchasedBid = await tx.bid.update({
        where: { id: bidId },
        data: {
          purchasedAt: new Date()
          // status remains 'SELECTED' (winner status)
        }
      });

      // T198: Update lead status to PURCHASED with payment timestamp
      const updatedLead = await tx.lead.update({
        where: { id: bid.leadId },
        data: {
          status: 'PURCHASED', // Now officially purchased with payment
          purchasedAt: new Date(), // Timestamp when payment completed
          // installerId already set when winner selected
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

      return { purchasedBid, updatedLead };
    });

    logger.info('Bid purchase completed', {
      bidId: result.purchasedBid.id,
      leadId: bid.leadId,
      installerId: auth.userId,
      amount: bid.finalTotal,
      correlationId
    });

    // Phase 13P: Send notifications after bid payment
    logger.info('Sending bid purchase notifications', { bidId, leadId: bid.leadId, correlationId });
    
    // Get admin users
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });
    logger.debug('Admin users found', { count: admins.length });

    // Notification 1: Homeowner notification
    await createNotification({
      recipientUserId: bid.lead.homeownerId,
      actionType: NotificationType.BID_PURCHASE_COMPLETED,
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.installer.confirmed',
      routeKey: 'homeowner.dashboard.review_bids',
      routeParams: { leadId: bid.leadId }
    });

    // Notification 2: Installer confirmation
    await createNotification({
      recipientUserId: auth.userId,
      actionType: NotificationType.BID_PURCHASE_COMPLETED,
      role: UserRole.INSTALLER,
      messageKey: 'installer.bid.payment.success',
      routeKey: 'installer.leads',
      routeParams: { leadId: bid.leadId }
    });
    logger.debug('Installer notification created');

    // Notification 3: Admin notifications
    if (admins.length > 0) {
      // Get installer email for admin to see
      const installer = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true }
      });
      
      await createBulkNotifications(
        admins.map(admin => ({
          recipientUserId: admin.id,
          actionType: NotificationType.BID_PURCHASE_COMPLETED,
          role: UserRole.ADMIN,
          messageKey: 'admin.bid.payment.completed',
          routeKey: 'admin.lead.manage',
          routeParams: { leadId: bid.leadId, bidId, installerId: auth.userId },
          metadata: {
            actorEmail: installer?.email,
            leadId: bid.leadId,
            bidId
          }
        }))
      );
      logger.debug('Admin notifications created', { count: admins.length });
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
      }
    });

  } catch (error) {
    logger.error('Bid purchase failed', error, { bidId: params.bidId, correlationId });
    
    // Handle authorization errors
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to purchase lead' },
      { status: 500 }
    );
  }
}
