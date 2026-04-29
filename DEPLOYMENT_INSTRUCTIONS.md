# SUPLOCK Protocol - Complete Deployment Guide

> **Last Updated**: April 29, 2026  
> **Status**: Ready for Supra Testnet Deployment  
> **Contracts**: Compiled ✓ | Fixed ✓ | Ready for Publishing

## 🚀 Quick Deployment Steps

### Step 1: Create Supra Profile (Interactive)

Run this command in an interactive terminal:

```bash
docker run -it --rm -v ~/.supra:/root/.supra \
  --entrypoint /supra/supra \
  supraoracles/supra-testnet-validator-node:v10.0.6 \
  profile new suplock_testnet --network testnet
```

**When prompted:**
- Enter a strong password (uppercase, lowercase, numbers, special chars)
- Confirm the password
- Review and confirm testnet network settings

**Save the output showing:**
- Account Address: `0x...`
- Public Key: `0x...`

### Step 2: Compile Smart Contracts

```bash
./deploy_supra.sh compile
```

✓ Compiles all Move contracts with Aptos CLI  
✓ Resolves dependencies from `aptos-labs/aptos-core`

### Step 3: Deploy to Testnet

```bash
./deploy_supra.sh deploy
```

**Expected Output:**
```
[SUCCESS] Contract deployment complete!
View transaction on: https://testnet.suprascan.io
```

**Save the Package ID** from the deployment output (format: `0x...`)

### Step 4: Setup Environment Variables

```bash
./deploy_supra.sh env
```

**When prompted, provide these values:**

| Prompt | Example Value | Description |
|--------|---------------|-------------|
| RPC URL | `https://rpc-testnet.supra.com` | Supra testnet RPC endpoint |
| Package ID | `0xabc123...` | From deployment output (Step 3) |
| Core State Address | `0xabc123...::suplock_core` | Package ID + module name |
| veSUPRA Registry Address | `0xabc123...::vesupra` | Package ID + module name |
| SUPReserve Address | `0xabc123...::supreserve` | Package ID + module name |
| Vault Registry Address | `0xabc123...::yield_vaults` | Package ID + module name |

### Step 5: Deploy Frontend & Backend

```bash
./deploy_supra.sh frontend   # Build Next.js frontend
./deploy_supra.sh backend    # Build Node.js backend
```

---

## 📋 Deployed Contract Modules

### Core Modules
| Module | Address Pattern | Purpose |
|--------|-----------------|---------|
| **suplock_core** | `PACKAGE_ID::suplock_core` | Core locking mechanism |
| **vesupra** | `PACKAGE_ID::vesupra` | Vote-escrowed SUPRA tracking |
| **supreserve** | `PACKAGE_ID::supreserve` | Token reserve & adaptive allocation |
| **yield_vaults** | `PACKAGE_ID::yield_vaults` | Yield farming & vault management |

### Integration Modules
| Module | Purpose |
|--------|---------|
| **restake_integration** | Restaking yield integration |
| **compound_yield_strategies** | Auto-compounding strategies |
| **gas_optimization** | Batch processing for efficiency |
| **dvrf_integration** | Distributed verifiable randomness |
| **oracle_integration** | Price feed integration |
| **stablecoin** | Stablecoin mechanisms |

---

## 🔍 Understanding the Registry Addresses

### Package ID
- **Format**: `0xabc123def456...`
- **Source**: First line of deployment output
- **Purpose**: Root address of all deployed modules

### veSUPRA Registry Address
- **Format**: `PACKAGE_ID::vesupra`
- **Contains**: Vote-escrow token state
- **Used by**: Frontend for fetching user balances, vote weights
- **Example**: If Package ID is `0x123`, then veSUPRA address is `0x123::vesupra`

### Core State Address  
- **Format**: `PACKAGE_ID::suplock_core`
- **Contains**: Global lock state, parameters, aggregators
- **Used by**: All locking operations

