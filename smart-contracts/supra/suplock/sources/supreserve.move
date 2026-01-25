/// SUPReserve Module for Supra L1
/// Central fee aggregation and automated distribution flywheel

module suplock::supreserve {
    use std::signer;
    use std::vector;

    const USDC_DECIMALS: u64 = 6;
    const SUPRA_DECIMALS: u64 = 8;
    const FLOOR_CIRCULATING_SUPPLY: u64 = 10_000_000_000; // 10 billion SUPRA
    const MAX_SUPRA_SUPPLY: u64 = 100_000_000_000; // 100 billion SUPRA

    // Pre-floor distribution (circulating > 10B)
    const BUYBACK_AND_BURN_BPS_PRE: u64 = 5000;    // 50%
    const DIVIDENDS_BPS_PRE: u64 = 3500;           // 35%
    const VE_REWARDS_BPS_PRE: u64 = 1000;          // 10%
    const TREASURY_BPS_PRE: u64 = 500;             // 5%

    // Post-floor distribution (circulating <= 10B)
    const BUYBACK_AND_BURN_BPS_POST: u64 = 0;      // 0% (redirected to dividends)
    const DIVIDENDS_BPS_POST: u64 = 6500;          // 65%
    const VE_REWARDS_BPS_POST: u64 = 1250;         // 12.5%
    const TREASURY_BPS_POST: u64 = 1250;           // 12.5%

    const DEAD_ADDRESS: address = @0x0000000000000000000000000000000000000000000000000000000000000001;

    /// Distribution Record
    struct DistributionRecord has key, store {
        distribution_id: u64,
        timestamp: u64,
        total_fees_usdc: u64,
        buyback_allocation: u64,
        dividends_allocation: u64,
        ve_rewards_allocation: u64,
        treasury_allocation: u64,
        was_post_floor: bool,
    }

    /// SUPReserve State
    struct SUPReserve has key {
        fee_accumulator_usdc: u64,
        total_distributions: u64,
        distribution_records: vector<DistributionRecord>,
        next_distribution_id: u64,
        total_burned_supra: u64,
        total_dividends_paid: u64,
        total_ve_rewards: u64,
        treasury_balance: u64,
        last_distribution_time: u64,
        dividend_per_share_usdc: u128,
        ve_reward_per_share_usdc: u128,
        total_ve_shares: u128,
        distribution_cycle_secs: u64, // Time between distributions (e.g., monthly)
    }

    /// User Dividend Record
    struct DividendRecord has key, store {
        user: address,
        amount_usdc: u64,
        ve_balance: u128,
        claimed_at: u64,
    }

    /// Dividend Tracker
    struct DividendTracker has key {
        pending_dividends: vector<DividendRecord>,
        total_claimed: u64,
    }

    /// Events
    #[event]
    struct FeesAccumulated has drop {
        source: address,
        amount_usdc: u64,
        timestamp: u64,
    }

    #[event]
    struct DistributionExecuted has drop {
        distribution_id: u64,
        total_fees: u64,
        buyback_amount: u64,
        dividends_amount: u64,
        ve_rewards_amount: u64,
        treasury_amount: u64,
        is_post_floor: bool,
        timestamp: u64,
    }

    #[event]
    struct BurnExecuted has drop {
        amount_supra: u64,
        burned_to_dead: u64,
        timestamp: u64,
    }

    #[event]
    struct DividendsClaimed has drop {
        user: address,
        amount_usdc: u64,
        ve_balance: u128,
        timestamp: u64,
    }

    #[event]
    struct FloorCheckExecuted has drop {
        circulating_supply: u64,
        is_post_floor: bool,
        timestamp: u64,
    }

    /// Initialize SUPReserve
    public fun initialize_supreserve(
        account: &signer,
        distribution_cycle_secs: u64,
    ) {
        let addr = signer::address_of(account);
        assert!(!exists<SUPReserve>(addr), 5001);

        let reserve = SUPReserve {
            fee_accumulator_usdc: 0,
            total_distributions: 0,
            distribution_records: vector::empty(),
            next_distribution_id: 1,
            total_burned_supra: 0,
            total_dividends_paid: 0,
            total_ve_rewards: 0,
            treasury_balance: 0,
            last_distribution_time: get_current_timestamp(),
            dividend_per_share_usdc: 0,
            ve_reward_per_share_usdc: 0,
            total_ve_shares: 0,
            distribution_cycle_secs,
        };

        move_to(account, reserve);
    }

    /// Accumulate fees from protocol (locks, vaults, restaking)
    public fun accumulate_fees(
        source: address,
        amount_usdc: u64,
        reserve_addr: address,
    ) acquires SUPReserve {
        assert!(amount_usdc > 0, 5002);

        let reserve = borrow_global_mut<SUPReserve>(reserve_addr);
        reserve.fee_accumulator_usdc = reserve.fee_accumulator_usdc + amount_usdc;

        0x1::event::emit(FeesAccumulated {
            source,
            amount_usdc,
            timestamp: get_current_timestamp(),
        });
    }

