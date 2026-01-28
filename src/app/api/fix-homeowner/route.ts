import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

let cachedHomeownerHash: string | null = null;

export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const email = 'homeowner@test.com';
    const password = 'homeowner123';
    // E2E/dev helper: keep hashing fast and deterministic.
    if (!cachedHomeownerHash) cachedHomeownerHash = await bcrypt.hash(password, 4);
    const hashedPassword = cachedHomeownerHash;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'HOMEOWNER',
        isActive: true,
        emailVerified: new Date(),
        name: 'John Smith',
        phone: '0487654321',
      },
      create: {
        email,
        password: hashedPassword,
        role: 'HOMEOWNER',
        isActive: true,
        emailVerified: new Date(),
        name: 'John Smith',
        phone: '0487654321',
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Homeowner user ensured for E2E/dev',
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
