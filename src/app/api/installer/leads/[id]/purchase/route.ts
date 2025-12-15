/**
 * Purchase Lead Endpoint
 * 
 * POST /api/installer/leads/[id]/purchase - Purchase/unlock a CALL_VISIT lead
 * 
 * @access Installer only
 * @body {} - No body required
 * @returns 200 OK + Updated lead with unmasked contact
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request, 500 Internal Server Error
 * 
 * Constitutional Compliance: Article VI (Zero-Trust Authorization)
 * Uses: requireAuth, requireRole from @/lib/auth/authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAuth, requireRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { createNotification, createBulkNotifications } from '@/lib/notifications/notification-service';
import { NotificationType, UserRole } from '@prisma/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ context: 'PurchaseLeadRoute' });

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = request.headers.get('x-correlation-id') || `purchase-${Date.now()}`;
  
  try {
    // Constitutional Article VI: Zero-trust authorization
    const auth = await requireRole('INSTALLER');
    
    const leadId = params.id;
    const installerId = auth.userId;

    logger.info('Lead purchase initiated', { leadId, installerId, correlationId });

    // Check if lead is assigned to this installer
    const assignment = await prisma.leadAssignment.findFirst({
      where: {
        leadId,
        installerId
      },
      include: {
        lead: {
          include: {
            homeowner: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      logger.warn('Lead not found or not assigned', { leadId, installerId });
      return NextResponse.json(
        { error: 'Lead not found or not assigned to you' },
        { status: 404 }
      );
    }

    const lead = assignment.lead;

    // Validate it's a CALL_VISIT lead
    if (lead.quoteType !== 'CALL_VISIT') {
      logger.warn('Invalid quote type for purchase', { leadId, quoteType: lead.quoteType });
      return NextResponse.json(
        { error: 'Only CALL_VISIT leads require purchase/unlock' },
        { status: 400 }
      );
    }

    // Check if already purchased by this installer
    if (lead.installerId === installerId && lead.purchasedAt) {
      logger.warn('Lead already purchased', { leadId, installerId });
      return NextResponse.json(
        { error: 'Lead already purchased by you' },
        { status: 400 }
      );
    }

    // Check if lead is expired
    if (lead.expiresAt && new Date() > lead.expiresAt) {
      logger.warn('Lead expired', { leadId, expiresAt: lead.expiresAt });
      return NextResponse.json(
        { error: 'Lead has expired' },
        { status: 400 }
      );
    }

    // TODO: Validate credit balance / payment before unlocking
    // For now, we'll just update the lead to mark as purchased

    // Update lead with purchase info (keeping original logic for CALL_VISIT leads)
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        installerId,
        purchasedAt: new Date(),
        purchaseStatus: 'COMPLETED',
        status: 'PURCHASED'
      },
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    logger.info('Lead purchase completed', { 
      leadId, 
      installerId, 
      purchaseStatus: updatedLead.purchaseStatus,
      correlationId 
    });

    // Send notifications to all parties with SendGrid email integration
    logger.info('Sending lead purchase notifications', { leadId, installerId, correlationId });

    // Get admin users for notification
    const admins = await prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      select: { id: true }
    });
    logger.debug('Admin users found', { count: admins.length });

    // Notification 1: Installer confirmation (with email)
    await createNotification({
      recipientUserId: installerId,
      actionType: NotificationType.PURCHASE_CONFIRMED,
      role: UserRole.INSTALLER,
      messageKey: 'installer.purchase.confirmed',
      routeKey: 'installer.leads',
      routeParams: { leadId }
    });
    logger.debug('Installer notification created');

    // Notification 2: Homeowner notification (with email)
    await createNotification({
      recipientUserId: updatedLead.homeownerId,
      actionType: NotificationType.INSTALLER_RESPONDED,
      role: UserRole.HOMEOWNER,
      messageKey: 'homeowner.installer.responded',
      routeKey: 'homeowner.requests',
      routeParams: { leadId }
    });
    logger.debug('Homeowner notification created');

    // Notification 3: Admin notifications (with email)
    if (admins.length > 0) {
      // Get installer email for admin metadata
      const installer = await prisma.user.findUnique({
        where: { id: installerId },
        select: { email: true }
      });

      await createBulkNotifications(
        admins.map(admin => ({
          recipientUserId: admin.id,
          actionType: NotificationType.LEAD_PURCHASED,
          role: UserRole.ADMIN,
          messageKey: 'admin.lead.purchased',
          routeKey: 'admin.dashboard',
          routeParams: { leadId, installerId },
          metadata: {
            actorEmail: installer?.email,
            leadId,
            installerId
          }
        }))
      );
      logger.debug('Admin notifications created', { count: admins.length });
    }

    // Return unmasked contact details
    return NextResponse.json({
      success: true,
      message: 'Lead purchased successfully',
      lead: {
        id: updatedLead.id,
        homeownerId: updatedLead.homeownerId,
        status: updatedLead.status,
        quoteType: updatedLead.quoteType,
        postcode: updatedLead.postcode,
        location: updatedLead.location,
        state: updatedLead.state,
        propertyType: updatedLead.propertyType,
        projectType: updatedLead.projectType,
        roofType: updatedLead.roofType,
        budgetRange: updatedLead.budgetRange,
        leadPrice: updatedLead.leadPrice,
        purchaseStatus: updatedLead.purchaseStatus,
        purchasedAt: updatedLead.purchasedAt?.toISOString(),
        homeowner: {
          name: updatedLead.homeowner.name,
          phone: updatedLead.homeowner.phone,
          email: updatedLead.homeowner.email
        }
      }
    });

  } catch (error) {
    logger.error('Lead purchase failed', error, { leadId: params.id, correlationId });
    
    // Handle authorization errors
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes('access required')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to purchase lead' },
      { status: 500 }
    );
  }
}
