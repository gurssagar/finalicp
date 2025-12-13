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
  
  const TokenBalance = IDL.Record({
    'tokenType': TokenType,
    'balance': IDL.Nat,
    'decimals': IDL.Nat,
  });
  
  return IDL.Service({
    'getBalance': IDL.Func([TokenType], [IDL.Nat], ['query']),
    'getAllBalances': IDL.Func([], [IDL.Vec(TokenBalance)], ['query']),
    'getWalletAddress': IDL.Func([], [IDL.Text], ['query']),
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletCanisterId = searchParams.get('walletCanisterId');
    const tokenType = searchParams.get('tokenType');

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

    // Get wallet address
    const walletAddress = await wallet.getWalletAddress();

    if (tokenType) {
      // Get specific token balance
      const tokenVariant = { [tokenType]: null };
      const balance = await wallet.getBalance(tokenVariant);
      
      return NextResponse.json({
        success: true,
        walletAddress,
        tokenType,
        balance: balance.toString(),
      });
    } else {
      // Get all balances
      const balances = await wallet.getAllBalances();
      
      const formattedBalances = balances.map((b: any) => {
        const tokenTypeKey = Object.keys(b.tokenType)[0];
        return {
          tokenType: tokenTypeKey,
          balance: b.balance.toString(),
          decimals: b.decimals.toString(),
        };
      });

      return NextResponse.json({
        success: true,
        walletAddress,
        balances: formattedBalances,
      });
    }
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}


