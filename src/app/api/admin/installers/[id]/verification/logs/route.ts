import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/installers/[id]/verification/logs
// Get verification activity logs for an installer
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
    }

    const userId = params.id;

    // Fetch verification logs
    const logs = await prisma.installerVerificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        notes: true,
        createdAt: true,
        adminId: true,
      },
    });

    // Enrich logs with admin names
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const adminUser = await prisma.user.findUnique({
          where: { id: log.adminId },
          select: { name: true, email: true },
        });
        return {
          id: log.id,
          action: log.action,
          notes: log.notes,
          timestamp: log.createdAt.toISOString(),
          performedBy: adminUser?.name || adminUser?.email || 'System',
        };
      })
    );

    return NextResponse.json({
      logs: enrichedLogs,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/installers/[id]/verification/logs] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load verification logs' },
      { status: 500 }
    );
  }
}
