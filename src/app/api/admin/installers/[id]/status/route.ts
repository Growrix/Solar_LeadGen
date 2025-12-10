import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { operationalStatusSchema } from '@/lib/validation/installer';
import { ZodError } from 'zod';

// PUT /api/admin/installers/[id]/status
// Admin can set installer operational status (ACTIVE/PAUSED/INACTIVE)
export async function PUT(
  req: NextRequest,
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
    const body = await req.json();
    const { status } = operationalStatusSchema.parse(body);

    // Update status
    const profile = await prisma.installerProfile.update({
      where: { userId },
      data: { operationalStatus: status },
      select: {
        id: true,
        operationalStatus: true,
        updatedAt: true,
      },
    });

    // Create notification for installer
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `Account Status Changed`,
        message:
          status === 'INACTIVE'
            ? 'Your installer account has been deactivated by an administrator. Please contact support for more information.'
            : status === 'PAUSED'
            ? 'Your installer account has been paused.'
            : 'Your installer account has been reactivated.',
      },
    });

    return NextResponse.json({
      success: true,
      operationalStatus: profile.operationalStatus,
      message: `Status updated to ${status}`,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[PUT /api/admin/installers/[id]/status] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
