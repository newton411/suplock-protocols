/// Compound Yield Strategies Module for Sustainable Profitability
/// 
/// This module orchestrates multiple yield-generation mechanisms:
/// 1. Lock-based staking yields (12% APR base + boost multipliers + compounding)
/// 2. Restaking integration yields (EigenLayer + Symbiotic protocols)
/// 3. Protocol partnership value sharing (Solido, Supralend, Atmos)
/// 4. Treasury reinvestment strategies (vault incentives, LP seeding)
/// 5. Cross-protocol yield aggregation and auto-compounding
///
/// The sustainability model ensures:
/// - Profitability: 40-50% of fees buyback/burn, 30-50% dividends to holders
/// - Sustainability: 10-20% reinvested into yield-generating strategies
/// - Compounding: Automatic reinvestment of yield for exponential growth
/// - Diversification: Income from multiple sources reduces single-point failure
/// - Economic security: Revenue generated regardless of token price movements

module suplock::compound_yield_strategies {
    use std::signer;
    use std::vector;
    use std::string::String;

    /// STRATEGY CONFIGURATION
    /// Minimum deposit to activate compound yield
    const MIN_COMPOUND_AMOUNT: u64 = 1_000_000; // 1 USDC minimum
    
    /// Target allocation across strategies
    const RESTAKING_ALLOCATION_BPS: u64 = 4000;       // 40% to EigenLayer/Symbiotic
    const LP_SEEDING_ALLOCATION_BPS: u64 = 3000;      // 30% to LP and trading
    const VAULT_INCENTIVES_ALLOCATION_BPS: u64 = 2000; // 20% to yield vault incentives
    const PARTNERSHIP_ALLOCATION_BPS: u64 = 1000;     // 10% to protocol partnerships

    /// Annual yield expectations from each strategy
    const RESTAKING_EXPECTED_APY_BPS: u64 = 1500;     // 15% APY
    const LP_EXPECTED_APY_BPS: u64 = 2000;            // 20% APY (swap fees + incentives)
    const VAULT_EXPECTED_APY_BPS: u64 = 1200;         // 12% APY
    const PARTNERSHIP_EXPECTED_APY_BPS: u64 = 800;    // 8% APY

    /// Compounding configuration
    const AUTO_COMPOUND_FREQUENCY_SECS: u64 = 2_592_000; // 30 days
    const COMPOUND_GAS_OPTIMIZATION: bool = true; // Batch compound operations

    /// Strategy Record
    struct YieldStrategy has key, store {
        strategy_id: u64,
        name: String,
        strategy_type: u8, // 1: restaking, 2: lp_seeding, 3: vault_incentives, 4: partnerships
        capital_allocated: u64, // USDC
        expected_apy_bps: u64,
        actual_yield_generated: u64,
        is_active: bool,
        created_at: u64,
        last_yield_time: u64,
    }

    /// User Compound Position
    struct CompoundYieldPosition has key, store {
        position_id: u64,
        user: address,
        principal: u64,
        strategies_enrolled: vector<u64>, // Strategy IDs
        total_yield_accrued: u64,
        times_compounded: u64,
        last_compound_at: u64,
        next_auto_compound_at: u64,
        is_auto_compound_enabled: bool,
    }

    /// Global Strategy Registry
    struct StrategyRegistry has key {
        strategies: vector<YieldStrategy>,
        next_strategy_id: u64,
        total_capital_deployed: u128,
        total_yield_generated: u128,
        compound_positions: vector<CompoundYieldPosition>,
        next_position_id: u64,
    }

    /// Events
    #[event]
    struct StrategyCreated has drop {
        strategy_id: u64,
        name: String,
        strategy_type: u8,
        expected_apy_bps: u64,
        created_at: u64,
    }

    #[event]
    struct CapitalDeployed has drop {
        strategy_id: u64,
        amount_deployed: u64,
        allocation_bps: u64,
        timestamp: u64,
    }

    #[event]
    struct YieldGenerated has drop {
        strategy_id: u64,
        yield_amount: u64,
        realized_apy_bps: u64,
        timestamp: u64,
    }

