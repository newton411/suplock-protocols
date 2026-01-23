# SUPLOCK Protocol - Setup & Deployment Guide

## Prerequisites

- **Node.js**: 18.x or higher
- **Supra CLI**: Latest version (`supra` command available)
- **TypeScript**: 5.x
- **Git**: For version control
- **Move Compiler**: Included with Supra CLI

### Installation

#### Supra CLI
```bash
# Install via Supra package manager
# Visit https://supraoracles.com/docs/

# Verify installation
supra --version
```

#### Node.js & npm
```bash
# macOS (via Homebrew)
brew install node

# Linux (Ubuntu/Debian)
sudo apt update && sudo apt install nodejs npm

# Verify
node --version  # v18+
npm --version   # 9+
```

---

## Smart Contracts Setup

### 1. Initialize Project
```bash
cd smart-contracts/supra/suplock

# Install dependencies
supra move fetch-dependencies
```

### 2. Compile Contracts
```bash
# Compile Move code
supra move compile --move-2

# Expected output: All modules compiled successfully
```

### 3. Run Tests
```bash
# Execute unit tests
supra move test

# Output:
# Test suplock::suplock_core::test_create_lock ... ok
# Test suplock::suplock_core::test_boost_calculation ... ok
# Test suplock::supreserve::test_floor_check ... ok
# Test suplock::supreserve::test_distribution_allocations ... ok
# Test suplock::yield_vaults::test_vault_creation ... ok
# Test suplock::yield_vaults::test_yt_yield_calculation ... ok
```

### 4. Deploy to Testnet
```bash
# Publish contract package
supra move publish --network testnet

# Output:
# Transaction confirmed!
# Object ID: 0x...
# Package ID: 0x...
```

**Save the Package ID** - You'll need it for frontend configuration.

### 5. Initialize Modules (Post-Deployment)
```bash
# Call initialization functions with:
# supra transaction call \
#   --network testnet \
#   --package-id <PACKAGE_ID> \
#   --function initialize \
#   --module suplock_core

# Repeat for each module:
# - suplock::suplock_core::initialize
# - suplock::vesupra::initialize_ve_registry
# - suplock::vesupra::initialize_governance_dao
# - suplock::supreserve::initialize_supreserve
# - suplock::yield_vaults::initialize_vault_registry
# - suplock::yield_vaults::initialize_intent_processor
```

**Contract Addresses (Testnet):**
- Core State: `<address>`
- veSUPRA Registry: `<address>`
- SUPReserve: `<address>`
- Vault Registry: `<address>`
- Intent Processor: `<address>`

Store these in the frontend configuration.

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend/suplock-dapp

npm install
# or: yarn install
```

### 2. Environment Configuration
Create `.env.local`:
```env
NEXT_PUBLIC_SUPRA_RPC_URL=https://rpc-testnet.supra.com
NEXT_PUBLIC_SUPRA_CHAIN_ID=8
NEXT_PUBLIC_PACKAGE_ID=<Your Move Package ID>
NEXT_PUBLIC_CORE_STATE_ADDR=<Core State Address>
NEXT_PUBLIC_VE_REGISTRY_ADDR=<veSUPRA Registry Address>
NEXT_PUBLIC_SUPRESERVE_ADDR=<SUPReserve Address>
NEXT_PUBLIC_VAULT_REGISTRY_ADDR=<Vault Registry Address>
NEXT_PUBLIC_INTENT_PROCESSOR_ADDR=<Intent Processor Address>
```

### 3. Development Server
```bash
npm run dev

# Output:
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Access: [http://localhost:3000](http://localhost:3000)

### 4. Build for Production
```bash
npm run build
npm run start

# Output:
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 5. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to Vercel project (create new if needed)
# - Production: Yes
# - Settings: Accept defaults or customize
```

**Configuration in Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Add the above `.env.local` variables
3. Redeploy

---

## Backend API Setup

### 1. Install Dependencies
```bash
cd backend/suplock-api

npm install
# or: yarn install
```

### 2. Environment Configuration
Create `.env`:
```env
PORT=3001
NODE_ENV=development
SUPRA_RPC_URL=https://rpc-testnet.supra.com
```

### 3. Compile TypeScript
```bash
npm run build

# Output: Compiles src/ to dist/
```

### 4. Development Server
```bash
npm run dev

# Output:
# SUPLOCK API running on http://localhost:3001
# Available endpoints:
#   GET  /health
#   GET  /api/projections?months=24
#   ...
```

### 5. Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Projections
curl http://localhost:3001/api/projections?months=24

# Stats
curl http://localhost:3001/api/stats

# Floor status
curl http://localhost:3001/api/floor-status

# Calculate dividends
curl -X POST http://localhost:3001/api/calculate-dividends \
  -H "Content-Type: application/json" \
  -d '{
    "veSUPRABalance": 5000,
    "totalVeSupply": 45000000,
    "accumulatedFees": 2345678
  }'
```

### 6. Production Deployment

#### Option A: Heroku
```bash
# Create Heroku app
heroku create suplock-api

