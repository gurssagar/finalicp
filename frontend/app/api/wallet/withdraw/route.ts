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
    'withdraw': IDL.Func([TokenType, IDL.Nat, IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
    'getBalance': IDL.Func([TokenType], [IDL.Nat], ['query']),
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletCanisterId, tokenType, amount, recipient, memo, userPrincipal } = body;

    if (!walletCanisterId || !tokenType || !amount || !recipient) {
      return NextResponse.json(
        { error: 'Wallet canister ID, token type, amount, and recipient are required' },
        { status: 400 }
      );
    }

    if (!userPrincipal) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
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

    // Check balance first
    const tokenVariant = { [tokenType]: null };
    const balance = await wallet.getBalance(tokenVariant);
    
    if (balance < BigInt(amount)) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Call withdraw function
    const memoOpt = memo ? [memo] : [];
    const result = await wallet.withdraw(tokenVariant, BigInt(amount), recipient, memoOpt);

    if ('ok' in result) {
      return NextResponse.json({
        success: true,
        transactionId: result.ok,
        message: 'Withdrawal successful',
      });
    } else {
      return NextResponse.json(
        { error: result.err },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}


