import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/installers/[id]/logs
// Get verification log history for an installer
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
      select: { id: true, role: true },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access only' }, { status: 403 });
    }

    const userId = params.id;

    // Get logs with admin user details
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

    // Fetch admin details for each log
    const adminIds = [...new Set(logs.map((log) => log.adminId))];
    const admins = await prisma.user.findMany({
      where: { id: { in: adminIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const adminMap = Object.fromEntries(admins.map((a) => [a.id, a]));

    // Enrich logs with admin details
    const enrichedLogs = logs.map((log) => ({
      ...log,
      admin: adminMap[log.adminId] || null,
    }));

    return NextResponse.json({ logs: enrichedLogs });
  } catch (error: any) {
    console.error('[GET /api/admin/installers/[id]/logs] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load logs' },
      { status: 500 }
    );
  }
}
