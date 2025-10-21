// User Agent for ICP User Canister
// Provides a clean interface for user management operations

import { Actor, HttpAgent } from '@dfinity/agent';

// Types matching the user canister
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: bigint;
  lastLoginAt: bigint | null;
  profile: ProfileData | null;
  otpData: OTPData | null;
  profileSubmitted: boolean;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  profileImageUrl: string | null;
  resumeUrl: string | null;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  gpa: string | null;
  description: string | null;
}

export interface OTPData {
  code: string;
  expiresAt: bigint;
  attempts: number;
}

// User canister agent and initialization
let userActor: any = null;

function getUserActor() {
  if (!userActor) {
    const canisterId = process.env.NEXT_PUBLIC_USER_CANISTER_ID || 'ulvla-h7777-77774-qaacq-cai';

    // Create actor using the agent

    // Local development uses 127.0.0.1, production uses the Internet Computer
    const isLocal = process.env.DFX_NETWORK === 'local';

    const agent = new HttpAgent({
      host: isLocal ? 'http://127.0.0.1:4943' : 'https://ic0.app',
    });

    // Fetch root key for local development
    if (isLocal) {
      agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      });
    }

    // Create actor interface
    const idlFactory = ({ IDL }: any) => {
      const OTPData = IDL.Record({
        'code': IDL.Text,
        'expiresAt': IDL.Int,
        'attempts': IDL.Int,
      });
      const ProfileData = IDL.Record({
        'firstName': IDL.Text,
        'lastName': IDL.Text,
        'bio': IDL.Opt(IDL.Text),
        'phone': IDL.Opt(IDL.Text),
        'location': IDL.Opt(IDL.Text),
        'website': IDL.Opt(IDL.Text),
        'linkedin': IDL.Opt(IDL.Text),
        'github': IDL.Opt(IDL.Text),
        'twitter': IDL.Opt(IDL.Text),
        'profileImageUrl': IDL.Opt(IDL.Text),
        'resumeUrl': IDL.Opt(IDL.Text),
        'skills': IDL.Vec(IDL.Text),
        'experience': IDL.Vec(IDL.Record({
          'id': IDL.Text,
          'company': IDL.Text,
          'position': IDL.Text,
          'startDate': IDL.Text,
          'endDate': IDL.Opt(IDL.Text),
          'description': IDL.Opt(IDL.Text),
          'current': IDL.Bool,
        })),
        'education': IDL.Vec(IDL.Record({
          'id': IDL.Text,
          'institution': IDL.Text,
          'degree': IDL.Text,
          'field': IDL.Text,
          'startDate': IDL.Text,
          'endDate': IDL.Opt(IDL.Text),
          'gpa': IDL.Opt(IDL.Text),
          'description': IDL.Opt(IDL.Text),
        })),
      });
      const User = IDL.Record({
        'createdAt': IDL.Int,
        'email': IDL.Text,
        'id': IDL.Text,
        'isVerified': IDL.Bool,
        'lastLoginAt': IDL.Opt(IDL.Int),
        'otpData': IDL.Opt(OTPData),
        'passwordHash': IDL.Text,
        'profile': IDL.Opt(ProfileData),
        'profileSubmitted': IDL.Bool,
      });
      return IDL.Service({
        'getAllUsers': IDL.Func([], [IDL.Vec(User)], ['query']),
        'getUser': IDL.Func([IDL.Text], [IDL.Opt(User)], ['query']),
      });
    };

    userActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }
  return userActor;
}

