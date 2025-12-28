/**
 * Unified Installer Leads API Route
 *
 * GET /api/installer/leads/unified
 * Returns a single merged feed for the logged-in installer:
 * - assigned (active)
 * - assigned (expired)
 * - purchased
 *
 * @access Installer only
 * @query expired=true|false - Include/exclude expired assigned leads (default: true)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCountdown } from '@/lib/services/countdown-service';

type LeadQuoteTypeLower = 'call_visit' | 'written' | 'bidding';

function normalizeQuoteType(quoteType: string): LeadQuoteTypeLower {
  const normalized = String(quoteType || '').toLowerCase();
  if (normalized === 'call_visit') return 'call_visit';
  if (normalized === 'written_quote' || normalized === 'written') return 'written';
  if (normalized === 'bidding') return 'bidding';
  if (normalized === 'callvisit') return 'call_visit';
  return 'call_visit';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Installer access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeExpired = searchParams.get('expired') !== 'false';

    const installerId = session.user.id;

    const assignedAssignments = await prisma.leadAssignment.findMany({
      where: {
        installerId,
        lead: {
          status: { not: 'CANCELLED' },
          NOT: {
            AND: [{ installerId }, { purchasedAt: { not: null } }],
          },
          ...(includeExpired
            ? {}
            : {
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              }),
        },
      },
      include: {
        lead: {
          include: {
            homeowner: {
              select: { id: true, name: true, phone: true, email: true },
            },
            quotes: { select: { id: true } },
            _count: {
              select: {
                quotes: true,
                writtenQuotes: true,
              },
            },
            bids: {
              select: {
                id: true,
                installerId: true,
                status: true,
                amount: true,
                selectedAt: true,
                purchasedAt: true,
              },
            },
            writtenQuotes: {
              where: { installerId },
              select: {
                id: true,
                installerId: true,
                amount: true,
                finalTotal: true,
                status: true,
                negotiationStatus: true,
                homeownerCounterAmount: true,
                homeownerCounterAt: true,
                installerRevisedAmount: true,
                installerRevisedAt: true,
                agreedAmount: true,
                agreedAt: true,
                purchasedAt: true,
                rejectedAt: true,
                rejectionReason: true,
                homeownerCounterCount: true,
                installerRevisionCount: true,
                negotiationTurnCount: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const purchasedLeads = await prisma.lead.findMany({
      where: {
        installerId,
        purchasedAt: { not: null },
        status: { not: 'CANCELLED' },
      },
      include: {
        homeowner: {
          select: { id: true, name: true, phone: true, email: true },
        },
        quotes: { select: { id: true } },
        _count: {
          select: {
            quotes: true,
            writtenQuotes: true,
          },
        },
        bids: {
          select: {
            id: true,
            installerId: true,
            status: true,
            amount: true,
            selectedAt: true,
            purchasedAt: true,
          },
        },
        writtenQuotes: {
          where: { installerId },
          select: {
            id: true,
            installerId: true,
            amount: true,
            finalTotal: true,
            status: true,
            negotiationStatus: true,
            homeownerCounterAmount: true,
            homeownerCounterAt: true,
            installerRevisedAmount: true,
            installerRevisedAt: true,
            agreedAmount: true,
            agreedAt: true,
            purchasedAt: true,
            rejectedAt: true,
            rejectionReason: true,
            homeownerCounterCount: true,
            installerRevisionCount: true,
            negotiationTurnCount: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const mappedAssigned = assignedAssignments.map((assignment) => {
      const lead = assignment.lead;

      const isPurchased = lead.installerId === installerId && !!lead.purchasedAt;
      const quotesCount =
        lead.quoteType === 'WRITTEN_QUOTE' ? lead._count.writtenQuotes : lead._count.quotes;

      return {
        id: lead.id,
        homeownerId: lead.homeownerId,
        status: lead.status,
        quoteType: normalizeQuoteType(lead.quoteType),
        postcode: lead.postcode,
        location: lead.location,
        state: lead.state,
        address: isPurchased ? lead.address || null : null,
        propertyType: lead.propertyType,
        projectType: lead.projectType,
        roofType: lead.roofType,
        budgetRange: lead.budgetRange,
        leadPrice: lead.leadPrice,
        purchaseStatus: lead.purchaseStatus || null,
        purchasedAt: lead.purchasedAt?.toISOString() || null,
        quotesCount,
        expiresAt: lead.expiresAt?.toISOString() || null,
        createdAt: lead.createdAt.toISOString(),
        approvedAt: lead.approvedAt?.toISOString() || null,
        assignedAt: assignment.assignedAt.toISOString(),
        assignmentNotes: assignment.notes,
        energyBill: isPurchased ? lead.energyBill : null,
        billType: isPurchased ? lead.billType : null,
        desiredOffset: isPurchased ? lead.desiredOffset : null,
        batteryRequired: isPurchased ? lead.batteryRequired : null,
        batteryCapacity: isPurchased ? lead.batteryCapacity || null : null,
        timeframe: isPurchased ? lead.timeframe || null : null,
        additionalNotes: isPurchased ? lead.additionalNotes || null : null,
        phoneNumber: isPurchased ? lead.phoneNumber || null : null,
        phoneVerified: isPurchased ? lead.phoneVerified : null,
        quoteData: lead.quoteType === 'BIDDING' || isPurchased ? lead.quoteData : null,
        homeowner: {
          name: isPurchased ? lead.homeowner.name : '***LOCKED***',
          phone: isPurchased ? lead.homeowner.phone : '***LOCKED***',
          email: isPurchased ? lead.homeowner.email : '***LOCKED***',
        },
        bids: lead.quoteType === 'BIDDING' ? lead.bids : undefined,
        writtenQuotes: lead.quoteType === 'WRITTEN_QUOTE' ? lead.writtenQuotes : undefined,
        countdown: calculateCountdown(lead.expiresAt),
        isPurchased,
        isPurchasedByAnother: !!lead.installerId && lead.installerId !== installerId,
        installerId: lead.installerId,
      };
    });

    const mappedPurchased = purchasedLeads.map((lead) => {
      const isPurchased = true;
      const quotesCount =
        lead.quoteType === 'WRITTEN_QUOTE' ? lead._count.writtenQuotes : lead._count.quotes;

      return {
        id: lead.id,
        homeownerId: lead.homeownerId,
        status: lead.status,
        quoteType: normalizeQuoteType(lead.quoteType),
        postcode: lead.postcode,
        location: lead.location,
        state: lead.state,
        address: lead.address || null,
        propertyType: lead.propertyType,
        projectType: lead.projectType,
        roofType: lead.roofType,
        budgetRange: lead.budgetRange,
        leadPrice: lead.leadPrice,
        purchaseStatus: lead.purchaseStatus || null,
        purchasedAt: lead.purchasedAt?.toISOString() || null,
        quotesCount,
        expiresAt: lead.expiresAt?.toISOString() || null,
        createdAt: lead.createdAt.toISOString(),
        approvedAt: lead.approvedAt?.toISOString() || null,
        assignedAt: (lead.purchasedAt || lead.createdAt).toISOString(),
        assignmentNotes: null,
        energyBill: lead.energyBill,
        billType: lead.billType,
        desiredOffset: lead.desiredOffset,
        batteryRequired: lead.batteryRequired,
        batteryCapacity: lead.batteryCapacity || null,
        timeframe: lead.timeframe || null,
        additionalNotes: lead.additionalNotes || null,
        phoneNumber: lead.phoneNumber || null,
        phoneVerified: lead.phoneVerified || null,
        quoteData: lead.quoteType === 'BIDDING' || isPurchased ? lead.quoteData : null,
        homeowner: {
          name: lead.homeowner.name,
          phone: lead.homeowner.phone,
          email: lead.homeowner.email,
        },
        bids: lead.quoteType === 'BIDDING' ? lead.bids : undefined,
        writtenQuotes: lead.quoteType === 'WRITTEN_QUOTE' ? lead.writtenQuotes : undefined,
        countdown: calculateCountdown(lead.expiresAt),
        isPurchased,
        isPurchasedByAnother: false,
        installerId: lead.installerId,
      };
    });

    const mergedById = new Map<string, any>();
    for (const lead of [...mappedAssigned, ...mappedPurchased]) {
      const existing = mergedById.get(String(lead.id));
      if (!existing) {
        mergedById.set(String(lead.id), lead);
        continue;
      }

      if (!existing.isPurchased && lead.isPurchased) {
        mergedById.set(String(lead.id), lead);
      }
    }

    const leads = Array.from(mergedById.values());

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length,
    });
  } catch (error) {
    console.error('Error fetching unified installer leads:', error);
    return NextResponse.json({ error: 'Failed to fetch unified leads' }, { status: 500 });
  }
}
