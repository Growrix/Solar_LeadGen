/**
 * Lead Detail API Route
 * 
 * GET /api/leads/[id] - Get single lead details
 * PATCH /api/leads/[id] - Update lead (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeadById } from '@/lib/services/lead-service';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/services/audit-logger';

/**
 * GET /api/leads/[id]
 * Get single lead details
 * 
 * @access Authenticated users (role-based visibility)
 * @param id - Lead ID
 * @returns 200 OK + Lead object (with role-based field filtering)
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const leadId = params.id;

    // Get lead via service (handles role-based visibility and field filtering)
    const lead = await getLeadById({
      leadId,
      userId: session.user.id,
      userRole: session.user.role,
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { lead },
      { status: 200 }
    );
  } catch (error) {
    console.error(`❌ [GET /api/leads/${params.id}] Error:`, error);
    
    return NextResponse.json(
      { error: 'Failed to fetch lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/[id]
 * Update lead details
 * - Homeowners can update their own pending leads (full form data)
 * - Admins can update price and notes
 * 
 * @access Authenticated (HOMEOWNER for own pending leads, ADMIN for any lead)
 * @param id - Lead ID
 * @body Homeowner: { propertyAddress, energyBill, etc. } | Admin: { leadPrice, adminNotes }
 * @returns 200 OK + Updated lead
 * @errors 401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Bad Request
 */
export async function PATCH(
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

    const leadId = params.id;
    const body = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Handle based on user role
    if (session.user.role === 'HOMEOWNER') {
      // Homeowner updating their own lead (full form update)
      const { updateLead } = await import('@/lib/services/lead-service');
      
      try {
        const updatedLead = await updateLead(
          leadId,
          session.user.id,
          {
            // Core database fields
            propertyAddress: body.propertyAddress,
            propertyPostcode: body.propertyPostcode,
            location: body.location,
            state: body.state,
            propertyType: body.propertyType,
            roofType: body.roofType,
            energyBill: body.energyBill,
            billType: body.billType,
            budgetRange: body.budgetRange,
            desiredOffset: body.desiredOffset,
            batteryRequired: body.batteryRequired,
            batteryCapacity: body.batteryCapacity,
            timeframe: body.timeframe,
            additionalNotes: body.additionalNotes,
            
            // Extended fields (passed through even if not in DB schema - stored in quoteData)
            panelOrientation: body.panelOrientation,
            roofTilt: body.roofTilt,
            shadingLevel: body.shadingLevel,
            usagePattern: body.usagePattern,
            hasExistingSystem: body.hasExistingSystem,
            existingSystemSize: body.existingSystemSize,
            batteryBrand: body.batteryBrand,
            batteryUsage: body.batteryUsage,
            backupCritical: body.backupCritical,
            includeVPP: body.includeVPP,
            includeEVCharging: body.includeEVCharging,
            includeSmartHome: body.includeSmartHome,
            includeGridServices: body.includeGridServices,
            panelBrand: body.panelBrand,
            systemSizeOverride: body.systemSizeOverride,
            includeOptimizers: body.includeOptimizers,
            includeMicroinverters: body.includeMicroinverters,
            retailer: body.retailer,
            tariffPlan: body.tariffPlan,
            customRetailRate: body.customRetailRate,
            customFeedInRate: body.customFeedInRate,
            peakDemand: body.peakDemand,
            isThreePhase: body.isThreePhase,
            projectPriority: body.projectPriority,
            
            // Complete form data for future use
            quoteData: body.quoteData,
          },
          ipAddress,
          userAgent
        );

        return NextResponse.json({
          success: true,
          message: 'Lead updated successfully',
          lead: {
            id: updatedLead.id,
            quoteType: updatedLead.quoteType,
            status: updatedLead.status,
            updatedAt: updatedLead.updatedAt,
          },
        });
      } catch (error: any) {
        if (error.message === 'Lead not found') {
          return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }
        if (error.message === 'Unauthorized: You can only edit your own leads') {
          return NextResponse.json({ error: 'Unauthorized. This lead does not belong to you.' }, { status: 403 });
        }
        if (error.message === 'Lead cannot be edited after admin approval') {
          return NextResponse.json({ error: 'Lead cannot be edited after admin approval' }, { status: 403 });
        }
        throw error;
      }
    } else if (session.user.role === 'ADMIN') {
      // Admin updating price/notes (existing logic)
      const existingLead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!existingLead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      const updateData: any = { updatedAt: new Date() };

      if (body.leadPrice !== undefined) {
        const price = parseFloat(body.leadPrice);
        if (isNaN(price) || price < 0) {
          return NextResponse.json({ error: 'Invalid lead price' }, { status: 400 });
        }
        updateData.leadPrice = price;
      }

      if (body.adminNotes !== undefined) {
        updateData.adminNotes = body.adminNotes;
      }

      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: updateData,
        include: {
          homeowner: {
            select: { id: true, name: true, email: true, phoneVerified: true },
          },
          installer: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await createAuditLog({
        userId: session.user.id,
        action: 'LEAD_UPDATED',
        entityType: 'lead',
        entityId: leadId,
        metadata: {
          updatedFields: Object.keys(updateData),
          leadPrice: body.leadPrice,
          adminNotes: body.adminNotes ? 'Updated' : undefined,
        },
      });

      console.log(`✅ [PATCH /api/leads/${leadId}] Lead updated by admin:`, session.user.id);
      return NextResponse.json(updatedLead, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Forbidden. Invalid role.' }, { status: 403 });
    }
  } catch (error) {
    console.error(`❌ [PATCH /api/leads/${params.id}] Error:`, error);
    
    return NextResponse.json(
      { error: 'Failed to update lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

