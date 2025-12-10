import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { installerPreferencesSchema } from '@/lib/validation/installer';
import { ZodError } from 'zod';

// GET /api/installer/preferences
// Read installer notification preferences
export async function GET(_req: NextRequest) {
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

    let preferences = await prisma.installerPreferences.findUnique({
      where: { userId: user.id },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.installerPreferences.create({
        data: {
          userId: user.id,
          alertNewLead: true,
          alertLeadUpdates: true,
          alertAdminMessages: true,
          alertVerificationUpdates: true,
          alertAccountActivity: true,
        },
      });
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error('[GET /api/installer/preferences] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/installer/preferences
// Update installer notification preferences
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
    const validatedData = installerPreferencesSchema.parse(body);

    // Upsert preferences
    const preferences = await prisma.installerPreferences.upsert({
      where: { userId: user.id },
      update: validatedData,
      create: {
        userId: user.id,
        ...validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[PUT /api/installer/preferences] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