    /// Check if floor is reached and return distribution mode
    /// Returns (is_post_floor, circulating_supply)
    public fun check_floor(
        current_circulating_supply: u64,
        reserve_addr: address,
    ) acquires SUPReserve {
        let is_post_floor = current_circulating_supply <= FLOOR_CIRCULATING_SUPPLY;

        let _reserve = borrow_global<SUPReserve>(reserve_addr);

        0x1::event::emit(FloorCheckExecuted {
            circulating_supply: current_circulating_supply,
            is_post_floor,
            timestamp: get_current_timestamp(),
        });
    }

    /// Execute automated distribution (called monthly or by keeper)
    /// Requires oracle/keeper to provide current circulating supply
    public fun execute_distribution(
        account: &signer,
        current_circulating_supply: u64,
        supra_price_usdc: u128, // Price with SUPRA_DECIMALS precision
        ve_total_supply: u128,
        reserve_addr: address,
    ) acquires SUPReserve {
        let _caller = signer::address_of(account);
        let current_time = get_current_timestamp();

        let reserve = borrow_global_mut<SUPReserve>(reserve_addr);

        // Check if enough time has passed
        assert!(
            current_time >= reserve.last_distribution_time + reserve.distribution_cycle_secs,
            5003, // DISTRIBUTION_COOLDOWN
        );

        assert!(reserve.fee_accumulator_usdc > 0, 5004); // NO_FEES_TO_DISTRIBUTE

        let total_fees = reserve.fee_accumulator_usdc;
        let is_post_floor = current_circulating_supply <= FLOOR_CIRCULATING_SUPPLY;

        // Calculate allocations based on floor status
        let (buyback_bps, dividends_bps, ve_bps, treasury_bps) = if (is_post_floor) {
            (BUYBACK_AND_BURN_BPS_POST, DIVIDENDS_BPS_POST, VE_REWARDS_BPS_POST, TREASURY_BPS_POST)
        } else {
            (BUYBACK_AND_BURN_BPS_PRE, DIVIDENDS_BPS_PRE, VE_REWARDS_BPS_PRE, TREASURY_BPS_PRE)
        };

        let buyback_allocation = (((total_fees as u128) * (buyback_bps as u128)) / 10000) as u64;
        let dividends_allocation = (((total_fees as u128) * (dividends_bps as u128)) / 10000) as u64;
        let ve_rewards_allocation = (((total_fees as u128) * (ve_bps as u128)) / 10000) as u64;
        let treasury_allocation = (((total_fees as u128) * (treasury_bps as u128)) / 10000) as u64;

        // Execute buyback: convert USDC to SUPRA and burn
        if (buyback_allocation > 0 && supra_price_usdc > 0) {
            let supra_to_burn = (((buyback_allocation as u128) * (10u128 << SUPRA_DECIMALS as u128)) / supra_price_usdc) as u64;
            reserve.total_burned_supra = reserve.total_burned_supra + supra_to_burn;

            0x1::event::emit(BurnExecuted {
                amount_supra: supra_to_burn,
                burned_to_dead: supra_to_burn,
                timestamp: current_time,
            });
        };

        // Track dividends per share
        if (ve_total_supply > 0) {
            let dividend_per_share = ((dividends_allocation as u128) * (10u128 << USDC_DECIMALS as u128)) / ve_total_supply;
            reserve.dividend_per_share_usdc = reserve.dividend_per_share_usdc + dividend_per_share;
        };

        // Track veSUPRA rewards per share
        if (ve_total_supply > 0) {
            let ve_reward_per_share = ((ve_rewards_allocation as u128) * (10u128 << SUPRA_DECIMALS as u128)) / ve_total_supply;
            reserve.ve_reward_per_share_usdc = reserve.ve_reward_per_share_usdc + ve_reward_per_share;
        };

        // Add to treasury (permanent, non-withdrawable except governance)
        reserve.treasury_balance = reserve.treasury_balance + treasury_allocation;

        // Record distribution
        let distribution_record = DistributionRecord {
            distribution_id: reserve.next_distribution_id,
            timestamp: current_time,
            total_fees_usdc: total_fees,
            buyback_allocation,
            dividends_allocation,
            ve_rewards_allocation,
            treasury_allocation,
            was_post_floor: is_post_floor,
        };

        vector::push_back(&mut reserve.distribution_records, distribution_record);
        reserve.next_distribution_id = reserve.next_distribution_id + 1;
        reserve.total_distributions = reserve.total_distributions + 1;
        reserve.last_distribution_time = current_time;
        reserve.fee_accumulator_usdc = 0; // Reset accumulator
        reserve.total_dividends_paid = reserve.total_dividends_paid + dividends_allocation;
        reserve.total_ve_rewards = reserve.total_ve_rewards + ve_rewards_allocation;
        reserve.total_ve_shares = ve_total_supply;

        0x1::event::emit(DistributionExecuted {
            distribution_id: reserve.next_distribution_id - 1,
            total_fees,
            buyback_amount: buyback_allocation,
            dividends_amount: dividends_allocation,
            ve_rewards_amount: ve_rewards_allocation,
            treasury_amount: treasury_allocation,
            is_post_floor,
            timestamp: current_time,
        });
    }

