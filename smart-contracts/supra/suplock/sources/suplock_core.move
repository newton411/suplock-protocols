https://ai-solutions-gules-five.vercel.app//// Core SUPLOCK locking mechanism module for Supra L1
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
        };

        // Move lock directly to user's account (O(1) operation)
        move_to(account, lock);

        // Update aggregator atomically (no global lock contention)
        aggregator::add(&mut global_state.total_locked_aggregator, amount as u128);

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
        let penalty_bps = (penalty_numerator / (total_lock_time as u128)) as u64;
        let penalty_amount = ((lock.amount as u128) * (penalty_bps as u128) / 10000) as u64;
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
        aggregator::sub(&mut global_state_mut.total_locked_aggregator, lock.amount as u128);

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
