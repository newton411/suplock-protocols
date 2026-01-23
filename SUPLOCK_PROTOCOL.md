# SUPLOCK Protocol - Complete Full-Stack DeFi Implementation

## Overview

SUPLOCK is a community-driven DeFi protocol on **Supra L1** that empowers $SUPRA token holders (capped supply 100 billion) with:

- **Vote-Escrow Locking**: Mint soulbound veSUPRA NFTs with up to 2.5x yield boost
- **LP Vacuum Privacy Layer**: Encrypt all interactions to prevent MEV and front-running
- **Yield & Restaking Vaults**: Split yields into PT/YT tokens with dual restaking (EigenLayer + Symbiotic)
- **SUPReserve Flywheel**: Automated fee distribution to buybacks, dividends, rewards, and treasury
- **Governance DAO**: veSUPRA holders vote on protocol parameters and treasury allocation

This repository contains the complete stack: Move smart contracts, React/Next.js frontend, Node.js backend API, and deployment documentation.

---

## Quick Start

### Smart Contracts
```bash
cd smart-contracts/supra/suplock
supra move compile
supra move test
supra move publish --network testnet
```

### Frontend
```bash
cd frontend/suplock-dapp
npm install
npm run dev
# Open http://localhost:3000
```

### Backend API
```bash
cd backend/suplock-api
npm install
npm run dev
# API runs on http://localhost:3001
```

---

## Project Structure

```
├── smart-contracts/supra/suplock/          # Move smart contracts
│   ├── sources/
│   │   ├── suplock_core.move               # Core locking mechanism
│   │   ├── vesupra.move                    # veSUPRA + governance
│   │   ├── supreserve.move                 # Fee distribution flywheel
│   │   └── yield_vaults.move               # Vaults, PT/YT, LP Vacuum
│   └── Move.toml
├── frontend/suplock-dapp/                  # React/Next.js dApp
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── styles/
│   └── package.json
└── backend/suplock-api/                    # Node.js REST API
    ├── src/
    │   ├── index.ts
    │   ├── projections.ts
    │   └── governance.ts
    └── package.json
```

---

## Smart Contracts Overview

### suplock_core.move
- **Locking**: 3-48 month locks with yield boost
- **Boost Formula**: `1 + (lock_time / max_time) * 1.5` (max 2.5x)
- **Early Unlock**: Penalty decay based on time remaining
- **Base APR**: 12%

### vesupra.move
- **veSUPRA NFTs**: Soulbound for 30 days, then transferable
- **Governance DAO**: 7-day voting, 3-day timelock
- **Proposals**: Revenue split, vault fees, locking tiers, treasury

### supreserve.move
- **Fee Aggregation**: USDC receiver for all protocol fees
- **Pre-Floor Distribution** (circulating > 10B):
  - 50% buyback & burn
  - 35% dividends
  - 10% veSUPRA rewards
  - 5% treasury
- **Post-Floor Distribution** (circulating ≤ 10B):
  - 0% buyback
  - 65% dividends
  - 12.5% veSUPRA rewards
  - 12.5% treasury

### yield_vaults.move
- **PT/YT Split**: Deposits split into Principal & Yield tokens
- **Restaking**: EigenLayer (stETH → rstSUPRA) & Symbiotic (SUPRA → symSUPRA)
- **LP Vacuum**: Encrypted intents prevent MEV, capture internally
- **Auto-Compound**: Fees to SUPReserve

---

## Frontend Features

