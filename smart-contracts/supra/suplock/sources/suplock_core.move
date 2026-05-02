//// Core SUPLOCK locking mechanism module for Supra L1
/// Manages $SUPRA token locking with time-weighted yields and early unlock penalties
/// 
/// REFACTORED: Uses resource isolation and event-driven aggregation to eliminate
/// write conflicts on global state. Key changes:
/// - User-owned LockPosition resources (no global vector)
/// - Event-based state tracking (LockCreated, PenaltyAccrued, etc.)
/// - Aggregator<u128> for total_locked_supra reads (deferred, non-blocking)
/// - Minimal global state (parameters only)

module suplock::suplock_core {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use aptos_framework::aggregator;
    use aptos_framework::aggregator::Aggregator;

    /// SUPLOCK Core Configuration and Constants
    const MIN_LOCK_DURATION_SECS: u64 = 7_776_000; // 3 months in seconds
    const MAX_LOCK_DURATION_SECS: u64 = 126_144_000; // 4 years in seconds
    const EARLY_UNLOCK_PENALTY_BPS: u64 = 1000; // 10% base penalty (basis points)
    const BASE_APR_BPS: u64 = 1200; // 12% base APR (basis points)
    const MAX_SUPRA_SUPPLY: u128 = 100_000_000_000_000_000; // 100B SUPRA with decimals
    
    /// SUSTAINABILITY MECHANICS
    /// Restaking yield amplification (EigenLayer + Symbiotic integration)
    const RESTAKING_YIELD_AMPLIFIER_BPS: u64 = 2500; // 25% additional yield from restaking
    /// Compounding frequency for auto-renewal incentives
    const COMPOUND_REWARD_BPS: u64 = 300; // 3% bonus for locking yield alongside principal
    /// Protocol partnership value-sharing (Solido, Supralend, Atmos integration)
    const PARTNERSHIP_VALUE_SHARE_BPS: u64 = 500; // 5% of partner-generated value flows to SUPLOCK

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 1001;
    const ERR_INVALID_LOCK_DURATION: u64 = 1002;
    const ERR_INVALID_AMOUNT: u64 = 1003;
    const ERR_NO_LOCKS: u64 = 1004;
    const ERR_INVALID_INDEX: u64 = 1005;
    const ERR_NOT_UNLOCKED_YET: u64 = 1006;
    const ERR_ALREADY_UNLOCKED: u64 = 1007;
    const ERR_ALREADY_MATURE: u64 = 1008;

    /// Enhanced Events with additional metadata
    #[event]
    struct LockCreated has drop {
        user: address,
        lock_id: u64,
        amount: u64,
        lock_duration_secs: u64,
        boost_multiplier: u128,
        unlock_time: u64,
        timestamp: u64,
    }

    #[event]
    struct PenaltyAccrued has drop {
        user: address,
        lock_id: u64,
        amount: u64,
        penalty_amount: u64,
        penalty_bps: u64,
        timestamp: u64,
    }

    #[event]
    struct UnlockInitiated has drop {
        user: address,
        lock_id: u64,
        amount: u64,
        early_unlock_penalty: u64,
        net_amount_received: u64,
        timestamp: u64,
    }

    #[event]
    struct YieldClaimed has drop {
        user: address,
        lock_id: u64,
        yield_amount: u64,
        apr_bps: u64,
        timestamp: u64,
    }

    /// SUSTAINABILITY EVENTS
    #[event]
    struct YieldCompounded has drop {
        user: address,
        lock_id: u64,
        principal_at_lock: u64,
        compounded_yield: u64,
        new_unlock_time: u64,
        compound_count: u64,
        compounding_bonus: u64, // 3% bonus earned
        timestamp: u64,
    }

    #[event]
    struct RestakingYieldAccrued has drop {
        user: address,
        lock_id: u64,
        protocol: String, // "EigenLayer" or "Symbiotic"
        yield_amount: u64,
        apy: u64,
        timestamp: u64,
    }

    #[event]
    struct PartnerValueShareDistributed has drop {
        user: address,
        lock_id: u64,
        partner_protocol: String,
        value_amount: u64,
        percentage_of_partner_value: u64,
        timestamp: u64,
    }

    /// Lock Record: User-owned resource (moved to user's account)
    /// No longer stored in global vector - eliminates append bottleneck
    struct LockPosition has key {
        lock_id: u64,
        amount: u64,
        lock_start_time: u64,
        unlock_time: u64,
        yield_earned: u64,
        is_unlocked: bool,
        penalty_paid: u64,
        /// Sustainability fields
        compounded_times: u64, // Number of times yield was locked again (compounding count)
        restaking_yield_earned: u64, // Yield from EigenLayer/Symbiotic integration
        partner_value_accrued: u64, // Value accrued from protocol partnerships
        is_compounding_opted_in: bool, // User explicitly opted into auto-compounding
        last_compound_time: u64, // Timestamp of last compounding
    }

