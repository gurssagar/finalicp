import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { getUserActor } from '@/lib/ic-agent';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const { principal, accountId }: { principal: string; accountId: string } = await request.json();

    if (!principal || !accountId) {
      return NextResponse.json({
        success: false,
        error: 'Principal and accountId are required',
      }, { status: 400 });
    }

    // Validate principal format (basic check)
    if (!principal.startsWith('lxzze-')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid principal format',
      }, { status: 400 });
    }

    const actor = await getUserActor();

    // Update wallet info in user canister
    const result = await actor.updateWalletInfo(
      session.userId,
      [principal], // Wrap in Option
      [accountId]  // Wrap in Option
    );

    if ('err' in result) {
      console.error('Failed to update wallet info:', result.err);
      return NextResponse.json({
        success: false,
        error: result.err,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet information updated successfully',
    });

  } catch (error) {
    console.error('Wallet update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update wallet information',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const actor = await getUserActor();

    // Get wallet info from user canister
    const result = await actor.getWalletInfo(session.userId);

    if ('err' in result) {
      console.error('Failed to get wallet info:', result.err);
      return NextResponse.json({
        success: false,
        error: result.err,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.ok,
    });

  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch wallet information',
    }, { status: 500 });
  }
}

