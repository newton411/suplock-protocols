/// SUPReserve Module for Supra L1
/// Central fee aggregation and automated distribution flywheel

module suplock::supreserve {
    use std::signer;
    use std::vector;

    const USDC_DECIMALS: u64 = 6;
    const SUPRA_DECIMALS: u64 = 8;
    const FLOOR_CIRCULATING_SUPPLY: u64 = 10_000_000_000; // 10 billion SUPRA
    const MAX_SUPRA_SUPPLY: u64 = 100_000_000_000; // 100 billion SUPRA

    // SUSTAINABLE PROFITABILITY MODEL
    // Pre-floor distribution (circulating > 10B): Focus on growth via buyback
    const BUYBACK_AND_BURN_BPS_PRE: u64 = 4000;    // 40% (was 50%)
    const DIVIDENDS_BPS_PRE: u64 = 3000;           // 30% (was 35%) - user incentives
    const VE_REWARDS_BPS_PRE: u64 = 1500;          // 15% (was 10%) - governance incentives
    const REINVESTMENT_BPS_PRE: u64 = 1000;        // 10% NEW - protocol growth/sustainability
    const TREASURY_BPS_PRE: u64 = 500;             // 5% - strategic reserve

    // Post-floor distribution (circulating <= 10B): Stop buyback, focus on sustainability
    const BUYBACK_AND_BURN_BPS_POST: u64 = 0;      // 0% (buyback stopped at floor to preserve supply)
    const DIVIDENDS_BPS_POST: u64 = 5000;          // 50% (increased) - holder rewards
    const VE_REWARDS_BPS_POST: u64 = 2000;         // 20% (increased) - governance participation
    const REINVESTMENT_BPS_POST: u64 = 2000;       // 20% NEW - long-term sustainability
    const TREASURY_BPS_POST: u64 = 1000;           // 10% (increased) - protocol reserves

    /*
     * HALVING-STYLE SUSTAINABILITY MODEL
     * ----------------------------------
     * To keep the protocol both profitable and sustainable over the long term,
     * we introduce an adaptive reinvestment allocation that decays in a manner
     * similar to Bitcoin's issuance schedule.  Bitcoin halves its block subsidy
     * every 210,000 blocks, gradually approaching its 21 million cap.  Here we
     * mimic that behaviour on the fee side: each `REINVEST_HALVING_PERIOD_CYCLES`
     * distributions, the portion of fees sent to the reinvestment pool is
     * divided by two.  This creates a logarithmic decay in reinvestment pressure
     * while guaranteeing a minimum floor (see `MIN_REINVEST_BPS`).  The effect
     * ensures early aggressive growth of the flywheel and later preservation as
     * the ecosystem matures.
     *
     * Mathematically, if `r0` is the initial base BPS, after `h` halving periods
     * the reinvestment weight becomes r0 / 2^h, bounded below by `MIN_REINVEST_BPS`.
     */
    const REINVEST_HALVING_PERIOD_CYCLES: u64 = 12; // number of distribution cycles before halving (e.g., ~1 year if cycles are monthly)
    const MIN_REINVEST_BPS: u64 = 100; // floor at 1% to ensure minimum sustainment

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
        reinvestment_allocation: u64, // NEW: for protocol sustainability
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
        /// SUSTAINABILITY FIELDS
        reinvestment_pool_usdc: u64, // Earmarked for protocol growth (vaults, incentives)
        reinvestment_deployed: u64, // Deployed reinvestment (tracked for ROI)
        total_reinvestment_yield: u64, // Yield generated from reinvestment strategies
        protocol_sustainability_score: u128, // Tracks long-term viability (0-10000 bps)
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

    #[event]
    struct ReinvestmentDeployed has drop {
        amount_usdc: u64,
        strategy: String, // "vault_incentives", "lp_seeding", "partner_liquidity"
        expected_apy: u64, // Expected return in basis points
        deployment_time: u64,
    }

    #[event]
    struct SustainabilityMetricsUpdated has drop {
        sustainability_score: u128, // 0-10000: how sustainable is the protocol long-term?
        reinvestment_yield_rate: u64, // Annual return from reinvested capital
        protocol_health: String, // "Excellent", "Good", "Moderate", "At Risk"
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
            /// Initialize sustainability fields
            reinvestment_pool_usdc: 0,
            reinvestment_deployed: 0,
            total_reinvestment_yield: 0,
            protocol_sustainability_score: 8000, // Start at 80% good health
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

