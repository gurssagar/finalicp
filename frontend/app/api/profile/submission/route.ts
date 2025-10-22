import { NextRequest, NextResponse } from 'next/server';
import { getUserActor } from '@/lib/ic-agent';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await request.json();
    const { isSubmitted } = body;

    if (typeof isSubmitted !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isSubmitted must be a boolean',
      }, { status: 400 });
    }

    // Get user actor and update profile submission status
    const userActor = await getUserActor();
    const result = await userActor.updateProfileSubmissionStatus(session.userId, isSubmitted);

    if ('err' in result) {
      return NextResponse.json({
        success: false,
        error: result.err,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: isSubmitted ? 'Profile marked as submitted' : 'Profile submission status updated',
    });

  } catch (error) {
    console.error('Profile submission update error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    // Get user actor and check profile submission status
    const userActor = await getUserActor();
    const isSubmitted = await userActor.isProfileSubmitted(session.userId);

    return NextResponse.json({
      success: true,
      isSubmitted,
    });

  } catch (error) {
    console.error('Profile submission status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }, { status: 500 });
  }
}