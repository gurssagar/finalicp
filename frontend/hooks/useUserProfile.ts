'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  designation?: string;
  profileImage?: string;
  isLoaded: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    designation: 'Client', // Default designation
    profileImage: '',
    isLoaded: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First, get the current session to get email
        const sessionResponse = await fetch('/api/auth/me');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();

          // Then get the user's profile data
          const profileResponse = await fetch('/api/profile/check-completeness');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();

            setProfile({
              firstName: profileData.profile?.firstName || '',
              lastName: profileData.profile?.lastName || '',
              email: sessionData.email || '',
              designation: getUserDesignation(profileData.profile) || 'Client',
              profileImage: profileData.profile?.profileImage || '',
              isLoaded: true,
            });
          } else {
            // Fallback to session data only
            setProfile({
              firstName: '',
              lastName: '',
              email: sessionData.email || '',
              designation: 'Client',
              profileImage: '',
              isLoaded: true,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Set default profile on error
        setProfile({
          firstName: '',
          lastName: '',
          email: '',
          designation: 'Client',
          profileImage: '',
          isLoaded: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { profile, isLoading };
}

// Helper function to determine user designation based on profile data
function getUserDesignation(profileData?: any): string {
  if (!profileData) return 'Client';

  const skills = profileData.skills || [];
  const bio = profileData.bio?.toLowerCase() || '';
  const hasResume = profileData.hasResume || profileData.resumeUrl;

  // Enhanced logic to determine designation based on skills and profile
  const technicalSkills = ['javascript', 'react', 'python', 'java', 'node.js', 'aws', 'docker', 'kubernetes', 'typescript', 'html', 'css', 'git', 'sql', 'mongodb'];
  const designSkills = ['figma', 'photoshop', 'illustrator', 'ui design', 'ux design', 'sketch', 'adobe xd'];
  const businessSkills = ['marketing', 'seo', 'content writing', 'project management', 'sales', 'leadership'];

  const userSkills = skills.map(skill => skill.toLowerCase());

  const hasTechnicalSkills = technicalSkills.some(skill => userSkills.some(userSkill => userSkill.includes(skill)));
  const hasDesignSkills = designSkills.some(skill => userSkills.some(userSkill => userSkill.includes(skill)));
  const hasBusinessSkills = businessSkills.some(skill => userSkills.some(userSkill => userSkill.includes(skill)));

  // Determine designation based on skills count and type
  if (skills.length >= 10 || (hasTechnicalSkills && hasResume)) {
    return 'Expert';
  } else if (skills.length >= 5 || hasTechnicalSkills) {
    return 'Professional';
  } else if (skills.length >= 3 || hasDesignSkills || hasBusinessSkills) {
    return 'Freelancer';
  } else if (bio.includes('looking for work') || bio.includes('hiring') || bio.includes('job')) {
    return 'Job Seeker';
  } else if (bio.includes('client') || bio.includes('customer')) {
    return 'Client';
  } else if (skills.length > 0) {
    return 'Talent';
  } else {
    return 'Client'; // Default
  }
}