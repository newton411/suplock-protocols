# SUPLOCK Protocol Whitepaper v2

## Abstract

SUPLOCK is a full‑stack, production‑ready DeFi protocol built on the Supra L1 network. It combines a deflationary locking economy with privacy‑first vaults, a DAO, cross‑chain yield strategies and an automated fee‑distribution flywheel. The protocol enforces a 10 billion $SUPRA floor via lock‑to‑earn mechanics, monthly burn schedules, and a supply‑decay forecasting engine. SUPLOCK’s architecture spans Move smart contracts, a React/Next.js frontend, and a Node.js backend API, making it one of the most comprehensive implementations in the Supra ecosystem.


## 1. Introduction

Stablecoins and tokenized yields dominate modern DeFi, but existing systems suffer from centralized reserves, inflationary minting, run risk, and MEV exposure. SUPLOCK tackles these issues by:

1. **Lock‑centric scarcity** – native $SUPRA holders lock tokens for time‑weighted yield that appreciates with protocol revenue.
2. **Automated burn flywheel** – fees are algorithmically split between dividends, governance rewards, and burns, creating a deflationary feedback loop.
3. **Native privacy & MEV resistance** – encrypted intent routing (LP Vacuum) prevents front‑running and funnels value back to users.
4. **Modular vault network** – yield vaults supporting PT/YT splitting and two‑layer restaking (EigenLayer and Symbiotic).
5. **DAO & compliance hooks** – veSUPRA governance, timelocks, and optional KYC/AML modules for institutional integration.


## 2. Core Principles

- **Deflationary Flywheel:** Lock tokens, earn yield, burn fees. Circulating supply shrinks toward a 10 B floor.
- **Boosted Yield:** Linear boost from 1× (3 month) to 2.5× (48 month) locks; Mythic NFTs and restaking enhance multipliers.
- **Privacy First:** All vault & swap intents are encrypted; MEV captured internally for protocol reserves.
- **Automated Governance:** veSUPRA NFTs grant voting power; proposals execute after a 7‑day vote and 3‑day timelock.
- **Extensibility:** Smart contract modules are loosely coupled; frontend and backend are API‑driven for seamless upgrades.


## 3. Tokenomics

| Parameter | Value |
|-----------|-------|
| $SUPRA max supply | 100 B (static) |
| Floor supply | 10 B (locked) |
| Base APR (locks) | 12 % |
| Boost formula | `1 + (lock_duration_months / 48) * 1.5` (max 2.5×) |
| Early exit penalty | `10% × (months_remaining / total_months)` |

### 3.1 Supply Floor Mechanics

Users deposit $SUPRA into `LockStake` (smart contract `suplock_core`). Each lock mints a **veSUPRA** NFT, soulbound for 30 days, with voting weight proportional to amount×duration.

Fees from swaps, vaults, and governance actions accumulate in USDC via `supreserve`. Monthly distributions (12 cycles per year) follow:

- **Pre‑Floor (circulating > 10 B):**
  - 40 % buyback & burn
  - 30 % dividends to veSUPRA
  - 15 % veSUPRA rewards
  - 10 % reinvestment pool (halving each year to 1 % floor)
  - 5 % treasury

- **Post‑Floor (circulating ≤ 10 B):**
  - 0 % burn
  - 50 % dividends
  - 20 % veSUPRA rewards
  - 20 % reinvestment pool
  - 10 % treasury

Burns shrink circulating supply and increase yield per locked token, incentivizing re‑locking and creating a positive scarcity feedback.


## 4. Protocol Components

### 4.1 suplock_core (LockStake)

- Lock durations: 3–48 months.
- Implements boost formula and early‑unlock penalties.
- Emits events on lock creation/withdrawal for backend tracking.

### 4.2 vesupra (Governance DAO)

- veSUPRA NFTs are soulbound 30 days, then transferable.
- Voting period: 7 days. Execution timelock: 3 days.
- Proposal types include revenue splits, vault fees, new vault registration.
- Participation earns revenue shares calculated by backend projections.

### 4.3 supreserve (Fee Flywheel)

- USDC aggregator receives protocol fees from frontend operations.
- Monthly `execute_distribution` function triggers the allocation logic.
- Adaptive reinvestment mimics a Bitcoin‑style halving schedule.

