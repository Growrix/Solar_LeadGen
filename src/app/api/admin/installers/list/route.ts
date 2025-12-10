import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin user
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const phoneVerified = searchParams.get('phoneVerified');
    const installerVerified = searchParams.get('installerVerified');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build where clause
    const where: any = {
      role: 'INSTALLER',
    };

    // Add search filter
    if (search.trim()) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        // F15: Search in InstallerVerification relation (source of truth for business data)
        {
          installerVerification: {
            companyName: { contains: search, mode: 'insensitive' }
          }
        },
        {
          installerVerification: {
            representativeName: { contains: search, mode: 'insensitive' }
          }
        },
        {
          installerVerification: {
            phone: { contains: search, mode: 'insensitive' }
          }
        },
        {
          installerVerification: {
            address: { contains: search, mode: 'insensitive' }
          }
        },
      ];
    }

    // Add phone verification filter
    if (phoneVerified !== null && phoneVerified !== undefined) {
      where.phoneVerified = phoneVerified === 'true';
    }

    // Add installer verification filter
    if (installerVerified !== null && installerVerified !== undefined) {
      where.installerVerified = installerVerified === 'true';
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Fetch installers
    const installers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        image: true,
        phoneVerified: true,
        installerVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // F15: Include InstallerVerification relation (source of truth for business data)
        installerVerification: {
          select: {
            companyName: true,
            representativeName: true,
            phone: true,
            address: true,
            postcodes: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      installers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching installers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch installers' },
      { status: 500 }
    );
  }
}
