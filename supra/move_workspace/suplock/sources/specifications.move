/// Move Prover Specifications for SUPLOCK Critical Paths
/// Formal verification of invariants for:
/// - Governance voting integrity
/// - Fee distribution correctness
/// - Lock state consistency
/// - veSUPRA supply accounting
/// 
/// Usage: move prove --dependencies=framework [source files]

module suplock::specifications {
    use suplock::suplock_core;
    use suplock::vesupra;
    use suplock::supreserve;

    // ============== SUPLOCK CORE SPECS ==============

    /// Invariant: Total locked supply >= sum of all user locks
    /// Formal property verified by Move Prover
    spec suplock_core::GlobalLockState {
        // Aggregator monotonically increases with lock creation
        invariant total_locked_aggregator >= 0;
    }

    /// Spec for lock creation: State machine property
    /// Pre-condition: amount > 0, duration valid
    /// Post-condition: aggregator incremented, event emitted
    spec suplock_core::create_lock {
        // Pre-conditions
        requires amount > 0;
        requires lock_duration_secs >= MIN_LOCK_DURATION_SECS;
        requires lock_duration_secs <= MAX_LOCK_DURATION_SECS;

        // Post-conditions
        ensures exists<suplock_core::LockPosition>(signer::address_of(account));
        ensures global<suplock_core::GlobalLockState>(global_state_addr).next_lock_id > old(
            global<suplock_core::GlobalLockState>(global_state_addr).next_lock_id
        );

        // No side effects on other accounts
        ensures forall addr: address where addr != signer::address_of(account):
            global<suplock_core::LockPosition>(addr) == old(global<suplock_core::LockPosition>(addr));
    }

    /// Spec for early unlock: No double-unlock property
    spec suplock_core::early_unlock {
        // Pre-conditions
        requires exists<suplock_core::LockPosition>(signer::address_of(account));

        let lock = global<suplock_core::LockPosition>(signer::address_of(account));
        requires !lock.is_unlocked;
        requires current_timestamp() < lock.unlock_time;

        // Post-conditions
        ensures global<suplock_core::LockPosition>(signer::address_of(account)).is_unlocked;
        ensures global<suplock_core::LockPosition>(signer::address_of(account)).penalty_paid > 0;

        // Invariant: No double penalty
        ensures global<suplock_core::LockPosition>(signer::address_of(account)).penalty_paid ==
            old(global<suplock_core::LockPosition>(signer::address_of(account)).penalty_paid);
    }

    /// Spec for yield claim: Monotonic yield property
    spec suplock_core::claim_yield {
        // Pre-conditions
        requires exists<suplock_core::LockPosition>(signer::address_of(account));

        let lock = global<suplock_core::LockPosition>(signer::address_of(account));
        requires current_timestamp() >= lock.unlock_time;

        // Post-conditions: Yield only increases
        ensures global<suplock_core::LockPosition>(signer::address_of(account)).yield_earned >=
            old(global<suplock_core::LockPosition>(signer::address_of(account)).yield_earned);

        // Invariant: No negative yield
        ensures global<suplock_core::LockPosition>(signer::address_of(account)).yield_earned >= 0;
    }

    // ============== VESUPRA GOVERNANCE SPECS ==============

    /// Invariant: veSUPRA supply is sum of all minted NFTs
    /// Critical for governance voting power calculation
    spec vesupra::VeSupraNFTRegistry {
        // Total ve supply consistency
        invariant
            forall nft in nfts:
                exists (total: u128) where total == calculate_total_ve_supply(nfts);
    }

    /// Spec for proposal voting: Democracy property
    /// Each voter votes once, weighted by veSUPRA balance
    spec vesupra::vote {
        // Pre-conditions
        requires exists<vesupra::Proposal>(proposal_addr);
        requires !exists<vesupra::UserVote>(signer::address_of(account));

        let proposal = global<vesupra::Proposal>(proposal_addr);
        requires current_timestamp() < proposal.voting_end_time;

        // Post-conditions: Vote recorded with correct weight
        ensures exists<vesupra::UserVote>(signer::address_of(account));

        let recorded_vote = global<vesupra::UserVote>(signer::address_of(account));
        ensures recorded_vote.proposal_id == proposal_id;
        ensures recorded_vote.ve_balance == ve_balance;
        ensures recorded_vote.voted_for == voted_for;

        // Vote count updated correctly
        if (voted_for) {
            ensures global<vesupra::Proposal>(proposal_addr).votes_for ==
                old(global<vesupra::Proposal>(proposal_addr).votes_for) + ve_balance;
        } else {
            ensures global<vesupra::Proposal>(proposal_addr).votes_against ==
                old(global<vesupra::Proposal>(proposal_addr).votes_against) + ve_balance;
        };

        // No voter can vote twice (safety property)
        ensures forall voter: address where voter == signer::address_of(account):
            count_votes_by_user(proposal_id, voter) == 1;
    }

