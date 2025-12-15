import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { installerVerificationSubmitSchema } from '@/lib/validation/installer';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// POST /api/installer/verification/submit
// Create or update installer verification application
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || user.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Forbidden - Installer access only' }, { status: 403 });
    }

    const body = await req.json();
    console.log('[VERIFICATION SUBMIT] Received body:', JSON.stringify(body, null, 2));

    // Validate payload with Zod
    const validatedData = installerVerificationSubmitSchema.parse(body);

    // Convert socialLinks to Prisma Json type
    const dataForPrisma = {
      ...validatedData,
      socialLinks: validatedData.socialLinks 
        ? (validatedData.socialLinks as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    };

    // Check if verification already exists
    const existing = await prisma.installerVerification.findUnique({
      where: { userId: user.id },
    });

    let verification;
    if (existing) {
      // Update existing verification (only if not APPROVED)
      if (existing.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Cannot resubmit approved verification. Use profile update instead.' },
          { status: 400 }
        );
      }

      verification = await prisma.installerVerification.update({
        where: { userId: user.id },
        data: {
          ...dataForPrisma,
          status: 'PENDING',
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new verification
      verification = await prisma.installerVerification.create({
        data: {
          userId: user.id,
          ...dataForPrisma,
          status: 'PENDING',
        },
      });
    }

    // Ensure InstallerProfile exists after initial submission (so later profile edits work)
    const existingProfile = await prisma.installerProfile.findUnique({ where: { userId: user.id } });
    if (!existingProfile) {
      await prisma.installerProfile.create({
        data: {
          userId: user.id,
          companyName: dataForPrisma.companyName,
          businessAddress: validatedData.address || 'Not provided',
          postcode: (validatedData.postcodes && validatedData.postcodes[0]) || '0000',
        },
      });
      console.log('[VERIFICATION SUBMIT] Created InstallerProfile bootstrap record');
    }

    // Create log entry
    await prisma.installerVerificationLog.create({
      data: {
        userId: user.id,
        adminId: user.id, // Self-submitted
        action: 'SUBMITTED',
        notes: existing ? 'Resubmitted verification application' : 'Initial verification submission',
      },
    });

    // TODO: Create notification for admins (optional - Phase B5.9)

    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        status: verification.status,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
      },
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error('[VERIFICATION SUBMIT] Validation failed:', error.issues);
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[POST /api/installer/verification/submit] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification' },
      { status: 500 }
    );
  }
}