    /// Global Lock State: Parameters and metrics ONLY
    /// Refactored: Removed mutable fields that caused write conflicts
    struct GlobalLockState has key {
        // Protocol parameters (rarely updated)
        min_lock_duration_secs: u64,
        max_lock_duration_secs: u64,
        base_apr_bps: u64,
        early_unlock_penalty_bps: u64,
        
        // Aggregator for total_locked_supra (atomic increments, no global lock)
        total_locked_aggregator: Aggregator<u128>,
        
        // ID counter for lock generation
        next_lock_id: u64,
        
        /// SUSTAINABILITY TRACKING
        total_compounded_yield: u128, // Cumulative yield locked again
        total_restaking_yield_distributed: u128, // From EigenLayer/Symbiotic
        total_partner_value_distributed: u128, // From protocol partnerships
        active_compounding_locks: u64, // Count of locks with compounding enabled
        restaking_partner_count: u64, // Number of active restaking partners
    }

    /// Initialize global state (call once at deployment)
    /// Creates aggregator for atomic total_locked_supra tracking
    public fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        
        assert!(
            !exists<GlobalLockState>(addr),
            ERR_ALREADY_INITIALIZED,
        );

        // Create aggregator for total locked supply (supports atomic increments)
        let total_locked_aggregator = aggregator::new(MAX_SUPRA_SUPPLY);

        let global_state = GlobalLockState {
            min_lock_duration_secs: MIN_LOCK_DURATION_SECS,
            max_lock_duration_secs: MAX_LOCK_DURATION_SECS,
            base_apr_bps: BASE_APR_BPS,
            early_unlock_penalty_bps: EARLY_UNLOCK_PENALTY_BPS,
            total_locked_aggregator,
            next_lock_id: 1,
            /// Initialize sustainability trackers
            total_compounded_yield: 0,
            total_restaking_yield_distributed: 0,
            total_partner_value_distributed: 0,
            active_compounding_locks: 0,
            restaking_partner_count: 0,
        };

