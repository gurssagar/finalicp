import { NextRequest, NextResponse } from 'next/server';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Escrow IDL
const escrowIdl = ({ IDL }: any) => {
  const EscrowId = IDL.Text;
  const Account = IDL.Record({
    'owner': IDL.Principal,
    'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  
  return IDL.Service({
    'create': IDL.Func(
      [IDL.Text, IDL.Principal, IDL.Principal, IDL.Nat, IDL.Opt(IDL.Text)],
      [IDL.Tuple(EscrowId, Account)],
      []
    ),
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectId, 
      clientPrincipal, 
      freelancerPrincipal, 
      amountE8s, 
      freelancerHotWalletId 
    } = body;

    if (!projectId || !clientPrincipal || !freelancerPrincipal || !amountE8s) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, clientPrincipal, freelancerPrincipal, amountE8s' },
        { status: 400 }
      );
    }

    const escrowCanisterId = process.env.ESCROW_CANISTER_ID || 'escrow';
    const host = process.env.NEXT_PUBLIC_IC_HOST || 'http://127.0.0.1:4943';

    console.log('Creating escrow with canister:', escrowCanisterId);

    const agent = new HttpAgent({ host });
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }

    const escrowCanister = Actor.createActor(escrowIdl, {
      agent,
      canisterId: escrowCanisterId,
    });

    const client = Principal.fromText(clientPrincipal);
    const freelancer = Principal.fromText(freelancerPrincipal);
    const hotWalletOpt = freelancerHotWalletId ? [freelancerHotWalletId] : [];

    console.log('Creating escrow:', {
      projectId,
      client: client.toText(),
      freelancer: freelancer.toText(),
      amountE8s,
      hotWallet: hotWalletOpt,
    });

    const result = await escrowCanister.create(
      projectId,
      client,
      freelancer,
      BigInt(amountE8s),
      hotWalletOpt
    );

    const [escrowId, depositAccount] = result;

    return NextResponse.json({
      success: true,
      escrow: {
        escrowId,
        depositAccount: {
          owner: depositAccount.owner.toText(),
          subaccount: depositAccount.subaccount.length > 0 ? Array.from(depositAccount.subaccount[0]) : null,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating escrow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create escrow' },
      { status: 500 }
    );
  }
}
