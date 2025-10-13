import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { profileBasicSchema } from '@/lib/validations';
import { getUserActor } from '@/lib/ic-agent';

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
    console.log('Received profile completion request:', body);

    // Validate input
    const validatedData = profileBasicSchema.parse(body);

    // TODO: Get user from session or JWT token
    // For now, we'll assume we have the user ID from the session
    // This would need to be implemented with proper authentication

    // Since we don't have session management yet, we'll just return success
    // In a real implementation, you would:
    // 1. Get user ID from session/JWT
    // 2. Update the user's profile in the backend
    // 3. Return the updated profile

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
    });

  } catch (error) {
    console.error('Profile completion error:', error);

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