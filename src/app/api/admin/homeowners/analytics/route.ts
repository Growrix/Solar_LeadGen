// ============================================================================
// ADMIN HOMEOWNERS ANALYTICS API
// ============================================================================
// GET /api/admin/homeowners/analytics
// Provides aggregated analytics for homeowners (ADMIN only)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - Homeowners analytics with aggregations
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    // Check for ADMIN role
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // ========================================================================
    // PARSE QUERY PARAMETERS
    // ========================================================================
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || 'all'; // all | 30d | 90d

    // ========================================================================
    // BUILD TIME FILTER
    // ========================================================================
    const where: any = {
      role: 'HOMEOWNER',
    };

    if (window === '30d') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    } else if (window === '90d') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      where.createdAt = { gte: ninetyDaysAgo };
    }
    // else 'all' - no time filter

    // ========================================================================
    // FETCH TOTAL COUNT
    // ========================================================================
    const totalHomeowners = await prisma.user.count({ where });

    // ========================================================================
    // AGGREGATE BY POSTCODE
    // ========================================================================
    // Fetch all homeowners with postcode, then group in-memory
    // (Prisma doesn't support groupBy with aggregations across all fields easily)
    const homeownersByPostcode = await prisma.user.groupBy({
      by: ['postcode'],
      where: {
        ...where,
        postcode: { not: null },
      },
      _count: true,
    });

    const byPostcode = homeownersByPostcode
      .map((item) => ({
        postcode: item.postcode || 'Unspecified',
        count: item._count,
        percent: totalHomeowners > 0 ? parseFloat(((item._count / totalHomeowners) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // ========================================================================
    // AGGREGATE BY LOCATION (simplified: use businessAddress or postcode prefix)
    // ========================================================================
    // Since User model doesn't have a dedicated"city" field, we'll use businessAddress
    // For homeowners, businessAddress might be null, so we group by postcode prefix or mark as Unspecified
    
    // Fetch all homeowners with their addresses
    const homeownersWithLocation = await prisma.user.findMany({
      where,
      select: {
        businessAddress: true,
        postcode: true,
      },
    });

    // Extract location from businessAddress or postcode (simplified logic)
    const locationCounts: Record<string, number> = {};
    
    homeownersWithLocation.forEach((user) => {
      let location = 'Unspecified';
      
      if (user.businessAddress && user.businessAddress.trim()) {
        // Extract city/region from address (very simplified: use last part before postcode)
        // In production, use proper address parsing or geocoding
        const parts = user.businessAddress.split(',').map(p => p.trim());
        if (parts.length > 1) {
          location = parts[parts.length - 2] || parts[0];
        } else {
          location = parts[0];
        }
      } else if (user.postcode) {
        // Group by postcode prefix (first part before space)
        const prefix = user.postcode.split(' ')[0];
        location = `${prefix} area`;
      }
      
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    const byLocation = Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percent: totalHomeowners > 0 ? parseFloat(((count / totalHomeowners) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // ========================================================================
    // RETURN ANALYTICS
    // ========================================================================
    return NextResponse.json(
      {
        window,
        totals: {
          homeowners: totalHomeowners,
        },
        byPostcode,
        byLocation,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching homeowners analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
