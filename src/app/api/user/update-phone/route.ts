/**
 * PUT /api/user/update-phone
 * 
 * Updates user's phone number in the database
 * Used when user changes phone number during verification process
 */

import { NextRequest, NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { createAuditLog } from"@/lib/services/audit-logger";

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error:"Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { phoneNumber } = body;

    // Validate phone number
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error:"Phone number is required" },
        { status: 400 }
      );
    }

    // Validate E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error:"Invalid phone number format. Must be in E.164 format (e.g., +61412345678)" },
        { status: 400 }
      );
    }

    // Update user's phone number
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        phone: phoneNumber,
        // Reset phone verification when phone number changes
        phoneVerified: false
      },
      select: {
        id: true,
        phone: true,
        phoneVerified: true
      }
    });

    // Log the phone number update
    await createAuditLog({
      userId: session.user.id,
      action: 'PHONE_UPDATED',
      entityType: 'USER',
      metadata: {
        newPhone: phoneNumber.slice(-4), // Last 4 digits only for privacy
        resetVerification: true
      }
    });

    return NextResponse.json({
      success: true,
      message:"Phone number updated successfully",
      phone: updatedUser.phone,
      phoneVerified: updatedUser.phoneVerified
    });

  } catch (error: any) {
    console.error('[update-phone] Error:', error);

    // Handle specific database errors
    if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
      return NextResponse.json(
        { 
          success: false,
          error:"This phone number is already registered to another account" 
        },
        { status: 409 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false,
        error:"Failed to update phone number. Please try again." 
      },
      { status: 500 }
    );
  }
}