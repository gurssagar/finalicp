import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { forgotPasswordSchema } from '@/lib/validations';
import { getUserActor } from '@/lib/ic-agent';
import { createPasswordResetToken } from '@/lib/auth';
import emailService from '@/lib/email';
import { checkPasswordResetRateLimit } from '@/lib/rate-limit';

// Get client IP for rate limiting
async function getClientIP(request: NextRequest): Promise<string> {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received forgot password request:', { email: body.email });

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);

    // Check rate limiting
    const ip = await getClientIP(request);
    const rateLimit = checkPasswordResetRateLimit(validatedData.email);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many password reset requests. Try again in ${Math.ceil((rateLimit.resetTime! - Date.now()) / 60000)} minutes.`,
      }, { status: 429 });
    }

    // Check if user exists
    const userActor = await getUserActor();
    const user = await userActor.getUserByEmail(validatedData.email);

    if (!user || user.length === 0) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const userData = user[0];

    // Create password reset token
    const resetToken = await createPasswordResetToken(userData.id);

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      userData.email,
      resetToken,
      `${userData.profile?.[0]?.firstName || 'User'} ${userData.profile?.[0]?.lastName || ''}`
    );

    if (!emailSent) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send password reset email. Please try again.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors[0].message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}