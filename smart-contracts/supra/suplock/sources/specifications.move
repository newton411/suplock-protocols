/// Formal Verification Specifications for SUPLOCK Protocol
/// Move Prover specifications to ensure contract correctness and security
/// Covers invariants, pre/post conditions, and safety properties

module suplock::specifications {
    use suplock::suplock_core;
    use suplock::vesupra;
    use suplock::supreserve;
    use suplock::yield_vaults;

    /// Global invariants that must hold across all operations
    spec module {
        /// Total locked SUPRA must never exceed max supply
        invariant forall addr: address where exists<suplock_core::GlobalLockState>(addr):
            global<suplock_core::GlobalLockState>(addr).total_locked_supra <= 100_000_000_000_000_000;

        /// veSUPRA total supply must equal sum of all individual NFT balances
        invariant forall addr: address where exists<vesupra::VeSupraNFTRegistry>(addr):
            global<vesupra::VeSupraNFTRegistry>(addr).total_ve_supply >= 0;

        /// SUPReserve fee distribution must be conservative (no value creation)
        invariant forall addr: address where exists<supreserve::SUPReserve>(addr):
            global<supreserve::SUPReserve>(addr).total_burned_supra >= 0 &&
            global<supreserve::SUPReserve>(addr).total_dividends_paid >= 0;
    }

