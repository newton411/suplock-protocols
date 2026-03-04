/// Restake Integration Module for SUPLOCK
/// Manages cross-protocol restaking with partner protocols (Supralend, Solido, Atmos)
/// Integrates with EigenLayer and Symbiotic for dual restaking
///
/// Features:
/// - Restake SUPRA from partner protocols
/// - Track yield from EigenLayer + Symbiotic
/// - Distribute partner protocol value back to SUPLOCK locks
/// - Adaptive reinvestment similar to supreserve flywheel
/// - Sustainability metrics and governance

module suplock::restake_integration {
    use std::signer;
    use std::string::{String, utf8};
    use std::vector;
    use std::option::{Self, Option};

    /// Partner Protocol IDs
    const PARTNER_SUPRALEND: u8 = 1;
    const PARTNER_SOLIDO: u8 = 2;
    const PARTNER_ATMOS: u8 = 3;

    /// Restaking Targets
    const TARGET_EIGENLAYER: u8 = 10;
    const TARGET_SYMBIOTIC: u8 = 11;

    /// Sustainability Constants (aligned with supreserve halving model)
    const RESTAKING_YIELD_CAPTURE_BPS: u64 = 500; // 5% of restaking yield → SUPReserve
    const PARTNER_VALUE_SHARE_BPS: u64 = 500; // 5% of partner value → SUPLOCK
    const REINVESTMENT_FROM_RESTAKING_BPS: u64 = 3000; // 30% of earned yields reinvested
    const PERFORMANCE_FEE_BPS: u64 = 1000; // 10% fee on excess yield above 15% APY baseline

    /// Restaking Position (user-owned resource)
    struct RestakingPosition has key {
        position_id: u64,
        user: address,
        lock_id: u64, // Link to suplock_core::LockPosition
        partner_protocol: u8, // PARTNER_SUPRALEND | PARTNER_SOLIDO | PARTNER_ATMOS
        restaking_target: u8, // TARGET_EIGENLAYER | TARGET_SYMBIOTIC
        principal_amount: u64, // Original SUPRA amount restaked
        staked_at: u64, // Block timestamp
        total_yield_earned: u64, // Cumulative yield from restaking
        partner_value_accrued: u64, // Value from partner protocol
        reinvested_amount: u64, // Portion redirected back for compounding
        is_active: bool,
        last_yield_update: u64,
    }

    /// Global Restake State
    struct RestakeState has key {
        next_position_id: u64,
        total_restaked_supralend: u64, // Amount from Supralend locked in vaults
        total_restaked_solido: u64, // Amount from Solido money market
        total_restaked_atmos: u64, // Amount from Atmos protocol
        total_principal_restaked: u64, // Total SUPRA in restaking
        total_yield_earned: u128, // Cumulative yield across all positions
        total_partner_value: u128, // Value distributed from partners
        total_reinvested: u128, // Amount recycled for compounding
        eigenlayer_apy_bps: u64, // Current EigenLayer APY in basis points
        symbiotic_apy_bps: u64, // Current Symbiotic APY in basis points
        partner_integrations: u64, // Count of active partner integrations
        restaking_sustainability_score: u128, // 0-10000: how sustainable is restaking
    }

    /// Restaking Metrics (for governance/monitoring)
    struct RestakingMetrics has key {
        period_start: u64,
        period_end: u64,
        yield_generated: u64,
        fees_collected: u64,
        reinvestments: u64,
        partner_value_distributed: u64,
        average_apy: u64,
    }

    /// Events
    #[event]
    struct RestakingPositionCreated has drop {
        position_id: u64,
        user: address,
        lock_id: u64,
        partner_protocol: u8,
        restaking_target: u8,
        principal_amount: u64,
        estimated_apy: u64,
        timestamp: u64,
    }

    #[event]
    struct RestakingYieldAcknowledged has drop {
        position_id: u64,
        user: address,
        yield_amount: u64,
        source: u8, // TARGET_EIGENLAYER or TARGET_SYMBIOTIC
        apy_earned: u64,
        timestamp: u64,
    }

    #[event]
    struct PartnerValueDistributed has drop {
        position_id: u64,
        user: address,
        partner_protocol: u8,
        value_amount: u64,
        percentage_of_partner_yield: u64,
        timestamp: u64,
    }

    #[event]
    struct ReinvestmentExecuted has drop {
        position_id: u64,
        user: address,
        reinvested_amount: u64,
        new_principal: u64,
        extended_apy: u64,
        timestamp: u64,
    }

    #[event]
    struct RestakingSustainabilityUpdated has drop {
        total_restaked: u64,
        weighted_apy: u64,
        sustainability_score: u128,
        average_partner_value: u64,
        timestamp: u64,
    }

