// ============================================================================
// ADMIN INSTANT QUOTES API ROUTE
// ============================================================================
// This file provides admin-only access to view and analyze guest instant quotes.
// 
// FILE LOCATION:
// - src/app/api/admin/instant-quotes/route.ts
// - Creates endpoint: http://localhost:3000/api/admin/instant-quotes
//
// PURPOSE:
// - Real-time metrics and analytics for admins
// - Quote list with filtering and pagination
// - Conversion tracking and funnel analysis
// 
// SECURITY NOTE:
// In production, this MUST require admin authentication!
// For now, we're keeping it simple for development.
// ============================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET HANDLER - Admin Quote Dashboard
// ============================================================================
// Returns quote statistics and list with flexible filtering.
//
// QUERY PARAMETERS:
// - mode:"metrics" |"list" |"both" (default:"both")
// - limit: number of quotes to return (default: 20, max: 100)
// - offset: pagination offset (default: 0)
// - state: filter by state (e.g.,"NSW")
// - quoteType: filter by type ("residential" |"commercial")
// - dateFrom: ISO date string (e.g.,"2025-10-01T00:00:00Z")
// - dateTo: ISO date string
// - search: search in location/postcode
// ============================================================================

export async function GET(request: Request) {
  try {
    // --------------------------------------------------------------------------
    // STEP 1: PARSE QUERY PARAMETERS
    // --------------------------------------------------------------------------
    const { searchParams } = new URL(request.url);
    
    const mode = searchParams.get('mode') || 'both'; //"metrics","list","both"
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filters
    const stateFilter = searchParams.get('state');
    const quoteTypeFilter = searchParams.get('quoteType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const searchQuery = searchParams.get('search');
    
    // --------------------------------------------------------------------------
    // STEP 2: BUILD FILTER OBJECT FOR PRISMA
    // --------------------------------------------------------------------------
    const where: any = {};
    
    if (stateFilter) {
      where.state = stateFilter;
    }
    
    if (quoteTypeFilter && ['residential', 'commercial'].includes(quoteTypeFilter)) {
      where.quoteType = quoteTypeFilter;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }
    
    // Search in location or postcode
    if (searchQuery) {
      where.OR = [
        { location: { contains: searchQuery, mode: 'insensitive' } },
        { postcode: { contains: searchQuery } },
      ];
    }
    
    // --------------------------------------------------------------------------
    // STEP 3: FETCH METRICS (if requested)
    // --------------------------------------------------------------------------
    let metrics: any = null;
    
    if (mode === 'metrics' || mode === 'both') {
      // Get total count
      const totalQuotes = await prisma.guestInstantQuote.count({ where });
      
      // Get counts by quote type
      const residentialCount = await prisma.guestInstantQuote.count({
        where: { ...where, quoteType: 'residential' },
      });
      
      const commercialCount = await prisma.guestInstantQuote.count({
        where: { ...where, quoteType: 'commercial' },
      });
      
      // Get counts by state
      const byState = await prisma.guestInstantQuote.groupBy({
        by: ['state'],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });
      
      // Get quotes with battery
      const batteryCount = await prisma.guestInstantQuote.count({
        where: { ...where, batteryIncluded: true },
      });
      
      // Get conversion count
      const convertedCount = await prisma.guestInstantQuote.count({
        where: { ...where, isConverted: true },
      });
      
      // Get today's quotes
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayQuotes = await prisma.guestInstantQuote.count({
        where: {
          ...where,
          createdAt: {
            gte: today,
          },
        },
      });
      
      // Get yesterday's quotes for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayQuotes = await prisma.guestInstantQuote.count({
        where: {
          ...where,
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });
      
      // Get this week's quotes
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);
      const weekQuotes = await prisma.guestInstantQuote.count({
        where: {
          ...where,
          createdAt: {
            gte: weekStart,
          },
        },
      });
      
      // Get this month's quotes
      const monthStart = new Date(today);
      monthStart.setDate(1);
      const monthQuotes = await prisma.guestInstantQuote.count({
        where: {
          ...where,
          createdAt: {
            gte: monthStart,
          },
        },
      });
      
      // Calculate averages from results JSON
      const quotesWithResults = await prisma.guestInstantQuote.findMany({
        where,
        select: {
          results: true,
        },
      });
      
      const systemSizes = quotesWithResults
        .map((q: any) => q.results?.systemSize)
        .filter((size: any) => typeof size === 'number');
      
      const finalPrices = quotesWithResults
        .map((q: any) => q.results?.finalPrice)
        .filter((price: any) => typeof price === 'number');
      
      const avgSystemSize = systemSizes.length > 0
        ? systemSizes.reduce((a: number, b: number) => a + b, 0) / systemSizes.length
        : 0;
        
      const avgFinalPrice = finalPrices.length > 0
        ? finalPrices.reduce((a: number, b: number) => a + b, 0) / finalPrices.length
        : 0;
      
      // Convert byState array to Record<string, number>
      const byStateObject: Record<string, number> = {};
      byState.forEach((s: any) => {
        byStateObject[s.state] = s._count.id;
      });
      
      // Build metrics object matching frontend interface
      metrics = {
        totalQuotes,
        byState: byStateObject,
        byQuoteType: {
          residential: residentialCount,
          commercial: commercialCount,
        },
        conversionRate: totalQuotes > 0 ? convertedCount / totalQuotes : 0,
        avgSystemSize: Math.round(avgSystemSize * 10) / 10,
        avgFinalPrice: Math.round(avgFinalPrice),
        last24Hours: todayQuotes,
        last7Days: weekQuotes,
      };
    }
    
    // --------------------------------------------------------------------------
    // STEP 4: FETCH QUOTE LIST (if requested)
    // --------------------------------------------------------------------------
    let quotes: any = null;
    let totalCount: number = 0;
    
    if (mode === 'list' || mode === 'both') {
      quotes = await prisma.guestInstantQuote.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          quoteType: true,
          postcode: true,
          location: true,
          state: true,
          electricityUsageType: true,
          electricityValue: true,
          batteryIncluded: true,
          results: true,
          createdAt: true,
          isConverted: true,
          conversionDate: true,
          sessionId: true,
          ipAddress: true,
          userAgent: true,
          roofType: true,
          budgetRange: true,
          panelOrientation: true,
          roofTilt: true,
          shadingLevel: true,
          desiredOffset: true,
          usagePattern: true,
          batteryCapacity: true,
          batteryBrand: true,
          customBatteryCapacity: true,
          backupCritical: true,
          batteryUsage: true,
          includeVPP: true,
          peakDemand: true,
          isThreePhase: true,
          projectPriority: true,
          retailer: true,
          tariffPlan: true,
          customRetailRate: true,
          customFeedInRate: true,
          panelBrand: true,
          includeOptimizers: true,
          includeMicroinverters: true,
          includeEVCharging: true,
          includeSmartHome: true,
          includeGridServices: true,
          hasExistingSystem: true,
          existingSystemSize: true,
          systemSizeOverride: true,
          additionalArrays: true,
          adminNotes: true,
        },
      });
      
      totalCount = await prisma.guestInstantQuote.count({ where });
    }
    
    // --------------------------------------------------------------------------
    // STEP 5: BUILD AND RETURN RESPONSE
    // --------------------------------------------------------------------------
    const response: any = {
      success: true,
    };
    
    if (metrics) {
      response.metrics = metrics;
    }
    
    if (quotes) {
      response.quotes = quotes;
      response.pagination = {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < totalCount,
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Admin instant quotes fetch error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch quote data',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH HANDLER - Update Quote (Admin Actions)
// ============================================================================
// Allows admins to mark quotes as converted or add notes.
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { quoteId, isConverted, adminNotes, conversionDate } = body;
    
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }
    
    // Build update data
    const updateData: any = {};
    
    if (typeof isConverted === 'boolean') {
      updateData.isConverted = isConverted;
      if (isConverted && !conversionDate) {
        updateData.conversionDate = new Date();
      }
    }
    
    if (conversionDate) {
      updateData.conversionDate = new Date(conversionDate);
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    // Update the quote
    const updatedQuote = await prisma.guestInstantQuote.update({
      where: { id: quoteId },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Quote updated successfully',
      quote: updatedQuote,
    });
    
  } catch (error) {
    console.error('Admin quote update error:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE HANDLER - Delete Guest Quote
// ============================================================================
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const quoteId = url.searchParams.get('id');
    
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the quote
    await prisma.guestInstantQuote.delete({
      where: { id: quoteId },
    });
    
    console.log('✅ Quote deleted successfully:', quoteId);
    
    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully',
    });
    
  } catch (error) {
    console.error('Admin quote delete error:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
//
// Get metrics and list (default)
// -------------------------------
// GET /api/admin/instant-quotes
//
// Get only metrics
// ----------------
// GET /api/admin/instant-quotes?mode=metrics
//
// Get filtered list
// -----------------
// GET /api/admin/instant-quotes?mode=list&state=NSW&quoteType=residential&limit=50
//
// Search quotes
// -------------
// GET /api/admin/instant-quotes?search=Sydney
//
// Date range filter
// -----------------
// GET /api/admin/instant-quotes?dateFrom=2025-10-01T00:00:00Z&dateTo=2025-10-31T23:59:59Z
//
// Mark quote as converted
// -----------------------
// PATCH /api/admin/instant-quotes
// Body: {"quoteId":"abc123","isConverted": true }
//
// Add admin notes
// ---------------
// PATCH /api/admin/instant-quotes
// Body: {"quoteId":"abc123","adminNotes":"Follow up with customer" }
//
// ============================================================================