    #[event]
    struct CompoundPositionCreated has drop {
        position_id: u64,
        user: address,
        principal: u64,
        enrolled_strategies: u64, // Count of strategies
        auto_compound_enabled: bool,
        timestamp: u64,
    }

    #[event]
    struct AutoCompoundExecuted has drop {
        position_id: u64,
        user: address,
        principal_before: u64,
        yield_compounded: u64,
        principal_after: u64,
        compound_count: u64,
        timestamp: u64,
    }

    /// Initialize strategy registry
    public fun initialize_strategy_registry(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<StrategyRegistry>(addr), 6001);

        let registry = StrategyRegistry {
            strategies: vector::empty(),
            next_strategy_id: 1,
            total_capital_deployed: 0,
            total_yield_generated: 0,
            compound_positions: vector::empty(),
            next_position_id: 1,
        };

        move_to(account, registry);
    }

    /// Create a new yield strategy
    public fun create_strategy(
        account: &signer,
        name: String,
        strategy_type: u8,
        expected_apy_bps: u64,
        registry_addr: address,
    ) acquires StrategyRegistry {
        let _admin = signer::address_of(account);
        assert!(strategy_type >= 1 && strategy_type <= 4, 6002); // Invalid type
        assert!(expected_apy_bps > 0 && expected_apy_bps <= 5000, 6003); // Invalid APY (0-50%)

        let registry = borrow_global_mut<StrategyRegistry>(registry_addr);
        let strategy_id = registry.next_strategy_id;

        let strategy = YieldStrategy {
            strategy_id,
            name: name,
            strategy_type,
            capital_allocated: 0,
            expected_apy_bps,
            actual_yield_generated: 0,
            is_active: true,
            created_at: get_current_timestamp(),
            last_yield_time: 0,
        };

        vector::push_back(&mut registry.strategies, strategy);
        registry.next_strategy_id = strategy_id + 1;

        0x1::event::emit(StrategyCreated {
            strategy_id,
            name,
            strategy_type,
            expected_apy_bps,
            created_at: get_current_timestamp(),
        });
    }

    /// Deploy capital from SUPReserve reinvestment pool to strategies
    public fun deploy_capital_to_strategy(
        account: &signer,
        strategy_id: u64,
        amount_usdc: u64,
        registry_addr: address,
    ) acquires StrategyRegistry {
        let _operator = signer::address_of(account);
        assert!(amount_usdc > 0, 6004);

        let registry = borrow_global_mut<StrategyRegistry>(registry_addr);
        let strategy_index = find_strategy_index(&registry.strategies, strategy_id);
        assert!(strategy_index < vector::length(&registry.strategies), 6005);

        let strategy = vector::borrow_mut(&mut registry.strategies, strategy_index);
        assert!(strategy.is_active, 6006);

        strategy.capital_allocated = strategy.capital_allocated + amount_usdc;
        registry.total_capital_deployed = registry.total_capital_deployed + (amount_usdc as u128);

        let allocation_bps = (amount_usdc as u128) * 10000 / (registry.total_capital_deployed as u128);
        let allocation_bps_u64 = allocation_bps as u64;

        0x1::event::emit(CapitalDeployed {
            strategy_id,
            amount_deployed: amount_usdc,
            allocation_bps: allocation_bps_u64,
            timestamp: get_current_timestamp(),
        });
    }

    /// Report yield from strategy execution
    /// Called by off-chain keepers/oracles after strategy completion
    public fun report_strategy_yield(
        account: &signer,
        strategy_id: u64,
        yield_amount: u64,
        registry_addr: address,
    ) acquires StrategyRegistry {
        let _keeper = signer::address_of(account);
        assert!(yield_amount > 0, ERR_INVALID_AMOUNT);

        let registry = borrow_global_mut<StrategyRegistry>(registry_addr);
        let strategy_index = find_strategy_index(&registry.strategies, strategy_id);
        assert!(strategy_index < vector::length(&registry.strategies), 6005);

        let strategy = vector::borrow_mut(&mut registry.strategies, strategy_index);
        strategy.actual_yield_generated = strategy.actual_yield_generated + yield_amount;
        strategy.last_yield_time = get_current_timestamp();

        registry.total_yield_generated = registry.total_yield_generated + (yield_amount as u128);

        // Calculate realized APY
        let realized_apy = if (strategy.capital_allocated > 0) {
            ((yield_amount as u128) * 10000 / (strategy.capital_allocated as u128)) as u64
        } else {
            0
        };

        0x1::event::emit(YieldGenerated {
            strategy_id,
            yield_amount,
            realized_apy_bps: realized_apy,
            timestamp: get_current_timestamp(),
        });
    }

    /// Create a compound yield position for a user
    /// Enrolls user in all active strategies and enables auto-compounding
    public fun create_compound_position(
        account: &signer,
        principal: u64,
        auto_compound: bool,
        registry_addr: address,
    ) acquires StrategyRegistry {
        let user = signer::address_of(account);
        assert!(principal >= MIN_COMPOUND_AMOUNT, 6007);

        let registry = borrow_global_mut<StrategyRegistry>(registry_addr);
        let position_id = registry.next_position_id;
        let current_time = get_current_timestamp();

        // Enroll in all active strategies
        let enrolled_strategies = vector::empty();
        let i = 0;
        while (i < vector::length(&registry.strategies)) {
            let strategy = vector::borrow(&registry.strategies, i);
            if (strategy.is_active) {
                vector::push_back(&mut enrolled_strategies, strategy.strategy_id);
            };
            i = i + 1;
        };

        let position = CompoundYieldPosition {
            position_id,
            user,
            principal,
            strategies_enrolled: enrolled_strategies,
            total_yield_accrued: 0,
            times_compounded: 0,
            last_compound_at: current_time,
            next_auto_compound_at: current_time + AUTO_COMPOUND_FREQUENCY_SECS,
            is_auto_compound_enabled: auto_compound,
        };

        vector::push_back(&mut registry.compound_positions, position);
        registry.next_position_id = position_id + 1;

        let strategy_count = vector::length(&enrolled_strategies);

        0x1::event::emit(CompoundPositionCreated {
            position_id,
            user,
            principal,
            enrolled_strategies: strategy_count,
            auto_compound_enabled: auto_compound,
            timestamp: current_time,
        });
    }

    /// Execute auto-compound for a position
    /// Requires: position.next_auto_compound_at <= current_time
    public fun execute_auto_compound(
        account: &signer,
        position_id: u64,
        accumulated_yield: u64,
        registry_addr: address,
    ) acquires StrategyRegistry {
        let _operator = signer::address_of(account);
        let current_time = get_current_timestamp();

        let registry = borrow_global_mut<StrategyRegistry>(registry_addr);
        let position_index = find_position_index(&registry.compound_positions, position_id);
        assert!(position_index < vector::length(&registry.compound_positions), 6008);

        let position = vector::borrow_mut(&mut registry.compound_positions, position_index);
        assert!(position.is_auto_compound_enabled, 6009);
        assert!(current_time >= position.next_auto_compound_at, 6010); // Not yet time to compound

        let principal_before = position.principal;

        // Lock yield as new principal
        position.principal = position.principal + accumulated_yield;
        position.total_yield_accrued = position.total_yield_accrued + accumulated_yield;
        position.times_compounded = position.times_compounded + 1;
        position.last_compound_at = current_time;
        position.next_auto_compound_at = current_time + AUTO_COMPOUND_FREQUENCY_SECS;

        0x1::event::emit(AutoCompoundExecuted {
            position_id,
            user: position.user,
            principal_before,
            yield_compounded: accumulated_yield,
            principal_after: position.principal,
            compound_count: position.times_compounded,
            timestamp: current_time,
        });
    }

    /// Helper: Find strategy index by ID
    fun find_strategy_index(strategies: &vector<YieldStrategy>, strategy_id: u64): u64 {
        let i = 0;
        let len = vector::length(strategies);
        while (i < len) {
            if (vector::borrow(strategies, i).strategy_id == strategy_id) {
                return i
            };
            i = i + 1;
        };
        len
    }

    /// Helper: Find position index by ID
    fun find_position_index(positions: &vector<CompoundYieldPosition>, position_id: u64): u64 {
        let i = 0;
        let len = vector::length(positions);
        while (i < len) {
            if (vector::borrow(positions, i).position_id == position_id) {
                return i
            };
            i = i + 1;
        };
        len
    }

    /// View: Get strategy details
    public fun get_strategy_details(
        strategy_id: u64,
        registry_addr: address,
    ): (String, u8, u64, u64, u64) acquires StrategyRegistry {
        let registry = borrow_global<StrategyRegistry>(registry_addr);
        let strategy_index = find_strategy_index(&registry.strategies, strategy_id);
        assert!(strategy_index < vector::length(&registry.strategies), 6005);

        let strategy = vector::borrow(&registry.strategies, strategy_index);
        (strategy.name, strategy.strategy_type, strategy.capital_allocated, strategy.expected_apy_bps, strategy.actual_yield_generated)
    }

    /// View: Get position details
    public fun get_position_details(
        position_id: u64,
        registry_addr: address,
    ): (address, u64, u64, u64, u64) acquires StrategyRegistry {
        let registry = borrow_global<StrategyRegistry>(registry_addr);
        let position_index = find_position_index(&registry.compound_positions, position_id);
        assert!(position_index < vector::length(&registry.compound_positions), 6008);

        let position = vector::borrow(&registry.compound_positions, position_index);
        (position.user, position.principal, position.total_yield_accrued, position.times_compounded, position.next_auto_compound_at)
    }

    /// View: Get global strategy metrics
    public fun get_strategy_metrics(registry_addr: address): (u128, u128, u64) acquires StrategyRegistry {
        let registry = borrow_global<StrategyRegistry>(registry_addr);
        let total_strategies = (vector::length(&registry.strategies) as u64);
        (
            registry.total_capital_deployed,
            registry.total_yield_generated,
            total_strategies,
        )
    }

    /// View: Calculate expected annual yield for user
    public fun calculate_expected_annual_yield(principal: u64, position_id: u64, registry_addr: address): u64 acquires StrategyRegistry {
        let registry = borrow_global<StrategyRegistry>(registry_addr);
        let position_index = find_position_index(&registry.compound_positions, position_id);
        
        assert!(position_index < vector::length(&registry.compound_positions), 6008);

        let position = vector::borrow(&registry.compound_positions, position_index);
        
        // Sum APYs across all enrolled strategies
        let total_apy = 0u64;
        let i = 0;
        while (i < vector::length(&position.strategies_enrolled)) {
            let strategy_id = *vector::borrow(&position.strategies_enrolled, i);
            let strategy_idx = find_strategy_index(&registry.strategies, strategy_id);
            if (strategy_idx < vector::length(&registry.strategies)) {
                let strategy = vector::borrow(&registry.strategies, strategy_idx);
                total_apy = total_apy + strategy.expected_apy_bps;
            };
            i = i + 1;
        };

        // Calculate annual yield: principal * total_apy / 10000
        ((principal as u128) * (total_apy as u128) / 10000u128) as u64
    }

    /// Get current timestamp
    fun get_current_timestamp(): u64 {
        0x1::chain::get_block_timestamp()
    }

    const ERR_INVALID_AMOUNT: u64 = 6011;

    #[test]
    fun test_strategy_allocation() {
        // Test allocation percentages sum to 100%
        let total = RESTAKING_ALLOCATION_BPS + LP_SEEDING_ALLOCATION_BPS + VAULT_INCENTIVES_ALLOCATION_BPS + PARTNERSHIP_ALLOCATION_BPS;
        assert!(total == 10000, 0);
    }

    #[test]
    fun test_expected_apy_ranges() {
        // Verify APYs are within realistic bounds (0-50%)
        assert!(RESTAKING_EXPECTED_APY_BPS > 0 && RESTAKING_EXPECTED_APY_BPS <= 5000, 0);
        assert!(LP_EXPECTED_APY_BPS > 0 && LP_EXPECTED_APY_BPS <= 5000, 0);
        assert!(VAULT_EXPECTED_APY_BPS > 0 && VAULT_EXPECTED_APY_BPS <= 5000, 0);
        assert!(PARTNERSHIP_EXPECTED_APY_BPS > 0 && PARTNERSHIP_EXPECTED_APY_BPS <= 5000, 0);
    }
}
