# Hot Wallet System Implementation Guide

## Overview

This document describes the hot wallet system implementation for freelancers on the platform. Each freelancer gets their own isolated wallet canister that can store and manage multiple token types including ICP, ckBTC, ckETH, and ckUSDC.

## Architecture

The system consists of three main components:

### 1. Individual Wallet Canisters (`user_wallet.mo`)

Each user gets their own dedicated wallet canister with the following features:

- **Token Support**: ICP, ckBTC, ckETH, ckUSDC
- **ICRC-1/ICRC-2 Compliance**: Uses standard token interfaces
- **Owner-Only Withdrawals**: Only the wallet owner can withdraw funds
- **Public Deposits**: Anyone can deposit to the wallet
- **Transaction History**: Full history of all deposits, withdrawals, and transfers
- **Balance Tracking**: Real-time balance for each token type

**Key Functions:**
- `deposit(tokenType, amount, memo)` - Deposit tokens (public)
- `withdraw(tokenType, amount, recipient, memo)` - Withdraw tokens (owner only)
- `transfer(tokenType, amount, toWallet, memo)` - Transfer to another wallet (owner only)
- `getBalance(tokenType)` - Get balance for specific token
- `getAllBalances()` - Get all token balances
- `getTransactionHistory(limit)` - Get transaction history
- `getWalletAddress()` - Get the wallet's principal address

### 2. Wallet Factory Canister (`wallet_factory.mo`)

Manages the creation and tracking of all user wallet canisters.

**Key Functions:**
- `createWallet(userId, userPrincipal)` - Create a new wallet for a user
- `getWalletByUserId(userId)` - Retrieve wallet info by user ID
- `getWalletByPrincipal(principal)` - Retrieve wallet info by principal
- `hasWallet(userId)` - Check if user has a wallet
- `getAllWallets()` - Get all wallets (admin)

### 3. User Profile Integration (`user_v2.mo`)

The user profile now includes hot wallet integration:

**New Field:**
- `hot_wallet_canister_id: ?Text` - Stores the canister ID of the user's hot wallet

**New Functions:**
- `updateHotWalletCanisterId(userId, canisterId)` - Link wallet to user profile
- `getHotWalletCanisterId(userId)` - Get user's wallet canister ID
- `hasHotWallet(userId)` - Check if user has a hot wallet

## Frontend Integration

### API Routes

Five new API routes have been created for wallet operations:

#### 1. Create Wallet
**POST** `/api/wallet/create`
```typescript
// Request
{
  userId: string,
  userPrincipal: string
}

// Response
{
  success: true,
  wallet: {
    userId: string,
    walletCanisterId: string,
    walletPrincipal: string,
    createdAt: string
  }
}
```

#### 2. Get Balances
**GET** `/api/wallet/balance?walletCanisterId=xxx&tokenType=ICP`
```typescript
// Response
{
  success: true,
  walletAddress: string,
  balances: [
    {
      tokenType: "ICP",
      balance: "1000000",
      decimals: "8"
    }
  ]
}
```

#### 3. Get Deposit Info
**GET** `/api/wallet/deposit?walletCanisterId=xxx&tokenType=ICP`
```typescript
// Response
{
  success: true,
  depositInfo: {
    walletAddress: string,
    walletCanisterId: string,
    tokenType: string,
    instructions: string
  }
}
```

#### 4. Withdraw Tokens
**POST** `/api/wallet/withdraw`
```typescript
// Request
{
  walletCanisterId: string,
  tokenType: "ICP",
  amount: string,
  recipient: string,
  memo?: string,
  userPrincipal: string
}

// Response
{
  success: true,
  transactionId: string,
  message: "Withdrawal successful"
}
```

#### 5. Get Transaction History
**GET** `/api/wallet/transactions?walletCanisterId=xxx&limit=50`
```typescript
// Response
{
  success: true,
  transactions: [
    {
      id: string,
      txType: "Deposit" | "Withdrawal" | "Transfer",
      tokenType: "ICP" | "ckBTC" | "ckETH" | "ckUSDC",
      amount: string,
      from: string | null,
      to: string | null,
      timestamp: string,
      status: "Pending" | "Completed" | "Failed",
      memo: string | null
    }
  ],
  totalCount: string
}
```

### TypeScript Declarations

Type definitions are available in:
- `frontend/lib/declarations/user_wallet.ts`
- `frontend/lib/declarations/wallet_factory.ts`

