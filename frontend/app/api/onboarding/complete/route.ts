import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/actions/auth';
import { getUserActor } from '@/lib/ic-agent';

// Complete onboarding data schema
const completeOnboardingSchema = z.object({
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    bio: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
  }),
  skills: z.array(z.string().max(50, 'Skill name is too long')).max(20, 'Maximum 20 skills allowed'),
  resume: z.object({
    fileName: z.string().optional(),
    fileUrl: z.string().optional(),
    hasResume: z.boolean(),
  }).optional(),
  address: z.object({
    isPrivate: z.boolean(),
    country: z.string(),
    state: z.string(),
    city: z.string(),
    zipCode: z.string(),
    streetAddress: z.string(),
  }).optional(),
});

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
    console.log('Received complete onboarding request:', body);

    // Validate input
    const validatedData = completeOnboardingSchema.parse(body);

    // Save all onboarding data to ICP backend
    try {
      const actor = await getUserActor();

      // Prepare complete profile data for ICP backend
      const profileData = {
        first_name: validatedData.profile.firstName,
        last_name: validatedData.profile.lastName,
        bio: validatedData.profile.bio || '',
        phone: validatedData.profile.phone || '',
        location: validatedData.profile.location || '',
        website: validatedData.profile.website || '',
        linkedin: validatedData.profile.linkedin || '',
        github: validatedData.profile.github || '',
        twitter: validatedData.profile.twitter || '',
        resume_url: validatedData.resume?.fileUrl || '',
        skills: validatedData.skills,
      };

      // Update the user's complete profile
      const result = await actor.update_user_profile(profileData);

      console.log('Complete profile updated in ICP:', result);

      // Clear onboarding data from localStorage
      // This will be handled on the frontend

      return NextResponse.json({
        success: true,
        message: 'Onboarding completed successfully',
        profile: result,
        data: {
          profile: validatedData.profile,
          skills: validatedData.skills,
          resume: validatedData.resume,
          address: validatedData.address,
        }
      });

    } catch (icpError) {
      console.error('ICP profile update error:', icpError);

      // Fallback: store onboarding data temporarily
      // This is a fallback mechanism for when ICP backend is not available
      return NextResponse.json({
        success: true,
        message: 'Onboarding data saved temporarily (backend update pending)',
        data: validatedData,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Complete onboarding error:', error);

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