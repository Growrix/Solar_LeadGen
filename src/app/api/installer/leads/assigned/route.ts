/**
 * Assigned Leads API Route
 * 
 * GET /api/installer/leads/assigned - Get leads assigned to logged-in installer
 * 
 * @access Installer only
 * @query expired=true|false - Include/exclude expired leads (default: false)
 * @returns 200 OK + Array of assigned leads with countdown
 * @errors 401 Unauthorized, 403 Forbidden, 500 Internal Server Error
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCountdown } from '@/lib/services/countdown-service';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const includeExpired = searchParams.get('expired') === 'true';

    // Query LeadAssignment with extended lead fields and homeowner
    const assignments = await prisma.leadAssignment.findMany({
      where: {
        installerId: session.user.id,
        lead: {
          // Exclude CANCELLED leads
          status: { not: 'CANCELLED' },
          // Exclude leads purchased by this installer (they go to Purchased Leads page)
          NOT: {
            AND: [
              { installerId: session.user.id },
              { purchasedAt: { not: null } }
            ]
          },
          // Optionally filter expired leads
          ...(includeExpired ? {} : {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          })
        }
      },
      include: {
        lead: {
          include: {
            homeowner: {
              select: { id: true, name: true, phone: true, email: true }
            },
            quotes: { select: { id: true } },
            // T196: Include bids for bidding leads to show winner/loser status
            bids: {
              select: {
                id: true,
                installerId: true,
                status: true,
                amount: true,
                selectedAt: true,
                purchasedAt: true
              }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    // Map assignments to formatted lead objects (extended shape)
    const leads = assignments.map(assignment => {
      const lead = assignment.lead;
      const isPurchased = lead.installerId === session.user.id && !!lead.purchasedAt;

      return {
        id: lead.id,
        homeownerId: lead.homeownerId,
        status: lead.status, // Raw backend status (e.g. APPROVED, PURCHASED, QUOTED)
        quoteType: lead.quoteType.toLowerCase().replace('_quote', '') as 'call_visit' | 'written' | 'bidding', // Convert CALL_VISIT -> call_visit, WRITTEN_QUOTE -> written, BIDDING -> bidding
        postcode: lead.postcode,
        location: lead.location,
        state: lead.state,
        address: isPurchased ? (lead.address || null) : null,
        propertyType: lead.propertyType,
        projectType: lead.projectType,
        roofType: lead.roofType,
        budgetRange: lead.budgetRange,
        leadPrice: lead.leadPrice,
        purchaseStatus: lead.purchaseStatus || null,
        purchasedAt: lead.purchasedAt?.toISOString() || null,
        quotesCount: lead.quotes.length,
        expiresAt: lead.expiresAt?.toISOString() || null,
        createdAt: lead.createdAt.toISOString(),
        approvedAt: lead.approvedAt?.toISOString() || null,
        assignedAt: assignment.assignedAt.toISOString(),
        assignmentNotes: assignment.notes,
        // Energy details (only show if purchased)
        energyBill: isPurchased ? lead.energyBill : null,
        billType: isPurchased ? lead.billType : null,
        desiredOffset: isPurchased ? lead.desiredOffset : null,
        batteryRequired: isPurchased ? lead.batteryRequired : null,
        batteryCapacity: isPurchased ? (lead.batteryCapacity || null) : null,
        timeframe: isPurchased ? (lead.timeframe || null) : null,
        additionalNotes: isPurchased ? (lead.additionalNotes || null) : null,
        // Phone verification
        phoneNumber: isPurchased ? (lead.phoneNumber || null) : null,
        phoneVerified: isPurchased ? lead.phoneVerified : null,
        // InstantQuote data (show for bidding leads or purchased leads)
        quoteData: (lead.quoteType === 'BIDDING' || isPurchased) ? lead.quoteData : null,
        homeowner: {
          name: isPurchased ? lead.homeowner.name : '***LOCKED***',
          phone: isPurchased ? lead.homeowner.phone : '***LOCKED***',
          email: isPurchased ? lead.homeowner.email : '***LOCKED***'
        },
        // T196: Include bids for bidding flow (winner/loser detection)
        bids: lead.quoteType === 'BIDDING' ? lead.bids : undefined,
        countdown: calculateCountdown(lead.expiresAt),
        isPurchased,
        isPurchasedByAnother: !!lead.installerId && lead.installerId !== session.user.id,
      };
    });

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length,
    });

  } catch (error) {
    console.error('Error fetching assigned leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assigned leads' },
      { status: 500 }
    );
  }
}
