import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl } from '@/lib/s3';
import { adminVerificationActionSchema } from '@/lib/validation/installer';
import { ZodError } from 'zod';

// GET /api/admin/installers/[id]/verification
// Get installer verification details with presigned download URLs for documents
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

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneVerified: true,
        installerVerified: true,
        companyName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Installer not found' }, { status: 404 });
    }

    const verification = await prisma.installerVerification.findUnique({
      where: { userId },
    });

    // Get verification logs
    const verificationLogs = await prisma.installerVerificationLog.findMany({
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
    const logs = await Promise.all(
      verificationLogs.map(async (log) => {
        const adminUser = await prisma.user.findUnique({
          where: { id: log.adminId },
          select: { name: true, email: true },
        });
        return {
          id: log.id,
          action: log.action,
          notes: log.notes,
          timestamp: log.createdAt.toISOString(),
          performedBy: adminUser?.name || adminUser?.email || 'Unknown Admin',
        };
      })
    );

    // Generate presigned download URLs for documents
    let documentUrls: any = {};
    if (verification) {
      try {
        if (verification.licenseDocKey) {
          documentUrls.licenseDocUrl = await getPresignedUrl(verification.licenseDocKey);
        }
        if (verification.abnDocKey) {
          documentUrls.abnDocUrl = await getPresignedUrl(verification.abnDocKey);
        }
        if (verification.logoKey) {
          documentUrls.logoUrl = await getPresignedUrl(verification.logoKey);
        }
      } catch (s3Error) {
        console.warn('[GET /api/admin/installers/[id]/verification] S3 error:', s3Error);
        // Continue without URLs if S3 is not configured
      }
    }

    return NextResponse.json({
      installer: user,
      verification,
      logs,
      documentUrls,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/installers/[id]/verification] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load verification details' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/installers/[id]/verification
// Approve, reject, or request more info for installer verification
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
    const { action, notes } = adminVerificationActionSchema.parse(body);

    // Get verification
    const verification = await prisma.installerVerification.findUnique({
      where: { userId },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification application not found' },
        { status: 404 }
      );
    }

    // Determine new status based on action
    let newStatus: string;
    let updateUserVerified: boolean | undefined;

    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED';
        updateUserVerified = true;
        break;
      case 'REJECT':
        newStatus = 'REJECTED';
        updateUserVerified = false;
        break;
      case 'REQUEST_INFO':
        newStatus = 'MORE_INFO';
        updateUserVerified = undefined; // Don't change
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update verification status
    await prisma.installerVerification.update({
      where: { userId },
      data: {
        status: newStatus,
        adminNotes: notes || undefined,
      },
    });

    // If APPROVED, sync verification data to User model and create/update profile
    if (action === 'APPROVE') {
      // Sync verification data to User model (CRITICAL: B7.6)
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: verification.representativeName,
          phone: verification.phone,
          companyName: verification.companyName,
          installerVerified: true,
        },
      });

      // Create or update InstallerProfile
      await prisma.installerProfile.upsert({
        where: { userId },
        create: {
          userId,
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
        where: { userId },
        create: {
          userId,
          alertNewLead: true,
          alertLeadUpdates: true,
          alertAdminMessages: true,
          alertVerificationUpdates: true,
          alertAccountActivity: true,
        },
        update: {},
      });

      console.log(`[ADMIN] Verification APPROVED for installer ${userId}. User data synced: name, phone, company.`);
    } else if (updateUserVerified !== undefined) {
      // Update User.installerVerified for REJECT
      await prisma.user.update({
        where: { id: userId },
        data: { installerVerified: updateUserVerified },
      });
    }

    // Create log entry
    await prisma.installerVerificationLog.create({
      data: {
        userId,
        adminId: admin.id,
        action,
        notes,
      },
    });

    // Create notification for installer
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `Verification ${action === 'APPROVE' ? 'Approved' : action === 'REJECT' ? 'Rejected' : 'Update Required'}`,
        message:
          action === 'APPROVE'
            ? 'Your installer verification has been approved. You can now access all features.'
            : action === 'REJECT'
            ? `Your installer verification was rejected. ${notes || 'Please contact support for more information.'}`
            : `More information required for your verification. ${notes || ''}`,
      },
    });

    return NextResponse.json({
      success: true,
      action,
      newStatus,
      message: `Verification ${action.toLowerCase()}d successfully`,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[PUT /api/admin/installers/[id]/verification] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update verification' },
      { status: 500 }
    );
  }
}
