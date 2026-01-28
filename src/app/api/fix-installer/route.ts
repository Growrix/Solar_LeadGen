import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

let cachedInstallerHash: string | null = null;

export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const email = 'mohammad@installer.com';
    const password = 'installer123';
    // E2E/dev helper: keep hashing fast and deterministic.
    if (!cachedInstallerHash) cachedInstallerHash = await bcrypt.hash(password, 4);
    const hashedPassword = cachedInstallerHash;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'INSTALLER',
        isActive: true,
        emailVerified: new Date(),
        name: 'Mohammad',
        companyName: 'Solar Solutions QLD',
        phone: '0412345678',
      },
      create: {
        email,
        password: hashedPassword,
        role: 'INSTALLER',
        isActive: true,
        emailVerified: new Date(),
        name: 'Mohammad',
        companyName: 'Solar Solutions QLD',
        phone: '0412345678',
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Installer user ensured for E2E/dev',
      user,
      credentials: { email, password },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