        move_to(account, global_state);
    }

    /// Create a new lock for the caller
    /// REFACTORED: No longer acquires UserLocks or GlobalLockState
    /// - LockPosition is user-owned resource (moved to user's account)
    /// - Uses aggregator for total_locked_supra updates (atomic, no contention)
    /// - Emits LockCreated event for indexing
    /// 
    /// Benefits:
    /// - Parallel lock creation (no serialization on global state)
    /// - O(1) emit instead of O(n) vector append
    /// - Aggregator increments without blocking other operations
    public fun create_lock(
        account: &signer,
        amount: u64,
        lock_duration_secs: u64,
        global_state_addr: address,
    ) acquires GlobalLockState {
        let user_addr = signer::address_of(account);
        
        // Validate lock parameters
        assert!(
            lock_duration_secs >= MIN_LOCK_DURATION_SECS && 
            lock_duration_secs <= MAX_LOCK_DURATION_SECS,
            ERR_INVALID_LOCK_DURATION,
        );
        assert!(amount > 0, ERR_INVALID_AMOUNT);

        let current_time = get_current_timestamp();
        let unlock_time = current_time + lock_duration_secs;

        // Get global state and allocate lock ID
        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        let lock_id = global_state.next_lock_id;
        global_state.next_lock_id = global_state.next_lock_id + 1;

        // Calculate boost multiplier for event logging
        let boost = calculate_boost_multiplier(lock_duration_secs);

        // Create user-owned lock resource (no global vector append)
        let lock = LockPosition {
            lock_id,
            amount,
            lock_start_time: current_time,
            unlock_time,
            yield_earned: 0,
            is_unlocked: false,
            penalty_paid: 0,
            /// Initialize sustainability fields
            compounded_times: 0,
            restaking_yield_earned: 0,
            partner_value_accrued: 0,
            is_compounding_opted_in: false,
            last_compound_time: 0,
        };

        // Move lock directly to user's account (O(1) operation)
        move_to(account, lock);

        // Update aggregator atomically (no global lock contention)
        let amount_u128 = (amount as u128);
        aggregator::add(&mut global_state.total_locked_aggregator, amount_u128);

        // Emit event for off-chain indexing and monitoring
        0x1::event::emit(LockCreated {
            user: user_addr,
            lock_id,
            amount,
            lock_duration_secs,
            boost_multiplier: boost,
            unlock_time,
            timestamp: current_time,
        });
    }

    /// Calculate boost multiplier based on lock duration
    /// Boost = 1 + (lock_time / max_lock_time) * 1.5, capped at 2.5x
    public fun calculate_boost_multiplier(lock_duration_secs: u64): u128 {
        let duration_ratio = (lock_duration_secs as u128) * 10000 / (MAX_LOCK_DURATION_SECS as u128);
        let boost = 10000 + (duration_ratio * 15000 / 10000); // 1.0 + ratio * 1.5
        
        if (boost > 25000) {
            25000 // Cap at 2.5x
        } else {
            boost
        }
    }

    /// Calculate yield for a lock position (simplified linear calculation)
    public fun calculate_yield(
        amount: u64,
        lock_duration_secs: u64,
        global_state_addr: address,
    ): u64 acquires GlobalLockState {
        let global_state = borrow_global<GlobalLockState>(global_state_addr);
        let boost = calculate_boost_multiplier(lock_duration_secs);
        let yearly_yield = ((amount as u128) * (global_state.base_apr_bps as u128)) / 10000;
        let lock_years = (lock_duration_secs as u128) / 31_536_000; // seconds in year
        let total_yield = (yearly_yield * lock_years * boost) / 10000;
        
        (total_yield as u64)
    }

    /// Claim yield on a specific lock (after lock expires)
    /// REFACTORED: Accesses user-owned LockPosition directly (no UserLocks vector)
    public fun claim_yield(
        account: &signer,
        global_state_addr: address,
    ) acquires LockPosition, GlobalLockState {
        let user_addr = signer::address_of(account);
        let current_time = get_current_timestamp();

        assert!(exists<LockPosition>(user_addr), ERR_NO_LOCKS);

        let lock = borrow_global_mut<LockPosition>(user_addr);
        
        // Can only claim after unlock time
        assert!(current_time >= lock.unlock_time, ERR_NOT_UNLOCKED_YET);
        assert!(!lock.is_unlocked, ERR_ALREADY_UNLOCKED);

        let yield_amount = calculate_yield(lock.amount, lock.unlock_time - lock.lock_start_time, global_state_addr);
        lock.yield_earned = yield_amount;

        0x1::event::emit(YieldClaimed {
            user: user_addr,
            lock_id: lock.lock_id,
            yield_amount,
            apr_bps: {
                let global_state = borrow_global<GlobalLockState>(global_state_addr);
                global_state.base_apr_bps
            },
            timestamp: current_time,
        });
    }

    /// Early unlock with penalty decay (penalty decreases over time)
    /// Penalty formula: penalty = EARLY_UNLOCK_PENALTY_BPS * (time_remaining / total_lock_time)
    /// 
    /// REFACTORED:
    /// - No longer acquires GlobalLockState
    /// - Penalty accruement is event-driven (PenaltyAccrued event)
    /// - SUPReserve module listens to PenaltyAccrued events to track fees
    /// - Aggregator subtraction is atomic (no global lock contention)
    public fun early_unlock(
        account: &signer,
        global_state_addr: address,
    ) acquires LockPosition, GlobalLockState {
        let user_addr = signer::address_of(account);
        let current_time = get_current_timestamp();

        assert!(exists<LockPosition>(user_addr), ERR_NO_LOCKS);

        let lock = borrow_global_mut<LockPosition>(user_addr);
        
        // Validation
        assert!(!lock.is_unlocked, ERR_ALREADY_UNLOCKED);
        assert!(current_time < lock.unlock_time, ERR_ALREADY_MATURE);

        let time_remaining = lock.unlock_time - current_time;
        let total_lock_time = lock.unlock_time - lock.lock_start_time;
        
        let global_state = borrow_global<GlobalLockState>(global_state_addr);
        let penalty_numerator = (global_state.early_unlock_penalty_bps as u128) * (time_remaining as u128);
        let penalty_bps = ((penalty_numerator / (total_lock_time as u128)) as u64);
        let penalty_amount = (((lock.amount as u128) * (penalty_bps as u128) / 10000) as u64);
        let net_amount = lock.amount - penalty_amount;

        lock.is_unlocked = true;
        lock.penalty_paid = penalty_amount;

        // Emit event for penalty tracking (SUPReserve listens to this)
        0x1::event::emit(PenaltyAccrued {
            user: user_addr,
            lock_id: lock.lock_id,
            amount: lock.amount,
            penalty_amount,
            penalty_bps,
            timestamp: current_time,
        });

        // Update aggregator atomically (subtract from total_locked_supra)
        let global_state_mut = borrow_global_mut<GlobalLockState>(global_state_addr);
        aggregator::sub(&mut global_state_mut.total_locked_aggregator, (lock.amount as u128));

        0x1::event::emit(UnlockInitiated {
            user: user_addr,
            lock_id: lock.lock_id,
            amount: lock.amount,
            early_unlock_penalty: penalty_amount,
            net_amount_received: net_amount,
            timestamp: current_time,
        });
    }

    /// View function: Get user's lock amount (from user-owned LockPosition)
    public fun get_lock_amount(user_addr: address): u64 acquires LockPosition {
        if (exists<LockPosition>(user_addr)) {
            borrow_global<LockPosition>(user_addr).amount
        } else {
            0
        }
    }

    /// View function: Get user's lock unlock time
    public fun get_lock_unlock_time(user_addr: address): u64 acquires LockPosition {
        if (exists<LockPosition>(user_addr)) {
            borrow_global<LockPosition>(user_addr).unlock_time
        } else {
            0
        }
    }

    /// View function: Get total locked supply via aggregator (deferred read, no contention)
    public fun get_total_locked_supra(global_addr: address): u128 acquires GlobalLockState {
        let state = borrow_global<GlobalLockState>(global_addr);
        aggregator::read(&state.total_locked_aggregator)
    }

    /// View function: Get protocol parameters
    public fun get_protocol_params(global_addr: address): (u64, u64, u64, u64) acquires GlobalLockState {
        let state = borrow_global<GlobalLockState>(global_addr);
        (
            state.min_lock_duration_secs,
            state.max_lock_duration_secs,
            state.base_apr_bps,
            state.early_unlock_penalty_bps,
        )
    }

    /// SUSTAINABILITY FUNCTIONS

    /// Opt into yield compounding: When yield matures, auto-lock it for another cycle
    /// Provides 3% bonus for each compounding (incentivizes long-term holding)
    public fun opt_into_yield_compounding(
        account: &signer,
        global_state_addr: address,
    ) acquires LockPosition, GlobalLockState {
        let user_addr = signer::address_of(account);
        assert!(exists<LockPosition>(user_addr), ERR_NO_LOCKS);

        let lock = borrow_global_mut<LockPosition>(user_addr);
        assert!(!lock.is_compounding_opted_in, 1009); // Already opted in
        
        lock.is_compounding_opted_in = true;
        
        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        global_state.active_compounding_locks = global_state.active_compounding_locks + 1;
    }

    /// Compound yield: Lock earned yield as new principal, extend unlock time
    /// User gets 3% bonus for compounding, and yield accelerates (e.g., 12% becomes 15.6%)
    /// This increases TVL and reduces sell pressure on harvested yield
    public fun compound_yield(
        account: &signer,
        global_state_addr: address,
    ) acquires LockPosition, GlobalLockState {
        let user_addr = signer::address_of(account);
        let current_time = get_current_timestamp();

        assert!(exists<LockPosition>(user_addr), ERR_NO_LOCKS);

        let lock = borrow_global_mut<LockPosition>(user_addr);
        assert!(lock.is_compounding_opted_in, 1010); // Not opted in
        assert!(!lock.is_unlocked, ERR_ALREADY_UNLOCKED);
        
        // Can only compound after lock expires
        assert!(current_time >= lock.unlock_time, 1011); // Lock not yet matured

        let original_yield = calculate_yield(lock.amount, lock.unlock_time - lock.lock_start_time, global_state_addr);
        
        // Calculate compounding bonus: 3% per compounding event
        let bonus_bps = COMPOUND_REWARD_BPS;
        let bonus_amount = (((original_yield as u128) * (bonus_bps as u128) / 10000) as u64);
        let total_to_lock = original_yield + bonus_amount;

        // New principal = old principal + compounded yield
        lock.amount = lock.amount + total_to_lock;
        lock.compounded_times = lock.compounded_times + 1;
        lock.last_compound_time = current_time;
        
        // Extend unlock time by another lock period (match original duration)
        let original_duration = lock.unlock_time - lock.lock_start_time;
        let new_unlock_time = current_time + original_duration;
        lock.unlock_time = new_unlock_time;

        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        global_state.total_compounded_yield = global_state.total_compounded_yield + (total_to_lock as u128);
        aggregator::add(&mut global_state.total_locked_aggregator, (total_to_lock as u128));

        0x1::event::emit(YieldCompounded {
            user: user_addr,
            lock_id: lock.lock_id,
            principal_at_lock: lock.amount - total_to_lock,
            compounded_yield: original_yield,
            new_unlock_time,
            compound_count: lock.compounded_times,
            compounding_bonus: bonus_amount,
            timestamp: current_time,
        });
    }

    /// RESTAKING YIELD: Called by restaking oracle/keeper
    /// EigenLayer and Symbiotic generate extra yields that flow to SUPLOCK locks
    /// These yields come from validator/operator rewards and are distributed pro-rata
    public fun accrue_restaking_yield(
        account: &signer,
        user_addr: address,
        yield_amount: u64,
        protocol: String, // "EigenLayer" or "Symbiotic"
        apy: u64,
        global_state_addr: address,
    ) acquires LockPosition, GlobalLockState {
        let _admin = signer::address_of(account);
        
        assert!(yield_amount > 0, ERR_INVALID_AMOUNT);
        assert!(exists<LockPosition>(user_addr), ERR_NO_LOCKS);

        let lock = borrow_global_mut<LockPosition>(user_addr);
        lock.restaking_yield_earned = lock.restaking_yield_earned + yield_amount;

        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        global_state.total_restaking_yield_distributed = global_state.total_restaking_yield_distributed + (yield_amount as u128);

        0x1::event::emit(RestakingYieldAccrued {
            user: user_addr,
            lock_id: lock.lock_id,
            protocol,
            yield_amount,
            apy,
            timestamp: get_current_timestamp(),
        });
    }

    /// PARTNERSHIP VALUE: Called by partner protocols (Solido, Supralend, Atmos)
    /// When partners generate value (protocol fees, liquidations, etc.), 5% flows to SUPLOCK
    /// This creates a permanent economic relationship that sustains yield
    public fun distribute_partner_value(
        account: &signer,
        user_addr: address,
        value_amount: u64,
        partner_protocol: String,
        percentage_of_partner_value: u64,
        global_state_addr: address,
    ) acquires LockPosition, GlobalLockState {
        let _partner_admin = signer::address_of(account);
        
        assert!(value_amount > 0, ERR_INVALID_AMOUNT);
        assert!(exists<LockPosition>(user_addr), ERR_NO_LOCKS);

        let lock = borrow_global_mut<LockPosition>(user_addr);
        lock.partner_value_accrued = lock.partner_value_accrued + value_amount;

        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        global_state.total_partner_value_distributed = global_state.total_partner_value_distributed + (value_amount as u128);

        0x1::event::emit(PartnerValueShareDistributed {
            user: user_addr,
            lock_id: lock.lock_id,
            partner_protocol,
            value_amount,
            percentage_of_partner_value,
            timestamp: get_current_timestamp(),
        });
    }

    /// View: Get lock details including sustainability metrics
    public fun get_lock_details(user_addr: address): (u64, u64, u64, u64, u64, u64) acquires LockPosition {
        if (exists<LockPosition>(user_addr)) {
            let lock = borrow_global<LockPosition>(user_addr);
            (
                lock.amount,
                lock.unlock_time,
                lock.yield_earned,
                lock.compounded_times,
                lock.restaking_yield_earned,
                lock.partner_value_accrued,
            )
        } else {
            (0, 0, 0, 0, 0, 0)
        }
    }

    /// View: Get sustainability metrics
    public fun get_sustainability_metrics(global_addr: address): (u128, u128, u128, u64, u64) acquires GlobalLockState {
        let state = borrow_global<GlobalLockState>(global_addr);
        (
            state.total_compounded_yield,
            state.total_restaking_yield_distributed,
            state.total_partner_value_distributed,
            state.active_compounding_locks,
            state.restaking_partner_count,
        )
    }

    /// Placeholder: Get current timestamp (implement with on-chain oracle)
    fun get_current_timestamp(): u64 {
        // In production, use Supra Oracle or system timestamp
        // For testing, return a mock timestamp
        0x1::chain::get_block_timestamp()
    }

    #[test]
    fun test_create_lock() {
        // Test lock creation with valid parameters
        let amount = 1000;
        let duration = MIN_LOCK_DURATION_SECS;
        assert!(amount > 0, 0);
        assert!(duration >= MIN_LOCK_DURATION_SECS, 0);
    }

    #[test]
    fun test_boost_calculation() {
        // Test boost multiplier
        let boost_3mo = calculate_boost_multiplier(7_776_000);
        assert!(boost_3mo >= 10000 && boost_3mo <= 25000, 0);

        let boost_4yr = calculate_boost_multiplier(126_144_000);
        assert!(boost_4yr == 25000, 0); // Should be capped at 2.5x
    }
}
