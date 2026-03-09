# SUPLOCK Protocol: The Complete Whitepaper

## Abstract

SUPLOCK is a full‑stack, production‑ready DeFi protocol built on the Supra L1 network. It combines a deflationary locking economy with privacy‑first vaults, elastic stablecoin issuance, a DAO, cross‑chain yield strategies, and an automated fee‑distribution flywheel. The protocol enforces a 10 billion $SUPRA floor via lock‑to‑earn mechanics, monthly burn schedules, and a supply‑decay forecasting engine. SUPLOCK's architecture spans Move smart contracts, a React/Next.js frontend, and a Node.js backend API, making it one of the most comprehensive implementations in the Supra ecosystem. Designed for both retail and institutional users, SUPLOCK introduces the first cross‑chain, peg‑stable vault system with built‑in MEV protection, oracle circuit breakers, and modular compliance hooks.


## 1. Introduction

Stablecoins and tokenized yields dominate modern DeFi, but existing systems suffer from fundamental weaknesses:

1. **Sound money integrity** – Many rely on centralized reserves or inflationary minting.
2. **Run risk** – Poorly designed redemption mechanisms can trigger cascades.
3. **Elasticity** – Supply must expand and contract with demand without losing the peg.
4. **Interoperability** – Bridging assets safely across chains is complex and expensive.
5. **Friction** – Users and institutions face onboarding hurdles, MEV exposure, and yield inefficiencies.

SUPLOCK addresses these gaps by re‑centering the model around a lock‑based deflationary engine and an automated fee‑distribution flywheel, supported by Supra's high‑performance network. The protocol achieves:

- **Lock‑centric scarcity** – native $SUPRA holders lock tokens for time‑weighted yield that appreciates with protocol revenue.
- **Automated burn flywheel** – fees are algorithmically split between dividends, governance rewards, and burns, creating a deflationary feedback loop.
- **Native privacy & MEV resistance** – encrypted intent routing (LP Vacuum) prevents front‑running and funnels value back to users.
- **Modular vault network** – yield vaults supporting PT/YT splitting and two‑layer restaking (EigenLayer and Symbiotic).
- **DAO & compliance hooks** – veSUPRA governance, timelocks, and optional KYC/AML modules for institutional integration.


## 2. Core Principles

- **Deflationary Flywheel:** Lock tokens, earn yield, burn fees. Circulating supply shrinks toward a 10 B floor.
- **Boosted Yield:** Linear boost from 1× (3 month) to 2.5× (48 month) locks; Mythic NFTs and restaking enhance multipliers.
- **Privacy First:** All vault & swap intents are encrypted; MEV captured internally for protocol reserves.
- **Yield Optimization:** Combines Proof‑of‑Earnings‑Locked (PoEL) rewards with delta‑neutral and AutoFi strategies capturing external DeFi yields.
- **Automated Governance:** veSUPRA NFTs grant voting power; proposals execute after a 7‑day vote and 3‑day timelock.
- **Modularity:** Vaults, cross‑chain routers, compliance modules, and NFT integrations are discrete contracts enabling parallel development.
- **Extensibility:** Smart contract modules are loosely coupled; frontend and backend are API‑driven for seamless upgrades.


## 3. Tokenomics

| Parameter | Value |
|-----------|-------|
| $SUPRA max supply | 100 B (static) |
| Floor supply | 10 B (locked) |
| Base APR (locks) | 12 % |
| Boost formula | `1 + (lock_duration_months / 48) * 1.5` (max 2.5×) |
| Early exit penalty | `10% × (months_remaining / total_months)` |

### 3.1 Supply Floor Mechanics

Users deposit $SUPRA into `LockStake` (smart contract `suplock_core`). Each lock mints a **veSUPRA** NFT, soulbound for 30 days, with voting weight proportional to amount×duration.

Fees from swaps, vaults, and governance actions accumulate in USDC via `supreserve`. Monthly distributions (12 cycles per year) follow:

- **Pre‑Floor (circulating > 10 B):**
  - 40 % buyback & burn
  - 30 % dividends to veSUPRA
  - 15 % veSUPRA rewards
  - 10 % reinvestment pool (halving each year to 1 % floor, inspired by Bitcoin)
  - 5 % treasury

- **Post‑Floor (circulating ≤ 10 B):**
  - 0 % burn
  - 50 % dividends
  - 20 % veSUPRA rewards
  - 20 % reinvestment pool
  - 10 % treasury

