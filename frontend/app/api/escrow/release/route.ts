import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';

const escrowIdl = ({ IDL }: any) => {
  const Result = IDL.Variant({
    'ok': IDL.Nat,
    'err': IDL.Text,
  });
  
  return IDL.Service({
    'release': IDL.Func([IDL.Text], [Result], []),
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { escrowId, userPrincipal } = body;

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID is required' },
        { status: 400 }
      );
    }

    const escrowCanisterId = process.env.ESCROW_CANISTER_ID || 'escrow';
    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    console.log('Releasing escrow:', escrowId);

    const agent = new HttpAgent({ host });
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    const escrowCanister = Actor.createActor(escrowIdl, {
      agent,
      canisterId: escrowCanisterId,
    });

    const result = await escrowCanister.release(escrowId);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        blockIndex: result.ok.toString(),
        message: 'Funds released to freelancer hot wallet successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.err },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to release escrow' },
      { status: 500 }
    );
  }
}


