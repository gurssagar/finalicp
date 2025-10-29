import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Escrow {
  'escrowId' : string,
  'releaseAtNs' : [] | [bigint],
  'freelancer' : Principal,
  'projectId' : string,
  'expectedE8s' : bigint,
  'fundedAtNs' : [] | [bigint],
  'subaccount' : Uint8Array | number[],
  'status' : EscrowStatus,
  'createdAtNs' : bigint,
  'ledgerBlockIndex' : [] | [bigint],
  'client' : Principal,
}
export type EscrowId = string;
export type EscrowStatus = { 'created' : null } |
  { 'funded' : null } |
  { 'released' : null } |
  { 'refunded' : null };
export type RefreshResult = {
  'funded' : boolean,
  'balanceE8s' : bigint,
};
export type TransferResult = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'create' : ActorMethod<
    [string, Principal, Principal, bigint],
    [string, Account]
  >,
  'get' : ActorMethod<[string], Escrow>,
  'get_deposit_account' : ActorMethod<[string], Account>,
  'get_relayer' : ActorMethod<[], [] | [Principal]>,
  'get_treasury' : ActorMethod<[], Principal>,
  'refresh_funding' : ActorMethod<[string], RefreshResult>,
  'release' : ActorMethod<[string], TransferResult>,
  'refund' : ActorMethod<[string], TransferResult>,
  'set_relayer' : ActorMethod<[] | [Principal], undefined>,
  'set_treasury' : ActorMethod<[Principal], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