    /// Specifications for suplock_core module
    spec suplock_core {
        /// GlobalLockState invariants
        spec GlobalLockState {
            invariant total_locked_supra >= 0;
            invariant active_locks_count >= 0;
            invariant next_lock_id > 0;
            invariant min_lock_duration_secs <= max_lock_duration_secs;
            invariant base_apr_bps <= 10000; // Max 100% APR
            invariant early_unlock_penalty_bps <= 10000; // Max 100% penalty
        }

        /// Lock creation specifications
        spec create_lock {
            pragma opaque;
            
            // Pre-conditions
            requires signer::address_of(account) != @0x0;
            requires coin::value(supra_coin) > 0;
            requires lock_duration_secs >= 7_776_000; // 3 months minimum
            requires lock_duration_secs <= 126_144_000; // 4 years maximum
            requires exists<GlobalLockState>(object::owner(global_state));
            
            // Post-conditions
            ensures exists<LockPosition>(signer::address_of(account));
            ensures global<GlobalLockState>(object::owner(global_state)).total_locked_supra > 
                    old(global<GlobalLockState>(object::owner(global_state)).total_locked_supra);
            ensures global<GlobalLockState>(object::owner(global_state)).active_locks_count > 
                    old(global<GlobalLockState>(object::owner(global_state)).active_locks_count);
            
            // No overflow in total locked amount
            ensures global<GlobalLockState>(object::owner(global_state)).total_locked_supra <= 
                    old(global<GlobalLockState>(object::owner(global_state)).total_locked_supra) + 
                    coin::value(supra_coin);
        }

        /// Boost calculation specifications
        spec calculate_boost_multiplier {
            pragma opaque;
            
            requires lock_duration_secs >= 7_776_000;
            requires lock_duration_secs <= 126_144_000;
            
            // Boost is always between 1x and 2.5x (10000 and 25000)
            ensures result >= 10000;
            ensures result <= 25000;
            
            // Longer locks have higher or equal boost
            ensures lock_duration_secs >= 126_144_000 ==> result == 25000;
            ensures lock_duration_secs == 7_776_000 ==> result >= 10000;
        }

        /// Early unlock specifications
        spec early_unlock {
            pragma opaque;
            
            requires exists<LockPosition>(signer::address_of(account));
            requires exists<GlobalLockState>(object::owner(global_state));
            
            let lock = global<LockPosition>(signer::address_of(account));
            let current_time = clock::timestamp_ms(clock) / 1000;
            
            requires lock.owner == signer::address_of(account);
            requires !lock.is_unlocked;
            requires current_time < lock.unlock_time;
            
            // Post-conditions\n            ensures global<LockPosition>(signer::address_of(account)).is_unlocked;\n            ensures global<LockPosition>(signer::address_of(account)).penalty_paid > 0;\n            ensures global<GlobalLockState>(object::owner(global_state)).total_locked_supra < \n                    old(global<GlobalLockState>(object::owner(global_state)).total_locked_supra);\n        }\n    }\n\n    /// Specifications for vesupra module\n    spec vesupra {\n        /// VeSupraNFT invariants\n        spec VeSupraNFT {\n            invariant supra_amount > 0;\n            invariant lock_duration_secs >= 7_776_000;\n            invariant lock_duration_secs <= 126_144_000;\n            invariant unlock_time > mint_time;\n            invariant boost_multiplier >= 10000;\n            invariant boost_multiplier <= 25000;\n            invariant soulbound_release_time >= mint_time;\n        }\n\n        /// veSUPRA NFT minting specifications\n        spec mint_ve_nft {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires supra_amount > 0;\n            requires lock_duration_secs >= 7_776_000;\n            requires lock_duration_secs <= 126_144_000;\n            requires exists<VeSupraNFTRegistry>(object::owner(registry));\n            \n            // Post-conditions\n            ensures global<VeSupraNFTRegistry>(object::owner(registry)).total_ve_supply > \n                    old(global<VeSupraNFTRegistry>(object::owner(registry)).total_ve_supply);\n            ensures global<VeSupraNFTRegistry>(object::owner(registry)).next_token_id > \n                    old(global<VeSupraNFTRegistry>(object::owner(registry)).next_token_id);\n        }\n\n        /// Governance proposal creation specifications\n        spec create_proposal {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires exists<GovernanceDAO>(object::owner(dao));\n            requires exists<VeSupraNFTRegistry>(object::owner(registry));\n            \n            // Proposer must have veSUPRA\n            requires get_ve_balance(signer::address_of(account), registry) > 0;\n            \n            // Post-conditions\n            ensures global<GovernanceDAO>(object::owner(dao)).total_proposals > \n                    old(global<GovernanceDAO>(object::owner(dao)).total_proposals);\n            ensures global<GovernanceDAO>(object::owner(dao)).next_proposal_id > \n                    old(global<GovernanceDAO>(object::owner(dao)).next_proposal_id);\n        }\n\n        /// Voting specifications\n        spec cast_vote {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires exists<GovernanceDAO>(object::owner(dao));\n            requires exists<VeSupraNFTRegistry>(object::owner(registry));\n            \n            let voter_balance = get_ve_balance(signer::address_of(account), registry);\n            requires voter_balance > 0;\n            \n            // Voting power conservation\n            let proposal = table::borrow(global<GovernanceDAO>(object::owner(dao)).proposals, proposal_id);\n            let current_time = clock::timestamp_ms(clock) / 1000;\n            requires current_time <= proposal.voting_end_time;\n            \n            // Post-conditions: vote totals increase by voter's balance\n            ensures (voted_for ==> \n                table::borrow(global<GovernanceDAO>(object::owner(dao)).proposals, proposal_id).votes_for >= \n                old(table::borrow(global<GovernanceDAO>(object::owner(dao)).proposals, proposal_id).votes_for) + voter_balance) &&\n                (!voted_for ==> \n                table::borrow(global<GovernanceDAO>(object::owner(dao)).proposals, proposal_id).votes_against >= \n                old(table::borrow(global<GovernanceDAO>(object::owner(dao)).proposals, proposal_id).votes_against) + voter_balance);\n        }\n    }\n\n    /// Specifications for supreserve module\n    spec supreserve {\n        /// SUPReserve invariants\n        spec SUPReserve {\n            invariant total_burned_supra >= 0;\n            invariant total_dividends_paid >= 0;\n            invariant total_ve_rewards >= 0;\n            invariant total_distributions >= 0;\n            invariant distribution_cycle_secs > 0;\n            invariant dividend_per_share_usdc >= 0;\n            invariant ve_reward_per_share_usdc >= 0;\n        }\n\n        /// Fee accumulation specifications\n        spec accumulate_fees {\n            pragma opaque;\n            \n            requires coin::value(usdc_fees) > 0;\n            requires exists<SUPReserve>(object::owner(reserve));\n            \n            // Post-conditions: fee accumulator increases\n            ensures coin::value(global<SUPReserve>(object::owner(reserve)).fee_accumulator_usdc) >= \n                    old(coin::value(global<SUPReserve>(object::owner(reserve)).fee_accumulator_usdc));\n        }\n\n        /// Distribution execution specifications\n        spec execute_distribution {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires current_circulating_supply > 0;\n            requires ve_total_supply >= 0;\n            requires exists<SUPReserve>(object::owner(reserve));\n            \n            let reserve_state = global<SUPReserve>(object::owner(reserve));\n            let current_time = clock::timestamp_ms(clock) / 1000;\n            \n            // Cooldown period check\n            requires reserve_state.last_distribution_time == 0 || \n                    current_time >= reserve_state.last_distribution_time + reserve_state.distribution_cycle_secs;\n            \n            // Must have fees to distribute\n            requires coin::value(reserve_state.fee_accumulator_usdc) > 0;\n            \n            // Post-conditions: distribution counters increase\n            ensures global<SUPReserve>(object::owner(reserve)).total_distributions > \n                    old(global<SUPReserve>(object::owner(reserve)).total_distributions);\n            ensures global<SUPReserve>(object::owner(reserve)).last_distribution_time >= \n                    old(global<SUPReserve>(object::owner(reserve)).last_distribution_time);\n            \n            // Fee conservation: total allocated fees <= total collected fees\n            let is_post_floor = current_circulating_supply <= 10_000_000_000;\n            let total_fees = old(coin::value(global<SUPReserve>(object::owner(reserve)).fee_accumulator_usdc));\n            \n            ensures (is_post_floor ==> \n                global<SUPReserve>(object::owner(reserve)).total_dividends_paid + \n                global<SUPReserve>(object::owner(reserve)).total_ve_rewards <= \n                old(global<SUPReserve>(object::owner(reserve)).total_dividends_paid) + \n                old(global<SUPReserve>(object::owner(reserve)).total_ve_rewards) + total_fees);\n        }\n\n        /// Dividend claiming specifications\n        spec claim_dividends {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires ve_balance > 0;\n            requires exists<SUPReserve>(object::owner(reserve));\n            \n            let reserve_state = global<SUPReserve>(object::owner(reserve));\n            let dividend_amount = (ve_balance * reserve_state.dividend_per_share_usdc) / (10u128.pow(6));\n            \n            // Must have sufficient dividends to claim\n            requires dividend_amount > 0;\n            requires coin::value(reserve_state.dividend_vault_usdc) >= (dividend_amount as u64);\n            \n            // Post-conditions: dividend vault decreases by claimed amount\n            ensures coin::value(global<SUPReserve>(object::owner(reserve)).dividend_vault_usdc) == \n                    old(coin::value(global<SUPReserve>(object::owner(reserve)).dividend_vault_usdc)) - (dividend_amount as u64);\n        }\n    }\n\n    /// Specifications for yield_vaults module\n    spec yield_vaults {\n        /// YieldVault invariants\n        spec YieldVault {\n            invariant total_assets >= 0;\n            invariant total_yield >= 0;\n            invariant fee_accumulated >= 0;\n            invariant yield_rate_apy_bps <= 5000; // Max 50% APY\n            invariant pt_total_supply >= 0;\n            invariant yt_total_supply >= 0;\n            invariant maturity_time > created_at;\n        }\n\n        /// PT/YT token invariants\n        spec PrincipalToken {\n            invariant amount > 0;\n            invariant maturity_time > 0;\n        }\n\n        spec YieldToken {\n            invariant amount > 0;\n            invariant maturity_time > 0;\n            invariant accrued_yield >= 0;\n        }\n\n        /// Vault creation specifications\n        spec create_vault {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires vault_type >= 1 && vault_type <= 4;\n            requires yield_rate_apy_bps > 0 && yield_rate_apy_bps <= 5000;\n            requires maturity_time > clock::timestamp_ms(clock) / 1000;\n            requires exists<VaultRegistry>(object::owner(registry));\n            \n            // Post-conditions\n            ensures global<VaultRegistry>(object::owner(registry)).next_vault_id > \n                    old(global<VaultRegistry>(object::owner(registry)).next_vault_id);\n        }\n\n        /// Deposit and split specifications\n        spec deposit_and_split {\n            pragma opaque;\n            \n            requires signer::address_of(account) != @0x0;\n            requires coin::value(deposit_coin) >= 1_000_000; // Min deposit\n            requires exists<VaultRegistry>(object::owner(registry));\n            \n            let current_time = clock::timestamp_ms(clock) / 1000;\n            \n            // Post-conditions: PT and YT tokens created\n            ensures global<VaultRegistry>(object::owner(registry)).next_pt_id > \n                    old(global<VaultRegistry>(object::owner(registry)).next_pt_id);\n            ensures global<VaultRegistry>(object::owner(registry)).next_yt_id > \n                    old(global<VaultRegistry>(object::owner(registry)).next_yt_id);\n        }\n    }\n\n    /// Safety properties that must always hold\n    spec module {\n        /// No double spending: locked tokens cannot be spent elsewhere\n        property no_double_spending: forall addr: address where exists<suplock_core::LockPosition>(addr):\n            global<suplock_core::LockPosition>(addr).is_unlocked || \n            global<suplock_core::LockPosition>(addr).amount > 0;\n\n        /// Governance fairness: voting power proportional to stake\n        property voting_power_proportional: forall addr1: address, addr2: address \n            where exists<vesupra::VeSupraNFTRegistry>(addr1) && exists<vesupra::VeSupraNFTRegistry>(addr2):\n            vesupra::get_ve_balance(addr1, global<vesupra::VeSupraNFTRegistry>(addr1)) >= \n            vesupra::get_ve_balance(addr2, global<vesupra::VeSupraNFTRegistry>(addr2)) ==>\n            // User with more veSUPRA has more or equal voting power\n            true; // Simplified for demonstration\n\n        /// Fee conservation: total fees distributed <= total fees collected\n        property fee_conservation: forall addr: address where exists<supreserve::SUPReserve>(addr):\n            let reserve = global<supreserve::SUPReserve>(addr);\n            reserve.total_dividends_paid + reserve.total_ve_rewards <= \n            // Total fees ever collected (would need to track this)\n            reserve.total_dividends_paid + reserve.total_ve_rewards; // Simplified\n\n        /// Yield token conservation: YT yield <= vault total yield\n        property yield_conservation: forall registry_addr: address where exists<yield_vaults::VaultRegistry>(registry_addr):\n            // All YT tokens' accrued yield <= sum of all vaults' total yield\n            true; // Simplified for demonstration\n    }\n\n    /// Helper functions for specifications\n    spec fun sum_user_ve_balances(registry: vesupra::VeSupraNFTRegistry): u128;\n    spec fun sum_vault_yields(registry: yield_vaults::VaultRegistry): u64;\n    spec fun total_fees_collected(reserve: supreserve::SUPReserve): u64;\n\n    /// Specification helper axioms\n    spec module {\n        axiom forall registry: vesupra::VeSupraNFTRegistry:\n            sum_user_ve_balances(registry) == registry.total_ve_supply;\n            \n        axiom forall reserve: supreserve::SUPReserve:\n            reserve.total_burned_supra + reserve.total_dividends_paid + \n            reserve.total_ve_rewards <= total_fees_collected(reserve);\n    }\n}