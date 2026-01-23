# SUPLOCK Developer Quick Reference

## Installation & Setup

### Prerequisites
```bash
npm install supra-l1-sdk
```

### Initialize Components

```move
// Initialize oracle (once at deployment)
oracle_integration::initialize_oracle(&deployer);

// Initialize DVRF (once at deployment)
dvrf_integration::initialize_dvrf(&deployer);

// Initialize batch processor (optional, recommended for users)
gas_optimization::initialize_batch_processor(&batch_admin);
```

---

## Oracle Integration - Quick Start

### Add Price Feed
```move
oracle_integration::add_feed(
    updater,      // Must have ROLE_UPDATER
    String::utf8(b"APY"),
    oracle_address,
    12000,        // 12% APY (in BPS)
    8,            // Decimals
    oracle_config_addr,
);
```

### Query Price
```move
let (price, decimals) = oracle_integration::get_feed_price(feed_id, oracle_config_addr);
```

### Upgrade Oracle Address (Critical Path)
```move
oracle_integration::update_oracle_address(
    admin,
    feed_id,
    new_oracle_address,
    oracle_config_addr,
);
```

---

## Move Prover - Quick Start

### Run Verification
```bash
cd smart-contracts/supra/suplock
move prove
```

### Check Results
```
✓ All specifications verified
✗ Violation: total_locked < sum_of_user_locks
  Counterexample: create_lock called with invalid amounts
```

### Common Invariants
- **Total locked**: `total_locked >= sum_of_all_user_locks`
- **No double-unlock**: `lock.is_unlocked ==> penalty_paid > 0`
- **Vote once**: `count_votes(voter, proposal) <= 1`
- **Fee conservation**: `sum of allocations == total_fees`

---

## DVRF - Quick Start

### Update Randomness Seed (Periodic)
```move
dvrf_integration::update_randomness_seed(
    oracle_caller,
    seed_from_supra,
    dvrf_manager_addr,
);
```

### Fair Selection
```move
let winner = dvrf_integration::select_random_committee_member(
    candidates,
    dvrf_manager_addr,
);
```

### Fair Lottery (Distribute N rewards to M candidates)
```move
let winners = dvrf_integration::fair_lottery_distribution(
    all_candidates,
    num_winners,
    dvrf_manager_addr,
);
```

### Randomized Order (Prevent MEV)
```move
let order = dvrf_integration::randomize_processing_order(
    claim_ids,
    dvrf_manager_addr,
);
```

---

## Gas Optimization - Quick Start

### Batch Lock Creation
```move
let amounts = vector![1000, 2000, 3000];
let durations = vector![7_776_000, 7_776_000, 7_776_000];

let batch = gas_optimization::prepare_lock_batch(amounts, durations);
gas_optimization::execute_lock_batch(account, batch, global_state_addr);
// Saves ~40% gas vs 3 individual transactions
```

### Batch Dividend Claims
```move
let users = vector![@user1, @user2, /* ... */, @user50];
let amounts = vector![100, 200, /* ... */, 500];

let batch = gas_optimization::prepare_dividend_batch(users, amounts);
gas_optimization::execute_dividend_batch(admin, batch, reserve_addr);
// Saves ~50% gas vs 50 individual transactions
```

### Batch Yields
```move
let lock_ids = vector![1, 2, 3, 4, 5];
let batch = gas_optimization::prepare_yield_batch(user_addr, lock_ids);
gas_optimization::execute_yield_batch(account, batch, global_state_addr);
// Saves ~45% gas vs 5 individual claims
```

### Batch Voting
```move
let batch = gas_optimization::prepare_vote_batch(
    proposal_id,
    voters,
    ve_balances,
    vote_directions,
);
gas_optimization::execute_vote_batch(admin, batch, proposal_addr);
// Saves ~55% gas vs individual votes
```

---

## Role Management - Quick Start

### Grant Updater Role (to oracle operator)
```move
oracle_integration::grant_role(
    admin,
    operator_address,
    2,  // ROLE_UPDATER
    oracle_config_addr,
);
```

### Grant Reader Role (to external service)
```move
oracle_integration::grant_role(
    admin,
    service_address,
    3,  // ROLE_READER
    oracle_config_addr,
);
```

### Revoke Role
```move
oracle_integration::revoke_role(
    admin,
    user_address,
    role,
    oracle_config_addr,
);
```

---

## Event Monitoring

