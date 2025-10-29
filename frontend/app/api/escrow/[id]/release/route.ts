import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { getEscrowActor, getUserActor } from '@/lib/ic-agent';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const { id: escrowId } = await params;

    if (!escrowId) {
      return NextResponse.json({
        success: false,
        error: 'Escrow ID is required',
      }, { status: 400 });
    }

    // Get escrow details to verify authorization
    const escrowActor = await getEscrowActor();

    try {
      const escrow = await escrowActor.get(escrowId);

      // Get current user's wallet principal
      const userActor = await getUserActor();
      const userWalletResult = await userActor.getWalletInfo(session.userId);

      if ('err' in userWalletResult) {
        return NextResponse.json({
          success: false,
          error: 'User wallet not connected',
        }, { status: 400 });
      }

      const userWallet = userWalletResult.ok;
      if (!userWallet.wallet_principal || userWallet.wallet_principal.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'User wallet not connected',
        }, { status: 400 });
      }

      const userPrincipal = userWallet.wallet_principal[0];

      // Check if user is the client
      if (escrow.client.toString() !== userPrincipal.toString()) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized: only the client can release escrow',
        }, { status: 403 });
      }

      // Check escrow status
      if (escrow.status !== { 'funded': null }) {
        return NextResponse.json({
          success: false,
          error: 'Escrow must be funded before it can be released',
        }, { status: 400 });
      }

      // Release the escrow
      const releaseResult = await escrowActor.release(escrowId);

      if ('err' in releaseResult) {
        return NextResponse.json({
          success: false,
          error: releaseResult.err,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          blockIndex: Number(releaseResult.ok),
          message: 'Escrow released successfully. Funds have been transferred to the freelancer.',
        },
      });

    } catch (escrowError: any) {
      console.error('Escrow release error:', escrowError);
      return NextResponse.json({
        success: false,
        error: escrowError.message || 'Failed to release escrow',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Escrow release API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to release escrow',
    }, { status: 500 });
  }
}