### Dark Futuristic UI
- Black (#000) / Dark Gray (#111) backgrounds
- Gold (#FFD700) accents
- Responsive, animated components
- Mobile-optimized

### Components
- **WalletConnectButton**: Supra L1 wallet integration
- **LockUI**: Create locks with boost preview
- **TokenomicsCharts**: Supply & revenue distribution
- **GovernancePanel**: Proposals & voting
- **VaultPanel**: Deposit, split, restake
- **DividendPanel**: Claim dividends, history

### Pages
- **Overview**: Hero, stats, features, charts
- **Lock**: Lock SUPRA with boost calculation
- **Governance**: Submit & vote on proposals
- **Vaults**: Deposit into yield vaults
- **Dividends**: Claim and track dividends

---

## Backend API

### Key Endpoints

**Projections** (24-month supply decay & revenue forecast)
```
GET /api/projections?months=24
```

**Governance**
```
GET /api/proposals
GET /api/governance/stats
```

**Protocol Stats**
```
GET /api/stats
GET /api/floor-status
```

**Calculations**
```
POST /api/calculate-dividends
POST /api/estimate-yield
```

**Privacy** (MEV captured by LP Vacuum)
```
GET /api/privacy/mev-captured
```

---

## Deployment

### Testnet
```bash
supra move publish --network testnet
# Frontend: vercel deploy
# Backend: heroku create && git push heroku main
```

### Mainnet (Post-Audit)
```bash
supra move publish --network mainnet
```

---

## Math Implementations

### Boost Multiplier
Boost = 1 + (lock_time / max_lock_time) × 1.5 (max 2.5x)

### Early Unlock Penalty (Decay)
Penalty% = 10% × (time_remaining / total_lock_time)

### Yield Calculation
Total Yield = Amount × Base APR × Years × Boost

### Supply Decay Model
S(t) = S_0 - b × (R/P) × t

### Revenue Distribution
- **Pre-Floor**: 50% burn, 35% dividends, 10% ve, 5% treasury
- **Post-Floor**: 0% burn, 65% dividends, 12.5% ve, 12.5% treasury

---

## Security

✅ Reentrancy guards  
✅ Overflow checks (u128 precision)  
✅ Access control (signer verification)  
✅ Event logging (audit trail)  
✅ Timelock governance  
✅ Encrypted intents (MEV prevention)  

**Pre-Mainnet**: External security audit required

---

## API Documentation

### Endpoints

#### Health Check
```
GET /health
Response: { status: "healthy", timestamp: "..." }
```

#### Revenue Projections
```
GET /api/projections?months=24
Response: [
  {
    month: 1,
    circulatingSupply: 45100000000,
    burned: 8500000000,
    totalFees: 2100000,
    buybackAllocation: 1050000,
    dividendAllocation: 735000,
    veRewardsAllocation: 210000,
    treasuryAllocation: 105000,
    isPostFloor: false
  },
  ...
]
```

#### Governance Proposals
```
GET /api/proposals?status=active
Response: [
  {
    id: 1,
    title: "Increase buyback allocation to 60%",
    type: "revenue_split",
    creator: "0x1234...5678",
    votesFor: 8500000,
    votesAgainst: 1200000,
    status: "active"
  },
  ...
]
```

#### Governance Stats
```
GET /api/governance/stats
Response: {
  totalProposals: 4,
  activeProposals: 2,
  totalVeSupply: 45000000,
  uniqueVoters: 1250,
  averageTurnout: "62.5%"
}
```

#### Protocol Stats
```
GET /api/stats
Response: {
  totalLocked: "12,500,000,000",
  circulatingSupply: "45,200,000,000",
  totalBurned: "8,500,000,000",
  protocolFees: "2,345,678",
  activeVaults: 3,
  veSUPRAHolders: 1250
}
```

#### Floor Status
```
GET /api/floor-status
Response: {
  circulatingSupply: 45200000000,
  floorThreshold: 10000000000,
  isPostFloor: false,
  percentToFloor: "224.76",
  distribution: { ... }
}
```

#### Calculate Dividends
```
POST /api/calculate-dividends
Body: {
  veSUPRABalance: 5000,
  totalVeSupply: 45000000,
  accumulatedFees: 2345678
}
Response: {
  dividendPerShare: "260.63",
  userDividends: "260.63"
}
```

#### Estimate Yield
```
POST /api/estimate-yield
Body: {
  amount: 1000,
  lockDurationMonths: 48,
  boostMultiplier: 2.5
}
Response: {
  baseAPR: "12.00%",
  estimatedYield: "1200.00",
  totalValue: "2200.00"
}
```

---

## Contract Functions

### suplock_core
- `initialize()` - Initialize global state
- `create_lock()` - Lock SUPRA and create position
- `calculate_boost_multiplier()` - Get yield boost
- `claim_yield()` - Claim yield after unlock
- `early_unlock()` - Unlock early with penalty

### vesupra
- `initialize_ve_registry()` - Setup veSUPRA system
- `initialize_governance_dao()` - Setup DAO
- `mint_ve_nft()` - Create veSUPRA NFT
- `burn_ve_nft()` - Burn and reclaim SUPRA
- `create_proposal()` - Submit governance proposal
- `cast_vote()` - Vote on proposal
- `execute_proposal()` - Execute passed proposal

### supreserve
- `initialize_supreserve()` - Setup fee system
- `accumulate_fees()` - Add fees from protocol
- `execute_distribution()` - Run monthly distribution
- `claim_dividends()` - Claim user dividends

### yield_vaults
- `initialize_vault_registry()` - Setup vaults
- `initialize_intent_processor()` - Setup LP Vacuum
- `create_vault()` - Create new vault
- `deposit_and_split()` - Deposit and split PT/YT
- `claim_yield_from_yt()` - Claim YT yield
- `restake_eigenlayer()` - Restake to EigenLayer
- `restake_symbiotic()` - Restake to Symbiotic
- `submit_encrypted_intent()` - Privacy layer
- `process_encrypted_intent()` - Process private intent

---

## References

- **Whitepaper**: [Sustainable DeFi Protocol](https://gamma.app/docs/Sustainable-DeFi-7jabltpt95th05k)
- **Supra L1**: [https://supraoracles.com/](https://supraoracles.com/)
- **Move Language**: [https://move-language.github.io/](https://move-language.github.io/)
- **Next.js**: [https://nextjs.org/](https://nextjs.org/)

---

## License

MIT

---

**Built for Supra L1 Community** ⛓️