### Watch Oracle Changes
```typescript
// Off-chain (TypeScript)
const events = await queryEvents({
  module: 'oracle_integration',
  event: 'FeedUpdated',
});

events.forEach(e => {
  console.log(`Feed ${e.feed_id}: ${e.old_price} → ${e.new_price}`);
});
```

### Monitor DVRF Seed Updates
```typescript
const events = await queryEvents({
  module: 'dvrf_integration',
  event: 'RandomnessSeedUpdated',
});

const latest = events[events.length - 1];
console.log(`Seed age: ${Date.now() - latest.timestamp}ms`);
```

### Track Batch Processing
```typescript
const events = await queryEvents({
  module: 'gas_optimization',
  event: 'BatchProcessingCompleted',
});

const total_gas_saved = events.reduce((sum, e) => sum + e.gas_saved, 0);
console.log(`Total gas saved: ${total_gas_saved}`);
```

---

## Error Codes

### Oracle Integration
- `3001` - Unauthorized (wrong role)
- `3002` - Invalid feed
- `3003` - Stale feed (>6 hours old)
- `3004` - Oracle unavailable
- `3005` - Invalid price
- `3006` - Feed not found

### DVRF
- `4001` - Invalid entropy (empty seed)
- `4002` - Randomness unavailable
- `4003` - Unauthorized
- `4004` - Seed expired (>1 hour old)

### Gas Optimization
- `5001` - Empty batch
- `5002` - Batch too large (>100)
- `5003` - Invalid index

---

## Best Practices

### Oracle
- ✅ Use fallback feeds for critical data
- ✅ Monitor feed freshness in UI
- ✅ Rotate oracle updater role regularly
- ✅ Validate price deviation before accepting
- ❌ Never modify feed address directly (use update_oracle_address)
- ❌ Don't trust stale feeds (>6 hours old)

### DVRF
- ✅ Update seed from Supra periodically
- ✅ Verify seed freshness before consumption
- ✅ Use DVRF for all governance randomness
- ✅ Log consumption for audit trail
- ❌ Never use block height as randomness source
- ❌ Don't assume deterministic ordering

### Batching
- ✅ Use batches for user onboarding (multiple locks)
- ✅ Batch dividend claims after distribution
- ✅ Batch voting in voting period closing minutes
- ✅ Limit batch size to 100 items
- ❌ Don't batch time-critical operations
- ❌ Don't batch operations that might fail individually

### Prover
- ✅ Run `move prove` in CI/CD pipeline
- ✅ Add specs for all critical paths
- ✅ Review counterexamples carefully
- ✅ Add invariants before code changes
- ❌ Don't ignore Prover violations
- ❌ Don't remove specs without audit

---

## Example: Complete Integration

```move
public fun process_distribution_with_optimizations(
    admin: &signer,
    oracle_addr: address,
    dvrf_addr: address,
    reserve_addr: address,
) {
    // 1. Query dynamic APY from oracle
    let (apy_bps, _decimals) = oracle_integration::get_feed_price(
        APY_FEED_ID,
        oracle_addr,
    );

    // 2. Use DVRF to fairly select dividend recipients
    let all_users = vector![@user1, @user2, /* ... */, @user1000];
    let selected = dvrf_integration::fair_lottery_distribution(
        all_users,
        500,  // Select 500 lucky recipients
        dvrf_addr,
    );

    // 3. Calculate dividends for each recipient
    let users = vector::empty();
    let amounts = vector::empty();
    
    for user in selected {
        let dividend = calculate_dividend(user, apy_bps);
        vector::push_back(&mut users, user);
        vector::push_back(&mut amounts, dividend);
    };

    // 4. Claim dividends in batches (randomized order for MEV prevention)
    let randomized_order = dvrf_integration::randomize_processing_order(
        users,
        dvrf_addr,
    );

    // Process in randomized order
    let batch = gas_optimization::prepare_dividend_batch(randomized_order, amounts);
    gas_optimization::execute_dividend_batch(admin, batch, reserve_addr);
    
    // Gas savings: 50% vs individual claims!
}
```

---

## Resources

- [Supra L1 SDK Docs](https://docs.supra.com/)
- [Move Prover Guide](https://move-book.com/advanced-topics/prover.html)
- [SUPLOCK Architecture](./ARCHITECTURE_REFERENCE.md)
- [Integration Guide](./SUPLOCK_ADVANCED_INTEGRATION_GUIDE.md)
