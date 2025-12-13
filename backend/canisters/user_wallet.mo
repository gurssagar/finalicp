import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

shared(init) actor class UserWallet() = this {
    // Token types supported
    public type TokenType = {
        #ICP;
        #ckBTC;
        #ckETH;
        #ckUSDC;
    };

    public type TokenBalance = {
        tokenType: TokenType;
        balance: Nat;
        decimals: Nat;
    };

    public type Transaction = {
        id: Text;
        txType: TransactionType;
        tokenType: TokenType;
        amount: Nat;
        from: ?Text;
        to: ?Text;
        timestamp: Int;
        status: TransactionStatus;
        memo: ?Text;
    };

    public type TransactionType = {
        #Deposit;
        #Withdrawal;
        #Transfer;
    };

    public type TransactionStatus = {
        #Pending;
        #Completed;
        #Failed;
    };

    // ICRC-1 Token Canister Interface
    public type ICRC1TransferArgs = {
        from_subaccount: ?Blob;
        to: {
            owner: Principal;
            subaccount: ?Blob;
        };
        amount: Nat;
        fee: ?Nat;
        memo: ?Blob;
        created_at_time: ?Nat64;
    };

    public type ICRC1TransferResult = {
        #Ok: Nat;
        #Err: ICRC1TransferError;
    };

    public type ICRC1TransferError = {
        #BadFee: { expected_fee: Nat };
        #BadBurn: { min_burn_amount: Nat };
        #InsufficientFunds: { balance: Nat };
        #TooOld;
        #CreatedInFuture: { ledger_time: Nat64 };
        #Duplicate: { duplicate_of: Nat };
        #TemporarilyUnavailable;
        #GenericError: { error_code: Nat; message: Text };
    };

    // State
    private stable let owner: Principal = init.caller;
    private stable var transactionCounter: Nat = 0;
    
    // Token balances storage
    private stable var balancesArray: [(TokenType, Nat)] = [];
    private flexible var balances = HashMap.HashMap<TokenType, Nat>(4, tokenTypeEqual, tokenTypeHash);
    
    // Transaction history storage
    private stable var transactionsArray: [Transaction] = [];
    private flexible var transactions = Buffer.Buffer<Transaction>(0);

    // Known ICRC-1 token canisters (these would typically come from config)
    private let tokenCanisters = HashMap.HashMap<TokenType, Principal>(4, tokenTypeEqual, tokenTypeHash);

    // Helper functions for TokenType
    private func tokenTypeEqual(a: TokenType, b: TokenType): Bool {
        switch (a, b) {
            case (#ICP, #ICP) { true };
            case (#ckBTC, #ckBTC) { true };
            case (#ckETH, #ckETH) { true };
            case (#ckUSDC, #ckUSDC) { true };
            case _ { false };
        };
    };

    private func tokenTypeHash(t: TokenType): Nat32 {
        switch (t) {
            case (#ICP) { 0 };
            case (#ckBTC) { 1 };
            case (#ckETH) { 2 };
            case (#ckUSDC) { 3 };
        };
    };

    private func tokenTypeToText(t: TokenType): Text {
        switch (t) {
            case (#ICP) { "ICP" };
            case (#ckBTC) { "ckBTC" };
            case (#ckETH) { "ckETH" };
            case (#ckUSDC) { "ckUSDC" };
        };
    };

    private func getTokenDecimals(tokenType: TokenType): Nat {
        switch (tokenType) {
            case (#ICP) { 8 };
            case (#ckBTC) { 8 };
            case (#ckETH) { 18 };
            case (#ckUSDC) { 6 };
        };
    };

    // Upgrade hooks
    system func preupgrade() {
        balancesArray := Iter.toArray(balances.entries());
        transactionsArray := Buffer.toArray(transactions);
    };

    system func postupgrade() {
        for ((tokenType, balance) in balancesArray.vals()) {
            balances.put(tokenType, balance);
        };
        for (tx in transactionsArray.vals()) {
            transactions.add(tx);
        };
        balancesArray := [];
        transactionsArray := [];
    };

    // Initialize balances for all supported tokens
    private func initializeBalances() {
        if (balances.size() == 0) {
            balances.put(#ICP, 0);
            balances.put(#ckBTC, 0);
            balances.put(#ckETH, 0);
            balances.put(#ckUSDC, 0);
        };
    };

    // Generate transaction ID
    private func generateTransactionId(): Text {
        transactionCounter += 1;
        "TX-" # Nat.toText(transactionCounter) # "-" # Nat.toText(Int.abs(Time.now()));
    };

    // Public query functions
    public query func getOwner(): async Principal {
        owner
    };

    public query func getWalletAddress(): async Text {
        Principal.toText(Principal.fromActor(this))
    };

    public query func getBalance(tokenType: TokenType): async Nat {
        initializeBalances();
        switch (balances.get(tokenType)) {
            case (?balance) { balance };
            case null { 0 };
        };
    };

    public query func getAllBalances(): async [TokenBalance] {
        initializeBalances();
        let buffer = Buffer.Buffer<TokenBalance>(4);
        for ((tokenType, balance) in balances.entries()) {
            buffer.add({
                tokenType = tokenType;
                balance = balance;
                decimals = getTokenDecimals(tokenType);
            });
        };
        Buffer.toArray(buffer);
    };

    public query func getTransactionHistory(limit: ?Nat): async [Transaction] {
        let txLimit = switch (limit) {
            case (?l) { if (l > 100) { 100 } else { l } };
            case null { 50 };
        };
        
        let size = transactions.size();
        let start = if (size > txLimit) { size - txLimit } else { 0 };
        let result = Buffer.Buffer<Transaction>(txLimit);
        
        var i = start;
        while (i < size) {
            result.add(transactions.get(i));
            i += 1;
        };
        
        Buffer.toArray(result);
    };

    public query func getTransaction(txId: Text): async ?Transaction {
        for (tx in transactions.vals()) {
            if (tx.id == txId) {
                return ?tx;
            };
        };
        null
    };

    // Deposit function (public - anyone can deposit)
    public shared(msg) func deposit(tokenType: TokenType, amount: Nat, memo: ?Text): async Result.Result<Text, Text> {
        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };

        initializeBalances();
        
        // Update balance
        let currentBalance = switch (balances.get(tokenType)) {
            case (?bal) { bal };
            case null { 0 };
        };
        balances.put(tokenType, currentBalance + amount);

        // Record transaction
        let txId = generateTransactionId();
        let transaction: Transaction = {
            id = txId;
            txType = #Deposit;
            tokenType = tokenType;
            amount = amount;
            from = ?Principal.toText(msg.caller);
            to = ?Principal.toText(Principal.fromActor(this));
            timestamp = Time.now();
            status = #Completed;
            memo = memo;
        };
        transactions.add(transaction);

        #ok(txId)
    };

    // Withdraw function (restricted to owner only)
    public shared(msg) func withdraw(tokenType: TokenType, amount: Nat, recipient: Text, memo: ?Text): async Result.Result<Text, Text> {
        // Verify caller is owner
        if (msg.caller != owner) {
            return #err("Unauthorized: Only wallet owner can withdraw");
        };

        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };

        initializeBalances();

        // Check balance
        let currentBalance = switch (balances.get(tokenType)) {
            case (?bal) { bal };
            case null { 0 };
        };

        if (currentBalance < amount) {
            return #err("Insufficient balance");
        };

        // Update balance
        balances.put(tokenType, currentBalance - amount);

        // Record transaction
        let txId = generateTransactionId();
        let transaction: Transaction = {
            id = txId;
            txType = #Withdrawal;
            tokenType = tokenType;
            amount = amount;
            from = ?Principal.toText(Principal.fromActor(this));
            to = ?recipient;
            timestamp = Time.now();
            status = #Completed;
            memo = memo;
        };
        transactions.add(transaction);

        #ok(txId)
    };

    // Internal transfer function (restricted to owner)
    public shared(msg) func transfer(tokenType: TokenType, amount: Nat, toWallet: Principal, memo: ?Text): async Result.Result<Text, Text> {
        // Verify caller is owner
        if (msg.caller != owner) {
            return #err("Unauthorized: Only wallet owner can transfer");
        };

        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };

        initializeBalances();

        // Check balance
        let currentBalance = switch (balances.get(tokenType)) {
            case (?bal) { bal };
            case null { 0 };
        };

        if (currentBalance < amount) {
            return #err("Insufficient balance");
        };

        // Update balance
        balances.put(tokenType, currentBalance - amount);

        // Record transaction
        let txId = generateTransactionId();
        let transaction: Transaction = {
            id = txId;
            txType = #Transfer;
            tokenType = tokenType;
            amount = amount;
            from = ?Principal.toText(Principal.fromActor(this));
            to = ?Principal.toText(toWallet);
            timestamp = Time.now();
            status = #Completed;
            memo = memo;
        };
        transactions.add(transaction);

        #ok(txId)
    };

    // Update token canister (admin/owner only)
    public shared(msg) func setTokenCanister(tokenType: TokenType, canisterId: Principal): async Result.Result<(), Text> {
        if (msg.caller != owner) {
            return #err("Unauthorized: Only owner can set token canisters");
        };
        tokenCanisters.put(tokenType, canisterId);
        #ok(())
    };

    // Get token canister
    public query func getTokenCanister(tokenType: TokenType): async ?Principal {
        tokenCanisters.get(tokenType)
    };

    // Admin function to get all transactions count
    public query func getTransactionCount(): async Nat {
        transactions.size()
    };

    // Health check
    public query func healthCheck(): async Bool {
        true
    };
}