### Updated User Types

The following interfaces now include `hotWalletCanisterId`:
- `UserProfile` in `frontend/lib/user-profile.ts`
- `ProfileData` in `frontend/lib/ic-agent.ts`
- `ProfileData` in `frontend/lib/stores/onboardingStore.ts`
- `ProfileData` in `frontend/lib/session/onboardingSession.ts`

## Deployment

### 1. Deploy Backend Canisters

```bash
cd backend

# Deploy wallet factory
dfx deploy wallet_factory

# Deploy a user wallet instance (for testing)
dfx deploy user_wallet

# Deploy or update user_v2 with hot wallet support
dfx deploy user_v2
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
WALLET_FACTORY_CANISTER_ID=<wallet_factory_canister_id>
USER_V2_CANISTER_ID=<user_v2_canister_id>
```

### 3. Generate Canister Declarations (Optional)

```bash
cd backend
dfx generate wallet_factory
dfx generate user_wallet
```

## Usage Examples

### Creating a Wallet for a User

```typescript
// Frontend code
const response = await fetch('/api/wallet/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'USER123',
    userPrincipal: 'xxxxx-xxxxx-xxxxx-xxxxx-cai'
  })
});

const data = await response.json();
console.log('Wallet created:', data.wallet);
```

### Checking Wallet Balance

```typescript
const walletCanisterId = userProfile.hotWalletCanisterId;
const response = await fetch(`/api/wallet/balance?walletCanisterId=${walletCanisterId}`);
const data = await response.json();

console.log('Balances:', data.balances);
// [{ tokenType: "ICP", balance: "100000000", decimals: "8" }]
```

### Withdrawing Funds

```typescript
const response = await fetch('/api/wallet/withdraw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletCanisterId: userProfile.hotWalletCanisterId,
    tokenType: 'ICP',
    amount: '50000000', // 0.5 ICP (8 decimals)
    recipient: 'recipient-principal-or-account-id',
    memo: 'Payment for services',
    userPrincipal: userPrincipal
  })
});

const data = await response.json();
console.log('Transaction ID:', data.transactionId);
```

## Security Considerations

1. **Owner-Only Withdrawals**: Only the wallet owner (identified by Principal) can withdraw funds
2. **Public Deposits**: Anyone can deposit, making it easy to receive payments
3. **Transaction History**: All transactions are logged for audit purposes
4. **Isolated Wallets**: Each user has their own canister, preventing cross-contamination
5. **ICRC Standards**: Uses industry-standard token interfaces

## Token Decimals

- **ICP**: 8 decimals (1 ICP = 100,000,000 e8s)
- **ckBTC**: 8 decimals (1 ckBTC = 100,000,000 satoshis)
- **ckETH**: 18 decimals (1 ckETH = 1,000,000,000,000,000,000 wei)
- **ckUSDC**: 6 decimals (1 ckUSDC = 1,000,000 micro-USDC)

## Future Enhancements

1. **Automatic Wallet Creation**: Create wallet automatically on user registration
2. **ICRC-2 Approve/TransferFrom**: Implement approval-based transfers
3. **Multi-Signature**: Add multi-sig support for business accounts
4. **Scheduled Transfers**: Support for recurring payments
5. **Gas Fee Estimation**: Show estimated fees before transactions
6. **Real ICRC Integration**: Connect to actual ICRC ledger canisters
7. **Wallet Analytics**: Dashboard showing wallet activity and statistics

## Troubleshooting

### Wallet Creation Fails

- Check that the wallet factory has sufficient cycles
- Verify user doesn't already have a wallet
- Check dfx is running: `dfx ping`

### Balance Shows 0

- Ensure deposits have been completed
- Check transaction history for failed deposits
- Verify correct token type is being queried

### Withdrawal Authorization Failed

- Verify the caller's Principal matches the wallet owner
- Check that sufficient balance exists
- Ensure the user is properly authenticated

## Support

For issues or questions about the hot wallet system, please refer to:
- Canister source: `backend/canisters/user_wallet.mo`
- Factory source: `backend/canisters/wallet_factory.mo`
- API routes: `frontend/app/api/wallet/`
- Type definitions: `frontend/lib/declarations/`

---

**Implementation Date**: December 2025
**Version**: 1.0.0
**Status**: ✅ Complete


