/// SUPReserve Module for Supra L1
/// Integrates with Supra Oracle for real-time price feeds and automated SUPRA buybacks
/// Uses Supra's native coin module and PoEL staking rewards

module suplock::supreserve {
    use std::signer;
    use std::vector;
    use supra_framework::coin::{Self, Coin};
    use supra_framework::object::{Self, UID};
    use supra_framework::event;
    use supra_framework::clock::{Self, Clock};
    use supra_framework::table::{Self, Table};
    use suplock::oracle_integration;
    use suplock::dvrf_integration;

    /// Native token types
    struct SUPRA has drop {}
    struct USDC has drop {}

    const USDC_DECIMALS: u8 = 6;
    const SUPRA_DECIMALS: u8 = 8;
    const FLOOR_CIRCULATING_SUPPLY: u64 = 10_000_000_000; // 10 billion SUPRA
    const MAX_SUPRA_SUPPLY: u64 = 100_000_000_000; // 100 billion SUPRA
    const DEAD_ADDRESS: address = @0x0000000000000000000000000000000000000000000000000000000000000001;
    const ORACLE_FEED_SUPRA_USD: u64 = 1; // Supra Oracle feed ID
    const ORACLE_FRESHNESS_THRESHOLD: u64 = 21600; // 6 hours

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

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 5001;
    const ERR_NO_FEES_TO_DISTRIBUTE: u64 = 5002;
    const ERR_DISTRIBUTION_COOLDOWN: u64 = 5003;
    const ERR_INSUFFICIENT_DIVIDENDS: u64 = 5004;
    const ERR_STALE_ORACLE_FEED: u64 = 5005;

    /// Distribution Record with Supra Oracle integration
    struct DistributionRecord has store {
        distribution_id: u64,
        timestamp: u64,
        total_fees_usdc: u64,
        buyback_allocation: u64,
        dividends_allocation: u64,
        ve_rewards_allocation: u64,
        treasury_allocation: u64,
        was_post_floor: bool,
        supra_price_usd: u128, // Price at distribution time
        supra_burned: u64, // Amount of SUPRA burned
        dvrf_seed: vector<u8>, // DVRF randomness for fairness
    }

    /// SUPReserve State with Supra integrations
    struct SUPReserve has key {
        id: UID,
        // Fee accumulation
        fee_accumulator_usdc: Coin<USDC>,
        total_distributions: u64,
        distribution_records: vector<DistributionRecord>,
        next_distribution_id: u64,
        
        // Burn tracking
        total_burned_supra: u64,
        burned_supra_vault: Coin<SUPRA>, // Holds SUPRA before burning
        
        // Dividend tracking
        total_dividends_paid: u64,
        dividend_vault_usdc: Coin<USDC>, // Holds USDC for dividends
        total_ve_rewards: u64,
        ve_rewards_vault_usdc: Coin<USDC>, // Holds USDC for veSUPRA rewards
        
        // Treasury
        treasury_balance_usdc: Coin<USDC>,
        
        // Distribution timing
        last_distribution_time: u64,
        distribution_cycle_secs: u64, // Time between distributions
        
        // Supra integrations
        oracle_config: address, // Oracle integration contract
        dvrf_manager: address, // DVRF integration contract
        poel_staking_pool: address, // Supra PoEL staking pool
        
        // Efficient tracking
        dividend_per_share_usdc: u128,
        ve_reward_per_share_usdc: u128,
        total_ve_shares: u128,
        
        // User dividend tracking
        user_dividends: Table<address, u64>, // User -> claimed amount
    }

    /// Events with Supra Oracle data
    #[event]
    struct FeesAccumulated has copy, drop {
        source: address,
        amount_usdc: u64,
        supra_price_usd: u128, // Current SUPRA price
        timestamp: u64,
    }

    #[event]
    struct DistributionExecuted has copy, drop {
        distribution_id: u64,
        total_fees: u64,
        buyback_amount: u64,
        dividends_amount: u64,
        ve_rewards_amount: u64,
        treasury_amount: u64,
        is_post_floor: bool,
        supra_price_usd: u128,
        supra_burned: u64,
        dvrf_seed: vector<u8>,
        timestamp: u64,
    }

    #[event]
    struct BurnExecuted has copy, drop {
        amount_supra: u64,
        burned_to_dead: u64,
        supra_price_usd: u128,
        total_burned_cumulative: u64,
        timestamp: u64,
    }

    #[event]
    struct DividendsClaimed has copy, drop {
        user: address,
        amount_usdc: u64,
        ve_balance: u128,
        timestamp: u64,
    }

