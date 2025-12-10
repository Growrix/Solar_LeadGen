import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'MORE_INFO']),
  adminNotes: z.string().optional().nullable(),
});

// PUT /api/admin/installers/[id]/verification/status
// Approve, reject, or request more info for verification
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

    const installerId = params.id;
    const body = await req.json();
    const { status, adminNotes } = updateStatusSchema.parse(body);

    // Fetch existing verification
    const verification = await prisma.installerVerification.findUnique({
      where: { userId: installerId },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    // Update verification status
    const updatedVerification = await prisma.installerVerification.update({
      where: { userId: installerId },
      data: {
        status,
        adminNotes,
        updatedAt: new Date(),
      },
    });

    // Create log entry
    await prisma.installerVerificationLog.create({
      data: {
        userId: installerId,
        adminId: admin.id,
        action: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'REQUEST_INFO',
        notes: adminNotes || null,
      },
    });

    // If APPROVED, sync data to User model and create/update InstallerProfile
    if (status === 'APPROVED') {
      // Sync verification data to User model
      await prisma.user.update({
        where: { id: installerId },
        data: {
          name: verification.representativeName,
          phone: verification.phone,
          companyName: verification.companyName,
          installerVerified: true,
        },
      });

      // Create or update InstallerProfile
      await prisma.installerProfile.upsert({
        where: { userId: installerId },
        create: {
          userId: installerId,
          companyName: verification.companyName,
          businessAddress: '', // TODO: Add to verification form in future
          postcode: verification.postcodes[0] || '',
          operationalStatus: 'ACTIVE',
        },
        update: {
          companyName: verification.companyName,
          postcode: verification.postcodes[0] || undefined,
        },
      });

      // Create InstallerPreferences if not exists
      await prisma.installerPreferences.upsert({
        where: { userId: installerId },
        create: {
          userId: installerId,
          alertNewLead: true,
          alertLeadUpdates: true,
          alertAdminMessages: true,
          alertVerificationUpdates: true,
          alertAccountActivity: true,
        },
        update: {},
      });

      console.log(`[ADMIN] Verification APPROVED for installer ${installerId}. User data synced.`);
    }

    // TODO: Send notification to installer (Phase B5.9)

    return NextResponse.json({
      success: true,
      verification: {
        id: updatedVerification.id,
        status: updatedVerification.status,
        adminNotes: updatedVerification.adminNotes,
        updatedAt: updatedVerification.updatedAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[PUT /api/admin/installers/[id]/verification/status] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update verification status' },
      { status: 500 }
    );
  }
}
