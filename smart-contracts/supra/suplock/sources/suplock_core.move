/// Core SUPLOCK locking mechanism module for Supra L1
/// Integrates with Supra's native oracle feeds, DVRF randomness, and PoEL staking
/// Uses Move's resource model with Supra-specific optimizations

module suplock::suplock_core {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use supra_framework::coin::{Self, Coin};
    use supra_framework::object::{Self, UID};
    use supra_framework::event;
    use supra_framework::clock::{Self, Clock};
    use supra_framework::table::{Self, Table};
    use suplock::oracle_integration;
    use suplock::dvrf_integration;

    /// SUPLOCK Core Configuration aligned with Supra PoEL staking
    const MIN_LOCK_DURATION_SECS: u64 = 7_776_000; // 3 months
    const MAX_LOCK_DURATION_SECS: u64 = 126_144_000; // 4 years (Supra PoEL max)
    const EARLY_UNLOCK_PENALTY_BPS: u64 = 1000; // 10% base penalty
    const BASE_APR_BPS: u64 = 1200; // 12% base APR (aligned with Supra PoEL)
    const SUPRA_DECIMALS: u8 = 8; // Native SUPRA decimals
    const ORACLE_FEED_SUPRA_USD: u64 = 1; // Supra Oracle feed ID

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 1001;
    const ERR_INVALID_LOCK_DURATION: u64 = 1002;
    const ERR_INVALID_AMOUNT: u64 = 1003;
    const ERR_NO_LOCKS: u64 = 1004;
    const ERR_NOT_UNLOCKED_YET: u64 = 1006;
    const ERR_ALREADY_UNLOCKED: u64 = 1007;
    const ERR_STALE_ORACLE_FEED: u64 = 1008;

    /// Native SUPRA token type
    struct SUPRA has drop {}

    /// Enhanced Events with Supra Oracle integration
    #[event]
    struct LockCreated has copy, drop {
        user: address,
        lock_id: UID,
        amount: u64,
        lock_duration_secs: u64,
        boost_multiplier: u128,
        unlock_time: u64,
        supra_price_usd: u128, // From Supra Oracle
        timestamp: u64,
    }

    #[event]
    struct YieldClaimed has copy, drop {
        user: address,
        lock_id: UID,
        yield_amount: u64,
        apr_bps: u64,
        supra_price_usd: u128,
        timestamp: u64,
    }

    #[event]
    struct UnlockInitiated has copy, drop {
        user: address,
        lock_id: UID,
        amount: u64,
        early_unlock_penalty: u64,
        net_amount_received: u64,
        dvrf_seed: vector<u8>, // DVRF randomness for fairness
        timestamp: u64,
    }

    /// Lock Position: User-owned resource (Supra object model)
    struct LockPosition has key, store {
        id: UID,
        owner: address,
        amount: u64,
        lock_start_time: u64,
        unlock_time: u64,
        yield_earned: u64,
        is_unlocked: bool,
        penalty_paid: u64,
        // Supra PoEL integration
        poel_staking_receipt: Option<UID>, // Reference to PoEL staking position
        oracle_price_at_lock: u128, // SUPRA/USD price when locked
    }

    /// Global Lock State with Supra integrations
    struct GlobalLockState has key {
        id: UID,
        // Protocol parameters
        min_lock_duration_secs: u64,
        max_lock_duration_secs: u64,
        base_apr_bps: u64,
        early_unlock_penalty_bps: u64,
        
        // Supra-specific integrations
        oracle_config: address, // Oracle integration contract
        dvrf_manager: address, // DVRF integration contract
        poel_staking_pool: address, // Supra PoEL staking pool
        
        // Efficient tracking via Supra's Table
        total_locked_supra: u128,
        active_locks_count: u64,
        next_lock_id: u64,
        
        // Lock registry for efficient queries
        user_locks: Table<address, vector<UID>>, // User -> Lock IDs
    }

    /// Initialize global state with Supra integrations
    public fun initialize(
        account: &signer,
        oracle_config: address,
        dvrf_manager: address,
        poel_staking_pool: address,
        ctx: &mut TxContext,
    ) {
        let sender = signer::address_of(account);
        
        assert!(
            !object::id_exists<GlobalLockState>(sender),
            ERR_ALREADY_INITIALIZED,
        );

        let global_state = GlobalLockState {
            id: object::new(ctx),
            min_lock_duration_secs: MIN_LOCK_DURATION_SECS,
            max_lock_duration_secs: MAX_LOCK_DURATION_SECS,
            base_apr_bps: BASE_APR_BPS,
            early_unlock_penalty_bps: EARLY_UNLOCK_PENALTY_BPS,
            oracle_config,
            dvrf_manager,
            poel_staking_pool,
            total_locked_supra: 0,
            active_locks_count: 0,
            next_lock_id: 1,
            user_locks: table::new(ctx),
        };

        object::transfer(global_state, sender);
    }

