/**
 * T032: POST /api/verification/send-otp
 * 
 * Sends OTP to user's phone number via Twilio SMS
 * - Rate limited (3 requests per 15 minutes)
 * - Creates/updates PhoneVerification record
 * - Sends SMS with 6-digit code
 */

import { NextRequest, NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { phoneVerificationService } from"@/lib/services/phone-verification-service";
import { createAuditLog } from"@/lib/services/audit-logger";

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
    const { phoneNumber } = body;

    // Validate phone number format
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error:"Phone number is required" },
        { status: 400 }
      );
    }

    // Basic E.164 format validation (+44xxxxxxxxxx)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error:"Invalid phone number format. Use E.164 format (e.g., +447123456789)" },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
                     || request.headers.get('x-real-ip') 
                     || 'unknown';

    // Send OTP via service (includes rate limiting)
    const result = await phoneVerificationService.sendOTP(
      session.user.id,
      phoneNumber,
      clientIp
    );

    // Log audit event
    await createAuditLog({
      userId: session.user.id,
      action: 'OTP_SENT',
      entityType: 'PHONE_VERIFICATION',
      metadata: {
        phoneNumber: phoneNumber.slice(-4), // Only log last 4 digits for privacy
        clientIp,
        verificationId: result.verificationId
      }
    });

    return NextResponse.json({
      success: true,
      message:"OTP sent successfully",
      verificationId: result.verificationId,
      expiresAt: result.expiresAt,
      remainingAttempts: result.remainingAttempts
    });

  } catch (error: any) {
    console.error('[send-otp] Error:', error);

    // Handle rate limit errors
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: error.message,
          retryAfter: error.retryAfter // Time until rate limit resets
        },
        { status: 429 }
      );
    }

    // Handle Twilio errors
    if (error.message?.includes('Twilio')) {
      return NextResponse.json(
        { error:"Failed to send SMS. Please check your phone number." },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error:"Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
