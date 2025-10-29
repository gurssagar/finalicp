import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/actions/auth';
import { getUserActor, getEscrowActor } from '@/lib/ic-agent';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const { projectId, freelancerUserId, amountE8s }: {
      projectId: string;
      freelancerUserId: string;
      amountE8s: number;
    } = await request.json();

    if (!projectId || !freelancerUserId || !amountE8s) {
      return NextResponse.json({
        success: false,
        error: 'projectId, freelancerUserId, and amountE8s are required',
      }, { status: 400 });
    }

    if (amountE8s <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be greater than 0',
      }, { status: 400 });
    }

    // Get client principal (current user)

    // Get freelancer wallet info
    const userActor = await getUserActor();
    const freelancerWalletResult = await userActor.getWalletInfo(freelancerUserId);

    if ('err' in freelancerWalletResult) {
      return NextResponse.json({
        success: false,
        error: 'Freelancer wallet not connected',
      }, { status: 400 });
    }

    const freelancerWallet = freelancerWalletResult.ok;
    if (!freelancerWallet.wallet_principal || freelancerWallet.wallet_principal.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Freelancer wallet not connected',
      }, { status: 400 });
    }

    const freelancerPrincipal = freelancerWallet.wallet_principal[0];

    // Get client wallet info (current user)
    const clientWalletResult = await userActor.getWalletInfo(session.userId);

    if ('err' in clientWalletResult) {
      return NextResponse.json({
        success: false,
        error: 'Client wallet not connected',
      }, { status: 400 });
    }

    const clientWallet = clientWalletResult.ok;
    if (!clientWallet.wallet_principal || clientWallet.wallet_principal.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Client wallet not connected',
      }, { status: 400 });
    }

    const clientPrincipal = clientWallet.wallet_principal[0];

    // Create escrow
    const escrowActor = await getEscrowActor();

    try {
      const result = await escrowActor.create(
        projectId,
        clientPrincipal,
        freelancerPrincipal,
        BigInt(amountE8s)
      );

      return NextResponse.json({
        success: true,
        data: {
          escrowId: result[0],
          depositAccount: {
            owner: result[1].owner.toString(),
            subaccount: result[1].subaccount && result[1].subaccount.length > 0
              ? Array.from(result[1].subaccount[0])
              : null,
          },
        },
      });
    } catch (escrowError: any) {
      console.error('Escrow creation error:', escrowError);
      return NextResponse.json({
        success: false,
        error: escrowError.message || 'Failed to create escrow',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Escrow create API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create escrow',
    }, { status: 500 });
  }
}
