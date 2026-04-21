# Supra L1 Testnet Integration Guide

> **Status:** Ready to implement | **Blockers:** Frontend SDK swap required | **Est. Time:** 2-4 days

---

## 🎯 Overview

Your suplock-protocol has **production-ready Move contracts** but the frontend is using **Ethereum-oriented libraries** (ethers, wagmi) that cannot interact with Supra L1 Move VM. This guide gets your dApp talking to Supra testnet in 3 phases.

---

## Phase 1: Smart Contract Validation ✅ Compiler Rules

### What to Check

Use the **4 Compiler Rules** from supra-dev-skills SKILL.md:

**Rule 1: Comments must be `//` not `///`**
```bash
grep -r "///" smart-contracts/supra/suplock/sources/ && echo "FAIL: Found ///" || echo "PASS"
```

**Rule 2: ASCII-only (no emoji/unicode)**
```bash
file smart-contracts/supra/suplock/sources/*.move | grep -i "UTF" && echo "FAIL: Non-ASCII found" || echo "PASS"
```

**Rule 3: Type casts need `(expr as T)` — all casts**
```bash
grep -E "[^(] as (u|U)" smart-contracts/supra/suplock/sources/*.move && echo "WARN: Check these casts" || echo "PASS"
```

**Rule 4: `acquires` lists must be exact**
```bash
# Manually review each public/entry function — verify:
# - All accessed global storage is listed
# - No unused acquires declarations
```

### Checklist

- [ ] Review [yield_vaults.move](smart-contracts/supra/suplock/yield_vaults.move) for VRF usage
- [ ] Verify dVRF 3.0 pattern (`permit_cap<T>` correct)
- [ ] Pin Move.toml to stable SupraFramework commit (not `rev = "dev"`)
- [ ] Run `supra move compile` in container — 0 errors
- [ ] Run `supra move test` — all tests pass

### Resources
- 📖 [supra-dev-skills/SKILL.md](supra-dev-skills-reference/SKILL.md) - Compiler rules (lines 23-150)
- 📖 [supra-dev-skills/references/core_topics.md](supra-dev-skills-reference/references/core_topics.md)

---

## Phase 2: Frontend SDK Swap — Replace ethers with Supra L1 SDK

### Current Problem

```typescript
// WRONG - ethers/wagmi won't work on Supra Move VM
import { ethers } from 'ethers';
import { useAccount, useConnect } from 'wagmi';
```

Supra L1 uses **Move VM** (not EVM), so Ethereum libraries fail.

### Solution: Use Supra TypeScript SDK

**Install:**
```bash
cd frontend/suplock-dapp
npm install @supralabs/supra-l1-sdk
# or  
bun add @supralabs/supra-l1-sdk
```

**SDK Docs:** https://github.com/Entropy-Foundation/supra-l1-sdk

### Tasks

#### Task 1: Create `src/lib/supra-client.ts`

```typescript
import { getSupraClient } from '@supralabs/supra-l1-sdk';

// Testnet RPC - Use /rpc/v3/ (v1/v2 deprecated)
const RPC_URL = 'https://testnet.supra.com/rpc/v3/';

export const getSupraRPCClient = async () => {
  return getSupraClient({
    nodeUrl: RPC_URL,
  });
};

export { RPC_URL };
```

#### Task 2: Update `src/contexts/WalletContext.tsx`

Replace ethers/wagmi imports:

**Before:**
```typescript
import { ethers } from 'ethers';
import { useAccount, useConnect } from 'wagmi';
```

**After:**
```typescript
import { getSupraRPCClient, RPC_URL } from '@/lib/supra-client';
// StarKey wallet pattern from supra-dev-skills/references/starkey_integration.md
```

#### Task 3: Implement StarKey Wallet Connection

Create `src/lib/starkey-wallet.ts`:

```typescript
// Reference: supra-dev-skills/references/starkey_integration.md
// Implement:
// 1. Check if window.starkey exists
// 2. Request account connection
// 3. Get account address + public key
// 4. Sign transactions using StarKey

export async function connectStarKeyWallet() {
  if (!window.starkey) {
    throw new Error('StarKey wallet not installed');
  }
  
  const [account] = await window.starkey.connect();
  return account;
}

export async function signTransactionWithStarKey(tx: SerializedRawTxObject) {
  const signed = await window.starkey.signTransaction(tx);
  return signed;
}
```

#### Task 4: Replace Contract Calls

**Before (ethers):**
```typescript
const contract = new ethers.Contract(address, abi, signer);
const result = await contract.myFunction();
```

**After (Supra SDK):**
```typescript
import { createSerializedRawTxObject, sendTxUsingSerializedRawTransaction } from '@supralabs/supra-l1-sdk';

// View call (read-only)
const result = await client.invokeViewMethod({
  target: '0x...::module::function',
  typeArguments: ['0x1::aptos_coin::AptosCoin'],
  functionArguments: [arg1, arg2],
});

// State-modifying call
const txPayload = {
  function: '0x...::module::function',
  typeArguments: [],
  arguments: [arg1, arg2],
};

const serializedTx = createSerializedRawTxObject(txPayload, accountAddress, gasLimit);
const signedTx = await signTransactionWithStarKey(serializedTx);
const txHash = await sendTxUsingSerializedRawTransaction(client, signedTx);
```

