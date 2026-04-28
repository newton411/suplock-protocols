# SUPLOCK Protocol - Supra Testnet Deployment Guide

> **Status**: Production-ready for testnet deployment  
> **Last Updated**: April 2026  
> **Chain**: Supra L1 Testnet

## Prerequisites

### 1. System Requirements
- **Docker**: v20.10+
- **Node.js**: 18.x or higher
- **curl**: For CLI interactions
- **Git**: For version control

### 2. Check Installation
```bash
node --version    # v18.x+
npm --version     # 9.x+
docker --version  # 20.10+
curl --version
```

---

## Step 1: Supra CLI Setup

### Option A: Using Docker (Recommended)

```bash
# Pull the latest Supra CLI Docker image
docker pull supraoracles/supra-testnet-validator-node:latest

# Create an alias for convenient access
alias supra_cli='docker run -it --rm -v ~/.supra:/root/.supra supraoracles/supra-testnet-validator-node:latest'

# Test the installation
supra_cli supra --version
```

### Option B: Manual CLI Installation

Visit: https://docs.supra.com/install-supra-cli

---

## Step 2: Create Deployment Profile

A deployment profile contains your keypair for interacting with Supra.

```bash
# Generate ed25519 keypair for testnet deployment
supra_cli supra key generate --key-type ed25519 --profile suplock-testnet

# Output will show:
# Profile: suplock-testnet
# Public Key: 0x...
# Account Address: 0x...
```

**Save the Account Address** - You'll use this for funding and contract initialization.

### List Existing Profiles
```bash
supra_cli supra profile list
```

---

## Step 3: Fund Your Account (Testnet)

The account must have SUPRA tokens to pay for deployment transactions.

```bash
# Fund from testnet faucet
supra_cli supra move account fund-with-faucet \
  --profile suplock-testnet \
  --rpc-url https://rpc-testnet.supra.com

# Expected output: "Account successfully funded with test SUPRA"

# Check balance
supra_cli supra client balance --profile suplock-testnet
```

---

## Step 4: Prepare Move Contracts

### 4.1 Verify Contract Structure
```bash
cd /workspaces/suplock-protocols/smart-contracts/supra/suplock

# Ensure Move.toml exists and dependencies are correct
cat Move.toml

# Expected:
# [package]
# name = "suplock"
# version = "0.1.0"
#
# [dependencies]
# Stdlib = { git = "https://github.com/SupraOracles/supra-move-stdlib.git", rev = "main" }
# SupraFramework = { git = "https://github.com/SupraOracles/supra-framework.git", rev = "main" }
```

### 4.2 Fetch Dependencies
The current Supra CLI version resolves Move package dependencies during compilation.
Because `Move.toml` points at external git dependencies, you must have access to those repositories for compilation to succeed.

> Note: `supra move fetch-dependencies` is no longer available in this image; use `supra move tool compile` instead.

---

## Step 5: Compile Smart Contracts

```bash
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  -v /workspaces/suplock-protocols/smart-contracts/supra/suplock:/supra/move_workspace/suplock \
  supraoracles/supra-testnet-validator-node:latest \
  supra move tool compile --package-dir /supra/move_workspace/suplock

# Expected output:
# Compiling suplock_core.move
# Compiling vesupra.move
# Compiling supreserve.move
# Compiling yield_vaults.move
# Compiling oracle_integration.move
# Compiling restake_integration.move
# Compiling dvrf_integration.move
# Compiling gas_optimization.move
# Compiling compound_yield_strategies.move
# Compiling stablecoin.move
# Compiled successfully!
```

### Compiler Rules (Critical)
✓ Use `//` not `///` for comments  
✓ ASCII only - no Unicode characters  
✓ Type casts must use parentheses: `(expr as T)`  
✓ `acquires` list must be exact  
✓ Use `supra_framework` not `aptos_framework`  

---

## Step 6: Deploy to Supra Testnet

```bash
# Publish contract package to testnet
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  -v /workspaces/suplock-protocols/smart-contracts/supra/suplock:/supra/move_workspace/suplock \
  supraoracles/supra-testnet-validator-node:latest \
  supra move tool publish \
    --package-dir /supra/move_workspace/suplock \
    --profile suplock-testnet \
    --rpc-url https://rpc-testnet.supra.com

# Expected output:
# ✓ Package published successfully
# Transaction ID: 0x...
# Package ID: 0x...
# Object ID: 0x...
```

