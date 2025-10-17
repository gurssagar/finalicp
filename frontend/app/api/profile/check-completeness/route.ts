import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { getUserActor } from '@/lib/ic-agent';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      console.log('⚠️ No session found, returning incomplete profile status');
      return NextResponse.json({
        success: true,
        isComplete: false,
        profileSubmitted: false,
        profile: {
          firstName: '',
          lastName: '',
          email: '',
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
        },
        completionPercentage: 0,
        missingFields: ['Authentication required'],
        message: 'Please log in to check your profile status',
        userEmail: '',
        details: {
          hasBasicInfo: false,
          hasContactInfo: false,
          hasLocation: false,
          hasSkills: false,
          hasResume: false,
          hasBio: false
        }
      });
    }

    try {
      console.log('🔍 Environment check:');
      console.log('  • IC_HOST:', process.env.NEXT_PUBLIC_IC_HOST);
      console.log('  • USER_CANISTER_ID:', process.env.NEXT_PUBLIC_USER_CANISTER_ID);
      
      const actor = await getUserActor();
      console.log('✅ User actor created successfully');

      // Get user profile from ICP backend using email
      console.log('🔍 Checking profile completeness for user:', session.email);
      const userResult = await actor.getUserByEmail(session.email);

      console.log('📊 Retrieved user result:', userResult);

      if (!userResult || userResult.length === 0) {
        return NextResponse.json({
          success: true,
          isComplete: false,
          profileSubmitted: false,
          profile: null,
          message: 'Profile not found - please complete onboarding',
          userEmail: session.email,
        });
      }

      // Extract the user from the array result
      const userProfile = userResult[0];
      const profileSubmitted = await actor.isProfileSubmitted(userProfile.id);

      console.log('📊 Extracted user profile:', userProfile);
      console.log('📊 Profile submitted status:', profileSubmitted);

      // Get profile data from the user
      const profileData = userProfile.profile && userProfile.profile[0] ? userProfile.profile[0] : null;

      // Comprehensive profile completeness check
      const hasBasicInfo = profileData && profileData.firstName && profileData.lastName &&
        profileData.firstName.trim() !== '' && profileData.lastName.trim() !== '';

      const hasContactInfo = profileData && profileData.phone && profileData.phone.length > 0 &&
        profileData.phone[0] && profileData.phone[0].trim() !== '';

      const hasLocation = profileData && profileData.location && profileData.location.length > 0 &&
        profileData.location[0] && profileData.location[0].trim() !== '';

      const hasSkills = profileData && profileData.skills && profileData.skills.length > 0;

      const hasResume = profileData && profileData.resumeUrl && profileData.resumeUrl.length > 0 &&
        profileData.resumeUrl[0] && profileData.resumeUrl[0].trim() !== '';

      const hasBio = profileData && profileData.bio && profileData.bio.length > 0 &&
        profileData.bio[0] && profileData.bio[0].trim() !== '';

      // Calculate completion percentage
      const completionChecks = [
        hasBasicInfo,
        hasContactInfo,
        hasLocation,
        hasSkills,
        hasResume,
        hasBio
      ];
      
      const completedChecks = completionChecks.filter(Boolean).length;
      const completionPercentage = Math.round((completedChecks / completionChecks.length) * 100);
      
      const isProfileComplete = hasBasicInfo && hasContactInfo && hasLocation && hasSkills;

      // Transform profile data for frontend
      const transformedProfile = {
        firstName: profileData ? profileData.firstName || '' : '',
        lastName: profileData ? profileData.lastName || '' : '',
        email: session.email || '',
        bio: profileData && profileData.bio && profileData.bio.length > 0 ? profileData.bio[0] || '' : '',
        phone: profileData && profileData.phone && profileData.phone.length > 0 ? profileData.phone[0] || '' : '',
        location: profileData && profileData.location && profileData.location.length > 0 ? profileData.location[0] || '' : '',
        website: profileData && profileData.website && profileData.website.length > 0 ? profileData.website[0] || '' : '',
        linkedin: profileData && profileData.linkedin && profileData.linkedin.length > 0 ? profileData.linkedin[0] || '' : '',
        github: profileData && profileData.github && profileData.github.length > 0 ? profileData.github[0] || '' : '',
        twitter: profileData && profileData.twitter && profileData.twitter.length > 0 ? profileData.twitter[0] || '' : '',
        skills: profileData ? profileData.skills || [] : [],
        hasResume: profileData && profileData.resumeUrl && profileData.resumeUrl.length > 0 ? !!profileData.resumeUrl[0] : false,
        profileImage: profileData && profileData.profileImageUrl && profileData.profileImageUrl.length > 0 ? profileData.profileImageUrl[0] || '' : '',
      };

      // Generate detailed completion message
      const missingFields = [];
      if (!hasBasicInfo) missingFields.push('Basic Information (Name)');
      if (!hasContactInfo) missingFields.push('Contact Information (Phone)');
      if (!hasLocation) missingFields.push('Location');
      if (!hasSkills) missingFields.push('Skills');
      if (!hasResume) missingFields.push('Resume');
      if (!hasBio) missingFields.push('Bio');

      const message = isProfileComplete
        ? 'Profile is complete and active!'
        : `Profile is ${completionPercentage}% complete. Missing: ${missingFields.join(', ')}`;

      console.log('📊 Profile completeness analysis:', {
        isComplete: isProfileComplete,
        completionPercentage,
        missingFields,
        userEmail: session.email
      });

      return NextResponse.json({
        success: true,
        isComplete: isProfileComplete,
        profileSubmitted,
        profile: transformedProfile,
        completionPercentage,
        missingFields,
        message,
        userEmail: session.email,
        details: {
          hasBasicInfo,
          hasContactInfo,
          hasLocation,
          hasSkills,
          hasResume,
          hasBio
        }
      });

    } catch (icpError) {
      console.error('ICP profile fetch error:', icpError);
      console.log('⚠️ Backend error for user:', session.email);
      console.log('Error details:', {
        message: icpError instanceof Error ? icpError.message : 'Unknown error',
        stack: icpError instanceof Error ? icpError.stack : undefined
      });

      // Return a more user-friendly response instead of an error
      return NextResponse.json({
        success: true,
        isComplete: false,
        profileSubmitted: false,
        profile: {
          firstName: '',
          lastName: '',
          email: session.email,
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
        },
        completionPercentage: 0,
        missingFields: ['Backend connection issue'],
        message: 'Unable to check profile status. Please try again later.',
        userEmail: session.email,
        details: {
          hasBasicInfo: false,
          hasContactInfo: false,
          hasLocation: false,
          hasSkills: false,
          hasResume: false,
          hasBio: false
        },
        backendError: true
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