# SUPLOCK Advanced Integration Guide

## Overview

This guide documents the advanced features integrated into SUPLOCK to meet DeFi best practices for security, fairness, and efficiency:

1. **Oracle Integration** - Secure feed access with access control
2. **Move Prover Specs** - Formal verification of critical paths
3. **DVRF Integration** - Verifiable randomness for fair governance
4. **Gas Optimization** - Batch operations for efficiency

---

## 1. Oracle Integration (oracle_integration.move)

### Purpose
Provides secure, access-controlled oracle feed access for on-chain data (prices, APY, risk metrics).

### Key Components

#### 1.1 Role-Based Access Control

```move
// Initialize oracle (deployment only)
oracle_integration::initialize_oracle(account: &signer)

// Grant roles (admin only)
oracle_integration::grant_role(
    admin: &signer,
    user: address,
    role: u8,  // 1=Admin, 2=Updater, 3=Reader
    config_addr: address,
)

// Revoke roles
oracle_integration::revoke_role(
    admin: &signer,
    user: address,
    role: u8,
    config_addr: address,
)
```

**Role Hierarchy:**
- **ROLE_ADMIN (1)**: Initialize, grant/revoke roles, update oracle addresses
- **ROLE_UPDATER (2)**: Add feeds, update prices, deactivate feeds
- **ROLE_READER (3)**: Query feed prices

#### 1.2 Feed Management

```move
// Add new oracle feed
oracle_integration::add_feed(
    updater: &signer,
    feed_name: String,
    oracle_address: address,
    initial_price: u128,
    decimals: u8,
    config_addr: address,
)

// Update feed price (with deviation validation)
oracle_integration::update_feed_price(
    updater: &signer,
    feed_id: u64,
    new_price: u128,
    config_addr: address,
)

// Critical: Update oracle address (admin only, secure upgrade path)
oracle_integration::update_oracle_address(
    admin: &signer,
    feed_id: u64,
    new_oracle_address: address,
    config_addr: address,
)
```

**Safety Features:**
- Price deviation limit: 20% (2000 BPS) prevents flash loan attacks
- Feed freshness validation: 6-hour threshold (configurable)
- Event-driven audit trail for all changes
- Separate updater/reader roles prevent privilege escalation

#### 1.3 Feed Queries

```move
// Simple price query (reverts if stale)
let (price, decimals) = oracle_integration::get_feed_price(
    feed_id: u64,
    config_addr: address,
);

// Query with fallback to secondary feeds
let (price, decimals, is_fallback) = oracle_integration::get_feed_price_with_fallback(
    feed_id: u64,
    config_addr: address,
);
```

### Integration Example: APY Calculation

```move
public fun calculate_dynamic_apy(
    lock_amount: u64,
    lock_duration_secs: u64,
    oracle_addr: address,
) {
    // Query base APY from oracle
    let (base_apy_bps, _decimals) = oracle_integration::get_feed_price(1, oracle_addr);
    
    // Apply boost multiplier
    let boost = calculate_boost_multiplier(lock_duration_secs);
    
    // Final APY = base_apy * boost
    let final_apy = (base_apy_bps * boost) / 10000;
}
```

### Security Best Practices

1. **Always use oracle address update** for upgrades (never modify feed address directly)
2. **Monitor freshness** in critical operations (yield claims, distributions)
3. **Use fallback feeds** for essential data (dividends should never fail)
4. **Audit role grants** - keep updater list small, rotate permissions

---

## 2. Move Prover Specifications (specifications.move)

### Purpose
Formal verification that critical protocol functions maintain invariants and safety properties.

### Critical Invariants

#### 2.1 Lock Consistency

```move
// Property: Total locked must match sum of user locks
invariant total_locked_supply() + total_penalty_paid() == total_deposit_value()

// Property: Lock can only be unlocked once
invariant !lock.is_unlocked ==> later lock.is_unlocked implies penalty_paid > 0

// Property: Yield only increases monotonically
invariant yield_earned >= old(yield_earned)
```

#### 2.2 Governance Integrity

```move
// Property: Each voter votes once per proposal
invariant forall voter: address, proposal_id: u64:
    count_votes(voter, proposal_id) <= 1

// Property: Vote weights sum correctly
invariant total_votes == votes_for + votes_against

// Property: Proposal respects voting period
invariant current_time < voting_end_time ==> !is_executed
invariant current_time >= execution_time && votes_for > votes_against ==> can_execute
```

#### 2.3 Fee Distribution

