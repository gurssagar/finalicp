import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signupSchema } from '@/lib/validations';
import {
  hashPassword,
  createPasswordResetToken,
  verifyPasswordResetToken,
  generateOTP,
  generateUserId,
  isValidEmail
} from '@/lib/auth';
import { getUserActor } from '@/lib/ic-agent';
import emailService from '@/lib/email';
import {
  checkOTPRateLimit,
  checkOTPVerificationRateLimit,
  checkLoginRateLimit,
  checkPasswordResetRateLimit,
  resetOTPRateLimit,
  resetOTPVerificationRateLimit,
  resetLoginRateLimit
} from '@/lib/rate-limit';

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
    console.log('Received signup request:', body);

    // Validate input
    const validatedData = signupSchema.parse(body);

    // Check rate limiting
    const ip = await getClientIP(request);
    const rateLimit = checkOTPRateLimit(validatedData.email);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many OTP requests. Try again in ${Math.ceil((rateLimit.resetTime! - Date.now()) / 60000)} minutes.`,
      }, { status: 429 });
    }

    // Check if user already exists
    const userActor = await getUserActor();
    const existingUser = await userActor.getUserByEmail(validatedData.email);

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists',
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const result = await userActor.createUser(validatedData.email, passwordHash);

    if ('err' in result) {
      return NextResponse.json({
        success: false,
        error: result.err,
      }, { status: 500 });
    }

    const userId = result.ok;

    // Generate and send OTP
    const otpResult = await userActor.createOTP(validatedData.email);

    if ('err' in otpResult) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create OTP. Please try again.',
      }, { status: 500 });
    }

    // Send OTP email
    const emailSent = await emailService.sendOTPEmail(
      validatedData.email,
      otpResult.ok,
      `${validatedData.firstName} ${validatedData.lastName}`
    );

    if (!emailSent) {
      return NextResponse.json({
        success: false,
        error: 'Failed to send verification email. Please try again.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification code.',
      userId,
    });

  } catch (error) {
    console.error('Signup error:', error);

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