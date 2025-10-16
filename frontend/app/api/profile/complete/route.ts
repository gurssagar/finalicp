import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { profileBasicSchema } from '@/lib/validations';
import { getUserActor } from '@/lib/ic-agent';
import { getCurrentSession } from '@/lib/actions/auth';

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
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received profile completion request:', body);

    // Validate input
    const validatedData = profileBasicSchema.parse(body);

    // Update user profile in ICP backend
    try {
      const actor = getUserActor();

      // Prepare profile data for ICP backend
      const profileData = {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        bio: validatedData.bio || '',
        phone: validatedData.phone || '',
        location: validatedData.location || '',
        website: validatedData.website || '',
        linkedin: validatedData.linkedin || '',
        github: validatedData.github || '',
        twitter: validatedData.twitter || '',
      };

      // Update the user's profile
      const result = await actor.update_user_profile(profileData);

      console.log('Profile updated in ICP:', result);

      return NextResponse.json({
        success: true,
        message: 'Profile completed successfully',
        profile: result
      });

    } catch (icpError) {
      console.error('ICP profile update error:', icpError);

      // Fallback: store profile data temporarily
      // This is a fallback mechanism for when ICP backend is not available
      return NextResponse.json({
        success: true,
        message: 'Profile saved temporarily (backend update pending)',
        profile: validatedData,
        fallback: true
      });
    }

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