import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Wallet Factory IDL
const walletFactoryIdl = ({ IDL }: any) => {
  const UserId = IDL.Text;
  const CreateWalletResult = IDL.Record({
    'userId': UserId,
    'walletCanisterId': IDL.Text,
    'walletPrincipal': IDL.Principal,
    'createdAt': IDL.Int,
  });
  const Result = IDL.Variant({
    'ok': CreateWalletResult,
    'err': IDL.Text,
  });
  
  return IDL.Service({
    'createWallet': IDL.Func([UserId, IDL.Principal], [Result], []),
    'getWalletByUserId': IDL.Func([UserId], [IDL.Opt(IDL.Record({
      'userId': UserId,
      'walletCanisterId': IDL.Principal,
      'ownerPrincipal': IDL.Principal,
      'createdAt': IDL.Int,
    }))], ['query']),
    'hasWallet': IDL.Func([UserId], [IDL.Bool], ['query']),
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userPrincipal } = body;

    if (!userId || !userPrincipal) {
      return NextResponse.json(
        { error: 'User ID and Principal are required' },
        { status: 400 }
      );
    }

    // Get wallet factory canister ID from environment or config
    const walletFactoryCanisterId = process.env.WALLET_FACTORY_CANISTER_ID || 'wallet_factory';
    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    // Create agent
    const agent = new HttpAgent({ host });
    
    // Fetch root key for local development
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    // Create actor
    const walletFactory = Actor.createActor(walletFactoryIdl, {
      agent,
      canisterId: walletFactoryCanisterId,
    });

    // Check if wallet already exists
    const hasWallet = await walletFactory.hasWallet(userId);
    if (hasWallet) {
      const existingWallet = await walletFactory.getWalletByUserId(userId);
      if (existingWallet && existingWallet.length > 0) {
        return NextResponse.json({
          success: true,
          wallet: {
            userId: existingWallet[0].userId,
            walletCanisterId: existingWallet[0].walletCanisterId.toText(),
            ownerPrincipal: existingWallet[0].ownerPrincipal.toText(),
            createdAt: existingWallet[0].createdAt.toString(),
          },
          message: 'Wallet already exists',
        });
      }
    }

    // Create new wallet
    const principal = Principal.fromText(userPrincipal);
    const result = await walletFactory.createWallet(userId, principal);

    if ('ok' in result) {
      const walletData = result.ok;
      
      // Update user profile with hot wallet canister ID
      // Call user_v2 canister to update profile
      const userCanisterId = process.env.USER_V2_CANISTER_ID || 'user_v2';
      const userIdl = ({ IDL }: any) => {
        return IDL.Service({
          'updateHotWalletCanisterId': IDL.Func([IDL.Text, IDL.Text], [IDL.Variant({
            'ok': IDL.Null,
            'err': IDL.Text,
          })], []),
        });
      };

      const userCanister = Actor.createActor(userIdl, {
        agent,
        canisterId: userCanisterId,
      });

      await userCanister.updateHotWalletCanisterId(userId, walletData.walletCanisterId);

      return NextResponse.json({
        success: true,
        wallet: {
          userId: walletData.userId,
          walletCanisterId: walletData.walletCanisterId,
          walletPrincipal: walletData.walletPrincipal.toText(),
          createdAt: walletData.createdAt.toString(),
        },
      });
    } else {
      return NextResponse.json(
        { error: result.err },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const walletFactoryCanisterId = process.env.WALLET_FACTORY_CANISTER_ID || 'wallet_factory';
    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    const agent = new HttpAgent({ host });
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    const walletFactory = Actor.createActor(walletFactoryIdl, {
      agent,
      canisterId: walletFactoryCanisterId,
    });

    const wallet = await walletFactory.getWalletByUserId(userId);
    
    if (wallet && wallet.length > 0) {
      return NextResponse.json({
        success: true,
        wallet: {
          userId: wallet[0].userId,
          walletCanisterId: wallet[0].walletCanisterId.toText(),
          ownerPrincipal: wallet[0].ownerPrincipal.toText(),
          createdAt: wallet[0].createdAt.toString(),
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}