Burns shrink circulating supply and increase yield per locked token, incentivizing re‑locking and creating a positive scarcity feedback loop.

### 3.2 Lock‑to‑Earn Mechanics

- **Lock Duration:** 3–48 months with linear boost multiplier.
- **veSUPRA Minting:** Each lock produces a governance NFT with voting power = amount × duration.
- **Deflationary Feedback:** As burns shrink circulating supply, veSUPRA holders earn greater relative yields, encouraging re‑locking and reinforcing scarcity.


## 4. Protocol Components

### 4.1 suplock_core (LockStake)

- Lock durations: 3–48 months.
- Implements boost formula and early‑unlock penalties.
- Emits events on lock creation/withdrawal for backend tracking.
- Dual yield: PoEL + AutoFi compounding.
- veSUPRA multipliers up to 4× (higher for Mythic NFT holders).
- Early exit penalties feed insurance pools.

### 4.2 vesupra (Governance DAO)

- veSUPRA NFTs are soulbound 30 days, then transferable.
- Voting period: 7 days. Execution timelock: 3 days.
- Proposal types include revenue splits, vault fees, new vault registration, burn rates, stable pair addition.
- Participation earns revenue shares calculated by backend projections.
- Voting weight adjusted by iAsset holdings and NFT tiers.
- Active participation rewarded with revenue shares in stablecoins.

### 4.3 supreserve (Fee Flywheel)

- USDC aggregator receives protocol fees from frontend operations.
- Monthly `execute_distribution` function triggers the allocation logic.
- Adaptive reinvestment mimics a Bitcoin‑style halving schedule.
- Monthly automation with transparent accounting.

### 4.4 yield_vaults (Vault Network)

- **PT/YT splitting:** deposits produce Principal Tokens (PTs) and Yield Tokens (YTs).
- **Restaking integrations:**
  - EigenLayer: users stake `stETH` → `rstSUPRA`. YT holders can restake back into SUPLOCK.
  - Symbiotic: `SUPRA` → `symSUPRA` restaking for additional APR.
- **LP Vacuum:** encrypted intents stored on‑chain, batch‑processed to prevent MEV; captured value flows to `supreserve`.
- **Composable receipts:** Collateral receipts enable additional leverage and yield strategies.
- **Performance fees:** 1% fee on yields, routed to reserve.

### 4.5 BurnVault

- Accepts stables/usdc/iusdc/iAssets.
- Automatically unwraps and burns 10‑20% of deposits with the remainder earning PoEL yield.
- Peg‑stability algorithms monitor oracles and trigger additional burns or rebalances during deviations.

### 4.6 LiquidityHub

- Aggregator router across SupraLend, Solido, Atmos, and other DEX protocols.
- Includes MEV capture layer and peg‑checks to ensure stable swaps remain within thresholds.

### 4.7 GovIncentivizer

- Voting weight adjusted by iAsset holdings.
- Parameter proposal templates (burn rates, stable pair addition, treasury allocation).
- Active participation rewarded with revenue shares in stablecoins.

### 4.8 Privacy & MEV Protection

- All deposit/withdrawal intents are encrypted off‑chain and revealed after inclusion; front‑running impossible.
- Backend tracks `mev_captured` statistics exposed via API.
- Internal MEV capture mechanisms route value back to the protocol reserve.

### 4.9 NFT & Boost Extensions

- Mythic NFTs grant fixed +35 % yield boost and additional governance weight.
- Stake NFTs for yield boosts and governance multipliers.
- Evolving NFTs unlock additional protocol privileges and burn bonuses.
- Future NFTs unlock cross‑chain privileges and burn multipliers.

### 4.10 AutoFi Primitives

- Intent execution engine enabling automated arbitrage, peg‑stabilization, and scheduled burns.
- Risk modules analyze market conditions and trigger safeguards.
- Auto‑compound mechanisms reinvest yields into the protocol.

### 4.11 Cross‑Chain & HyperNova

- HyperNova primitives allow bridgeless stable locking across Supra L1 and EVM chains.
- Locked stables generate yield which is auto‑routed to the BurnVault via cross‑chain messages.
- Over‑collateralized zero‑liquidity borrows supported at 110‑120 % collateral ratios.
- Bridgeless stable locking across Supra L1 and other EVM/L1 chains.
- Yields generated post‑lock feed back into the BurnVault.


## 5. Stablecoin Optimizations

### 5.1 Stablecoin Yield Vaults + Peg‑Stability Burns

