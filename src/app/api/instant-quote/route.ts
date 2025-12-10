// ============================================================================
// INSTANT QUOTE API ROUTE
// ============================================================================
// This file handles HTTP requests for instant solar quote submissions.
// 
// FILE LOCATION:
// - src/app/api/instant-quote/route.ts
// - Creates endpoint: http://localhost:3000/api/instant-quote
//
// PURPOSE:
// - Save guest instant quote submissions to database
// - Track user behavior and quote trends
// - Enable admin analytics and reporting
// - Link quotes to user accounts when they sign up
// ============================================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================================
// POST HANDLER - Save Instant Quote
// ============================================================================
// Saves a guest's instant quote submission with all inputs and calculated results.
// 
// REQUEST BODY STRUCTURE:
// {
//   // Property & Location
//   quoteType:"residential" |"commercial",
//   postcode:"2000",
//   location:"Sydney",
//   state:"NSW",
//   
//   // Energy Usage
//   electricityUsageType:"monthly" |"quarterly",
//   electricityValue:"400",
//   
//   // System Configuration
//   roofType:"tile",
//   budgetRange:"10000-20000",
//   panelOrientation:"north",
//   roofTilt:"optimal",
//   shadingLevel:"none",
//   desiredOffset: 100,
//   
//   // Optional fields...
//   batteryIncluded: false,
//   hasExistingSystem: false,
//   
//   // Calculated Results
//   results: {
//     systemSize: 6.6,
//     annualProduction: 9500,
//     annualSavings: 1250,
//     finalPrice: 5000,
//     ...
//   },
//   
//   // Tracking
//   sessionId?:"abc123",
//   userAgent?:"Mozilla/5.0...",
//   ipAddress?:"192.168.1.1"
// }
// ============================================================================