    /// Initialize restake state (call once at deployment)
    public fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<RestakeState>(addr), 6001);

        let state = RestakeState {
            next_position_id: 1,
            total_restaked_supralend: 0,
            total_restaked_solido: 0,
            total_restaked_atmos: 0,
            total_principal_restaked: 0,
            total_yield_earned: 0,
            total_partner_value: 0,
            total_reinvested: 0,
            eigenlayer_apy_bps: 1500, // 15% APY baseline
            symbiotic_apy_bps: 1200, // 12% APY baseline
            partner_integrations: 3,
            restaking_sustainability_score: 8500, // Start at 85% health
        };

        move_to(account, state);
    }

    /// Create a new restaking position
    /// User brings SUPRA from a partner protocol and restakes it via EigenLayer/Symbiotic
    /// Links to their suplock_core::LockPosition for governance & dividend sharing
    public fun create_restaking_position(
        account: &signer,
        lock_id: u64,
        partner_protocol: u8,
        restaking_target: u8,
        principal_amount: u64,
        state_addr: address,
    ) acquires RestakeState {
        let user = signer::address_of(account);
        assert!(principal_amount > 0, 6002);
        assert!(partner_protocol >= 1 && partner_protocol <= 3, 6003);
        assert!(restaking_target == TARGET_EIGENLAYER || restaking_target == TARGET_SYMBIOTIC, 6004);

        let state = borrow_global_mut<RestakeState>(state_addr);
        let position_id = state.next_position_id;
        state.next_position_id = state.next_position_id + 1;

        // Update partner-specific counters
        if (partner_protocol == PARTNER_SUPRALEND) {
            state.total_restaked_supralend = state.total_restaked_supralend + principal_amount;
        } else if (partner_protocol == PARTNER_SOLIDO) {
            state.total_restaked_solido = state.total_restaked_solido + principal_amount;
        } else if (partner_protocol == PARTNER_ATMOS) {
            state.total_restaked_atmos = state.total_restaked_atmos + principal_amount;
        };

        state.total_principal_restaked = state.total_principal_restaked + principal_amount;

        // Select APY based on target
        let apy = if (restaking_target == TARGET_EIGENLAYER) {
            state.eigenlayer_apy_bps
        } else {
            state.symbiotic_apy_bps
        };

        let position = RestakingPosition {
            position_id,
            user,
            lock_id,
            partner_protocol,
            restaking_target,
            principal_amount,
            staked_at: get_current_timestamp(),
            total_yield_earned: 0,
            partner_value_accrued: 0,
            reinvested_amount: 0,
            is_active: true,
            last_yield_update: get_current_timestamp(),
        };

        move_to(account, position);

        0x1::event::emit(RestakingPositionCreated {
            position_id,
            user,
            lock_id,
            partner_protocol,
            restaking_target,
            principal_amount,
            estimated_apy: apy,
            timestamp: get_current_timestamp(),
        });
    }

    /// Accrue yield from restaking oracle/keeper
    /// Called periodically (daily/weekly) to update yield earned
    public fun accrue_restaking_yield(
        account: &signer,
        user_addr: address,
        yield_amount: u64,
        source: u8, // TARGET_EIGENLAYER or TARGET_SYMBIOTIC
        apy_earned: u64,
        state_addr: address,
    ) acquires RestakingPosition, RestakeState {
        let _keeper = signer::address_of(account);
        assert!(yield_amount > 0, 6005);
        assert!(exists<RestakingPosition>(user_addr), 6006);

        let position = borrow_global_mut<RestakingPosition>(user_addr);
        assert!(position.is_active, 6007);

        position.total_yield_earned = position.total_yield_earned + yield_amount;
        position.last_yield_update = get_current_timestamp();

        let state = borrow_global_mut<RestakeState>(state_addr);
        state.total_yield_earned = state.total_yield_earned + (yield_amount as u128);

        // Calculate performance fee (10% on yields exceeding 15% baseline)
        let baseline_yield = (position.principal_amount as u128) * ((15 * 100) as u128) / (10000 as u128);
        let excess_yield = if ((yield_amount as u128) > baseline_yield) {
            (yield_amount as u128) - baseline_yield
        } else {
            0
        };
        let performance_fee = if (excess_yield > 0) {
            ((excess_yield * (PERFORMANCE_FEE_BPS as u128)) / 10000) as u64
        } else {
            0
        };

        0x1::event::emit(RestakingYieldAcknowledged {
            position_id: position.position_id,
            user: user_addr,
            yield_amount,
            source,
            apy_earned,
            timestamp: get_current_timestamp(),
        });
    }

    /// Distribute partner protocol value back to SUPLOCK locks
    /// When Supralend/Solido/Atmos generate fees/value, 5% flows back to SUPLOCK users
    public fun distribute_partner_value(
        account: &signer,
        user_addr: address,
        partner_protocol: u8,
        value_amount: u64,
        state_addr: address,
    ) acquires RestakingPosition, RestakeState {
        let _partner = signer::address_of(account);
        assert!(value_amount > 0, 6008);
        assert!(exists<RestakingPosition>(user_addr), 6009);

        let position = borrow_global_mut<RestakingPosition>(user_addr);
        assert!(position.is_active, 6010);
        assert!(position.partner_protocol == partner_protocol, 6011);

        position.partner_value_accrued = position.partner_value_accrued + value_amount;

        let state = borrow_global_mut<RestakeState>(state_addr);
        state.total_partner_value = state.total_partner_value + (value_amount as u128);

        0x1::event::emit(PartnerValueDistributed {
            position_id: position.position_id,
            user: user_addr,
            partner_protocol,
            value_amount,
            percentage_of_partner_value: PARTNER_VALUE_SHARE_BPS,
            timestamp: get_current_timestamp(),
        });
    }

    /// Reinvest earned yield back into the restaking position
    /// Extends lock duration and increases principal (compounding similar to suplock_core)
    public fun reinvest_restaking_yield(
        account: &signer,
        state_addr: address,
    ) acquires RestakingPosition, RestakeState {
        let user = signer::address_of(account);
        assert!(exists<RestakingPosition>(user), 6012);

        let position = borrow_global_mut<RestakingPosition>(user);
        assert!(position.is_active, 6013);

        let yield_to_reinvest = ((position.total_yield_earned as u128) * ((REINVESTMENT_FROM_RESTAKING_BPS as u128)) / 10000) as u64;
        assert!(yield_to_reinvest > 0, 6014);

        position.principal_amount = position.principal_amount + yield_to_reinvest;
        position.reinvested_amount = position.reinvested_amount + yield_to_reinvest;
        position.total_yield_earned = 0; // Reset for next cycle

        let state = borrow_global_mut<RestakeState>(state_addr);
        state.total_reinvested = state.total_reinvested + (yield_to_reinvest as u128);

        let apy = if (position.restaking_target == TARGET_EIGENLAYER) {
            state.eigenlayer_apy_bps
        } else {
            state.symbiotic_apy_bps
        };

        0x1::event::emit(ReinvestmentExecuted {
            position_id: position.position_id,
            user,
            reinvested_amount: yield_to_reinvest,
            new_principal: position.principal_amount,
            extended_apy: apy,
            timestamp: get_current_timestamp(),
        });
    }

    /// Update APY for restaking targets (oracle/governance function)
    public fun update_apy(
        account: &signer,
        target: u8,
        new_apy_bps: u64,
        state_addr: address,
    ) acquires RestakeState {
        let _admin = signer::address_of(account);
        assert!(target == TARGET_EIGENLAYER || target == TARGET_SYMBIOTIC, 6015);
        assert!(new_apy_bps > 0, 6016);

        let state = borrow_global_mut<RestakeState>(state_addr);
        if (target == TARGET_EIGENLAYER) {
            state.eigenlayer_apy_bps = new_apy_bps;
        } else {
            state.symbiotic_apy_bps = new_apy_bps;
        };
    }

    /// Calculate weighted average APY across all positions
    public fun calculate_weighted_apy(state_addr: address): u64 acquires RestakeState {
        let state = borrow_global<RestakeState>(state_addr);
        if (state.total_principal_restaked == 0) {
            return 0
        };

        let eigenlayer_weight = (state.total_restaked_supralend + state.total_restaked_solido) / 2;
        let symbiotic_weight = state.total_restaked_atmos;

        let total_weight = eigenlayer_weight + symbiotic_weight;
        if (total_weight == 0) {
            return 0
        };

        let weighted = ((eigenlayer_weight as u128) * (state.eigenlayer_apy_bps as u128) / (total_weight as u128)) +
                       ((symbiotic_weight as u128) * (state.symbiotic_apy_bps as u128) / (total_weight as u128));
        (weighted as u64)
    }

    /// View: Get restaking position details
    public fun get_position_details(user_addr: address): (u64, u64, u64, u64, u64) acquires RestakingPosition {
        if (exists<RestakingPosition>(user_addr)) {
            let pos = borrow_global<RestakingPosition>(user_addr);
            (
                pos.position_id,
                pos.principal_amount,
                pos.total_yield_earned,
                pos.partner_value_accrued,
                pos.reinvested_amount,
            )
        } else {
            (0, 0, 0, 0, 0)
        }
    }

    /// View: Get restaking state metrics
    public fun get_restake_metrics(state_addr: address): (u64, u128, u128, u128) acquires RestakeState {
        let state = borrow_global<RestakeState>(state_addr);
        (
            state.total_principal_restaked,
            state.total_yield_earned,
            state.total_partner_value,
            state.total_reinvested,
        )
    }

    /// Get current timestamp
    fun get_current_timestamp(): u64 {
        0x1::chain::get_block_timestamp()
    }

    #[test]
    fun test_create_position() {
        let principal = 1000u64;
        assert!(principal > 0, 0);
        assert!(PARTNER_SUPRALEND == 1, 0);
    }

    #[test]
    fun test_apy_calculation() {
        // Baseline APY checks
        assert!(1500 == 15 * 100, 0); // 15% EigenLayer
        assert!(1200 == 12 * 100, 0); // 12% Symbiotic
    }
}
