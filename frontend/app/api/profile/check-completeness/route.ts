import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { getUserActor } from '@/lib/ic-agent';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    try {
      const actor = getUserActor();

      // Get user profile from ICP backend
      const userProfile = await actor.get_user_profile();

      // Check if required fields are filled
      const requiredFields = ['first_name', 'last_name'];
      const isProfileComplete = requiredFields.every(field =>
        userProfile[field] && userProfile[field].trim() !== ''
      );

      // Transform profile data for frontend
      const transformedProfile = {
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        linkedin: userProfile.linkedin || '',
        github: userProfile.github || '',
        twitter: userProfile.twitter || '',
        skills: userProfile.skills || [],
        hasResume: userProfile.has_resume || false,
      };

      return NextResponse.json({
        success: true,
        isComplete: isProfileComplete,
        profile: transformedProfile,
        message: isProfileComplete ? 'Profile is complete' : 'Profile needs completion'
      });

    } catch (icpError) {
      console.error('ICP profile fetch error:', icpError);

      // Fallback: return incomplete profile status
      return NextResponse.json({
        success: true,
        isComplete: false,
        profile: null,
        message: 'Profile needs completion (backend unavailable)',
        fallback: true
      });
    }

  } catch (error) {
    console.error('Profile check error:', error);

    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}