export async function POST(request: Request) {
  try {
    // --------------------------------------------------------------------------
    // STEP 1: EXTRACT DATA FROM REQUEST
    // --------------------------------------------------------------------------
    const body = await request.json();
    console.log('📥 Received quote submission:', {
      quoteType: body.quoteType,
      location: body.location,
      sessionId: body.sessionId,
    });
    
    // Destructure all required and optional fields
    const {
      // Required fields
      quoteType,
      postcode,
      location,
      state,
      electricityUsageType,
      electricityValue,
      roofType,
      budgetRange,
      panelOrientation,
      roofTilt,
      shadingLevel,
      desiredOffset,
      results,
      
      // Optional tracking fields
      sessionId,
      userAgent,
      ipAddress,
      
      // Optional configuration fields
      usagePattern,
      batteryIncluded = false,
      batteryCapacity,
      batteryBrand,
      customBatteryCapacity,
      backupCritical,
      batteryUsage,
      includeVPP = false,
      peakDemand,
      isThreePhase = false,
      projectPriority,
      retailer,
      tariffPlan,
      customRetailRate,
      customFeedInRate,
      panelBrand,
      includeOptimizers = false,
      includeMicroinverters = false,
      includeEVCharging = false,
      includeSmartHome = false,
      includeGridServices = false,
      hasExistingSystem = false,
      existingSystemSize,
      systemSizeOverride,
      additionalArrays,
    } = body;
    
    // --------------------------------------------------------------------------
    // STEP 2: VALIDATE REQUIRED FIELDS
    // --------------------------------------------------------------------------
    const requiredFields = {
      quoteType,
      postcode,
      location,
      state,
      electricityUsageType,
      electricityValue,
      roofType,
      budgetRange,
      panelOrientation,
      roofTilt,
      shadingLevel,
      desiredOffset,
      results,
    };
    
    // Check if any required field is missing
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      console.error('Received body keys:', Object.keys(body));
      return NextResponse.json(
        {
          error: 'Missing required fields',
          fields: missingFields,
        },
        { status: 400 }
      );
    }
    
    // Validate quote type
    if (!['residential', 'commercial'].includes(quoteType)) {
      return NextResponse.json(
        { error: 'Invalid quote type. Must be"residential" or"commercial"' },
        { status: 400 }
      );
    }
    
    // Validate postcode format (4 digits)
    if (!/^\d{4}$/.test(postcode)) {
      return NextResponse.json(
        { error: 'Invalid postcode format. Must be a 4-digit number' },
        { status: 400 }
      );
    }
    
    // Validate state
    const validStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
    if (!validStates.includes(state)) {
      return NextResponse.json(
        {
          error: 'Invalid state code',
          validStates,
        },
        { status: 400 }
      );
    }
    
    // Validate results is an object
    if (typeof results !== 'object' || results === null) {
      return NextResponse.json(
        { error: 'Results must be a valid object' },
        { status: 400 }
      );
    }
    
    // --------------------------------------------------------------------------
    // STEP 3: GET IP ADDRESS FROM REQUEST IF NOT PROVIDED
    // --------------------------------------------------------------------------
    let finalIpAddress = ipAddress;
    if (!finalIpAddress) {
      // Try to extract IP from headers
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      finalIpAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    }
    
    // --------------------------------------------------------------------------
    // STEP 4: GET USER AGENT IF NOT PROVIDED
    // --------------------------------------------------------------------------
    const finalUserAgent = userAgent || request.headers.get('user-agent') || 'unknown';
    
    // --------------------------------------------------------------------------
    // STEP 5: CREATE QUOTE RECORD IN DATABASE
    // --------------------------------------------------------------------------
    const quote = await prisma.guestInstantQuote.create({
      data: {
        // Required fields
        quoteType,
        postcode,
        location,
        state,
        electricityUsageType,
        electricityValue,
        roofType,
        budgetRange,
        panelOrientation,
        roofTilt,
        shadingLevel,
        desiredOffset,
        results,
        
        // Tracking
        sessionId: sessionId || null,
        ipAddress: finalIpAddress,
        userAgent: finalUserAgent,
        
        // Optional configuration
        usagePattern: usagePattern || null,
        batteryIncluded,
        batteryCapacity: batteryCapacity || null,
        batteryBrand: batteryBrand || null,
        customBatteryCapacity: customBatteryCapacity || null,
        backupCritical: backupCritical || null,
        batteryUsage: batteryUsage || null,
        includeVPP,
        peakDemand: peakDemand || null,
        isThreePhase,
        projectPriority: projectPriority || null,
        retailer: retailer || null,
        tariffPlan: tariffPlan || null,
        customRetailRate: customRetailRate || null,
        customFeedInRate: customFeedInRate || null,
        panelBrand: panelBrand || null,
        includeOptimizers,
        includeMicroinverters,
        includeEVCharging,
        includeSmartHome,
        includeGridServices,
        hasExistingSystem,
        existingSystemSize: existingSystemSize || null,
        systemSizeOverride: systemSizeOverride || null,
        additionalArrays: additionalArrays || null,
      },
    });
    
    // --------------------------------------------------------------------------
    // STEP 6: SEND SUCCESS RESPONSE
    // --------------------------------------------------------------------------
    console.log('✅ Quote saved successfully:', {
      id: quote.id,
      quoteType: quote.quoteType,
      location: quote.location,
      createdAt: quote.createdAt,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Quote saved successfully',
      quoteId: quote.id,
      id: quote.id,
      createdAt: quote.createdAt,
    }, { status: 201 });
    // 201 = Created (new resource was successfully created)
    
  } catch (error) {
    // Catch any unexpected errors
    console.error('Instant quote save error:', error);
    
    // Check if it's a Prisma error
    if (error instanceof Error && error.message.includes('Prisma')) {
      return NextResponse.json(
        {
          error: 'Database error occurred',
          details: error.message,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save quote. Please try again.' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Retrieve Guest Quotes (For Testing/Debug)
// ============================================================================
// This endpoint is for development and testing only.
// In production, this should be removed or require admin authentication.
// ============================================================================

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Fetch recent quotes with pagination
    const quotes = await prisma.guestInstantQuote.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        quoteType: true,
        location: true,
        state: true,
        postcode: true,
        results: true,
        createdAt: true,
      },
    });
    
    // Get total count
    const total = await prisma.guestInstantQuote.count();
    
    return NextResponse.json({
      success: true,
      quotes,
      total,
      limit,
      offset,
    });
    
  } catch (error) {
    console.error('Fetch quotes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
//
// POST /api/instant-quote
// -----------------------
// curl -X POST http://localhost:3000/api/instant-quote \
//   -H"Content-Type: application/json" \
//   -d '{
//   "quoteType":"residential",
//   "postcode":"2000",
//   "location":"Sydney",
//   "state":"NSW",
//   "electricityUsageType":"monthly",
//   "electricityValue":"400",
//   "roofType":"tile",
//   "budgetRange":"10000-20000",
//   "panelOrientation":"north",
//   "roofTilt":"optimal",
//   "shadingLevel":"none",
//   "desiredOffset": 100,
//   "results": {
//     "systemSize": 6.6,
//     "annualProduction": 9500,
//     "annualSavings": 1250,
//     "finalPrice": 5000
//     }
//   }'
//
// GET /api/instant-quote?limit=10&offset=0
// -----------------------------------------
// curl http://localhost:3000/api/instant-quote?limit=10&offset=0
//
// ============================================================================
