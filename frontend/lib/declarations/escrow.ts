import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type EscrowId = string;

export type EscrowStatus = 
  | { 'created': null }
  | { 'funded': null }
  | { 'released': null }
  | { 'refunded': null };

export interface Escrow {
  'escrowId': EscrowId;
  'projectId': string;
  'client': Principal;
  'freelancer': Principal;
  'freelancerHotWallet': [] | [string];
  'expectedE8s': bigint;
  'status': EscrowStatus;
  'subaccount': Uint8Array | number[];
  'createdAtNs': bigint;
  'fundedAtNs': [] | [bigint];
  'releaseAtNs': [] | [bigint];
  'ledgerBlockIndex': [] | [bigint];
}

export interface Account {
  'owner': Principal;
  'subaccount': [] | [Uint8Array | number[]];
}

export interface RefreshResult {
  'funded': boolean;
  'balanceE8s': bigint;
}

export type TransferResult = 
  | { 'ok': bigint }
  | { 'err': string };

export type Result<T, E> = 
  | { 'ok': T }
  | { 'err': E };

export interface ICRC1TransferArgs {
  'from_subaccount': [] | [Uint8Array | number[]];
  'to': Account;
  'amount': bigint;
  'fee': [] | [bigint];
  'memo': [] | [Uint8Array | number[]];
  'created_at_time': [] | [bigint];
}

export type ICRC1TransferError = 
  | { 'InsufficientFunds': null }
  | { 'BadFee': { 'expected_fee': bigint } }
  | { 'TemporarilyUnavailable': null }
  | { 'GenericError': { 'error_code': bigint; 'message': string } }
  | { 'BadBurn': { 'min_burn_amount': bigint } }
  | { 'Duplicate': { 'duplicate_of': bigint } }
  | { 'InvalidReceiver': { 'receiver': Principal } }
  | { 'CreatedInFuture': { 'ledger_time': bigint } };

export type ICRC1TransferResult = 
  | { 'Ok': bigint }
  | { 'Err': ICRC1TransferError };

export interface ICRC1BalanceArgs {
  'owner': Principal;
  'subaccount': [] | [Uint8Array | number[]];
}

export interface EscrowCanister {
  'create': ActorMethod<[string, Principal, Principal, bigint, [] | [string]], [EscrowId, Account]>;
  'get': ActorMethod<[EscrowId], Escrow>;
  'get_deposit_account': ActorMethod<[EscrowId], Account>;
  'refresh_funding': ActorMethod<[EscrowId], RefreshResult>;
  'release': ActorMethod<[EscrowId], TransferResult>;
  'refund': ActorMethod<[EscrowId], TransferResult>;
  'setFreelancerHotWallet': ActorMethod<[EscrowId, string], Result<null, string>>;
  'getEscrowWithWallet': ActorMethod<[EscrowId], Result<Escrow, string>>;
  'set_treasury': ActorMethod<[Principal], void>;
  'set_relayer': ActorMethod<[[] | [Principal]], void>;
  'get_treasury': ActorMethod<[], Principal>;
  'get_relayer': ActorMethod<[], [] | [Principal]>;
}

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const EscrowId = IDL.Text;
  
  const EscrowStatus = IDL.Variant({
    'created': IDL.Null,
    'funded': IDL.Null,
    'released': IDL.Null,
    'refunded': IDL.Null,
  });
  
  const Escrow = IDL.Record({
    'escrowId': EscrowId,
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
  
  const Account = IDL.Record({
    'owner': IDL.Principal,
    'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  
  const RefreshResult = IDL.Record({
    'funded': IDL.Bool,
    'balanceE8s': IDL.Nat,
  });
  
  const TransferResult = IDL.Variant({
    'ok': IDL.Nat,
    'err': IDL.Text,
  });
  
  const Result = (T: IDL.Type, E: IDL.Type) => IDL.Variant({
    'ok': T,
    'err': E,
  });
  
  return IDL.Service({
    'create': IDL.Func(
      [IDL.Text, IDL.Principal, IDL.Principal, IDL.Nat, IDL.Opt(IDL.Text)],
      [IDL.Tuple(EscrowId, Account)],
      []
    ),
    'get': IDL.Func([EscrowId], [Escrow], ['query']),
    'get_deposit_account': IDL.Func([EscrowId], [Account], ['query']),
    'refresh_funding': IDL.Func([EscrowId], [RefreshResult], []),
    'release': IDL.Func([EscrowId], [TransferResult], []),
    'refund': IDL.Func([EscrowId], [TransferResult], []),
    'setFreelancerHotWallet': IDL.Func([EscrowId, IDL.Text], [Result(IDL.Null, IDL.Text)], []),
    'getEscrowWithWallet': IDL.Func([EscrowId], [Result(Escrow, IDL.Text)], ['query']),
    'set_treasury': IDL.Func([IDL.Principal], [], []),
    'set_relayer': IDL.Func([IDL.Opt(IDL.Principal)], [], []),
    'get_treasury': IDL.Func([], [IDL.Principal], ['query']),
    'get_relayer': IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
  });
};

export const init = ({ IDL }: { IDL: IDL }) => { return []; };


