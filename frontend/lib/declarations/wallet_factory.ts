import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type UserId = string;

export interface WalletInfo {
  'userId': UserId;
  'walletCanisterId': Principal;
  'ownerPrincipal': Principal;
  'createdAt': bigint;
}

export interface CreateWalletResult {
  'userId': UserId;
  'walletCanisterId': string;
  'walletPrincipal': Principal;
  'createdAt': bigint;
}

export type Result<T, E> = 
  | { 'ok': T }
  | { 'err': E };

export interface WalletFactory {
  'createWallet': ActorMethod<[UserId, Principal], Result<CreateWalletResult, string>>;
  'createWalletAdvanced': ActorMethod<[UserId, Principal], Result<CreateWalletResult, string>>;
  'deleteWalletMapping': ActorMethod<[UserId], Result<null, string>>;
  'getAllWallets': ActorMethod<[], Array<WalletInfo>>;
  'getCyclesBalance': ActorMethod<[], bigint>;
  'getTotalWalletsCreated': ActorMethod<[], bigint>;
  'getWalletByPrincipal': ActorMethod<[Principal], [] | [WalletInfo]>;
  'getWalletByUserId': ActorMethod<[UserId], [] | [WalletInfo]>;
  'getWalletCount': ActorMethod<[], bigint>;
  'hasWallet': ActorMethod<[UserId], boolean>;
  'healthCheck': ActorMethod<[], boolean>;
  'updateWalletInfo': ActorMethod<[UserId, Principal], Result<null, string>>;
}

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const UserId = IDL.Text;
  
  const CreateWalletResult = IDL.Record({
    'userId': UserId,
    'walletCanisterId': IDL.Text,
    'walletPrincipal': IDL.Principal,
    'createdAt': IDL.Int,
  });
  
  const Result = (T: IDL.Type, E: IDL.Type) => IDL.Variant({
    'ok': T,
    'err': E,
  });
  
  const WalletInfo = IDL.Record({
    'userId': UserId,
    'walletCanisterId': IDL.Principal,
    'ownerPrincipal': IDL.Principal,
    'createdAt': IDL.Int,
  });
  
  return IDL.Service({
    'createWallet': IDL.Func([UserId, IDL.Principal], [Result(CreateWalletResult, IDL.Text)], []),
    'createWalletAdvanced': IDL.Func([UserId, IDL.Principal], [Result(CreateWalletResult, IDL.Text)], []),
    'deleteWalletMapping': IDL.Func([UserId], [Result(IDL.Null, IDL.Text)], []),
    'getAllWallets': IDL.Func([], [IDL.Vec(WalletInfo)], ['query']),
    'getCyclesBalance': IDL.Func([], [IDL.Nat], ['query']),
    'getTotalWalletsCreated': IDL.Func([], [IDL.Nat], ['query']),
    'getWalletByPrincipal': IDL.Func([IDL.Principal], [IDL.Opt(WalletInfo)], ['query']),
    'getWalletByUserId': IDL.Func([UserId], [IDL.Opt(WalletInfo)], ['query']),
    'getWalletCount': IDL.Func([], [IDL.Nat], ['query']),
    'hasWallet': IDL.Func([UserId], [IDL.Bool], ['query']),
    'healthCheck': IDL.Func([], [IDL.Bool], ['query']),
    'updateWalletInfo': IDL.Func([UserId, IDL.Principal], [Result(IDL.Null, IDL.Text)], []),
  });
};

export const init = ({ IDL }: { IDL: IDL }) => { return []; };


