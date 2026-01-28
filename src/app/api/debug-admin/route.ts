import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  // Safety: this was a one-off debug endpoint and must never run in production.
  // It also caused build-time Prisma access when no DB is available.
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEBUG_ADMIN_ENDPOINT !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // Get the actual admin user from database
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@solarmatch.com' }
    });

    if (!admin) {
      return NextResponse.json({
        error: 'Admin user does not exist in database',
        solution: 'Need to create admin user'
      });
    }

    // Test the password that should work
    const testPassword = 'Admin123!Secure';
    const passwordMatch = admin.password 
      ? await bcrypt.compare(testPassword, admin.password)
      : false;

    return NextResponse.json({
      adminExists: true,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      hasPassword: !!admin.password,
      testPassword: testPassword,
      passwordMatches: passwordMatch,
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