# Set environment variables
heroku config:set PORT=3001 NODE_ENV=production SUPRA_RPC_URL=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Option B: AWS Lambda
```bash
npm install -g serverless

# Create serverless.yml
serverless deploy

# Get endpoint from output
```

#### Option C: Docker (Any VPS)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

```bash
# Build and run
docker build -t suplock-api .
docker run -p 3001:3001 -e PORT=3001 suplock-api
```

---

## Full Stack Integration

### 1. Connect Frontend to Backend
Update `frontend/suplock-dapp/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://suplock-api.herokuapp.com
```

Use in frontend:
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`);
```

### 2. Connect Frontend to Smart Contracts
Implement wallet integration:
```typescript
// src/utils/supraMath.ts
export function calculateBoost(lockDurationMonths: number): number {
  const MAX_DURATION = 48; // months
  return Math.min(1 + (lockDurationMonths / MAX_DURATION) * 1.5, 2.5);
}

export function calculateYield(
  amount: number,
  lockDurationMonths: number,
  boostMultiplier: number
): number {
  const BASE_APR = 0.12;
  const years = lockDurationMonths / 12;
  return amount * BASE_APR * years * boostMultiplier;
}
```

### 3. API Integration Flow
```
Frontend
   ↓
  User Actions (lock, vote, deposit)
   ↓
Backend API
   ↓
Fetch on-chain data (via Supra RPC)
   ↓
Calculate projections, dividends, etc.
   ↓
Return to Frontend
   ↓
Display to User
```

---

## Testing Checklist

### Smart Contracts
- [ ] All Move tests pass (`supra move test`)
- [ ] Boost calculations correct (3mo → 4yr)
- [ ] Early unlock penalty decay working
- [ ] Floor check at 10B supply
- [ ] Distribution allocations sum to 100%

### Frontend
- [ ] Wallet connects successfully
- [ ] Lock UI shows correct boost
- [ ] Charts render data correctly
- [ ] Governance proposals load
- [ ] Vault deposits process
- [ ] Dividends calculation works
- [ ] Mobile responsive (375px+)

### Backend API
- [ ] All endpoints return 200 status
- [ ] Projections calculate correctly
- [ ] Proposals load from mock data
- [ ] Dividend calculation accurate
- [ ] Yield estimation matches contract math

### Integration
- [ ] Frontend → Backend requests working
- [ ] Backend → Contract data (mock) working
- [ ] All flows end-to-end tested

---

## Monitoring & Logs

### Frontend (Vercel)
```bash
vercel logs --tail
```

### Backend (Heroku)
```bash
heroku logs --tail -a suplock-api
```

### Smart Contracts (Supra Testnet)
```bash
# View transaction on block explorer
# https://testnet.suprascan.io/

# Query contract state
supra state --package-id <ID> --module suplock_core
```

---

## Troubleshooting

### "supra: command not found"
```bash
# Add to PATH or install via official docs
# https://supraoracles.com/docs/
```

### "Module not found" errors in Frontend
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### API requests timing out
```bash
# Check RPC URL
curl https://rpc-testnet.supra.com/

# Verify environment variables
echo $SUPRA_RPC_URL
```

### "Transaction failed" on contract call
```bash
# Check account balance
supra account balance --network testnet

# Ensure account is funded with testnet $SUPRA
```

---

## Mainnet Deployment (Post-Audit)

### 1. Security Audit
```bash
# External audit required before mainnet
# Recommended: Trail of Bits, OpenZeppelin, etc.
```

### 2. Contracts → Mainnet
```bash
supra move publish --network mainnet

# Save mainnet Package ID and addresses
```

### 3. Frontend Configuration
Update `.env.production`:
```env
NEXT_PUBLIC_SUPRA_RPC_URL=https://rpc-mainnet.supra.com
NEXT_PUBLIC_SUPRA_CHAIN_ID=1  # Mainnet chain ID
NEXT_PUBLIC_PACKAGE_ID=<mainnet package>
# ... all contract addresses
```

### 4. Backend Configuration
```env
NODE_ENV=production
SUPRA_RPC_URL=https://rpc-mainnet.supra.com
PORT=80  # or 443 with SSL
```

### 5. Deploy
```bash
# Verify all configs
# Deploy frontend to Vercel production
vercel deploy --prod

# Deploy backend
heroku config:set NODE_ENV=production
git push heroku main

# Verify
curl https://suplock.app/health
```

---

## Maintenance

### Regular Tasks
- [ ] Monitor API uptime
- [ ] Check contract state (burns, fees, distributions)
- [ ] Update dependencies monthly
- [ ] Review governance proposals
- [ ] Track MEV captured

### Upgrades (Post-Mainnet)
1. Deploy new contract version to testnet
2. Run full test suite
3. Security audit
4. Governance vote (if breaking changes)
5. Deploy to mainnet with upgrade module

---

## Support & Resources

- **Supra Docs**: https://supraoracles.com/docs/
- **Move Language**: https://move-language.github.io/
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Heroku Docs**: https://devcenter.heroku.com/

---

**Deployment Complete!** 🚀