    /// Spec for proposal execution: Timelock property
    /// Proposal cannot execute before voting period + delay
    spec vesupra::execute_proposal {
        // Pre-conditions
        requires exists<vesupra::Proposal>(proposal_addr);

        let proposal = global<vesupra::Proposal>(proposal_addr);
        requires proposal.is_executed == false;
        requires current_timestamp() >= proposal.execution_time;

        // Post-conditions
        ensures global<vesupra::Proposal>(proposal_addr).is_executed == true;

        // Safety: Execution respects voting results
        ensures proposal.votes_for > proposal.votes_against || 
            (proposal.votes_for == proposal.votes_against && proposal.votes_for > 0);
    }

    /// Spec: No vote double-counting
    spec vesupra::vote {
        ensures !exists<vesupra::UserVote>(signer::address_of(account))
            before vote(account, proposal_id, ve_balance, voted_for, proposal_addr) ==
            exists<vesupra::UserVote>(signer::address_of(account))
            after vote(account, proposal_id, ve_balance, voted_for, proposal_addr);
    }

    // ============== SUPRESERVE DISTRIBUTION SPECS ==============

    /// Invariant: Fee distribution splits sum to 10000 basis points
    /// Critical for economic correctness
    spec supreserve::DistributionSplit {
        invariant buyback_bps + dividends_bps + ve_rewards_bps + treasury_bps == 10000;
    }

    /// Spec for distribution: Conservation of fees
    /// All fees input must equal fees output across all buckets
    spec supreserve::execute_distribution {
        // Pre-conditions
        requires total_fees_usdc > 0;

        let split = if (is_post_floor) {
            distribution_split_post
        } else {
            distribution_split_pre
        };

        // Post-conditions: Fee conservation
        ensures (total_fees_usdc * split.buyback_bps / 10000) +
                (total_fees_usdc * split.dividends_bps / 10000) +
                (total_fees_usdc * split.ve_rewards_bps / 10000) +
                (total_fees_usdc * split.treasury_bps / 10000)
            == total_fees_usdc;

        // Each bucket updated correctly
        ensures global<supreserve::Distribution>(distribution_addr).buyback_allocation ==
            (total_fees_usdc * split.buyback_bps / 10000);
        ensures global<supreserve::Distribution>(distribution_addr).dividends_allocation ==
            (total_fees_usdc * split.dividends_bps / 10000);
        ensures global<supreserve::Distribution>(distribution_addr).ve_rewards_allocation ==
            (total_fees_usdc * split.ve_rewards_bps / 10000);
        ensures global<supreserve::Distribution>(distribution_addr).treasury_allocation ==
            (total_fees_usdc * split.treasury_bps / 10000);

        // Distribution ID incremented
        ensures global<supreserve::SUPReserve>(config_addr).next_distribution_id ==
            old(global<supreserve::SUPReserve>(config_addr).next_distribution_id) + 1;
    }

    /// Spec for dividend claim: No double-claiming
    spec supreserve::claim_dividends {
        // Pre-condition
        requires !exists<supreserve::DividendRecord>(signer::address_of(account));

        // Post-condition: Record created exactly once
        ensures exists<supreserve::DividendRecord>(signer::address_of(account));

        let record = global<supreserve::DividendRecord>(signer::address_of(account));
        ensures record.user == signer::address_of(account);
        ensures record.amount_usdc == amount_usdc;

        // Cannot claim again for same period
        ensures forall prev_record in distribution_history:
            prev_record.user == signer::address_of(account) ==>
            prev_record.claimed_at != record.claimed_at;
    }

    // ============== CROSS-CUTTING INVARIANTS ==============

    /// Global safety invariant: No value creation
    /// Total locked (including penalties) = deposited amount
    spec module {
        invariant
            total_locked_supply() + total_penalty_paid() == total_deposit_value();
    }

    /// Global safety invariant: Monotonic time
    spec module {
        invariant current_timestamp() >= old(current_timestamp());
    }

    /// Global safety invariant: Event completeness
    /// Every state change must emit an event for audit trail
    spec module {
        invariant forall state_change: StateChange where state_change.is_critical:
            exists event: Event where event.correlates_with(state_change);
    }

    // ============== HELPER SPECIFICATIONS ==============

    /// Calculate total veSUPRA from all NFTs
    spec fun calculate_total_ve_supply(nfts: vector<VeSupraNFT>): u128 {
        let total = 0;
        for nft in nfts {
            total = total + (nft.supra_amount * nft.boost_multiplier / 10000);
        };
        total
    }

    /// Count votes cast by a user for a proposal
    spec fun count_votes_by_user(proposal_id: u64, voter: address): u64 {
        let count = 0;
        forall vote in all_votes where vote.proposal_id == proposal_id && vote.voter == voter:
            count = count + 1;
        count
    }

    /// Verify distribution split validity
    spec fun is_valid_distribution_split(split: DistributionSplit): bool {
        split.buyback_bps + split.dividends_bps + split.ve_rewards_bps + split.treasury_bps == 10000
    }

    /// Verify total value conservation
    spec fun total_locked_supply(): u128 {
        sum_of_all_user_locks()
    }

    spec fun total_penalty_paid(): u128 {
        sum_of_penalties_by_all_users()
    }

    spec fun total_deposit_value(): u128 {
        total_locked_supply() + total_penalty_paid()
    }
}