### Save Deployment Information
```json
{
  "network": "supra-testnet",
  "deployment_date": "2026-04-21",
  "profile": "suplock-testnet",
  "account_address": "0x...",
  "package_id": "0x...",
  "transaction_id": "0x...",
  "modules": {
    "suplock_core": "0x...::suplock_core",
    "vesupra": "0x...::vesupra",
    "supreserve": "0x...::supreserve",
    "yield_vaults": "0x...::yield_vaults",
    "oracle_integration": "0x...::oracle_integration",
    "restake_integration": "0x...::restake_integration",
    "dvrf_integration": "0x...::dvrf_integration",
    "compound_yield_strategies": "0x...::compound_yield_strategies",
    "stablecoin": "0x...::stablecoin"
  }
}
```

---

## Step 7: Initialize Smart Contract Modules

After deployment, initialize each module:

### 7.1 Initialize SUPLOCK Core
```bash
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra transaction call \
    --profile suplock-testnet \
    --rpc-url https://rpc-testnet.supra.com \
    --package-id 0x... \
    --module suplock_core \
    --function initialize_protocol
```

### 7.2 Initialize veSUPRA Governance
```bash
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra transaction call \
    --profile suplock-testnet \
    --rpc-url https://rpc-testnet.supra.com \
    --package-id 0x... \
    --module vesupra \
    --function initialize_governance_dao
```

### 7.3 Initialize SUPReserve
```bash
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra transaction call \
    --profile suplock-testnet \
    --rpc-url https://rpc-testnet.supra.com \
    --package-id 0x... \
    --module supreserve \
    --function initialize_supreserve
```

### 7.4 Initialize Yield Vaults
```bash
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra transaction call \
    --profile suplock-testnet \
    --rpc-url https://rpc-testnet.supra.com \
    --package-id 0x... \
    --module yield_vaults \
    --function initialize_vault_registry
```

---

## Step 8: Frontend Environment Configuration

Create `.env.local` in the frontend directory:

```bash
cd /workspaces/suplock-protocols/frontend/suplock-dapp

cat > .env.local << 'EOF'
# Supra Testnet Configuration
NEXT_PUBLIC_SUPRA_RPC_URL=https://rpc-testnet.supra.com
NEXT_PUBLIC_SUPRA_CHAIN_ID=8
NEXT_PUBLIC_SUPRA_NETWORK=testnet

# Smart Contracts
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_CORE_STATE_ADDR=0x...
NEXT_PUBLIC_VE_REGISTRY_ADDR=0x...
NEXT_PUBLIC_SUPRESERVE_ADDR=0x...
NEXT_PUBLIC_VAULT_REGISTRY_ADDR=0x...
NEXT_PUBLIC_INTENT_PROCESSOR_ADDR=0x...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000

# Wallet Configuration
NEXT_PUBLIC_WALLET_PROVIDERS=starkey,petra,martian

# Feature Flags
NEXT_PUBLIC_ENABLE_RESTAKING=true
NEXT_PUBLIC_ENABLE_DVRFmfsi=true
NEXT_PUBLIC_ENABLE_COMPOUND_YIELD=true
EOF
```

---

## Step 9: Deploy Frontend

### 9.1 Local Development
```bash
cd /workspaces/suplock-protocols/frontend/suplock-dapp

npm run dev
# Access at http://localhost:3000
```

### 9.2 Production Build
```bash
npm run build
npm run start
# Access at http://localhost:3000
```

### 9.3 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
cd /workspaces/suplock-protocols/frontend/suplock-dapp
vercel

# Follow prompts:
# 1. Link to Vercel project
# 2. Set production deployment
# 3. Add environment variables
```

**In Vercel Dashboard:**
1. Go to Project Settings > Environment Variables
2. Add all `.env.local` variables
3. Trigger redeploy

---

## Step 10: Deploy Backend API

### 10.1 Build Backend
```bash
cd /workspaces/suplock-protocols/backend/suplock-api

npm run build
```

### 10.2 Local Testing
```bash
npm run dev
# API runs on http://localhost:3001

# Test health endpoint
curl http://localhost:3001/health
# Response: { "status": "healthy", "timestamp": "..." }
```

### 10.3 Deploy to Hosting

**Option A: Render.com**
```bash
# Create render.yaml in backend directory
cat > render.yaml << 'EOF'
services:
  - type: web
    name: suplock-api
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: PORT
        value: 3001
      - key: NODE_ENV
        value: production
EOF