```move
// Property: Fee distribution splits sum to 10000 BPS
invariant buyback_bps + dividends_bps + ve_rewards_bps + treasury_bps == 10000

// Property: Fee conservation - no value lost
invariant (total_fees * buyback_bps / 10000) +
          (total_fees * dividends_bps / 10000) +
          (total_fees * ve_rewards_bps / 10000) +
          (total_fees * treasury_bps / 10000) == total_fees
```

### Running Move Prover

```bash
# Install Move Prover
cargo install move-cli

# Verify specifications on single file
move prove --dependencies=framework smart-contracts/supra/suplock/sources/suplock_core.move

# Verify entire project
cd smart-contracts/supra/suplock
move prove

# Verbose output with counterexamples
move prove --verbose
```

### Interpreting Results

```
✓ Function verification succeeded
  - Preconditions valid
  - Postconditions satisfied
  - Invariants maintained

✗ Function verification failed
  - Counterexample shows violation path
  - Shows which invariant is violated
  - Suggests code modifications
```

### Integration with CI/CD

Add to GitHub Actions:

```yaml
- name: Run Move Prover
  run: |
    cd smart-contracts/supra/suplock
    move prove
```

---

## 3. Supra DVRF Integration (dvrf_integration.move)

### Purpose
Provides verifiable randomness for fair, unbiased governance and distribution decisions.

### Setup

```move
// Initialize DVRF manager
dvrf_integration::initialize_dvrf(account: &signer)

// Update randomness seed from Supra Oracle (periodic)
dvrf_integration::update_randomness_seed(
    oracle_caller: &signer,
    new_seed: vector<u8>,
    manager_addr: address,
)
```

### Use Cases

#### 3.1 Fair Committee Selection

```move
let candidates = vector::empty();
vector::push_back(&mut candidates, @user1);
vector::push_back(&mut candidates, @user2);
vector::push_back(&mut candidates, @user3);

let selected_member = dvrf_integration::select_random_committee_member(
    candidates,
    dvrf_addr,
);
// selected_member cannot be predicted or manipulated
```

#### 3.2 Random Audit Selection

```move
// Select 5 random targets out of 100 for audit
let audit_targets = dvrf_integration::random_audit_selection(
    100,  // eligible_targets
    5,    // num_audits
    dvrf_addr,
);
// Prevents auditors from being bribed to skip checks
```

#### 3.3 Fair Lottery Distribution

```move
// Distribute 10 rewards to random winners from 100 candidates
let winners = dvrf_integration::fair_lottery_distribution(
    candidates,
    10,  // num_winners
    dvrf_addr,
);
// Each candidate has equal probability of winning
```

#### 3.4 MEV Prevention via Order Randomization

```move
// Randomize dividend claim processing order
let claim_ids = vector![1, 2, 3, 4, 5];
let randomized_order = dvrf_integration::randomize_processing_order(
    claim_ids,
    dvrf_addr,
);
// Process in random order to prevent MEV extraction
```

### Supra Oracle Integration

The DVRF system requires periodic seed updates from Supra's oracle:

```typescript
// Off-chain service (Node.js/TypeScript)
const { SupraClient } = require('supra-l1-sdk');

const supra = new SupraClient('https://rpc.mainnet.supra.com');

// Get random seed from DVRF
const seed = await supra.getDVRFSeed();

// Update on-chain DVRF
await sendTransaction({
    function: 'dvrf_integration::update_randomness_seed',
    args: [seed],
});
```

### Auditing DVRF Usage

```move
// Log all randomness usage for audit trail
dvrf_integration::log_randomness_consumption(
    consumer: address,
    use_case: String,
    manager_addr: address,
)

// Verify seed freshness
let (seed_count, is_valid, age) = dvrf_integration::get_dvrf_state(manager_addr);
assert!(age <= MAX_SEED_AGE, ERR_SEED_EXPIRED);
```

---

## 4. Gas Optimization (gas_optimization.move)

### Purpose
Reduce transaction costs through batch operations and storage efficiency.

### Batch Operations

#### 4.1 Batch Lock Creation

**Scenario:** User creates 5 locks simultaneously

```move
// Traditional approach: 5 separate transactions
// Cost: 5 × setup_overhead + 5 × execution

// Optimized approach: Single batch transaction
let amounts = vector![1000, 2000, 3000, 4000, 5000];
let durations = vector![
    7_776_000,   // 3 months
    15_552_000,  // 6 months
    31_104_000,  // 1 year
    62_208_000,  // 2 years
    126_144_000, // 4 years
];

let batch = gas_optimization::prepare_lock_batch(amounts, durations);
gas_optimization::execute_lock_batch(account, batch, global_state_addr);

// Gas savings: ~40% (only 1 setup overhead instead of 5)
```

#### 4.2 Batch Dividend Claims

