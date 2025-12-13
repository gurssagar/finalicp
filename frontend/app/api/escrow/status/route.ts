import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';

const escrowIdl = ({ IDL }: any) => {
  const EscrowStatus = IDL.Variant({
    'created': IDL.Null,
    'funded': IDL.Null,
    'released': IDL.Null,
    'refunded': IDL.Null,
  });

  const Escrow = IDL.Record({
    'escrowId': IDL.Text,
    'projectId': IDL.Text,
    'client': IDL.Principal,
    'freelancer': IDL.Principal,
    'freelancerHotWallet': IDL.Opt(IDL.Text),
    'expectedE8s': IDL.Nat,
    'status': EscrowStatus,
    'subaccount': IDL.Vec(IDL.Nat8),
    'createdAtNs': IDL.Nat64,
    'fundedAtNs': IDL.Opt(IDL.Nat64),
    'releaseAtNs': IDL.Opt(IDL.Nat64),
    'ledgerBlockIndex': IDL.Opt(IDL.Nat64),
  });

  const Result = IDL.Variant({
    'ok': Escrow,
    'err': IDL.Text,
  });

  const RefreshResult = IDL.Record({
    'funded': IDL.Bool,
    'balanceE8s': IDL.Nat,
  });
  
  return IDL.Service({
    'getEscrowWithWallet': IDL.Func([IDL.Text], [Result], ['query']),
    'refresh_funding': IDL.Func([IDL.Text], [RefreshResult], []),
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const escrowId = searchParams.get('escrowId');

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID is required' },
        { status: 400 }
      );
    }

    const escrowCanisterId = process.env.ESCROW_CANISTER_ID || 'escrow';
    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    const agent = new HttpAgent({ host });
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    const escrowCanister = Actor.createActor(escrowIdl, {
      agent,
      canisterId: escrowCanisterId,
    });

    // Get escrow details
    const escrowResult = await escrowCanister.getEscrowWithWallet(escrowId);

    if ('err' in escrowResult) {
      return NextResponse.json(
        { error: escrowResult.err },
        { status: 404 }
      );
    }

    const escrow = escrowResult.ok;

    // Get funding status
    const fundingResult = await escrowCanister.refresh_funding(escrowId);

    // Format status
    const statusKey = Object.keys(escrow.status)[0];

    return NextResponse.json({
      success: true,
      escrow: {
        escrowId: escrow.escrowId,
        projectId: escrow.projectId,
        client: escrow.client.toText(),
        freelancer: escrow.freelancer.toText(),
        freelancerHotWallet: escrow.freelancerHotWallet.length > 0 ? escrow.freelancerHotWallet[0] : null,
        expectedE8s: escrow.expectedE8s.toString(),
        status: statusKey,
        createdAt: escrow.createdAtNs.toString(),
        fundedAt: escrow.fundedAtNs.length > 0 ? escrow.fundedAtNs[0].toString() : null,
        releaseAt: escrow.releaseAtNs.length > 0 ? escrow.releaseAtNs[0].toString() : null,
        blockIndex: escrow.ledgerBlockIndex.length > 0 ? escrow.ledgerBlockIndex[0].toString() : null,
        isFunded: fundingResult.funded,
        balanceE8s: fundingResult.balanceE8s.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching escrow status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch escrow status' },
      { status: 500 }
    );
  }
}