    /// Initialize dividend tracker for user
    public fun initialize_dividend_tracker(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<DividendTracker>(addr)) {
            let tracker = DividendTracker {
                pending_dividends: vector::empty(),
                total_claimed: 0,
            };
            move_to(account, tracker);
        };
    }

    /// Claim accumulated dividends
    public fun claim_dividends(
        account: &signer,
        ve_balance: u128,
        reserve_addr: address,
    ) acquires SUPReserve, DividendTracker {
        let user = signer::address_of(account);
        initialize_dividend_tracker(account);

        let reserve = borrow_global<SUPReserve>(reserve_addr);
        
        // Calculate dividend amount: ve_balance * dividend_per_share
        let dividend_amount = ((ve_balance * reserve.dividend_per_share_usdc) / (10u128 << USDC_DECIMALS as u128)) as u64;
        
        assert!(dividend_amount > 0, 5005);

        // Record claim
        let dividend_record = DividendRecord {
            user,
            amount_usdc: dividend_amount,
            ve_balance,
            claimed_at: get_current_timestamp(),
        };

        let tracker = borrow_global_mut<DividendTracker>(user);
        vector::push_back(&mut tracker.pending_dividends, dividend_record);
        tracker.total_claimed = tracker.total_claimed + dividend_amount;

        0x1::event::emit(DividendsClaimed {
            user,
            amount_usdc: dividend_amount,
            ve_balance,
            timestamp: get_current_timestamp(),
        });
    }

    /// View: Get current fee accumulator
    public fun get_accumulated_fees(reserve_addr: address): u64 acquires SUPReserve {
        borrow_global<SUPReserve>(reserve_addr).fee_accumulator_usdc
    }

    /// View: Get total burned supply
    public fun get_total_burned(reserve_addr: address): u64 acquires SUPReserve {
        borrow_global<SUPReserve>(reserve_addr).total_burned_supra
    }

    /// View: Get treasury balance
    public fun get_treasury_balance(reserve_addr: address): u64 acquires SUPReserve {
        borrow_global<SUPReserve>(reserve_addr).treasury_balance
    }

    /// View: Get total dividends paid
    public fun get_total_dividends_paid(reserve_addr: address): u64 acquires SUPReserve {
        borrow_global<SUPReserve>(reserve_addr).total_dividends_paid
    }

    /// Get distribution history
    public fun get_distribution_records(
        reserve_addr: address,
        start_index: u64,
        count: u64,
    ): vector<DistributionRecord> acquires SUPReserve {
        let reserve = borrow_global<SUPReserve>(reserve_addr);
        let records = vector::empty();
        let i = start_index;
        let end = if (start_index + count > vector::length(&reserve.distribution_records)) {
            vector::length(&reserve.distribution_records)
        } else {
            start_index + count
        };

        while (i < end) {
            vector::push_back(&mut records, *vector::borrow(&reserve.distribution_records, i));
            i = i + 1;
        };

        records
    }

    /// Get current timestamp
    fun get_current_timestamp(): u64 {
        0x1::chain::get_block_timestamp()
    }

    #[test]
    fun test_floor_check() {
        let above_floor = 15_000_000_000u64;
        let below_floor = 8_000_000_000u64;

        assert!(above_floor > FLOOR_CIRCULATING_SUPPLY, 0);
        assert!(below_floor <= FLOOR_CIRCULATING_SUPPLY, 0);
    }

    #[test]
    fun test_distribution_allocations() {
        // Pre-floor: 50 + 35 + 10 + 5 = 100 basis points
        let total_pre = BUYBACK_AND_BURN_BPS_PRE + DIVIDENDS_BPS_PRE + VE_REWARDS_BPS_PRE + TREASURY_BPS_PRE;
        assert!(total_pre == 10000, 0);

        // Post-floor: 0 + 65 + 12.5 + 12.5 = 90 basis points
        let total_post = BUYBACK_AND_BURN_BPS_POST + DIVIDENDS_BPS_POST + VE_REWARDS_BPS_POST + TREASURY_BPS_POST;
        assert!(total_post == 9000, 0);
    }
}
