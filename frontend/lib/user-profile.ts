// User profile fetching utilities

export interface UserProfile {
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  location: string;
  profileImage: string;
  skills: string[];
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  isOnline: boolean;
  lastSeen?: string | null;
  profileSubmitted?: boolean;
  fallback?: boolean;
}

// Simple in-memory cache for user profiles
const profileCache = new Map<string, { data: UserProfile; timestamp: number; ttl: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper function to get cached data
function getCachedData(email: string): UserProfile | null {
  const cached = profileCache.get(email);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
}

// Helper function to set cached data
function setCachedData(email: string, data: UserProfile): void {
  profileCache.set(email, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
}

// Get user profile by email
export async function getUserProfileByEmail(email: string): Promise<UserProfile> {
  // Check cache first
  const cachedData = getCachedData(email);
  if (cachedData) {
    console.log('📋 Returning cached user profile for:', email);
    return cachedData;
  }

  try {
    console.log('🔍 Fetching user profile for email:', email);

    const response = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Retrieved user profile for:', email);

        // Cache the response
        setCachedData(email, data.data);

        return data.data;
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', email, error);
  }

  // Fallback to basic profile from email
  console.log('⚠️ Using fallback profile for:', email);
  const basicProfile: UserProfile = {
    email: email,
    firstName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    lastName: '',
    displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    bio: '',
    location: '',
    profileImage: '',
    skills: [],
    isOnline: false,
    lastSeen: null,
    fallback: true
  };

  // Cache the basic profile
  setCachedData(email, basicProfile);

  return basicProfile;
}

// Get multiple user profiles by emails
export async function getUserProfilesByEmails(emails: string[]): Promise<UserProfile[]> {
  const profiles: UserProfile[] = [];

  // Process emails in parallel
  const promises = emails.map(email => getUserProfileByEmail(email));

  try {
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        profiles.push(result.value);
      } else {
        console.error('Failed to fetch profile for:', emails[index], result.reason);
        // Add fallback profile
        profiles.push({
          email: emails[index],
          firstName: emails[index].split('@')[0].charAt(0).toUpperCase() + emails[index].split('@')[0].slice(1),
          lastName: '',
          displayName: emails[index].split('@')[0].charAt(0).toUpperCase() + emails[index].split('@')[0].slice(1),
          bio: '',
          location: '',
          profileImage: '',
          skills: [],
          isOnline: false,
          lastSeen: null,
          fallback: true
        });
      }
    });
  } catch (error) {
    console.error('Error fetching multiple profiles:', error);
  }

  return profiles;
}

// Clear cache for a specific email or all cache
export function clearProfileCache(email?: string): void {
  if (email) {
    profileCache.delete(email);
  } else {
    profileCache.clear();
  }
}