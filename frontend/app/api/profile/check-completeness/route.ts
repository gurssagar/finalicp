import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserActor } from '@/lib/ic-agent';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    try {
      const actor = await getUserActor();

      // Get user profile from ICP backend using the correct method
      const userProfile = await actor.getProfile(session.userId);
      const profileSubmitted = await actor.isProfileSubmitted(session.userId);

      if (!userProfile) {
        return NextResponse.json({
          success: true,
          isComplete: false,
          profileSubmitted,
          profile: null,
          message: 'Profile not found',
        });
      }

      // Check if required fields are filled (using camelCase from DID)
      const isProfileComplete = userProfile.firstName && userProfile.lastName &&
        userProfile.firstName.trim() !== '' && userProfile.lastName.trim() !== '';

      // Transform profile data for frontend
      const transformedProfile = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: session.email || '',
        bio: userProfile.bio || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        linkedin: userProfile.linkedin || '',
        github: userProfile.github || '',
        twitter: userProfile.twitter || '',
        skills: userProfile.skills || [],
        hasResume: !!userProfile.resumeUrl,
        profileImage: userProfile.profileImageUrl || '',
      };

      return NextResponse.json({
        success: true,
        isComplete: isProfileComplete,
        profileSubmitted,
        profile: transformedProfile,
        message: isProfileComplete ? 'Profile is complete' : 'Profile needs completion'
      });

    } catch (icpError) {
      console.error('ICP profile fetch error:', icpError);

      // Check if user has completed onboarding flag in localStorage
      // This is a client-side fallback since we can't access localStorage in API route
      // We'll return a neutral response that lets the ProfileChecker handle it

      // Return basic profile info from session as fallback
      const fallbackProfile = {
        firstName: '',
        lastName: '',
        email: session.email || '',
        bio: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        skills: [],
        hasResume: false,
        profileImage: '',
      };

      return NextResponse.json({
        success: true,
        isComplete: false,
        profileSubmitted: false,
        profile: fallbackProfile,
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