// User agent implementation
export const userApi = {
  /**
   * Get all users from the user canister
   * @returns Promise<User[]> - Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const actor = getUserActor();
      const users = await actor.getAllUsers();

      console.log(`[UserApi] Retrieved ${users.length} users from canister`);
      return users;
    } catch (error) {
      console.error('[UserApi] Error getting all users:', error);
      throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get a specific user by ID
   * @param userId - The user ID to fetch
   * @returns Promise<User | null> - The user or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const actor = getUserActor();
      const user = await actor.getUser(userId);

      if (user && user.length > 0) {
        console.log(`[UserApi] Retrieved user: ${userId}`);
        return user[0];
      } else {
        console.log(`[UserApi] User not found: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error(`[UserApi] Error getting user ${userId}:`, error);
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get users by their email addresses
   * @param emails - Array of email addresses to search for
   * @returns Promise<User[]> - Array of users matching the emails
   */
  async getUsersByEmails(emails: string[]): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      const matchedUsers = allUsers.filter(user => emails.includes(user.email));

      console.log(`[UserApi] Found ${matchedUsers.length} users for ${emails.length} emails`);
      return matchedUsers;
    } catch (error) {
      console.error('[UserApi] Error getting users by emails:', error);
      throw new Error(`Failed to fetch users by emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Search users by name or email
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Promise<User[]> - Array of users matching the search
   */
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      const lowerQuery = query.toLowerCase();

      const matchedUsers = allUsers
        .filter(user => {
          // Search in email
          if (user.email.toLowerCase().includes(lowerQuery)) {
            return true;
          }

          // Search in profile name
          if (user.profile) {
            const fullName = `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase();
            if (fullName.includes(lowerQuery)) {
              return true;
            }
          }

          return false;
        })
        .slice(0, limit);

      console.log(`[UserApi] Search for "${query}" returned ${matchedUsers.length} results`);
      return matchedUsers;
    } catch (error) {
      console.error('[UserApi] Error searching users:', error);
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get verified users only
   * @param limit - Maximum number of results to return
   * @returns Promise<User[]> - Array of verified users
   */
  async getVerifiedUsers(limit: number = 50): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      const verifiedUsers = allUsers
        .filter(user => user.isVerified)
        .slice(0, limit);

      console.log(`[UserApi] Retrieved ${verifiedUsers.length} verified users`);
      return verifiedUsers;
    } catch (error) {
      console.error('[UserApi] Error getting verified users:', error);
      throw new Error(`Failed to fetch verified users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get users with complete profiles
   * @param limit - Maximum number of results to return
   * @returns Promise<User[]> - Array of users with complete profiles
   */
  async getUsersWithProfiles(limit: number = 50): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      const usersWithProfiles = allUsers
        .filter(user => user.profile && user.profileSubmitted)
        .slice(0, limit);

      console.log(`[UserApi] Retrieved ${usersWithProfiles.length} users with complete profiles`);
      return usersWithProfiles;
    } catch (error) {
      console.error('[UserApi] Error getting users with profiles:', error);
      throw new Error(`Failed to fetch users with profiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get user statistics
   * @returns Promise<UserStats> - User statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    verifiedUsers: number;
    usersWithProfiles: number;
    recentSignups: number;
  }> {
    try {
      const allUsers = await this.getAllUsers();
      const now = BigInt(Date.now());
      const thirtyDaysAgo = now - BigInt(30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds

      const stats = {
        totalUsers: allUsers.length,
        verifiedUsers: allUsers.filter(user => user.isVerified).length,
        usersWithProfiles: allUsers.filter(user => user.profile && user.profileSubmitted).length,
        recentSignups: allUsers.filter(user => user.createdAt > thirtyDaysAgo).length
      };

      console.log('[UserApi] User statistics:', stats);
      return stats;
    } catch (error) {
      console.error('[UserApi] Error getting user stats:', error);
      throw new Error(`Failed to fetch user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Helper functions for data transformation
export const userHelpers = {
  /**
   * Get display name for a user
   * @param user - The user object
   * @returns string - Display name
   */
  getDisplayName(user: User): string {
    if (user.profile) {
      const name = `${user.profile.firstName} ${user.profile.lastName}`.trim();
      return name || user.email;
    }
    return user.email;
  },

  /**
   * Get user initials for avatar
   * @param user - The user object
   * @returns string - User initials
   */
  getInitials(user: User): string {
    if (user.profile) {
      const first = user.profile.firstName.charAt(0).toUpperCase();
      const last = user.profile.lastName.charAt(0).toUpperCase();
      return (first + last).trim() || user.email.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  },

  /**
   * Check if user has a complete profile
   * @param user - The user object
   * @returns boolean - Whether profile is complete
   */
  hasCompleteProfile(user: User): boolean {
    return !!(user.profile && user.profileSubmitted && user.profile.firstName && user.profile.lastName);
  },

  /**
   * Format user creation date
   * @param user - The user object
   * @returns string - Formatted date
   */
  formatJoinDate(user: User): string {
    return new Date(Number(user.createdAt)).toLocaleDateString();
  },

  /**
   * Transform user data for frontend consumption
   * @param user - The raw user object from canister
   * @returns UserForFrontend - Transformed user data
   */
  transformForFrontend(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: this.getDisplayName(user),
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      profileImageUrl: user.profile?.profileImageUrl || null,
      isVerified: user.isVerified,
      hasProfile: !!user.profile,
      hasCompleteProfile: this.hasCompleteProfile(user),
      createdAt: user.createdAt.toString(),
      joinDate: this.formatJoinDate(user),
      initials: this.getInitials(user),
      skills: user.profile?.skills || [],
      location: user.profile?.location || null,
      bio: user.profile?.bio || null,
      website: user.profile?.website,
      linkedin: user.profile?.linkedin,
      github: user.profile?.github,
      twitter: user.profile?.twitter
    };
  }
};

export type UserForFrontend = ReturnType<typeof userHelpers.transformForFrontend>;

export default userApi;