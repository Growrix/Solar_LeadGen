/**
 * GET /api/installer/leads/purchased
 * Returns leads purchased by logged-in installer
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json(
        { error: 'Installer access required' },
        { status: 403 }
      );
    }
    
    const purchasedLeads = await prisma.lead.findMany({
      where: {
        installerId: session.user.id,
        purchasedAt: { not: null }
      },
      include: {
        homeowner: { 
          select: { id: true, name: true, phone: true, email: true } 
        },
        quotes: { 
          select: { id: true } 
        }
      },
      orderBy: { purchasedAt: 'desc' }
    });
    
    const leads = purchasedLeads.map(lead => ({
      id: lead.id,
      homeownerId: lead.homeownerId,
      quoteType: lead.quoteType,
      status: lead.status,
      purchaseStatus: lead.purchaseStatus,
      purchasedAt: lead.purchasedAt?.toISOString(),
      createdAt: lead.createdAt.toISOString(),
      approvedAt: lead.approvedAt?.toISOString(),
      leadPrice: lead.leadPrice,
      homeowner: {
        id: lead.homeowner.id,
        name: lead.homeowner.name,
        phone: lead.homeowner.phone,
        email: lead.homeowner.email
      },
      location: lead.location,
      postcode: lead.postcode,
      state: lead.state,
      address: lead.address,
      propertyType: lead.propertyType,
      roofType: lead.roofType,
      projectType: lead.projectType,
      budgetRange: lead.budgetRange,
      energyBill: lead.energyBill,
      billType: lead.billType,
      desiredOffset: lead.desiredOffset,
      batteryRequired: lead.batteryRequired,
      batteryCapacity: lead.batteryCapacity,
      timeframe: lead.timeframe,
      additionalNotes: lead.additionalNotes,
      phoneNumber: lead.phoneNumber,
      phoneVerified: lead.phoneVerified,
      quoteData: lead.quoteData,
      quotesCount: lead.quotes.length
    }));
    
    return NextResponse.json({
      success: true,
      leads,
      count: leads.length
    });
    
  } catch (error) {
    console.error('Error fetching purchased leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchased leads' },
      { status: 500 }
    );
  }
}
