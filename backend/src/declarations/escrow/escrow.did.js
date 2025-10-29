export const idlFactory = ({ IDL }) => {
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const EscrowStatus = IDL.Variant({
    'created' : IDL.Null,
    'funded' : IDL.Null,
    'released' : IDL.Null,
    'refunded' : IDL.Null,
  });
  const Escrow = IDL.Record({
    'escrowId' : IDL.Text,
    'releaseAtNs' : IDL.Opt(IDL.Nat64),
    'freelancer' : IDL.Principal,
    'projectId' : IDL.Text,
    'expectedE8s' : IDL.Nat,
    'fundedAtNs' : IDL.Opt(IDL.Nat64),
    'subaccount' : IDL.Vec(IDL.Nat8),
    'status' : EscrowStatus,
    'createdAtNs' : IDL.Nat64,
    'ledgerBlockIndex' : IDL.Opt(IDL.Nat64),
    'client' : IDL.Principal,
  });
  const RefreshResult = IDL.Record({
    'funded' : IDL.Bool,
    'balanceE8s' : IDL.Nat,
  });
  const TransferResult = IDL.Variant({
    'ok' : IDL.Nat,
    'err' : IDL.Text,
  });
  return IDL.Service({
    'create' : IDL.Func([IDL.Text, IDL.Principal, IDL.Principal, IDL.Nat], [IDL.Text, Account], []),
    'get' : IDL.Func([IDL.Text], [Escrow], ['query']),
    'get_deposit_account' : IDL.Func([IDL.Text], [Account], ['query']),
    'get_relayer' : IDL.Func([], [IDL.Opt(IDL.Principal)], ['query']),
    'get_treasury' : IDL.Func([], [IDL.Principal], ['query']),
    'refresh_funding' : IDL.Func([IDL.Text], [RefreshResult], []),
    'release' : IDL.Func([IDL.Text], [TransferResult], []),
    'refund' : IDL.Func([IDL.Text], [TransferResult], []),
    'set_relayer' : IDL.Func([IDL.Opt(IDL.Principal)], [], []),
    'set_treasury' : IDL.Func([IDL.Principal], [], []),
  });
};
export const init = ({ IDL }) => { return []; };