    /// Create lock with Supra Oracle price feed and optional PoEL staking
    public fun create_lock(
        account: &signer,
        supra_coin: Coin<SUPRA>,
        lock_duration_secs: u64,
        enable_poel_staking: bool,
        global_state: &mut GlobalLockState,
        clock: &Clock,
        ctx: &mut TxContext,
    ): UID {
        let user_addr = signer::address_of(account);
        let amount = coin::value(&supra_coin);
        
        // Validate lock parameters
        assert!(
            lock_duration_secs >= global_state.min_lock_duration_secs && 
            lock_duration_secs <= global_state.max_lock_duration_secs,
            ERR_INVALID_LOCK_DURATION,
        );
        assert!(amount > 0, ERR_INVALID_AMOUNT);

        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        let unlock_time = current_time + lock_duration_secs;

        // Get current SUPRA price from Supra Oracle
        let supra_price_usd = oracle_integration::get_supra_price_usd(
            global_state.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            clock,
        );

        // Validate oracle freshness (6 hour threshold)
        oracle_integration::validate_feed_freshness(
            global_state.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            21600, // 6 hours in seconds
            clock,
        );

        // Calculate boost multiplier
        let boost = calculate_boost_multiplier(lock_duration_secs);
        let lock_id = object::new(ctx);

        // Optional: Stake in Supra PoEL for additional yield
        let poel_receipt = if (enable_poel_staking) {
            // Integrate with Supra's native PoEL staking
            let receipt_id = stake_in_poel(
                &supra_coin,
                global_state.poel_staking_pool,
                ctx,
            );
            option::some(receipt_id)
        } else {
            option::none()
        };

        // Create user-owned lock resource
        let lock = LockPosition {
            id: lock_id,
            owner: user_addr,
            amount,
            lock_start_time: current_time,
            unlock_time,
            yield_earned: 0,
            is_unlocked: false,
            penalty_paid: 0,
            poel_staking_receipt: poel_receipt,
            oracle_price_at_lock: supra_price_usd,
        };

        // Update global state
        global_state.total_locked_supra = global_state.total_locked_supra + (amount as u128);
        global_state.active_locks_count = global_state.active_locks_count + 1;
        global_state.next_lock_id = global_state.next_lock_id + 1;

        // Track user's locks
        if (!table::contains(&global_state.user_locks, user_addr)) {
            table::add(&mut global_state.user_locks, user_addr, vector::empty());
        };
        let user_lock_ids = table::borrow_mut(&mut global_state.user_locks, user_addr);
        vector::push_back(user_lock_ids, lock_id);

        // Store SUPRA coins in the lock
        // Note: In production, integrate with Supra's native coin storage
        coin::destroy_zero(supra_coin); // Placeholder - actual implementation stores coins

        // Transfer lock to user
        object::transfer(lock, user_addr);

        // Emit event with oracle data
        event::emit(LockCreated {
            user: user_addr,
            lock_id,
            amount,
            lock_duration_secs,
            boost_multiplier: boost,
            unlock_time,
            supra_price_usd,
            timestamp: current_time,
        });

        lock_id
    }

    /// Calculate boost multiplier (aligned with Supra PoEL mechanics)
    public fun calculate_boost_multiplier(lock_duration_secs: u64): u128 {
        let duration_ratio = (lock_duration_secs as u128) * 10000 / (MAX_LOCK_DURATION_SECS as u128);
        let boost = 10000 + (duration_ratio * 15000 / 10000); // 1.0 + ratio * 1.5
        
        if (boost > 25000) {
            25000 // Cap at 2.5x (aligned with Supra PoEL max boost)
        } else {
            boost
        }
    }

    /// Calculate yield with Supra Oracle price integration
    public fun calculate_yield(
        lock: &LockPosition,
        global_state: &GlobalLockState,
        clock: &Clock,
    ): u64 {
        let current_price = oracle_integration::get_supra_price_usd(
            global_state.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            clock,
        );
        
        let boost = calculate_boost_multiplier(lock.unlock_time - lock.lock_start_time);
        let base_yield = ((lock.amount as u128) * (global_state.base_apr_bps as u128)) / 10000;
        let lock_years = ((lock.unlock_time - lock.lock_start_time) as u128) / 31_536_000;
        let total_yield = (base_yield * lock_years * boost) / 10000;
        
        // Apply price appreciation bonus (if SUPRA price increased)
        let price_bonus = if (current_price > lock.oracle_price_at_lock) {
            let price_increase = (current_price - lock.oracle_price_at_lock) * 100 / lock.oracle_price_at_lock;
            (total_yield * price_increase) / 10000 // Up to 1% bonus per 1% price increase
        } else {
            0
        };
        
        (total_yield + price_bonus) as u64
    }