    /// Initialize SUPReserve with Supra integrations
    public fun initialize_supreserve(
        account: &signer,
        distribution_cycle_secs: u64,
        oracle_config: address,
        dvrf_manager: address,
        poel_staking_pool: address,
        ctx: &mut TxContext,
    ) {
        let sender = signer::address_of(account);
        
        assert!(
            !object::id_exists<SUPReserve>(sender),
            ERR_ALREADY_INITIALIZED,
        );

        let reserve = SUPReserve {
            id: object::new(ctx),
            fee_accumulator_usdc: coin::zero<USDC>(ctx),
            total_distributions: 0,
            distribution_records: vector::empty(),
            next_distribution_id: 1,
            total_burned_supra: 0,
            burned_supra_vault: coin::zero<SUPRA>(ctx),
            total_dividends_paid: 0,
            dividend_vault_usdc: coin::zero<USDC>(ctx),
            total_ve_rewards: 0,
            ve_rewards_vault_usdc: coin::zero<USDC>(ctx),
            treasury_balance_usdc: coin::zero<USDC>(ctx),
            last_distribution_time: 0, // Will be set on first distribution
            distribution_cycle_secs,
            oracle_config,
            dvrf_manager,
            poel_staking_pool,
            dividend_per_share_usdc: 0,
            ve_reward_per_share_usdc: 0,
            total_ve_shares: 0,
            user_dividends: table::new(ctx),
        };

        object::transfer(reserve, sender);
    }

    /// Accumulate fees with Supra Oracle price tracking
    public fun accumulate_fees(
        source: address,
        usdc_fees: Coin<USDC>,
        reserve: &mut SUPReserve,
        clock: &Clock,
    ) {
        let amount_usdc = coin::value(&usdc_fees);
        assert!(amount_usdc > 0, ERR_NO_FEES_TO_DISTRIBUTE);

        // Get current SUPRA price from Supra Oracle
        let supra_price_usd = oracle_integration::get_supra_price_usd(
            reserve.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            clock,
        );

        // Validate oracle freshness
        oracle_integration::validate_feed_freshness(
            reserve.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            ORACLE_FRESHNESS_THRESHOLD,
            clock,
        );

        // Add to fee accumulator
        coin::join(&mut reserve.fee_accumulator_usdc, usdc_fees);

        event::emit(FeesAccumulated {
            source,
            amount_usdc,
            supra_price_usd,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });
    }

    /// Execute automated distribution with Supra Oracle and DVRF integration
    public fun execute_distribution(
        account: &signer,
        current_circulating_supply: u64,
        ve_total_supply: u128,
        reserve: &mut SUPReserve,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let current_time = clock::timestamp_ms(clock) / 1000;
        let total_fees = coin::value(&reserve.fee_accumulator_usdc);

        // Check cooldown period
        if (reserve.last_distribution_time > 0) {
            assert!(
                current_time >= reserve.last_distribution_time + reserve.distribution_cycle_secs,
                ERR_DISTRIBUTION_COOLDOWN,
            );
        };

        assert!(total_fees > 0, ERR_NO_FEES_TO_DISTRIBUTE);

        // Get SUPRA price and DVRF randomness
        let supra_price_usd = oracle_integration::get_supra_price_usd(
            reserve.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            clock,
        );

        let dvrf_seed = dvrf_integration::get_randomness_seed(
            reserve.dvrf_manager,
            ctx,
        );

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

        // Extract fees from accumulator
        let total_fees_coin = coin::split(&mut reserve.fee_accumulator_usdc, total_fees, ctx);

        // Execute buyback and burn if applicable
        let supra_burned = if (buyback_allocation > 0 && supra_price_usd > 0) {
            let buyback_usdc = coin::split(&mut total_fees_coin, buyback_allocation, ctx);
            execute_buyback_and_burn(
                buyback_usdc,
                supra_price_usd,
                reserve,
                ctx,
            )
        } else {
            0
        };

        // Allocate dividends
        if (dividends_allocation > 0) {
            let dividend_usdc = coin::split(&mut total_fees_coin, dividends_allocation, ctx);
            coin::join(&mut reserve.dividend_vault_usdc, dividend_usdc);
            
            if (ve_total_supply > 0) {
                let dividend_per_share = ((dividends_allocation as u128) * (10u128.pow(USDC_DECIMALS))) / ve_total_supply;
                reserve.dividend_per_share_usdc = reserve.dividend_per_share_usdc + dividend_per_share;
            };
        };

        // Allocate veSUPRA rewards
        if (ve_rewards_allocation > 0) {
            let ve_rewards_usdc = coin::split(&mut total_fees_coin, ve_rewards_allocation, ctx);
            coin::join(&mut reserve.ve_rewards_vault_usdc, ve_rewards_usdc);
            
            if (ve_total_supply > 0) {
                let ve_reward_per_share = ((ve_rewards_allocation as u128) * (10u128.pow(USDC_DECIMALS))) / ve_total_supply;
                reserve.ve_reward_per_share_usdc = reserve.ve_reward_per_share_usdc + ve_reward_per_share;
            };
        };

        // Allocate to treasury
        if (treasury_allocation > 0) {
            let treasury_usdc = coin::split(&mut total_fees_coin, treasury_allocation, ctx);
            coin::join(&mut reserve.treasury_balance_usdc, treasury_usdc);
        };

        // Destroy any remaining dust
        coin::destroy_zero(total_fees_coin);

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
            supra_price_usd,
            supra_burned,
            dvrf_seed,
        };