### Resources
- 📖 [supra-dev-skills/references/sdk_guide.md](supra-dev-skills-reference/references/sdk_guide.md)
- 📖 [supra-dev-skills/references/starkey_integration.md](supra-dev-skills-reference/references/starkey_integration.md)
- 🔗 [Supra TypeScript SDK](https://github.com/Entropy-Foundation/supra-l1-sdk)

---

## Phase 3: Test on Supra Testnet

### Prerequisites

1. **StarKey Wallet** installed + funded with testnet SUPRA
   - Get testnet faucet: https://testnet-faucet.supra.com/
2. **Smart contracts deployed** to testnet
   ```bash
   cd smart-contracts/supra/suplock
   supra move publish --network testnet --account suplock
   ```

### Test Flow

1. **Connect Wallet**
   - [ ] Frontend loads, shows "Connect StarKey" button
   - [ ] Click → StarKey prompts user to connect
   - [ ] Display user's address & balance

2. **View Function Call** (read-only, free)
   - [ ] Fetch user's lock amount: `vesupra::get_lock_amount(user)`
   - [ ] Fetch DAO balance: `supreserve::get_treasury_balance()`
   - [ ] Display on Overview tab

3. **State-Modifying Call** (costs gas)
   - [ ] **Lock SUPRA** (5 SUPRA, 1 year lock)
     - Create lock → Sign with StarKey → Wait for confirmation
     - Poll `/rpc/v3/transaction/txbyhash` for status
   - [ ] **Vote on Proposal**
     - Vote yes/no → Sign → Confirm

4. **Error Handling**
   - [ ] Insufficient balance error
   - [ ] Lock duration out of range (3mo - 4yr)
   - [ ] Proposal expired
   - [ ] Wallet not connected

### Test Checklist

- [ ] Homepage connects to wallet
- [ ] Can see connected address
- [ ] Can query SUPRA balance
- [ ] Can lock SUPRA (small amount, 3-month lock)
- [ ] Can view pending proposals
- [ ] Can vote on proposal
- [ ] All gas fees display correctly
- [ ] Transactions show in Explorer: https://tnexplorer.supra.com/

---

## Files to Update (Summary)

| File | Change | Priority |
|------|--------|----------|
| `frontend/suplock-dapp/package.json` | Add `@supralabs/supra-l1-sdk` | 🔴 Critical |
| `frontend/suplock-dapp/src/contexts/WalletContext.tsx` | Replace ethers → Supra SDK | 🔴 Critical |
| `frontend/suplock-dapp/src/lib/supra-client.ts` | NEW - RPC client setup | 🔴 Critical |
| `frontend/suplock-dapp/src/lib/starkey-wallet.ts` | NEW - Wallet connection | 🔴 Critical |
| `frontend/suplock-dapp/src/pages/Locking.tsx` | Update lock() call signature | 🟡 High |
| `frontend/suplock-dapp/src/pages/Governance.tsx` | Update vote() call signature | 🟡 High |
| `smart-contracts/supra/suplock/Move.toml` | Pin SupraFramework commit | 🟡 High |
| `smart-contracts/supra/suplock/sources/*.move` | Validate 4 compiler rules | 🟡 High |

---

## Troubleshooting

### "Cannot find module '@supralabs/supra-l1-sdk'"
```bash
cd frontend/suplock-dapp
npm install @supralabs/supra-l1-sdk@latest
npm list @supralabs/supra-l1-sdk  # Verify installed
```

### "RPC endpoint returned 404"
- ✅ Confirmed working: `https://testnet.supra.com/rpc/v3/`
- ❌ Don't use: `https://testnet.supra.com/rpc/v1/` (deprecated)

### "StarKey wallet_sign transaction failed"
- [ ] Verify account has testnet SUPRA (check balance first)
- [ ] Verify gas limit is sufficient (query simulation)
- [ ] Check StarKey version is latest

### "Contract call returns 'module not found'"
- [ ] Verify contract address is correct (deployed address)
- [ ] Verify function signature matches Move contract exactly
- [ ] Ensure type arguments are in correct order

---

## Reference Materials

All in `supra-dev-skills-reference/`:

| File | Contains |
|------|----------|
| `SKILL.md` | 4 compiler rules, Move fundamentals, CLI commands |
| `references/sdk_guide.md` | TypeScript SDK patterns, BCS encoding |
| `references/starkey_integration.md` | Wallet connection, signing, gas estimation |
| `references/core_topics.md` | Move language deep-dive |
| `references/patterns.md` | Common contract patterns |
| `references/supra_vs_aptos.md` | Gotchas when migrating from Aptos |

---

## Next Steps

**Immediate:**
1. [ ] Validate smart contracts against 4 compiler rules
2. [ ] Create `src/lib/supra-client.ts` with RPC setup
3. [ ] Install `@supralabs/supra-l1-sdk`

**Short-term (this week):**
4. [ ] Implement StarKey wallet connection
5. [ ] Update WalletContext.tsx
6. [ ] Test view calls (lock amounts, balances)

**Testing (end of week):**
7. [ ] Deploy contracts to testnet
8. [ ] Test locking flow end-to-end
9. [ ] Test governance voting
10. [ ] Verify all tabs work (Overview, Governance, Vaults, Dividends, Bridge)

---

**Questions?** Check `supra-dev-skills-reference/` for specific patterns or reference guide sections.