    /// Compute reinvestment BPS based on halving cycles and epoch (number of distributions)
    public fun reinvestment_bps_for_epoch(epoch: u64, base_bps: u64): u64 {
        let halvings = epoch / REINVEST_HALVING_PERIOD_CYCLES;
        let mut bps = base_bps;
        let mut i = 0;
        while (i < halvings) {
            if (bps <= MIN_REINVEST_BPS) { break; };
            bps = bps / 2;
            i = i + 1;
        };
        if (bps < MIN_REINVEST_BPS) { bps = MIN_REINVEST_BPS; };
        bps
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

        // Base allocations based on floor status (these are starting weights; reinvestment can adapt over time)
        let (base_buyback_bps, base_dividends_bps, base_ve_bps, base_reinvest_bps, base_treasury_bps) = if (is_post_floor) {
            (BUYBACK_AND_BURN_BPS_POST, DIVIDENDS_BPS_POST, VE_REWARDS_BPS_POST, REINVESTMENT_BPS_POST, TREASURY_BPS_POST)
        } else {
            (BUYBACK_AND_BURN_BPS_PRE, DIVIDENDS_BPS_PRE, VE_REWARDS_BPS_PRE, REINVESTMENT_BPS_PRE, TREASURY_BPS_PRE)
        };

        // Determine adaptive reinvestment BPS using halving-style decay based on number of distributions (epoch)
        let epoch = reserve.total_distributions;
        let reinvestment_bps = reinvestment_bps_for_epoch(epoch, base_reinvest_bps);

        // Partition total fees proportionally across the dynamic weights to ensure exact splitting regardless of adaptive changes
        let total_bps_defined = base_buyback_bps + base_dividends_bps + base_ve_bps + base_treasury_bps + reinvestment_bps;

        let mut buyback_allocation = (((total_fees as u128) * (base_buyback_bps as u128)) / (total_bps_defined as u128)) as u64;
        let mut dividends_allocation = (((total_fees as u128) * (base_dividends_bps as u128)) / (total_bps_defined as u128)) as u64;
        let mut ve_rewards_allocation = (((total_fees as u128) * (base_ve_bps as u128)) / (total_bps_defined as u128)) as u64;
        let mut reinvestment_allocation = (((total_fees as u128) * (reinvestment_bps as u128)) / (total_bps_defined as u128)) as u64;
        let mut treasury_allocation = (((total_fees as u128) * (base_treasury_bps as u128)) / (total_bps_defined as u128)) as u64;

        // Fix rounding remainder to ensure allocations sum to total_fees
        let mut sum_alloc = buyback_allocation + dividends_allocation + ve_rewards_allocation + reinvestment_allocation + treasury_allocation;
        if (sum_alloc < total_fees) {
            let remainder = total_fees - sum_alloc;
            treasury_allocation = treasury_allocation + remainder;
            sum_alloc = sum_alloc + remainder;
        };

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

        // Add to reinvestment pool (earmarked for yield-generating strategies)
        reserve.reinvestment_pool_usdc = reserve.reinvestment_pool_usdc + reinvestment_allocation;

        // Record distribution
        let distribution_record = DistributionRecord {
            distribution_id: reserve.next_distribution_id,
            timestamp: current_time,
            total_fees_usdc: total_fees,
            buyback_allocation,
            dividends_allocation,
            ve_rewards_allocation,
            reinvestment_allocation,
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

    /// SUSTAINABILITY FUNCTIONS

    /// Deploy reinvestment pool capital to yield-generating strategies
    /// Strategies: vault incentives, LP seeding, partner integrations
    /// Returns funds deployed and expected APY
    public fun deploy_reinvestment(
        account: &signer,
        strategy: String, // "vault_incentives", "lp_seeding", "partner_liquidity"
        amount_usdc: u64,
        expected_apy: u64, // Annual percentage yield in basis points
        reserve_addr: address,
    ) acquires SUPReserve {
        let _admin = signer::address_of(account);
        
        assert!(amount_usdc > 0, 5006);
        
        let reserve = borrow_global_mut<SUPReserve>(reserve_addr);
        assert!(reserve.reinvestment_pool_usdc >= amount_usdc, 5007); // Insufficient reinvestment pool

        // Depleoy capital from pool
        reserve.reinvestment_pool_usdc = reserve.reinvestment_pool_usdc - amount_usdc;
        reserve.reinvestment_deployed = reserve.reinvestment_deployed + amount_usdc;

        0x1::event::emit(ReinvestmentDeployed {
            amount_usdc,
            strategy,
            expected_apy,
            deployment_time: get_current_timestamp(),
        });
    }

    /// Accrue yield from reinvestment strategies
    /// Called by oracles/keepers when reinvested capital generates returns
    public fun accrue_reinvestment_yield(
        account: &signer,
        yield_amount: u64,
        annual_yield_percent: u64,
        reserve_addr: address,
    ) acquires SUPReserve {
        let _admin = signer::address_of(account);
        assert!(yield_amount > 0, ERR_INVALID_AMOUNT);

        let reserve = borrow_global_mut<SUPReserve>(reserve_addr);
        reserve.total_reinvestment_yield = reserve.total_reinvestment_yield + yield_amount;
        
        // Re-allocate yield back to reinvestment pool for compounding
        reserve.reinvestment_pool_usdc = reserve.reinvestment_pool_usdc + yield_amount;
        
        // Update sustainability score based on reinvestment ROI
        let reinvestment_roi = if (reserve.reinvestment_deployed > 0) {
            ((reserve.total_reinvestment_yield as u128) * 10000 / (reserve.reinvestment_deployed as u128)) as u64
        } else {
            0
        };

        // Score increases with positive reinvestment ROI
        let max_score = 10000u128;
        reserve.protocol_sustainability_score = if (reinvestment_roi > 500) { // >5% ROI
            max_score * 95 / 100 // 95% excellent score
        } else if (reinvestment_roi > 200) { // >2% ROI
            max_score * 85 / 100 // 85% good score
        } else if (reinvestment_roi > 0) {
            max_score * 70 / 100 // 70% moderate score
        } else {
            max_score * 50 / 100 // 50% at risk score
        };
    }

    /// Get current reinvestment pool status
    public fun get_reinvestment_status(reserve_addr: address): (u64, u64, u64, u64) acquires SUPReserve {
        let reserve = borrow_global<SUPReserve>(reserve_addr);
        (
            reserve.reinvestment_pool_usdc,
            reserve.reinvestment_deployed,
            reserve.total_reinvestment_yield,
            reserve.protocol_sustainability_score,
        )
    }

    /// Get protocol health score (sustainability metric)
    /// Score: 0-10000 basis points
    /// 9000+: Excellent, 7500-9000: Good, 5000-7500: Moderate, <5000: At Risk
    public fun get_sustainability_health(reserve_addr: address): u128 acquires SUPReserve {
        borrow_global<SUPReserve>(reserve_addr).protocol_sustainability_score
    }

    /// Get current timestamp
    fun test_floor_check() {
        let above_floor = 15_000_000_000u64;
        let below_floor = 8_000_000_000u64;

        assert!(above_floor > FLOOR_CIRCULATING_SUPPLY, 0);
        assert!(below_floor <= FLOOR_CIRCULATING_SUPPLY, 0);
    }

    #[test]
    fun test_distribution_allocations() {
        // Static constant invariants
        let total_pre = BUYBACK_AND_BURN_BPS_PRE + DIVIDENDS_BPS_PRE + VE_REWARDS_BPS_PRE + REINVESTMENT_BPS_PRE + TREASURY_BPS_PRE;
        assert!(total_pre == 10000, 0);
        let total_post = BUYBACK_AND_BURN_BPS_POST + DIVIDENDS_BPS_POST + VE_REWARDS_BPS_POST + REINVESTMENT_BPS_POST + TREASURY_BPS_POST;
        assert!(total_post == 10000, 0);

        // Adaptive reinvestment - simulate multiple epochs and ensure halving behavior
        let base = 1000; // pretend base pre-floor
        let epoch0 = reinvestment_bps_for_epoch(0, base);
        assert!(epoch0 == base, 1);
        let epoch1 = reinvestment_bps_for_epoch(REINVEST_HALVING_PERIOD_CYCLES, base);
        assert!(epoch1 == base / 2, 2);
        let epoch2 = reinvestment_bps_for_epoch(REINVEST_HALVING_PERIOD_CYCLES * 3, base);
        assert!(epoch2 == base / 8, 3);
        // ensure the floor is respected
        let min = reinvestment_bps_for_epoch(REINVEST_HALVING_PERIOD_CYCLES * 1000, base);
        assert!(min >= MIN_REINVEST_BPS, 4);
    }

    #[test]
    fun test_dynamic_allocation_sum() {
        // ensure calculated allocations always sum to the input total
        let total_fees = 10_000u64;
        let epoch = 5;
        // call the function path used in distribution
        let (buyback_bps, dividends_bps, ve_bps, reinvest_bps, treasury_bps) = (BUYBACK_AND_BURN_BPS_PRE, DIVIDENDS_BPS_PRE, VE_REWARDS_BPS_PRE, reinvestment_bps_for_epoch(epoch, REINVESTMENT_BPS_PRE), TREASURY_BPS_PRE);
        let total_bps_defined = buyback_bps + dividends_bps + ve_bps + treasury_bps + reinvest_bps;
        let buyback = ((total_fees as u128) * (buyback_bps as u128) / (total_bps_defined as u128)) as u64;
        let dividends = ((total_fees as u128) * (dividends_bps as u128) / (total_bps_defined as u128)) as u64;
        let ve = ((total_fees as u128) * (ve_bps as u128) / (total_bps_defined as u128)) as u64;
        let reinvest = ((total_fees as u128) * (reinvest_bps as u128) / (total_bps_defined as u128)) as u64;
        let treasury = ((total_fees as u128) * (treasury_bps as u128) / (total_bps_defined as u128)) as u64;
        let sum = buyback + dividends + ve + reinvest + treasury;
        assert!(sum == total_fees, 5);
    }
}
