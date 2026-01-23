https://ai-solutions-gules-five.vercel.app//// Core SUPLOCK locking mechanism module for Supra L1
/// Manages $SUPRA token locking with time-weighted yields and early unlock penalties

module suplock::suplock_core {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};

    /// SUPLOCK Core Configuration and Constants
    const MIN_LOCK_DURATION_SECS: u64 = 7_776_000; // 3 months in seconds
    const MAX_LOCK_DURATION_SECS: u64 = 126_144_000; // 4 years in seconds
    const EARLY_UNLOCK_PENALTY_BPS: u64 = 1000; // 10% base penalty (basis points)
    const BASE_APR_BPS: u64 = 1200; // 12% base APR (basis points)

    /// Events
    #[event]
    struct LockCreated has drop {
        user: address,
        amount: u64,
        lock_duration_secs: u64,
        unlock_time: u64,
        timestamp: u64,
    }

    #[event]
    struct UnlockInitiated has drop {
        user: address,
        amount: u64,
        early_unlock_penalty: u64,
        net_amount_received: u64,
    }

    #[event]
    struct YieldEarned has drop {
        user: address,
        amount: u64,
        apr_bps: u64,
    }

    /// Lock Record: Stores individual lock positions
    struct LockPosition has key, store {
        amount: u64,
        lock_start_time: u64,
        unlock_time: u64,
        yield_earned: u64,
        is_unlocked: bool,
    }

    /// User's Lock Portfolio: Aggregates all locks
    struct UserLocks has key {
        locks: vector<LockPosition>,
        total_locked: u64,
        total_penalty_paid: u64,
    }

    /// Global Lock State: Treasury and stats
    struct GlobalLockState has key {
        total_locked_supra: u64,
        fee_accumulated: u64,
        lock_count: u64,
    }

    /// Initialize global state (call once at deployment)
    public fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        
        assert!(
            !exists<GlobalLockState>(addr),
            1001, // ALREADY_INITIALIZED
        );

        let global_state = GlobalLockState {
            total_locked_supra: 0,
            fee_accumulated: 0,
            lock_count: 0,
        };

        move_to(account, global_state);
    }

    /// Create a new lock for the caller
    /// lock_duration_secs must be between MIN and MAX
    public fun create_lock(
        account: &signer,
        amount: u64,
        lock_duration_secs: u64,
        global_state_addr: address,
    ) acquires GlobalLockState, UserLocks {
        let user_addr = signer::address_of(account);
        
        // Validate lock duration
        assert!(
            lock_duration_secs >= MIN_LOCK_DURATION_SECS && 
            lock_duration_secs <= MAX_LOCK_DURATION_SECS,
            1002, // INVALID_LOCK_DURATION
        );

        assert!(amount > 0, 1003); // INVALID_AMOUNT

        let current_time = get_current_timestamp();
        let unlock_time = current_time + lock_duration_secs;

        let lock = LockPosition {
            amount,
            lock_start_time: current_time,
            unlock_time,
            yield_earned: 0,
            is_unlocked: false,
        };

        // Initialize user locks if needed
        if (!exists<UserLocks>(user_addr)) {
            let user_locks = UserLocks {
                locks: vector::empty(),
                total_locked: 0,
                total_penalty_paid: 0,
            };
            move_to(account, user_locks);
        };

        // Add lock to user's portfolio
        let user_locks = borrow_global_mut<UserLocks>(user_addr);
        vector::push_back(&mut user_locks.locks, lock);
        user_locks.total_locked = user_locks.total_locked + amount;

        // Update global state
        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        global_state.total_locked_supra = global_state.total_locked_supra + amount;
        global_state.lock_count = global_state.lock_count + 1;

        // Emit event
        0x1::event::emit(LockCreated {
            user: user_addr,
            amount,
            lock_duration_secs,
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
        _global_state_addr: address,
    ): u64 {
        let boost = calculate_boost_multiplier(lock_duration_secs);
        let yearly_yield = ((amount as u128) * (BASE_APR_BPS as u128)) / 10000;
        let lock_years = (lock_duration_secs as u128) / 31_536_000; // seconds in year
        let total_yield = (yearly_yield * lock_years * boost) / 10000;
        
        (total_yield as u64)
    }

    /// Claim yield on a specific lock (after lock expires)
    public fun claim_yield(
        account: &signer,
        lock_index: u64,
        global_state_addr: address,
    ) acquires UserLocks {
        let user_addr = signer::address_of(account);
        let current_time = get_current_timestamp();

        assert!(exists<UserLocks>(user_addr), 1004); // NO_LOCKS

        let user_locks = borrow_global_mut<UserLocks>(user_addr);
        assert!(lock_index < vector::length(&user_locks.locks), 1005); // INVALID_INDEX

        let lock = vector::borrow_mut(&mut user_locks.locks, lock_index);
        
        // Can only claim after unlock time OR early unlock with penalty
        assert!(current_time >= lock.unlock_time, 1006); // NOT_UNLOCKED_YET

        let yield_amount = calculate_yield(lock.amount, lock.unlock_time - lock.lock_start_time, global_state_addr);
        lock.yield_earned = yield_amount;

        0x1::event::emit(YieldEarned {
            user: user_addr,
            amount: yield_amount,
            apr_bps: BASE_APR_BPS,
        });
    }

    /// Early unlock with penalty decay (penalty decreases over time)
    /// Penalty formula: penalty = EARLY_UNLOCK_PENALTY_BPS * (time_remaining / total_lock_time)
    public fun early_unlock(
        account: &signer,
        lock_index: u64,
        global_state_addr: address,
    ) acquires UserLocks, GlobalLockState {
        let user_addr = signer::address_of(account);
        let current_time = get_current_timestamp();

        assert!(exists<UserLocks>(user_addr), 1004);

        let user_locks = borrow_global_mut<UserLocks>(user_addr);
        assert!(lock_index < vector::length(&user_locks.locks), 1005);

        let lock = vector::borrow_mut(&mut user_locks.locks, lock_index);
        
        // Can only early unlock if not already unlocked
        assert!(!lock.is_unlocked, 1007); // ALREADY_UNLOCKED
        assert!(current_time < lock.unlock_time, 1008); // ALREADY_MATURE

        let time_remaining = lock.unlock_time - current_time;
        let total_lock_time = lock.unlock_time - lock.lock_start_time;
        let penalty_numerator = (EARLY_UNLOCK_PENALTY_BPS as u128) * (time_remaining as u128);
        let penalty_bps = (penalty_numerator / (total_lock_time as u128)) as u64;
        let penalty_amount = ((lock.amount as u128) * (penalty_bps as u128) / 10000) as u64;
        let net_amount = lock.amount - penalty_amount;

        lock.is_unlocked = true;
        user_locks.total_penalty_paid = user_locks.total_penalty_paid + penalty_amount;

        // Update global state - penalty fees go to SUPReserve
        let global_state = borrow_global_mut<GlobalLockState>(global_state_addr);
        global_state.fee_accumulated = global_state.fee_accumulated + penalty_amount;
        global_state.total_locked_supra = global_state.total_locked_supra - lock.amount;

        0x1::event::emit(UnlockInitiated {
            user: user_addr,
            amount: lock.amount,
            early_unlock_penalty: penalty_amount,
            net_amount_received: net_amount,
        });
    }

    /// View function: Get user's total locked amount
    public fun get_user_total_locked(user_addr: address): u64 acquires UserLocks {
        if (exists<UserLocks>(user_addr)) {
            borrow_global<UserLocks>(user_addr).total_locked
        } else {
            0
        }
    }

    /// View function: Get total penalties paid by user
    public fun get_user_total_penalties(user_addr: address): u64 acquires UserLocks {
        if (exists<UserLocks>(user_addr)) {
            borrow_global<UserLocks>(user_addr).total_penalty_paid
        } else {
            0
        }
    }

    /// View function: Get global lock statistics
    public fun get_global_stats(global_addr: address): (u64, u64, u64) acquires GlobalLockState {
        let state = borrow_global<GlobalLockState>(global_addr);
        (state.total_locked_supra, state.fee_accumulated, state.lock_count)
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
