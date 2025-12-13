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
  
  const TransactionType = IDL.Variant({
    'Deposit': IDL.Null,
    'Withdrawal': IDL.Null,
    'Transfer': IDL.Null,
  });
  
  const TransactionStatus = IDL.Variant({
    'Pending': IDL.Null,
    'Completed': IDL.Null,
    'Failed': IDL.Null,
  });
  
  const Transaction = IDL.Record({
    'id': IDL.Text,
    'txType': TransactionType,
    'tokenType': TokenType,
    'amount': IDL.Nat,
    'from': IDL.Opt(IDL.Text),
    'to': IDL.Opt(IDL.Text),
    'timestamp': IDL.Int,
    'status': TransactionStatus,
    'memo': IDL.Opt(IDL.Text),
  });
  
  return IDL.Service({
    'getTransactionHistory': IDL.Func([IDL.Opt(IDL.Nat)], [IDL.Vec(Transaction)], ['query']),
    'getTransaction': IDL.Func([IDL.Text], [IDL.Opt(Transaction)], ['query']),
    'getTransactionCount': IDL.Func([], [IDL.Nat], ['query']),
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletCanisterId = searchParams.get('walletCanisterId');
    const txId = searchParams.get('txId');
    const limit = searchParams.get('limit');

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

    if (txId) {
      // Get specific transaction
      const transaction = await wallet.getTransaction(txId);
      
      if (transaction && transaction.length > 0) {
        const tx = transaction[0];
        return NextResponse.json({
          success: true,
          transaction: formatTransaction(tx),
        });
      } else {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }
    } else {
      // Get transaction history
      const limitOpt = limit ? [parseInt(limit)] : [];
      const transactions = await wallet.getTransactionHistory(limitOpt);
      const count = await wallet.getTransactionCount();
      
      const formattedTransactions = transactions.map(formatTransaction);

      return NextResponse.json({
        success: true,
        transactions: formattedTransactions,
        totalCount: count.toString(),
      });
    }
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

function formatTransaction(tx: any) {
  const tokenTypeKey = Object.keys(tx.tokenType)[0];
  const txTypeKey = Object.keys(tx.txType)[0];
  const statusKey = Object.keys(tx.status)[0];
  
  return {
    id: tx.id,
    txType: txTypeKey,
    tokenType: tokenTypeKey,
    amount: tx.amount.toString(),
    from: tx.from.length > 0 ? tx.from[0] : null,
    to: tx.to.length > 0 ? tx.to[0] : null,
    timestamp: tx.timestamp.toString(),
    status: statusKey,
    memo: tx.memo.length > 0 ? tx.memo[0] : null,
  };
}