- Vaults accept USDC/USDT/iAssets with SupraOracles feeding real‑time pricing.
- AutoFi algorithms react to peg deviation by rebalancing positions and triggering burns, preserving run‑protection and supply elasticity.
- Fee model: 10‑20% performance fees; burns boost $SUPRA scarcity.

### 5.2 Cross‑Chain Stablecoin Locking + Bridgeless Burn Flywheel

- Users lock bridged stables through HyperNova; vault yields automatically route to BurnVault.
- Zero‑liquidity borrows supported with 110‑120% collateral, ensuring over‑collateralization.
- Revenue from bridge/fee spreads attracts cross‑chain liquidity.

### 5.3 Compliance & Integrity Layer

- Optional KYC/AML integration via modular hooks.
- Oracle‑audited reserve attestations stored on‑chain.
- Governance settings allow MiCA‑aligned parameters; premium tiers for institutional stables.
- GeographyAware governance settings for regulatory compliance.

### 5.4 Frictionless Spend Enhancements

- Stable yields available for on‑chain payments and remittances using Supra primitives.
- Built‑in yield simulator for merchants; fees apply for merchant onboarding.

### 5.5 Run‑Protection Safeguards

- Oracle circuit breakers detect abnormal outflows.
- Diversified reserve basket (stablecoins + short‑duration bonds) reduces correlation risk.
- Fee‑funded insurance pool underwrites withdrawal guarantees; premiums augment TVL.


## 6. Architecture

```text
[User Wallet] → [Frontend dApp (React/Next.js)]
             ↘  (RPC & WebSocket)
              [Supra L1 Contracts] ←- [supra move publish]
             ↗
[Backend API (Node.js/Express)]
```

### 6.1 Technical Stack

