/**
 * T033: POST /api/verification/verify-otp
 * 
 * Verifies OTP code and marks user as phone verified
 * - Validates 6-digit code against stored hash
 * - Checks expiry and attempt limits
 * - Updates user.phoneVerified on success
 */

import { NextRequest, NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { phoneVerificationService } from"@/lib/services/phone-verification-service";
import { createAuditLog } from"@/lib/services/audit-logger";
import { createNotification } from"@/lib/services/notification-service";
import { prisma } from"@/lib/prisma";

export async function POST(request: NextRequest) {
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
    const { verificationId, code } = body;

    // Validate input
    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { error:"Verification ID is required" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error:"Invalid code format. Must be 6 digits." },
        { status: 400 }
      );
    }

    // Verify OTP via service
    const result = await phoneVerificationService.verifyOTP(
      session.user.id,
      verificationId,
      code
    );

    if (!result.success) {
      // Log failed attempt
      await createAuditLog({
        userId: session.user.id,
        action: 'OTP_VERIFY_FAILED',
        entityType: 'PHONE_VERIFICATION',
        metadata: {
          verificationId,
          remainingAttempts: result.remainingAttempts
        }
      });

      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          remainingAttempts: result.remainingAttempts
        },
        { status: 400 }
      );
    }

    // Update user's phone verified status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        phoneVerified: true,
        phone: result.phoneNumber // Store verified phone number
      }
    });

    // Phase 4.13: Update ALL existing leads for this homeowner with verified status
    const updatedLeads = await prisma.lead.updateMany({
      where: { homeownerId: session.user.id },
      data: { 
        phoneVerified: true,
        phoneNumber: result.phoneNumber
      }
    });

    // Log successful verification
    await createAuditLog({
      userId: session.user.id,
      action: 'PHONE_VERIFIED',
      entityType: 'USER',
      metadata: {
        verificationId,
        phoneNumber: result.phoneNumber?.slice(-4), // Last 4 digits only
        leadsUpdated: updatedLeads.count // Phase 4.13: Track how many leads were updated
      }
    });

    // Send confirmation notification
    await createNotification({
      userId: session.user.id,
      type: 'SYSTEM',
      title: 'Phone Verified',
      message: `Your phone number has been successfully verified. ${updatedLeads.count > 0 ? `All ${updatedLeads.count} of your lead(s) have been updated with verified status.` : 'You can now submit additional lead requests.'}`,
      metadata: {
        verificationId: verificationId,
        leadsUpdated: updatedLeads.count, // Phase 4.13
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message:"Phone number verified successfully",
      phoneNumber: result.phoneNumber,
      leadsUpdated: updatedLeads.count // Phase 4.13: Return count of updated leads
    });

  } catch (error: any) {
    console.error('[verify-otp] Error:', error);

    // Handle specific errors
    if (error.message?.includes('not found') || error.message?.includes('expired')) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false,
        error:"Failed to verify OTP. Please try again." 
      },
      { status: 500 }
    );
  }
}
