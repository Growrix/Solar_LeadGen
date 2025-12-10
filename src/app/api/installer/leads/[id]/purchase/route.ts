/**
 * Purchase Lead Endpoint
 * 
 * POST /api/installer/leads/[id]/purchase - Purchase/unlock a CALL_VISIT lead
 * 
 * @access Installer only
 * @body {} - No body required
 * @returns 200 OK + Updated lead with unmasked contact
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request, 500 Internal Server Error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check installer role
    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json(
        { error: 'Installer access required' },
        { status: 403 }
      );
    }

    const leadId = params.id;

    // Check if lead is assigned to this installer
    const assignment = await prisma.leadAssignment.findFirst({
      where: {
        leadId,
        installerId: session.user.id
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
      return NextResponse.json(
        { error: 'Lead not found or not assigned to you' },
        { status: 404 }
      );
    }

    const lead = assignment.lead;

    // Validate it's a CALL_VISIT lead
    if (lead.quoteType !== 'CALL_VISIT') {
      return NextResponse.json(
        { error: 'Only CALL_VISIT leads require purchase/unlock' },
        { status: 400 }
      );
    }

    // Check if already purchased by this installer
    if (lead.installerId === session.user.id && lead.purchasedAt) {
      return NextResponse.json(
        { error: 'Lead already purchased by you' },
        { status: 400 }
      );
    }

    // Check if lead is expired
    if (lead.expiresAt && new Date() > lead.expiresAt) {
      return NextResponse.json(
        { error: 'Lead has expired' },
        { status: 400 }
      );
    }

    // TODO: Validate credit balance / payment before unlocking
    // For now, we'll just update the lead to mark as purchased

    // Update lead with purchase info
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        installerId: session.user.id,
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

    // Create notification for homeowner
    await prisma.notification.create({
      data: {
        userId: updatedLead.homeownerId,
        type: 'LEAD_PURCHASED',
        title: 'Installer Responded to Your Request',
        message: 'An installer has responded to your solar request and will contact you soon.',
        isRead: false
      }
    });

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
    console.error('Error purchasing lead:', error);
    return NextResponse.json(
      { error: 'Failed to purchase lead' },
      { status: 500 }
    );
  }
}
