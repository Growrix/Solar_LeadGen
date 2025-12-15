import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
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
      passwordHashLength: admin.password?.length || 0,
      passwordHashPreview: admin.password?.substring(0, 20) + '...',
      testPassword: testPassword,
      passwordMatches: passwordMatch,
      actualPasswordHash: admin.password, // TEMPORARY - for debugging only
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
