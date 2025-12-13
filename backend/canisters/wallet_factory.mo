import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";

persistent actor WalletFactory {
    // Import the UserWallet canister type
    type UserWallet = actor {
        getOwner: query () -> async Principal;
        getWalletAddress: query () -> async Text;
    };

    // Types
    public type UserId = Text;
    public type WalletInfo = {
        userId: UserId;
        walletCanisterId: Principal;
        ownerPrincipal: Principal;
        createdAt: Int;
    };

    public type CreateWalletResult = {
        userId: UserId;
        walletCanisterId: Text;
        walletPrincipal: Principal;
        createdAt: Int;
    };

    // Storage
    private stable var walletEntriesArray: [(UserId, WalletInfo)] = [];
    private stable var principalToUserIdArray: [(Principal, UserId)] = [];
    private stable var walletCounter: Nat = 0;

    private flexible var userWallets = HashMap.HashMap<UserId, WalletInfo>(0, Text.equal, Text.hash);
    private flexible var principalToUserId = HashMap.HashMap<Principal, UserId>(0, Principal.equal, Principal.hash);

    // Minimum cycles required to create a wallet canister (0.5 TC)
    private let WALLET_CREATION_CYCLES: Nat = 500_000_000_000;

    // Upgrade hooks
    system func preupgrade() {
        walletEntriesArray := Iter.toArray(userWallets.entries());
        principalToUserIdArray := Iter.toArray(principalToUserId.entries());
    };

    system func postupgrade() {
        for ((userId, walletInfo) in walletEntriesArray.vals()) {
            userWallets.put(userId, walletInfo);
        };
        for ((principal, userId) in principalToUserIdArray.vals()) {
            principalToUserId.put(principal, userId);
        };
        walletEntriesArray := [];
        principalToUserIdArray := [];
    };

    // Create a new wallet for a user
    public shared(msg) func createWallet(userId: UserId, userPrincipal: Principal): async Result.Result<CreateWalletResult, Text> {
        // Check if user already has a wallet
        switch (userWallets.get(userId)) {
            case (?existing) {
                return #err("User already has a wallet: " # Principal.toText(existing.walletCanisterId));
            };
            case null {};
        };

        // Check if principal already has a wallet
        switch (principalToUserId.get(userPrincipal)) {
            case (?existingUserId) {
                return #err("Principal already has a wallet for user: " # existingUserId);
            };
            case null {};
        };

        // Create the wallet canister with cycles
        try {
            Cycles.add<system>(WALLET_CREATION_CYCLES);
            
            // In a real implementation, you would dynamically create the UserWallet actor
            // For now, we'll use a placeholder approach
            // let walletCanister = await UserWallet.UserWallet();
            
            // Since we can't dynamically instantiate in this version,
            // we'll store the wallet info and return a placeholder
            // In production, you'd use the IC management canister to create canisters
            
            let timestamp = Time.now();
            walletCounter += 1;
            
            // Generate a deterministic canister ID (in production, this comes from IC)
            let walletCanisterId = userPrincipal; // Placeholder - would be actual canister principal
            
            let walletInfo: WalletInfo = {
                userId = userId;
                walletCanisterId = walletCanisterId;
                ownerPrincipal = userPrincipal;
                createdAt = timestamp;
            };

            // Store the mapping
            userWallets.put(userId, walletInfo);
            principalToUserId.put(userPrincipal, userId);

            let result: CreateWalletResult = {
                userId = userId;
                walletCanisterId = Principal.toText(walletCanisterId);
                walletPrincipal = walletCanisterId;
                createdAt = timestamp;
            };

            #ok(result)
        } catch (e) {
            #err("Failed to create wallet: " # Error.message(e))
        };
    };

    // Advanced version: Create wallet using IC management canister
    public shared(msg) func createWalletAdvanced(userId: UserId, userPrincipal: Principal): async Result.Result<CreateWalletResult, Text> {
        // Check if user already has a wallet
        switch (userWallets.get(userId)) {
            case (?existing) {
                return #err("User already has a wallet: " # Principal.toText(existing.walletCanisterId));
            };
            case null {};
        };

        try {
            // IC Management Canister interface
            let ic = actor "aaaaa-aa" : actor {
                create_canister : { settings : ?{
                    controllers : ?[Principal];
                    compute_allocation : ?Nat;
                    memory_allocation : ?Nat;
                    freezing_threshold : ?Nat;
                } } -> async { canister_id : Principal };
                
                install_code : {
                    mode : { #install; #reinstall; #upgrade };
                    canister_id : Principal;
                    wasm_module : Blob;
                    arg : Blob;
                } -> async ();
            };

            // Add cycles for canister creation
            Cycles.add<system>(WALLET_CREATION_CYCLES);

            // Create canister with user as controller
            let canisterResult = await ic.create_canister({
                settings = ?{
                    controllers = ?[userPrincipal, Principal.fromActor(WalletFactory)];
                    compute_allocation = null;
                    memory_allocation = null;
                    freezing_threshold = null;
                };
            });

            let canisterId = canisterResult.canister_id;
            let timestamp = Time.now();
            walletCounter += 1;

            // Note: In production, you would also need to install the WASM code here
            // await ic.install_code({ ... });

            let walletInfo: WalletInfo = {
                userId = userId;
                walletCanisterId = canisterId;
                ownerPrincipal = userPrincipal;
                createdAt = timestamp;
            };

            // Store the mapping
            userWallets.put(userId, walletInfo);
            principalToUserId.put(userPrincipal, userId);

            let result: CreateWalletResult = {
                userId = userId;
                walletCanisterId = Principal.toText(canisterId);
                walletPrincipal = canisterId;
                createdAt = timestamp;
            };

            #ok(result)
        } catch (e) {
            #err("Failed to create wallet: " # Error.message(e))
        };
    };

    // Get wallet by user ID
    public query func getWalletByUserId(userId: UserId): async ?WalletInfo {
        userWallets.get(userId)
    };

    // Get wallet by principal
    public query func getWalletByPrincipal(principal: Principal): async ?WalletInfo {
        switch (principalToUserId.get(principal)) {
            case (?userId) { userWallets.get(userId) };
            case null { null };
        };
    };

    // Check if user has wallet
    public query func hasWallet(userId: UserId): async Bool {
        switch (userWallets.get(userId)) {
            case (?_) { true };
            case null { false };
        };
    };

    // Get all wallets (admin function)
    public query func getAllWallets(): async [WalletInfo] {
        let buffer = Buffer.Buffer<WalletInfo>(userWallets.size());
        for ((_, walletInfo) in userWallets.entries()) {
            buffer.add(walletInfo);
        };
        Buffer.toArray(buffer);
    };

    // Get wallet count
    public query func getWalletCount(): async Nat {
        userWallets.size()
    };

    // Get total wallets created (including any deleted)
    public query func getTotalWalletsCreated(): async Nat {
        walletCounter
    };

    // Delete wallet mapping (doesn't delete the actual canister)
    public shared(msg) func deleteWalletMapping(userId: UserId): async Result.Result<(), Text> {
        switch (userWallets.get(userId)) {
            case (?walletInfo) {
                userWallets.delete(userId);
                principalToUserId.delete(walletInfo.ownerPrincipal);
                #ok(())
            };
            case null {
                #err("Wallet not found for user: " # userId)
            };
        };
    };

    // Update wallet info (e.g., if canister ID changes)
    public shared(msg) func updateWalletInfo(userId: UserId, newCanisterId: Principal): async Result.Result<(), Text> {
        switch (userWallets.get(userId)) {
            case (?walletInfo) {
                let updatedInfo: WalletInfo = {
                    walletInfo with walletCanisterId = newCanisterId
                };
                userWallets.put(userId, updatedInfo);
                #ok(())
            };
            case null {
                #err("Wallet not found for user: " # userId)
            };
        };
    };

    // Get cycles balance of factory
    public query func getCyclesBalance(): async Nat {
        Cycles.balance()
    };

    // Health check
    public query func healthCheck(): async Bool {
        true
    };
}


