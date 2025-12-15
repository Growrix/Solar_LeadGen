/**
 * Lead Management API Routes
 * 
 * POST /api/leads - Create new lead (homeowner)
 * GET /api/leads - List leads (role-based filtering)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLead, getHomeownerLeadSummary, getLeads } from '@/lib/services/lead-service';

/**
 * POST /api/leads
 * Create a new lead request
 * 
 * @access Homeowner only
 * @body CreateLeadRequest (quote type, property details, etc.)
 * @returns 201 Created + Lead object
 * @errors 400 Bad Request, 401 Unauthorized, 403 Forbidden (limit reached)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only homeowners can create leads
    if (session.user.role !== 'HOMEOWNER') {
      return NextResponse.json(
        { error: 'Only homeowners can create leads' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const validQuoteTypes: Array<'CALL_VISIT' | 'WRITTEN_QUOTE' | 'BIDDING'> = ['CALL_VISIT', 'WRITTEN_QUOTE', 'BIDDING'];

    // Phase 4.5: Debug log to verify quoteData is received
    console.log('[POST /api/leads] QuoteData received:', {
      hasQuoteData: !!body.quoteData,
      quoteDataKeys: body.quoteData ? Object.keys(body.quoteData).length : 0,
      quoteType: body.quoteType
    });
    
    // DEBUGGING: Log full body to identify where bad quoteType comes from
    console.log('[POST /api/leads] FULL BODY:', JSON.stringify(body, null, 2));
    
    // DEBUG: Log energyBill calculation
    const calculatedEnergyBill = body.energyBill || 
                  Number(body.electricityValue) || 
                  0; // SIMPLIFIED: Just use the raw input value
    console.log('[POST /api/leads] energyBill calculation:', {
      bodyEnergyBill: body.energyBill,
      electricityValue: body.electricityValue,
      billType: body.billType || body.electricityUsageType,
      calculated: calculatedEnergyBill
    });
    
    // Validate required fields
    if (!body.quoteType || !body.propertyPostcode || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteType, propertyPostcode, location' },
        { status: 400 }
      );
    }

    if (!validQuoteTypes.includes(body.quoteType)) {
      return NextResponse.json(
        { error: 'Invalid quoteType. Expected CALL_VISIT, WRITTEN_QUOTE, or BIDDING' },
        { status: 400 }
      );
    }

    // Create lead via service (handles validation, count tracking, audit logging)
    const result = await createLead({
      homeownerId: session.user.id,
      quoteData: body.quoteData, // InstantQuote calculation results
      quoteType: body.quoteType,
      propertyAddress: body.propertyAddress || body.address, // Support both field names
      propertyPostcode: body.propertyPostcode,
      location: body.location,
      state: body.state,
      propertyType: body.propertyType || 'residential',
      roofType: body.roofType,
      // FIX: Convert to Number - handle both string and number inputs
      energyBill: Number(body.energyBill) || Number(body.electricityValue) || 0,
      billType: body.billType || body.electricityUsageType || 'quarterly',
      budgetRange: body.budgetRange,
      desiredOffset: body.desiredOffset || 100,
      batteryRequired: body.batteryRequired || false,
      batteryCapacity: body.batteryCapacity,
      timeframe: body.timeframe,
      additionalNotes: body.additionalNotes,
      // ✅ Phase 21.2 Fix: Only pass name/phoneNumber if provided in request (first-time registration)
      // If not provided, createLead will use homeowner.name/phone from User table
      ...(body.name && { name: body.name }),
      ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Check if verification is required
    if (result.requiresVerification) {
      return NextResponse.json(
        {
          error: 'Phone verification required',
          message: 'You must verify your phone number before submitting additional leads',
          leadSubmissionCount: result.leadSubmissionCount,
          quoteLimit: result.quoteLimit,
          remainingLeadAllowance: result.remainingLeadAllowance,
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Check if limit reached
    if (result.limitReached) {
      return NextResponse.json(
        {
          error: 'Lead limit reached',
          message: `You have reached the maximum number of lead submissions (${result.quoteLimit} total)`,
          leadSubmissionCount: result.leadSubmissionCount,
          quoteLimit: result.quoteLimit,
          remainingLeadAllowance: result.remainingLeadAllowance,
        },
        { status: 403 }
      );
    }

    // Get homeowner dashboard summary
    const dashboardSummary = await getHomeownerLeadSummary(session.user.id);

    return NextResponse.json(
      {
        lead: result.lead,
        message: 'Lead created successfully',
        autoApproved: result.lead.status === 'APPROVED',
        leadSubmissionCount: result.leadSubmissionCount,
        quoteLimit: result.quoteLimit,
        remainingLeadAllowance: result.remainingLeadAllowance,
        dashboardSummary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ [POST /api/leads] Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads
 * List leads with role-based filtering
 * 
 * @access Authenticated users (role-based visibility)
 * @query status - Filter by lead status
 * @query quoteType - Filter by quote type (CALL_VISIT or WRITTEN_QUOTE)
 * @query postcode - Filter by postcode
 * @query marketplace - Show available marketplace leads (installers only)
 * @query purchased - Show purchased leads (installers only)
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20)
 * @returns 200 OK + { leads[], pagination }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const isMarketplace = searchParams.get('marketplace') === 'true';
    const isPurchased = searchParams.get('purchased') === 'true';
    const isAssigned = searchParams.get('assigned') === 'true';
    
    const filters = {
      status: searchParams.get('status') || undefined,
      quoteType: searchParams.get('quoteType') || undefined,
      postcode: searchParams.get('postcode') || undefined,
      marketplace: isMarketplace,
      purchased: isPurchased,
      assigned: isAssigned,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    // Get leads via service (handles role-based filtering)
    const result = await getLeads({
      userId: session.user.id,
      userRole: session.user.role,
      filters,
    });

    console.log('[GET /api/leads] Result for user:', {
      userId: session.user.id,
      userRole: session.user.role,
      leadCount: result.leads.length,
      firstThreeLeads: result.leads.slice(0, 3).map(l => ({ id: l.id, status: l.status })),
    });

    return NextResponse.json(
      {
        leads: result.leads,
        pagination: result.pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [GET /api/leads] Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch leads', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