# Deploy via git
# Connect GitHub repo to Render
```

**Option B: Vercel Functions**
```bash
# Create vercel.json with serverless functions
# Deploy API endpoints as Vercel Functions
vercel
```

**Option C: Railway.app**
```bash
# Connect GitHub repo to Railway
# Auto-deploys on push
```

---

## Step 11: Configure Frontend-Backend Communication

Update [backend/suplock-api/src/index.ts](backend/suplock-api/src/index.ts):

```typescript
// Configure CORS for frontend URLs
app.use(cors({
  origin: [
    'http://localhost:3000',           // Local dev
    'http://localhost:3001',           // API local
    'https://suplock-dapp.vercel.app', // Production frontend
    'https://your-domain.com'          // Custom domain
  ],
  credentials: true
}));
```

Update [frontend/suplock-dapp/.env.local](frontend/suplock-dapp/.env.local):

```env
# Point to your deployed backend
NEXT_PUBLIC_API_URL=https://suplock-api.vercel.app
```

---

## Step 12: Testing Deployment

### 12.1 Smart Contracts
```bash
# Query contract state
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra client query-state

# Expected: View all deployed objects
```

### 12.2 Frontend
```bash
# Test core functionality
curl https://suplock-dapp.vercel.app
# Response: HTML frontend bundle
```

### 12.3 Backend API
```bash
# Test health check
curl https://suplock-api.vercel.app/health
# Expected: { "status": "healthy" }

# Test projections endpoint
curl https://suplock-api.vercel.app/api/projections?months=24
# Expected: [ { month: 1, price: ..., ... } ]
```

---

## Step 13: Monitoring & Maintenance

### View Transactions
```bash
# On Suprascan
https://testnet.suprascan.io/tx/0x...
```

### Monitor Smart Contract
```bash
# Query account resources
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra client query-owned-objects --address 0x...

# View contract events
docker run -it --rm \
  -v ~/.supra:/root/.supra \
  supraoracles/supra-testnet-validator-node:latest \
  supra client query-events --tx-digest 0x...
```

### Backend API Monitoring
```bash
# Check logs
# For Vercel: vercel logs
# For Render: Dashboard > Logs tab
# For Railway: Dashboard > Logs

# Monitor error rates
# Set up error tracking (Sentry.io)
```

---

## Troubleshooting

### Contract Compilation Errors

**Error**: `E01001: invalid character`
- **Cause**: Non-ASCII character in source (emoji, Unicode)
- **Fix**: Use ASCII only, remove emoji and special symbols

**Error**: `E02002: unnecessary or extraneous item`
- **Cause**: Extra item in `acquires` list
- **Fix**: Remove unused items from `acquires` declaration

**Error**: `E04020: missing acquires annotation`
- **Cause**: Function accessing global storage but not declaring `acquires`
- **Fix**: Add required resource types to `acquires` list

### Deployment Failures

**Error**: Account has insufficient SUPRA
- **Fix**: Fund account using faucet again
```bash
supra_cli supra move account fund-with-faucet --profile suplock-testnet
```

**Error**: Package dependency resolution fails
- **Fix**: Update dependencies
```bash
supra_cli supra move fetch-dependencies --package-dir ...
```

### Frontend Issues

**Error**: "Cannot connect to backend"
- **Fix**: Verify CORS configuration and API URL in .env.local

**Error**: "Wallet not detected"
- **Fix**: Install Starkey, Petra, or Martian wallet extension

---

## Production Migration Checklist

- [ ] All contracts tested on testnet
- [ ] Core functionality verified in frontend
- [ ] Backend API stress tested
- [ ] Monitor logs for errors
- [ ] Security audit completed
- [ ] Team review approved
- [ ] Change contract addresses for mainnet
- [ ] Test mainnet deployment on staging environment
- [ ] Prepare rollout plan
- [ ] Deploy to mainnet with monitoring

---

## Resources

- **Supra Docs**: https://docs.supra.com
- **Move Language**: https://move-language.github.io/
- **Supra Testnet Explorer**: https://testnet.suprascan.io
- **Supra CLI Docs**: https://docs.supra.com/cli
- **SDK Documentation**: https://docs.supra.com/sdk

---

## Support

For deployment issues:
1. Check logs: `docker logs supra_cli`
2. Verify RPC connectivity: `curl https://rpc-testnet.supra.com`
3. Reference: [COMPLETE_INFRASTRUCTURE_SUMMARY.md](COMPLETE_INFRASTRUCTURE_SUMMARY.md)
4. Github Issues: https://github.com/Entropy-Foundation/supra-move-stdlib/issues

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: April 21, 2026  
**Maintained by**: SUPLOCK Development Team