### 4.4 yield_vaults (Vault Network)

- **PT/YT splitting:** deposits produce Principal Tokens (PTs) and Yield Tokens (YTs).
- **Restaking integrations:**
  - EigenLayer: users stake `stETH` → `rstSUPRA`. YT holders can restake back into SUPLOCK.
  - Symbiotic: `SUPRA` → `symSUPRA` restaking for additional APR.
- **LP Vacuum:** encrypted intents stored on‑chain, batch‑processed to prevent MEV; captured value flows to `supreserve`.

### 4.5 Privacy & MEV Protection

- All deposit/withdrawal intents are encrypted off‑chain and revealed after inclusion; front‑running impossible.
- Backend tracks `mev_captured` statistics exposed via API.

### 4.6 NFT & Boost Extensions

- Mythic NFTs grant fixed +35 % yield boost and additional governance weight.
- Future NFTs unlock cross‑chain privileges and burn multipliers.

### 4.7 Cross‑Chain & HyperNova

- HyperNova primitives allow bridgeless stable locking across Supra L1 and EVM chains.
- Locked stables generate yield which is auto‑routed to the BurnVault via cross‑chain messages.
- Over‑collateralized zero‑liquidity borrows supported at 110‑120 % collateral ratios.


## 5. Architecture

```text
[User Wallet] → [Frontend dApp (React/Next.js)]
             ↘  (RPC & WebSocket)
              [Supra L1 Contracts] ←- [supra move publish]
             ↗
[Backend API (Node.js/Express)]
```

- **Presentation layer:** 5‑tab responsive interface with real‑time calculations.
- **Application layer:** `supdock-api` interfaces with Supra RPC, oracles, and contract events.
- **Contract layer:** Move modules under `smart-contracts/supra/suplock/sources`.

The backend provides nine REST endpoints for stats, projections, governance data, and yield/dividend calculators.


## 6. Governance & DAO

veSUPRA holders can submit proposals and cast votes via the frontend. Governance parameters include:

- Revenue distribution percentages.
- Vault creation & fee rates.
- Lock multipliers and maximum duration.
- Treasury allocations.

A 7‑day vote followed by a 3‑day timelock ensures transparency and safe execution. The governance dashboard displays live vote counts and NFT tiers.


## 7. Roadmap

1. **v2 Launch:** Stable vaults, cross‑chain locking, MVP governance (completed).
2. **Q2–Q3:** Compliance modules (KYC/AML), liquidity hub expansion, NFT utility upgrades.
3. **Medium:** Institutional treasury product, off‑chain reserve attestations, MiCA‑ready frameworks.
4. **Long‑term:** Real‑world payments integration, HyperNova network of peg stabilizers, L2 scaling.


## 8. Security & Risk Mitigation

- **Smart contract safety:** Move’s resource model, reentrancy guards, access control, event logs.
- **Audits:** Planned PeckShield review prior to mainnet launch.
- **Oracle resilience:** SupraOracles multi‑source feeds with circuit breakers for price deviations.
- **MEV exposure:** LP Vacuum captures instead of leaking value; encrypted intents guard user transactions.
- **Regulatory:** Modular compliance hooks allow geography‑aware governance settings.


## 9. Implementation Notes

- **Testing:** `move test` covers all contract logic; frontend and backend have matching TypeScript unit tests.
- **Deployment scripts:** `deploy.sh` orchestrates smart contract publishing, frontend build, and backend start.
- **Documentation:** Over 7 000 lines of markdown (see `QUICK_REFERENCE.md`, `ARCHITECTURE_REFERENCE.md`, `IMPLEMENTATION_SUMMARY.md`).


## 10. Conclusion

SUPLOCK represents a mature, audited‑ready DeFi primitive for the Supra ecosystem. By locking $SUPRA, users secure sound monetary policies while accessing elastic, cross‑chain stable yields. Its modular, privacy‑centric architecture positions the protocol for adoption by retail and institutional stakeholders alike.


> *For full technical detail, inspect the Move sources under `smart-contracts/supra/suplock/sources` and the frontend/backend codebases.*