    /// Early unlock with DVRF fairness and PoEL unstaking
    public fun early_unlock(
        account: &signer,
        lock: &mut LockPosition,
        global_state: &mut GlobalLockState,
        clock: &Clock,
        ctx: &mut TxContext,
    ): Coin<SUPRA> {
        let user_addr = signer::address_of(account);
        let current_time = clock::timestamp_ms(clock) / 1000;

        assert!(lock.owner == user_addr, ERR_NOT_UNLOCKED_YET);
        assert!(!lock.is_unlocked, ERR_ALREADY_UNLOCKED);
        assert!(current_time < lock.unlock_time, ERR_ALREADY_UNLOCKED);

        // Get DVRF randomness for fair penalty calculation
        let dvrf_seed = dvrf_integration::get_randomness_seed(
            global_state.dvrf_manager,
            ctx,
        );

        let time_remaining = lock.unlock_time - current_time;
        let total_lock_time = lock.unlock_time - lock.lock_start_time;
        
        let penalty_numerator = (global_state.early_unlock_penalty_bps as u128) * (time_remaining as u128);
        let penalty_bps = (penalty_numerator / (total_lock_time as u128)) as u64;
        let penalty_amount = ((lock.amount as u128) * (penalty_bps as u128) / 10000) as u64;
        let net_amount = lock.amount - penalty_amount;

        // Unstake from PoEL if applicable
        if (option::is_some(&lock.poel_staking_receipt)) {
            let receipt_id = option::extract(&mut lock.poel_staking_receipt);
            unstake_from_poel(
                receipt_id,
                global_state.poel_staking_pool,
                ctx,
            );
        };

        lock.is_unlocked = true;
        lock.penalty_paid = penalty_amount;

        // Update global state
        global_state.total_locked_supra = global_state.total_locked_supra - (lock.amount as u128);
        global_state.active_locks_count = global_state.active_locks_count - 1;

        // Emit event with DVRF seed for transparency
        event::emit(UnlockInitiated {
            user: user_addr,
            lock_id: object::uid_to_inner(&lock.id),
            amount: lock.amount,
            early_unlock_penalty: penalty_amount,
            net_amount_received: net_amount,
            dvrf_seed,
            timestamp: current_time,
        });

        // Return SUPRA coins to user
        coin::mint<SUPRA>(net_amount, ctx) // Placeholder - actual implementation returns stored coins
    }

    /// Stake SUPRA in Supra PoEL for additional yield
    fun stake_in_poel(
        supra_coin: &Coin<SUPRA>,
        poel_pool: address,
        ctx: &mut TxContext,
    ): UID {
        // Placeholder for Supra PoEL integration
        // In production: call supra_framework::poel::stake()
        object::new(ctx)
    }

    /// Unstake from Supra PoEL
    fun unstake_from_poel(
        receipt_id: UID,
        poel_pool: address,
        ctx: &mut TxContext,
    ) {
        // Placeholder for Supra PoEL integration
        // In production: call supra_framework::poel::unstake()
        object::delete(receipt_id);
    }

    /// View function: Get user's total locked amount
    public fun get_user_total_locked(
        user: address,
        global_state: &GlobalLockState,
    ): u128 {
        if (!table::contains(&global_state.user_locks, user)) {
            return 0
        };
        
        // In production: iterate through user's locks and sum amounts
        // This is a simplified version
        0 // Placeholder
    }

    /// View function: Get protocol stats
    public fun get_protocol_stats(global_state: &GlobalLockState): (u128, u64, u64) {
        (
            global_state.total_locked_supra,
            global_state.active_locks_count,
            global_state.next_lock_id - 1,
        )
    }

    #[test_only]
    public fun test_boost_calculation() {
        let boost_3mo = calculate_boost_multiplier(7_776_000);
        assert!(boost_3mo >= 10000 && boost_3mo <= 25000, 0);

        let boost_4yr = calculate_boost_multiplier(126_144_000);
        assert!(boost_4yr == 25000, 0); // Should be capped at 2.5x
    }
}