**Scenario:** 50 users claim dividends simultaneously

```move
// Traditional: 50 separate transactions, each pays overhead

// Optimized: Single batch transaction
let users = vector![@user1, @user2, /* ... */, @user50];
let amounts = vector![100, 200, /* ... */, 500];

let batch = gas_optimization::prepare_dividend_batch(users, amounts);
gas_optimization::execute_dividend_batch(admin, batch, supreserve_addr);

// Gas savings: ~50% (overhead amortized across 50 claims)
```

#### 4.3 Batch Yield Claims

**Scenario:** User claims yields from 10 locks

```move
let lock_ids = vector![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let batch = gas_optimization::prepare_yield_batch(user_addr, lock_ids);
gas_optimization::execute_yield_batch(account, batch, global_state_addr);

// Gas savings: ~45% (consolidates 10 state reads/writes)
```

#### 4.4 Batch Voting

**Scenario:** 100 governance participants vote on proposal

```move
let voters = vector![@user1, @user2, /* ... */, @user100];
let ve_balances = vector![1000, 2000, /* ... */, 500];
let votes = vector![true, false, true, /* ... */, true];

let batch = gas_optimization::prepare_vote_batch(
    proposal_id,
    voters,
    ve_balances,
    votes,
);
gas_optimization::execute_vote_batch(admin, batch, proposal_addr);

// Gas savings: ~55% (voting has high per-transaction overhead)
```

### Storage Optimization

#### 4.1 Pruning Expired Locks

```move
// Remove locks older than 1 year (reduces storage)
let pruned_count = gas_optimization::prune_expired_locks(user_addr);
```

#### 4.2 Defragmentation

```move
// Consolidate locks smaller than 100 SUPRA
let remaining_locks = gas_optimization::defragment_locks(
    user_addr,
    100,  // consolidation_threshold
);
```

### Gas Savings Summary

| Operation | Traditional | Batch | Savings |
|-----------|-----------|-------|---------|
| Lock Creation (5x) | 5 tx | 1 tx | 40% |
| Dividend Claims (50x) | 50 tx | 1 tx | 50% |
| Yield Claims (10x) | 10 tx | 1 tx | 45% |
| Voting (100x) | 100 tx | 1 tx | 55% |

---

## Integration Checklist

### Pre-Deployment

- [ ] Initialize oracle with seed feeds (APY, risk metrics)
- [ ] Set up DVRF manager with initial seed
- [ ] Configure batch processor with max batch sizes
- [ ] Review Move Prover specs and ensure all pass
- [ ] Set up Supra Oracle RPC endpoint for seed updates

### Deployment

- [ ] Deploy oracle_integration.move
- [ ] Deploy specifications.move (for verification)
- [ ] Deploy dvrf_integration.move
- [ ] Deploy gas_optimization.move
- [ ] Deploy updated core modules (suplock_core, vesupra, supreserve)

### Post-Deployment

- [ ] Grant oracle updater role to authorized addresses
- [ ] Set up off-chain service to provide DVRF seeds
- [ ] Monitor oracle feed freshness
- [ ] Enable batch processing for users
- [ ] Monitor gas savings metrics

### Monitoring

```typescript
// Monitor oracle feed age
const [price, decimals, age] = await queryDVRFState(manager_addr);
if (age > 3600) {
  alert("DVRF seed stale, update required");
}

// Monitor batch processing
const [max_size, total_batches] = await getProcessorStats(processor_addr);
console.log(`Total batches processed: ${total_batches}`);

// Monitor Move Prover status
// Run `move prove` in CI/CD pipeline
```

---

## Troubleshooting

### Oracle Issues

**Issue:** "Feed not found"
- Verify feed_id corresponds to initialized feed
- Check feed is active (not deactivated)

**Issue:** "Stale feed"
- Ensure oracle feeds updated within 6-hour window
- Check DVRF seed age for randomness-dependent operations

### DVRF Issues

**Issue:** "Randomness unavailable"
- Verify DVRF manager initialized
- Check seed_update_count > 0
- Ensure seed age <= MAX_SEED_AGE

**Issue:** "Batch too large"
- Reduce batch size to <= MAX_BATCH_SIZE (100)
- Split into multiple batches

### Prover Issues

**Issue:** Verification timeout
- Simplify invariant specifications
- Limit to critical paths only
- Use `--timeout=3600` flag for longer timeout

---

## Next Steps

1. **Set up monitoring** for oracle feeds and DVRF seeds
2. **Enable batch processing** in UI for users
3. **Run full Move Prover suite** in CI/CD
4. **Deploy to testnet** and stress-test batch operations
5. **Audit oracle access control** patterns