- **Presentation Layer:** 5‑tab responsive interface with real‑time calculations. React/TypeScript with dark theme (black/#000, dark gray/#111 backgrounds, gold/#FFD700 accents), responsive design, and animated components.
- **Application Layer:** `supdock-api` (Node.js/Express) interfaces with Supra RPC, oracle feeds, and smart contracts. Provides nine REST endpoints for stats, projections, governance data, and calculations.
- **Contract Layer:** Move modules under `smart-contracts/supra/suplock/sources/`:
  - `suplock_core.move` – Core locking mechanism (290 lines)
  - `vesupra.move` – Governance DAO (436 lines)
  - `supreserve.move` – Fee distribution (386 lines)
  - `yield_vaults.move` – Vault network (565 lines)
  - `stablecoin.move` – Stablecoin integration
- **Infrastructure:** Supra L1 stack leveraging HyperNova, SupraOracles, DVRF network.

### 6.2 API Endpoints (9 Total)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /health | GET | Health check |
| /api/stats | GET | Protocol stats |
| /api/projections | GET | 24‑month supply & revenue forecast |
| /api/proposals | GET | Governance proposals list |
| /api/governance/stats | GET | DAO statistics |
| /api/floor-status | GET | Supply floor status |
| /api/privacy/mev-captured | GET | MEV capture statistics |
| /api/calculate-dividends | POST | Dividend calculations |
| /api/estimate-yield | POST | Yield estimations |

### 6.3 Frontend Components

| Component | Purpose |
|-----------|---------|
| WalletConnectButton | Supra L1 wallet integration |
| LockUI | Create locks with boost preview |
| TokenomicsCharts | Supply & revenue distribution charts |
| GovernancePanel | Proposals & voting |
| VaultPanel | Deposit, split, and restake |
| DividendPanel | Claim dividends and track history |

### 6.4 Pages

- **Overview:** Hero, stats, features, charts
- **Lock:** Lock SUPRA with boost calculation
- **Governance:** Submit & vote on proposals
- **Vaults:** Deposit into yield vaults
- **Dividends:** Claim and track dividends


## 7. Governance & DAO

veSUPRA holders can submit proposals and cast votes via the frontend. Governance parameters include:

- Revenue distribution percentages (pre/post‑floor splits).
- Vault creation & fee rates.
- Lock multipliers and maximum duration.
- Treasury allocations and reinvestment pool targets.
- Burn rate adjustments.

A 7‑day vote followed by a 3‑day timelock ensures transparency and safe execution. The governance dashboard displays live vote counts and NFT tiers. 

**Governance mechanics:**
- 7‑day voting period + 3‑day execution timelock.
- Proportional voting power based on veSUPRA amount × duration.
- Revenue sharing configurable (35‑65% dividends; remainder to burns/governance treasury).
- Governance dashboard provides visibility and weighted voting based on staked NFT tiers.


## 8. Roadmap

1. **v1 Launch:** Locking mechanism, DAO, fee distribution flywheel.
2. **v2 Launch:** Stable vaults, cross‑chain locking, MVP governance, PT/YT splitting, restaking integrations (completed).
3. **Q2–Q3:** Compliance modules (KYC/AML), liquidity hub expansion, NFT utility upgrades.
4. **Medium-Term:** Institutional treasury product, off‑chain reserve attestations, MiCA‑ready frameworks, real‑world payments integration.
5. **Long-Term:** HyperNova network of peg stabilizers, L2 scaling, institutional adoption at scale.


## 9. Security & Risk Mitigation

### 9.1 Smart Contract Safety

- **Move Resource Model:** Leverages Supra's native resource model for ownership semantics and preventing reentrancy.
- **Reentrancy Guards:** State updates before external calls.
- **Access Controls:** Signer verification on all privileged functions.
- **Event Logging:** Complete audit trail for all state changes.
- **Overflow Checks:** u128 precision throughout.
- **Input Validation:** All parameters validated before processing.

### 9.2 Audits & Reviews

- Planned PeckShield review prior to mainnet launch.
- Upgradable modules with multisig control.
- Testing: `move test` covers all contract logic; frontend and backend have matching TypeScript unit tests.

### 9.3 Oracle Resilience

- SupraOracles multi‑source feeds with circuit breakers for price deviations.
- Oracle proofs via SupraOracles.
- Fallback circuits for oracle failure scenarios.

### 9.4 MEV Protection

- LP Vacuum captures instead of leaking value; encrypted intents guard user transactions.
- Internal MEV capture mechanisms route value back to the protocol reserve.
- MEV prevention via batch processing and front‑running shields.

### 9.5 Regulatory & Compliance

- Modular compliance hooks allow geography‑aware governance settings.
- Optional KYC/AML integration.
- On‑chain reserve attestations.
- MiCA‑aligned parameter configurations.

### 9.6 Over‑Collateralization

- Over‑collateralization enforced on all borrow/lock operations.
- Zero‑liquidity borrows supported at 110‑120 % collateral ratios.


## 10. Implementation Notes

### 10.1 Testing & Deployment

- **Smart Contracts:**
  ```bash
  cd smart-contracts/supra/suplock
  move compile
  move test
  supra move publish --network testnet
  ```

- **Frontend:**
  ```bash
  cd frontend/suplock-dapp
  npm install
  npm run dev
  ```

- **Backend:**
  ```bash
  cd backend/suplock-api
  npm install
  npm run dev
  ```

### 10.2 Documentation

- Over 7,000 lines of markdown documentation (see [QUICK_REFERENCE.md](QUICK_REFERENCE.md), [ARCHITECTURE_REFERENCE.md](ARCHITECTURE_REFERENCE.md), [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)).
- Total project: 2,496 lines of code plus comprehensive docs.

### 10.3 Deployment Scripts

- `deploy.sh` orchestrates smart contract publishing, frontend build, and backend start.
- Testnet and mainnet support via parameterized network selection.


## 11. Conclusion

SUPLOCK represents a mature, comprehensive DeFi protocol for the Supra ecosystem. By combining a deflationary locking economy with privacy‑first vaults, cross‑chain yield strategies, and an automated governance DAO, it addresses fundamental weaknesses in existing stablecoin and DeFi protocols.

**Key innovations:**

- **Sound money via scarcity:** The supply floor and deflationary burn flywheel create a monetary policy aligned with users' interests.
- **Privacy by default:** LP Vacuum and encrypted intents protect users from MEV and front‑running.
- **Modular extensibility:** Loosely‑coupled smart contract modules enable rapid feature development without ecosystem disruption.
- **Institutional readiness:** MiCA‑aligned compliance hooks, over‑collateralization, and audit readiness position SUPLOCK for both retail and institutional adoption.
- **Complete implementation:** Full‑stack architecture (Move contracts + React frontend + Node.js backend) makes SUPLOCK production‑ready with comprehensive API and governance interfaces.

Whether for yield generation, governance participation, or stable value preservation, SUPLOCK offers a comprehensive platform designed to scale safely and transparently on Supra L1.

---

*For full technical detail, inspect the Move sources under `smart-contracts/supra/suplock/sources` and the frontend/backend codebases. For quick reference, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md).*
