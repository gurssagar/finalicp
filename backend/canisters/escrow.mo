import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Blob "mo:base/Blob";

persistent actor EscrowCanister {

  // ========================================
  // TYPE DEFINITIONS
  // ========================================

  public type EscrowId = Text;

  public type EscrowStatus = {
    #created;
    #funded;
    #released;
    #refunded;
  };

  public type Escrow = {
    escrowId: EscrowId;
    projectId: Text;
    client: Principal;
    freelancer: Principal;
    expectedE8s: Nat;
    status: EscrowStatus;
    subaccount: Blob;
    createdAtNs: Nat64;
    fundedAtNs: ?Nat64;
    releaseAtNs: ?Nat64;
    ledgerBlockIndex: ?Nat64;
  };

  public type Account = {
    owner: Principal;
    subaccount: ?Blob;
  };

  public type RefreshResult = {
    funded: Bool;
    balanceE8s: Nat;
  };

  public type TransferResult = Result.Result<Nat, Text>;

  // ICRC-1 Ledger Types
  public type ICRC1TransferArgs = {
    from_subaccount: ?Blob;
    to: Account;
    amount: Nat;
    fee: ?Nat;
    memo: ?Blob;
    created_at_time: ?Nat64;
  };

  public type ICRC1TransferResult = {
    #Ok: Nat;
    #Err: {
      #InsufficientFunds;
      #BadFee: { expected_fee: Nat };
      #TemporarilyUnavailable;
      #GenericError: { error_code: Nat; message: Text };
      #BadBurn: { min_burn_amount: Nat };
      #Duplicate: { duplicate_of: Nat };
      #InvalidReceiver: { receiver: Principal };
      #CreatedInFuture: { ledger_time: Nat64 };
    };
  };

  public type ICRC1BalanceArgs = {
    owner: Principal;
    subaccount: ?Blob;
  };

  // ========================================
  // STORAGE
  // ========================================

  // Configurable principals
  private flexible var ledgerCanisterId: Principal = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"); // ICP Ledger
  private flexible var treasuryPrincipal: Principal = Principal.fromText("lxzze-o7777-77777-aaaaa-cai"); // Provided treasury
  private flexible var relayerPrincipal: ?Principal = null;

  // Escrow storage
  private var escrowsArray: [(EscrowId, Escrow)] = [];
  private flexible var escrows = HashMap.HashMap<EscrowId, Escrow>(0, Text.equal, Text.hash);

  // Sequence for generating unique escrow IDs
  private flexible var nextEscrowId: Nat = 0;

  // ========================================
  // UPGRADE FUNCTIONS
  // ========================================

  system func preupgrade() {
    escrowsArray := Iter.toArray(escrows.entries());
  };

  system func postupgrade() {
    for ((id, escrow) in escrowsArray.vals()) {
      escrows.put(id, escrow);
    };
    escrowsArray := [];
  };

  // ========================================
  // LEDGER INTERFACE
  // ========================================

  private let ledgerActor = actor(Principal.toText(ledgerCanisterId)) : actor {
    icrc1_transfer: (ICRC1TransferArgs) -> async ICRC1TransferResult;
    icrc1_balance_of: (ICRC1BalanceArgs) -> async Nat;
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  private func generateEscrowId(projectId: Text): EscrowId {
    let id = Nat.toText(nextEscrowId);
    nextEscrowId += 1;
    projectId # ":" # id
  };

  private func generateSubaccount(): Blob {
    // Generate a unique 32-byte subaccount using timestamp and counter
    let timestamp = Nat64.toNat(Time.now());
    let counter = nextEscrowId;
    let data = Text.encodeUtf8(Nat.toText(timestamp) # ":" # Nat.toText(counter));

    // Pad or truncate to exactly 32 bytes
    let bytes = Blob.toArray(data);
    if (bytes.size() > 32) {
      Array.subArray(bytes, 0, 32)
    } else {
      let padding = Array.tabulate<Nat8>(32 - bytes.size(), func(_) { 0 });
      Array.append(bytes, padding)
    };
    Blob.fromArray(?bytes)
  };

  private func calculateFee(amountE8s: Nat): Nat {
    // 5% fee, rounded down
    amountE8s * 5 / 100
  };

  private func isAuthorizedForRelease(caller: Principal, escrow: Escrow): Bool {
    // Client can release, relayer can release
    caller == escrow.client or
    Option.get(relayerPrincipal, Principal.fromText("aaaaa-aa")) == caller
  };

  private func isAuthorizedForRefund(caller: Principal, escrow: Escrow): Bool {
    // Client can refund, relayer can refund
    caller == escrow.client or
    Option.get(relayerPrincipal, Principal.fromText("aaaaa-aa")) == caller
  };

  // ========================================
  // PUBLIC API FUNCTIONS
  // ========================================

  public shared({ caller }) func create(
    projectId: Text,
    client: Principal,
    freelancer: Principal,
    amountE8s: Nat
  ): async (EscrowId, Account) {

    // Validate input
    if (amountE8s == 0) {
      Debug.trap("Amount must be greater than 0");
    };

    let escrowId = generateEscrowId(projectId);
    let subaccount = generateSubaccount();

    let escrow: Escrow = {
      escrowId = escrowId;
      projectId = projectId;
      client = client;
      freelancer = freelancer;
      expectedE8s = amountE8s;
      status = #created;
      subaccount = subaccount;
      createdAtNs = Nat64.fromNat(Int.abs(Time.now()));
      fundedAtNs = null;
      releaseAtNs = null;
      ledgerBlockIndex = null;
    };

    escrows.put(escrowId, escrow);

    let depositAccount: Account = {
      owner = Principal.fromActor(this);
      subaccount = ?subaccount;
    };

    (escrowId, depositAccount)
  };

  public query func get(escrowId: EscrowId): async Escrow {
    switch (escrows.get(escrowId)) {
      case (?escrow) { escrow };
      case null { Debug.trap("Escrow not found") };
    }
  };

  public query func get_deposit_account(escrowId: EscrowId): async Account {
    switch (escrows.get(escrowId)) {
      case (?escrow) {
        {
          owner = Principal.fromActor(this);
          subaccount = ?escrow.subaccount;
        }
      };
      case null { Debug.trap("Escrow not found") };
    }
  };

  public func refresh_funding(escrowId: EscrowId): async RefreshResult {
    switch (escrows.get(escrowId)) {
      case (?escrow) {
        let balanceArgs: ICRC1BalanceArgs = {
          owner = Principal.fromActor(this);
          subaccount = ?escrow.subaccount;
        };

        let balance = await ledgerActor.icrc1_balance_of(balanceArgs);
        let isFunded = balance >= escrow.expectedE8s;

        // Update escrow status if newly funded
        if (isFunded and escrow.status == #created) {
          let updatedEscrow = {
            escrowId = escrow.escrowId;
            projectId = escrow.projectId;
            client = escrow.client;
            freelancer = escrow.freelancer;
            expectedE8s = escrow.expectedE8s;
            status = #funded;
            subaccount = escrow.subaccount;
            createdAtNs = escrow.createdAtNs;
            fundedAtNs = ?Nat64.fromNat(Int.abs(Time.now()));
            releaseAtNs = escrow.releaseAtNs;
            ledgerBlockIndex = escrow.ledgerBlockIndex;
          };
          escrows.put(escrowId, updatedEscrow);
        };

        { funded = isFunded; balanceE8s = balance }
      };
      case null { Debug.trap("Escrow not found") };
    }
  };

  public shared({ caller }) func release(escrowId: EscrowId): async TransferResult {
    switch (escrows.get(escrowId)) {
      case (?escrow) {
        // Authorization check
        if (not isAuthorizedForRelease(caller, escrow)) {
          return #err("Unauthorized: only client or relayer can release");
        };

        // Status check
        if (escrow.status != #funded) {
          return #err("Escrow must be funded before release");
        };

        // Calculate amounts
        let totalAmount = escrow.expectedE8s;
        let feeAmount = calculateFee(totalAmount);
        let freelancerAmount = totalAmount - feeAmount;

        // Transfer to freelancer
        let freelancerTransferArgs: ICRC1TransferArgs = {
          from_subaccount = ?escrow.subaccount;
          to = { owner = escrow.freelancer; subaccount = null };
          amount = freelancerAmount;
          fee = null; // Use default fee
          memo = ?Text.encodeUtf8("Escrow release: " # escrowId);
          created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
        };

        let freelancerResult = await ledgerActor.icrc1_transfer(freelancerTransferArgs);

        var blockIndex: Nat = 0;
        switch (freelancerResult) {
          case (#Ok(idx)) { blockIndex := idx; };
          case (#Err(err)) { return #err("Freelancer transfer failed: " # debug_show(err)); };
        };

        // Transfer fee to treasury
        let treasuryTransferArgs: ICRC1TransferArgs = {
          from_subaccount = ?escrow.subaccount;
          to = { owner = treasuryPrincipal; subaccount = null };
          amount = feeAmount;
          fee = null; // Use default fee
          memo = ?Text.encodeUtf8("Platform fee: " # escrowId);
          created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
        };

        let treasuryResult = await ledgerActor.icrc1_transfer(treasuryTransferArgs);

        var treasuryBlockIndex: Nat = 0;
        switch (treasuryResult) {
          case (#Ok(idx)) { treasuryBlockIndex := idx; };
          case (#Err(err)) {
            // If treasury transfer fails, this is critical - log and return error
            Debug.print("CRITICAL: Treasury transfer failed for escrow " # escrowId # ": " # debug_show(err));
            return #err("Treasury transfer failed: " # debug_show(err));
          };
        };

        // Update escrow status
        let updatedEscrow = {
          escrowId = escrow.escrowId;
          projectId = escrow.projectId;
          client = escrow.client;
          freelancer = escrow.freelancer;
          expectedE8s = escrow.expectedE8s;
          status = #released;
          subaccount = escrow.subaccount;
          createdAtNs = escrow.createdAtNs;
          fundedAtNs = escrow.fundedAtNs;
          releaseAtNs = ?Nat64.fromNat(Int.abs(Time.now()));
          ledgerBlockIndex = ?Nat64.fromNat(blockIndex);
        };

        escrows.put(escrowId, updatedEscrow);
        #ok(blockIndex)
      };
      case null { #err("Escrow not found") };
    }
  };

  public shared({ caller }) func refund(escrowId: EscrowId): async TransferResult {
    switch (escrows.get(escrowId)) {
      case (?escrow) {
        // Authorization check
        if (not isAuthorizedForRefund(caller, escrow)) {
          return #err("Unauthorized: only client or relayer can refund");
        };

        // Status check - can only refund if not released
        if (escrow.status == #released) {
          return #err("Cannot refund a released escrow");
        };

        // Check current balance
        let balanceArgs: ICRC1BalanceArgs = {
          owner = Principal.fromActor(this);
          subaccount = ?escrow.subaccount;
        };
        let balance = await ledgerActor.icrc1_balance_of(balanceArgs);

        if (balance == 0) {
          return #err("No funds to refund");
        };

        // Transfer back to client
        let refundTransferArgs: ICRC1TransferArgs = {
          from_subaccount = ?escrow.subaccount;
          to = { owner = escrow.client; subaccount = null };
          amount = balance;
          fee = null; // Use default fee
          memo = ?Text.encodeUtf8("Escrow refund: " # escrowId);
          created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
        };

        let refundResult = await ledgerActor.icrc1_transfer(refundTransferArgs);

        switch (refundResult) {
          case (#Ok(blockIndex)) {
            // Update escrow status
            let updatedEscrow = {
              escrowId = escrow.escrowId;
              projectId = escrow.projectId;
              client = escrow.client;
              freelancer = escrow.freelancer;
              expectedE8s = escrow.expectedE8s;
              status = #refunded;
              subaccount = escrow.subaccount;
              createdAtNs = escrow.createdAtNs;
              fundedAtNs = escrow.fundedAtNs;
              releaseAtNs = ?Nat64.fromNat(Int.abs(Time.now()));
              ledgerBlockIndex = ?Nat64.fromNat(blockIndex);
            };

            escrows.put(escrowId, updatedEscrow);
            #ok(blockIndex)
          };
          case (#Err(err)) { #err("Refund transfer failed: " # debug_show(err)) };
        }
      };
      case null { #err("Escrow not found") };
    }
  };

  // ========================================
  // ADMIN FUNCTIONS
  // ========================================

  public shared({ caller }) func set_treasury(newTreasury: Principal): async () {
    assert(Principal.isController(caller));
    treasuryPrincipal := newTreasury;
  };

  public shared({ caller }) func set_relayer(newRelayer: ?Principal): async () {
    assert(Principal.isController(caller));
    relayerPrincipal := newRelayer;
  };

  public query func get_treasury(): async Principal {
    treasuryPrincipal
  };

  public query func get_relayer(): async ?Principal {
    relayerPrincipal
  };
};
