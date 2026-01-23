# SUPLOCK Protocol

A production-ready DeFi protocol on Supra L1 featuring vote-escrow locking, governance DAO, yield vaults with privacy mechanisms, and automated fee distribution.

**Status:** ✅ Production-ready for testnet deployment

## Core Components

### Smart Contracts (Move Language)

**suplock_core.move** - Core locking mechanism
- Lock duration: 3 months to 4 years
- Boost multiplier: 1x to 2.5x
- Base APR: 12%
- Early unlock penalties

**vesupra.move** - Governance DAO
- Vote-escrow NFTs (soulbound for 30 days)
- Proposal types: revenue allocation, vault parameters, treasury management
- 7-day voting period + 3-day execution timelock

**supreserve.move** - Automated fee distribution
- USDC fee aggregation and monthly distribution
- Pre-floor mode (< 10B): 50% burn, 35% dividends, 10% veSUPRA, 5% treasury
- Post-floor mode (≥ 10B): 0% burn, 65% dividends, 12.5% veSUPRA, 12.5% treasury

**yield_vaults.move** - Yield infrastructure
- Principal Token (PT) and Yield Token (YT) splitting
- EigenLayer and Symbiotic restaking integration
- Encrypted intents for MEV prevention
- Composable collateral receipts

### Frontend (React/Next.js)

- 5-tab responsive dApp (Overview, Lock, Governance, Vaults, Dividends)
- Dark theme with gold accents
- Real-time boost calculations
- Supra L1 wallet integration

### Backend API (Node.js/Express)

- 9 REST endpoints for protocol operations
- Supply decay forecasting (24 months)
- Governance and dividend calculations
- MEV tracking statistics

## Documentation

- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [ARCHITECTURE_REFERENCE.md](ARCHITECTURE_REFERENCE.md) - Technical reference
- [SUPLOCK_PROTOCOL.md](SUPLOCK_PROTOCOL.md) - Protocol specifications
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details

## Setup

**Smart Contracts:**
```bash
cd smart-contracts/supra/suplock
move compile
move test
supra move publish --network testnet
```

**Frontend:**
```bash
cd frontend/suplock-dapp
npm install
npm run dev
```

**Backend:**
```bash
cd backend/suplock-api
npm install
npm run dev
```

## Features

- Vote-escrow locking mechanism (3-48 months)
- Governance DAO with timelock execution
- Yield vaults with token splitting (PT/YT)
- Restaking integration (EigenLayer, Symbiotic)
- MEV prevention with encrypted intents
- Automated fee distribution flywheel
- Dividend tracking and claims
- Supply decay forecasting
- Real-time boost calculations

## Security

- Move resource model for secure state management
- Reentrancy guards on state-changing functions
- Event logging for audit trail
- Timelock governance (3-day execution delay)
- Access controls and permission verification
- Encrypted intents for MEV prevention

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment instructions.

## License

Open source project for Supra L1 ecosystem.