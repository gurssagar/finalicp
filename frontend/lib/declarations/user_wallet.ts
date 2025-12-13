import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type TokenType = 
  | { 'ICP': null }
  | { 'ckBTC': null }
  | { 'ckETH': null }
  | { 'ckUSDC': null };

export interface TokenBalance {
  'tokenType': TokenType;
  'balance': bigint;
  'decimals': bigint;
}

export type TransactionType = 
  | { 'Deposit': null }
  | { 'Withdrawal': null }
  | { 'Transfer': null };

export type TransactionStatus = 
  | { 'Pending': null }
  | { 'Completed': null }
  | { 'Failed': null };

export interface Transaction {
  'id': string;
  'txType': TransactionType;
  'tokenType': TokenType;
  'amount': bigint;
  'from': [] | [string];
  'to': [] | [string];
  'timestamp': bigint;
  'status': TransactionStatus;
  'memo': [] | [string];
}

export type Result<T, E> = 
  | { 'ok': T }
  | { 'err': E };

export interface ICRC1TransferArgs {
  'from_subaccount': [] | [Uint8Array | number[]];
  'to': {
    'owner': Principal;
    'subaccount': [] | [Uint8Array | number[]];
  };
  'amount': bigint;
  'fee': [] | [bigint];
  'memo': [] | [Uint8Array | number[]];
  'created_at_time': [] | [bigint];
}

export type ICRC1TransferError = 
  | { 'BadFee': { 'expected_fee': bigint } }
  | { 'BadBurn': { 'min_burn_amount': bigint } }
  | { 'InsufficientFunds': { 'balance': bigint } }
  | { 'TooOld': null }
  | { 'CreatedInFuture': { 'ledger_time': bigint } }
  | { 'Duplicate': { 'duplicate_of': bigint } }
  | { 'TemporarilyUnavailable': null }
  | { 'GenericError': { 'error_code': bigint; 'message': string } };

export type ICRC1TransferResult = Result<bigint, ICRC1TransferError>;

export interface UserWallet {
  'deposit': ActorMethod<[TokenType, bigint, [] | [string]], Result<string, string>>;
  'getBalance': ActorMethod<[TokenType], bigint>;
  'getAllBalances': ActorMethod<[], Array<TokenBalance>>;
  'getOwner': ActorMethod<[], Principal>;
  'getTokenCanister': ActorMethod<[TokenType], [] | [Principal]>;
  'getTransaction': ActorMethod<[string], [] | [Transaction]>;
  'getTransactionCount': ActorMethod<[], bigint>;
  'getTransactionHistory': ActorMethod<[[] | [bigint]], Array<Transaction>>;
  'getWalletAddress': ActorMethod<[], string>;
  'healthCheck': ActorMethod<[], boolean>;
  'setTokenCanister': ActorMethod<[TokenType, Principal], Result<null, string>>;
  'transfer': ActorMethod<[TokenType, bigint, Principal, [] | [string]], Result<string, string>>;
  'withdraw': ActorMethod<[TokenType, bigint, string, [] | [string]], Result<string, string>>;
}

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const TokenType = IDL.Variant({
    'ICP': IDL.Null,
    'ckBTC': IDL.Null,
    'ckETH': IDL.Null,
    'ckUSDC': IDL.Null,
  });
  
  const Result = (T: IDL.Type, E: IDL.Type) => IDL.Variant({
    'ok': T,
    'err': E,
  });
  
  const TokenBalance = IDL.Record({
    'tokenType': TokenType,
    'balance': IDL.Nat,
    'decimals': IDL.Nat,
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
    'deposit': IDL.Func([TokenType, IDL.Nat, IDL.Opt(IDL.Text)], [Result(IDL.Text, IDL.Text)], []),
    'getBalance': IDL.Func([TokenType], [IDL.Nat], ['query']),
    'getAllBalances': IDL.Func([], [IDL.Vec(TokenBalance)], ['query']),
    'getOwner': IDL.Func([], [IDL.Principal], ['query']),
    'getTokenCanister': IDL.Func([TokenType], [IDL.Opt(IDL.Principal)], ['query']),
    'getTransaction': IDL.Func([IDL.Text], [IDL.Opt(Transaction)], ['query']),
    'getTransactionCount': IDL.Func([], [IDL.Nat], ['query']),
    'getTransactionHistory': IDL.Func([IDL.Opt(IDL.Nat)], [IDL.Vec(Transaction)], ['query']),
    'getWalletAddress': IDL.Func([], [IDL.Text], ['query']),
    'healthCheck': IDL.Func([], [IDL.Bool], ['query']),
    'setTokenCanister': IDL.Func([TokenType, IDL.Principal], [Result(IDL.Null, IDL.Text)], []),
    'transfer': IDL.Func([TokenType, IDL.Nat, IDL.Principal, IDL.Opt(IDL.Text)], [Result(IDL.Text, IDL.Text)], []),
    'withdraw': IDL.Func([TokenType, IDL.Nat, IDL.Text, IDL.Opt(IDL.Text)], [Result(IDL.Text, IDL.Text)], []),
  });
};

export const init = ({ IDL }: { IDL: IDL }) => { return []; };


