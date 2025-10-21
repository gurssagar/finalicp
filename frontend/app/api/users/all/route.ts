import { NextRequest, NextResponse } from 'next/server';
import { userApi } from '@/lib/user-agent';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeEmail = searchParams.get('excludeEmail'); // Optional: exclude current user

    // Get all users from the canister
    const allUsers = await userApi.getAllUsers();

    // Filter out the current user if specified
    const filteredUsers = excludeEmail
      ? allUsers.filter(user => user.email !== excludeEmail)
      : allUsers;

    // Transform user data for frontend
    const users = filteredUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      profileImageUrl: user.profile?.profileImageUrl || null,
      isVerified: user.isVerified,
      hasProfile: !!user.profile,
      createdAt: user.createdAt.toString(),
      skills: user.profile?.skills || [],
      location: user.profile?.location || null,
      bio: user.profile?.bio || null
    }));

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}