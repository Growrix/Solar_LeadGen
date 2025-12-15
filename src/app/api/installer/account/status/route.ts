import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED']), // Installer can only toggle between ACTIVE and PAUSED
});

// PUT /api/installer/account/status
// Toggle operational status (ACTIVE/PAUSED)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Forbidden - Installer access only' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = statusSchema.parse(body);

    // Update operational status in InstallerProfile
    const profile = await prisma.installerProfile.update({
      where: { userId: user.id },
      data: { operationalStatus: status },
      select: {
        id: true,
        operationalStatus: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      operationalStatus: profile.operationalStatus,
      message: `Status updated to ${status}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[PUT /api/installer/account/status] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
