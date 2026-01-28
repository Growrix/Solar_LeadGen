import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

let cachedAdminHash: string | null = null;

export async function POST() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    // Set the password
    const password = 'Admin123!Secure';
    // E2E/dev helper: keep hashing fast and deterministic.
    if (!cachedAdminHash) cachedAdminHash = await bcrypt.hash(password, 4);
    const hashedPassword = cachedAdminHash;
    
    // Update admin user with password
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@solarmatch.com' },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    });

    // Verify it worked
    const isValid = await bcrypt.compare(password, updatedAdmin.password!);

    return NextResponse.json({
      success: true,
      passwordSet: true,
      passwordTest: isValid,
      message: isValid ? 'Password set successfully! Try logging in now.' : 'Password set but verification failed'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
