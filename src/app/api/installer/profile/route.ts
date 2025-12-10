import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { installerProfileUpdateSchema } from '@/lib/validation/installer';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// GET /api/installer/profile
// Aggregates User + InstallerProfile + InstallerVerification + InstallerPreferences
export async function GET(_req: NextRequest) {
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
        name: true,
        phone: true,
        phoneVerified: true,
        installerVerified: true,
        role: true,
      },
    });

    if (!user || user.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Forbidden - Installer access only' }, { status: 403 });
    }

    const profile = await prisma.installerProfile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        companyName: true,
        businessAddress: true,
        postcode: true,
        operationalStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const verification = await prisma.installerVerification.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        companyName: true,
        representativeName: true,
        designation: true,
        email: true,
        phone: true,
        address: true,
        abnOrLicense: true,
        establishedYear: true,
        employeeCount: true,
        services: true,
        serviceAreas: true,
        postcodes: true,
        website: true,
        socialLinks: true,
        companyDescription: true,
        licenseDocKey: true,
        abnDocKey: true,
        logoKey: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const preferences = await prisma.installerPreferences.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        alertNewLead: true,
        alertLeadUpdates: true,
        alertAdminMessages: true,
        alertVerificationUpdates: true,
        alertAccountActivity: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user,
      profile,
      verification,
      preferences,
      operationalStatus: profile?.operationalStatus || 'ACTIVE',
    });
  } catch (error: any) {
    console.error('[GET /api/installer/profile] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load installer profile' }, { status: 500 });
  }
}

// PUT /api/installer/profile
// Update installer profile and editable verification fields (post-approval subset)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        installerVerified: true,
      },
    });

    if (!user || user.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Forbidden - Installer access only' }, { status: 403 });
    }

    const body = await req.json();

    // Phase E13: Legacy label normalization (services & serviceAreas)
    const LEGACY_SERVICE_MAP: Record<string,string> = {
      Installation: 'Residential Solar',
      Maintenance: 'Solar Maintenance',
      Inspection: 'System Upgrades',
      Repair: 'System Upgrades',
      Consultation: 'Commercial Solar',
    };
    const LEGACY_AREA_MAP: Record<string,string> = {
      'Regional NSW': 'Newcastle',
      'Regional VIC': 'Geelong',
      'Regional QLD': 'Gold Coast',
    };
    if (Array.isArray(body.services)) {
      body.services = body.services.map((s: string) => LEGACY_SERVICE_MAP[s] || s);
    }
    if (Array.isArray(body.serviceAreas)) {
      body.serviceAreas = body.serviceAreas.map((a: string) => LEGACY_AREA_MAP[a] || a);
    }

    // DEBUG: Log incoming payload
    console.log('[PUT /api/installer/profile] Incoming payload:', JSON.stringify(body, null, 2));

    // Validate payload
    const validatedData = installerProfileUpdateSchema.parse(body);

    // Convert socialLinks to Prisma Json type
    const dataForPrisma = {
      ...validatedData,
      socialLinks: validatedData.socialLinks 
        ? (validatedData.socialLinks as Prisma.InputJsonValue)
        : undefined,
    };

    // Ensure InstallerProfile exists (create minimal record if missing)
    let existingProfile = await prisma.installerProfile.findUnique({ where: { userId: user.id } });
    if (!existingProfile) {
      // Attempt to derive initial values from verification record if it exists
      const existingVerification = await prisma.installerVerification.findUnique({ where: { userId: user.id } });
      existingProfile = await prisma.installerProfile.create({
        data: {
          userId: user.id,
          companyName: dataForPrisma.companyName || existingVerification?.companyName || 'Pending Company',
          businessAddress: dataForPrisma.businessAddress || 'Pending Address',
          postcode: dataForPrisma.postcode || (existingVerification?.postcodes?.[0] || '0000'),
        },
      });
      console.log('[PUT /api/installer/profile] Created missing InstallerProfile');
    }

    // Update InstallerProfile if any basic fields provided
    if (dataForPrisma.companyName || dataForPrisma.businessAddress || dataForPrisma.postcode) {
      await prisma.installerProfile.update({
        where: { userId: user.id },
        data: {
          companyName: dataForPrisma.companyName ?? existingProfile.companyName,
          businessAddress: dataForPrisma.businessAddress ?? existingProfile.businessAddress,
          postcode: dataForPrisma.postcode ?? existingProfile.postcode,
        },
      });
    }

    // E1: Handle phone number update (User table + verification sync)
    if (dataForPrisma.phone) {
      // Update User.phone and mark as verified (OTP already completed in frontend)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: dataForPrisma.phone,
          phoneVerified: true,
        },
      });
    }

    // Update InstallerVerification (allow all installers to update profile)
    const verification = await prisma.installerVerification.findUnique({
      where: { userId: user.id },
    });

    if (verification) {
      const updateData: any = {};
      
      if (dataForPrisma.services) updateData.services = dataForPrisma.services;
      if (dataForPrisma.serviceAreas) updateData.serviceAreas = dataForPrisma.serviceAreas;
      if (dataForPrisma.postcodes) updateData.postcodes = dataForPrisma.postcodes;
      if (dataForPrisma.website !== undefined) updateData.website = dataForPrisma.website;
      if (dataForPrisma.socialLinks !== undefined) updateData.socialLinks = dataForPrisma.socialLinks;
      if (dataForPrisma.companyDescription !== undefined) updateData.companyDescription = dataForPrisma.companyDescription;
      if (dataForPrisma.logoKey !== undefined) updateData.logoKey = dataForPrisma.logoKey;
      // Phase E13: Document keys persistence
      if (dataForPrisma.licenseDocKey !== undefined) updateData.licenseDocKey = dataForPrisma.licenseDocKey;
      if (dataForPrisma.abnDocKey !== undefined) updateData.abnDocKey = dataForPrisma.abnDocKey;
      if (dataForPrisma.phone) updateData.phone = dataForPrisma.phone; // E1: Sync phone to verification record
      // E2: Add company details update logic
      if (dataForPrisma.companyName) updateData.companyName = dataForPrisma.companyName;
      if (dataForPrisma.representativeName) updateData.representativeName = dataForPrisma.representativeName;
      if (dataForPrisma.designation) updateData.designation = dataForPrisma.designation;
      if (dataForPrisma.address !== undefined) updateData.address = dataForPrisma.address; // F14: Business address
      if (dataForPrisma.abnOrLicense) updateData.abnOrLicense = dataForPrisma.abnOrLicense;
      if (dataForPrisma.establishedYear !== undefined) updateData.establishedYear = dataForPrisma.establishedYear;
      if (dataForPrisma.employeeCount !== undefined) updateData.employeeCount = dataForPrisma.employeeCount;

      if (Object.keys(updateData).length > 0) {
        console.log('[PUT /api/installer/profile] Updating verification with:', JSON.stringify(updateData, null, 2));
        await prisma.installerVerification.update({
          where: { userId: user.id },
          data: updateData,
        });
        console.log('[PUT /api/installer/profile] ✅ Verification updated successfully');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error('[PUT /api/installer/profile] Validation error:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }

    console.error('[PUT /api/installer/profile] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
