import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';

// User Wallet IDL
const userWalletIdl = ({ IDL }: any) => {
  const TokenType = IDL.Variant({
    'ICP': IDL.Null,
    'ckBTC': IDL.Null,
    'ckETH': IDL.Null,
    'ckUSDC': IDL.Null,
  });
  
  const Result = IDL.Variant({
    'ok': IDL.Text,
    'err': IDL.Text,
  });
  
  return IDL.Service({
    'deposit': IDL.Func([TokenType, IDL.Nat, IDL.Opt(IDL.Text)], [Result], []),
    'getWalletAddress': IDL.Func([], [IDL.Text], ['query']),
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletCanisterId = searchParams.get('walletCanisterId');
    const tokenType = searchParams.get('tokenType') || 'ICP';

    if (!walletCanisterId) {
      return NextResponse.json(
        { error: 'Wallet canister ID is required' },
        { status: 400 }
      );
    }

    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    const agent = new HttpAgent({ host });
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    const wallet = Actor.createActor(userWalletIdl, {
      agent,
      canisterId: walletCanisterId,
    });

    // Get wallet address for deposits
    const walletAddress = await wallet.getWalletAddress();

    return NextResponse.json({
      success: true,
      depositInfo: {
        walletAddress,
        walletCanisterId,
        tokenType,
        instructions: `Send ${tokenType} tokens to this address: ${walletAddress}`,
      },
    });
  } catch (error: any) {
    console.error('Error fetching deposit info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deposit info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletCanisterId, tokenType, amount, memo } = body;

    if (!walletCanisterId || !tokenType || !amount) {
      return NextResponse.json(
        { error: 'Wallet canister ID, token type, and amount are required' },
        { status: 400 }
      );
    }

    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    const agent = new HttpAgent({ host });
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    const wallet = Actor.createActor(userWalletIdl, {
      agent,
      canisterId: walletCanisterId,
    });

    // Call deposit function
    const tokenVariant = { [tokenType]: null };
    const memoOpt = memo ? [memo] : [];
    const result = await wallet.deposit(tokenVariant, BigInt(amount), memoOpt);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        transactionId: result.ok,
        message: 'Deposit successful',
      });
    } else {
      return NextResponse.json(
        { error: result.err },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process deposit' },
      { status: 500 }
    );
  }
}