        vector::push_back(&mut reserve.distribution_records, distribution_record);
        reserve.next_distribution_id = reserve.next_distribution_id + 1;
        reserve.total_distributions = reserve.total_distributions + 1;
        reserve.last_distribution_time = current_time;
        reserve.total_dividends_paid = reserve.total_dividends_paid + dividends_allocation;
        reserve.total_ve_rewards = reserve.total_ve_rewards + ve_rewards_allocation;
        reserve.total_ve_shares = ve_total_supply;

        event::emit(DistributionExecuted {
            distribution_id: reserve.next_distribution_id - 1,
            total_fees,
            buyback_amount: buyback_allocation,
            dividends_amount: dividends_allocation,
            ve_rewards_amount: ve_rewards_allocation,
            treasury_amount: treasury_allocation,
            is_post_floor,
            supra_price_usd,
            supra_burned,
            dvrf_seed,
            timestamp: current_time,
        });
    }

    /// Execute SUPRA buyback and burn using Supra Oracle price
    fun execute_buyback_and_burn(
        usdc_for_buyback: Coin<USDC>,
        supra_price_usd: u128,
        reserve: &mut SUPReserve,
        ctx: &mut TxContext,
    ): u64 {
        let usdc_amount = coin::value(&usdc_for_buyback);
        
        // Calculate SUPRA amount to buy (with decimals adjustment)
        let supra_to_buy = ((usdc_amount as u128) * (10u128.pow(SUPRA_DECIMALS)) * (10u128.pow(6))) / 
                          (supra_price_usd * (10u128.pow(USDC_DECIMALS)));
        let supra_amount = supra_to_buy as u64;

        // In production: Execute actual buyback via DEX
        // For now: Mint equivalent SUPRA (placeholder)
        let supra_to_burn = coin::mint<SUPRA>(supra_amount, ctx);
        
        // Burn SUPRA by sending to dead address
        coin::join(&mut reserve.burned_supra_vault, supra_to_burn);
        let burned_supra = coin::split(&mut reserve.burned_supra_vault, supra_amount, ctx);
        
        // Transfer to dead address (permanent burn)
        object::transfer(burned_supra, DEAD_ADDRESS);
        
        reserve.total_burned_supra = reserve.total_burned_supra + supra_amount;

        // Destroy USDC used for buyback
        coin::destroy_zero(usdc_for_buyback);

        event::emit(BurnExecuted {
            amount_supra: supra_amount,
            burned_to_dead: supra_amount,
            supra_price_usd,
            total_burned_cumulative: reserve.total_burned_supra,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });

        supra_amount
    }

    /// Claim accumulated dividends
    public fun claim_dividends(
        account: &signer,
        ve_balance: u128,
        reserve: &mut SUPReserve,
        clock: &Clock,
        ctx: &mut TxContext,
    ): Coin<USDC> {
        let user = signer::address_of(account);
        
        // Calculate dividend amount
        let dividend_amount = ((ve_balance * reserve.dividend_per_share_usdc) / (10u128.pow(USDC_DECIMALS))) as u64;
        
        // Subtract already claimed amount
        let already_claimed = if (table::contains(&reserve.user_dividends, user)) {
            *table::borrow(&reserve.user_dividends, user)
        } else {
            0
        };
        
        assert!(dividend_amount > already_claimed, ERR_INSUFFICIENT_DIVIDENDS);
        let claimable_amount = dividend_amount - already_claimed;

        // Update claimed amount
        if (table::contains(&reserve.user_dividends, user)) {
            let claimed_ref = table::borrow_mut(&mut reserve.user_dividends, user);
            *claimed_ref = dividend_amount;
        } else {
            table::add(&mut reserve.user_dividends, user, dividend_amount);
        };

        // Extract dividends from vault
        let dividend_coin = coin::split(&mut reserve.dividend_vault_usdc, claimable_amount, ctx);

        event::emit(DividendsClaimed {
            user,
            amount_usdc: claimable_amount,
            ve_balance,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });

        dividend_coin
    }

    /// View functions
    public fun get_accumulated_fees(reserve: &SUPReserve): u64 {
        coin::value(&reserve.fee_accumulator_usdc)
    }

    public fun get_total_burned(reserve: &SUPReserve): u64 {
        reserve.total_burned_supra
    }

    public fun get_treasury_balance(reserve: &SUPReserve): u64 {
        coin::value(&reserve.treasury_balance_usdc)
    }

    public fun get_total_dividends_paid(reserve: &SUPReserve): u64 {
        reserve.total_dividends_paid
    }

    #[test_only]
    public fun test_floor_check() {
        let above_floor = 15_000_000_000u64;
        let below_floor = 8_000_000_000u64;

        assert!(above_floor > FLOOR_CIRCULATING_SUPPLY, 0);
        assert!(below_floor <= FLOOR_CIRCULATING_SUPPLY, 0);
    }
}