### SUPReserve Address
- **Format**: `PACKAGE_ID::supreserve`
- **Contains**: Reserve balance, yield distributions
- **Used by**: Yield accrual and dividend distribution

### Vault Registry Address
- **Format**: `PACKAGE_ID::yield_vaults`
- **Contains**: All active vaults, PT/YT state
- **Used by**: Vault operations and yield farming

---

## 🧪 Testing After Deployment

### 1. Verify Profile
```bash
docker run --rm -v ~/.supra:/root/.supra \
  --entrypoint /supra/supra \
  supraoracles/supra-testnet-validator-node:v10.0.6 \
  profile list
```

### 2. Check Account Balance
```bash
docker run --rm -v ~/.supra:/root/.supra \
  --entrypoint /supra/supra \
  supraoracles/supra-testnet-validator-node:v10.0.6 \
  move account balance --profile suplock_testnet
```

### 3. View Deployment on Explorer
- Go to: https://testnet.suprascan.io
- Search for your account address or package ID
- Verify all modules are published

---

## ❌ Troubleshooting

### Profile Creation Issues
**Error: "No such file or directory"**
```bash
# Ensure .supra directory exists
mkdir -p ~/.supra

# Try creating profile again
docker run -it --rm -v ~/.supra:/root/.supra \
  --entrypoint /supra/supra \
  supraoracles/supra-testnet-validator-node:v10.0.6 \
  profile new suplock_testnet --network testnet
```

### Compilation Errors
**If contracts fail to compile:**
```bash
# Clean and retry
cd smart-contracts/supra/suplock
rm -f Move.lock
cd /workspaces/suplock-protocols
./deploy_supra.sh compile
```

### Deployment Insufficient Balance
**Error: "Insufficient gas"**
```bash
# Fund account from testnet faucet
docker run --rm -v ~/.supra:/root/.supra \
  --entrypoint /supra/supra \
  supraoracles/supra-testnet-validator-node:v10.0.6 \
  move account fund-with-faucet --profile suplock_testnet
```

---

## 📝 Environment File Location

After running `./deploy_supra.sh env`, check:
```bash
cat frontend/suplock-dapp/.env.local
```

**Expected content:**
```env
NEXT_PUBLIC_SUPRA_RPC_URL=https://rpc-testnet.supra.com
NEXT_PUBLIC_SUPRA_CHAIN_ID=8
NEXT_PUBLIC_SUPRA_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_CORE_STATE_ADDR=0x...::suplock_core
NEXT_PUBLIC_VE_REGISTRY_ADDR=0x...::vesupra
NEXT_PUBLIC_SUPRESERVE_ADDR=0x...::supreserve
NEXT_PUBLIC_VAULT_REGISTRY_ADDR=0x...::yield_vaults
NEXT_PUBLIC_INTENT_PROCESSOR_ADDR=0x...::yield_vaults
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLET_PROVIDERS=starkey,petra,martian
NEXT_PUBLIC_ENABLE_RESTAKING=true
NEXT_PUBLIC_ENABLE_DVRF=true
NEXT_PUBLIC_ENABLE_COMPOUND_YIELD=true
```

---

## 🎯 Next Steps

1. ✅ **Contracts compiled** - All Move syntax fixed
2. ⏳ **Profile creation** - Create in interactive terminal
3. ⏳ **Deploy** - Run `./deploy_supra.sh deploy`
4. ⏳ **Setup env** - Run `./deploy_supra.sh env` with your addresses
5. ⏳ **Frontend** - Deploy frontend with `./deploy_supra.sh frontend`
6. ⏳ **Backend** - Deploy backend with `./deploy_supra.sh backend`

---

## 📞 Support

- **Supra Docs**: https://docs.supra.com
- **Supra RPC**: https://rpc-testnet.supra.com
- **Explorer**: https://testnet.suprascan.io
- **Faucet**: Check Supra docs for testnet faucet access

---

**Happy deploying! 🚀**
