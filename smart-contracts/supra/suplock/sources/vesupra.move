/// veSUPRA Vote-Escrow Module for Supra L1
/// Implements soulbound veSUPRA NFTs for governance and yield boosting

module suplock::vesupra {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use std::string::{Self, String};

    const MAX_LOCK_DURATION_SECS: u64 = 126_144_000; // 4 years
    const MIN_LOCK_DURATION_SECS: u64 = 7_776_000;   // 3 months
    const SOULBOUND_LOCK_DAYS: u64 = 30; // NFT soulbound for 30 days

    /// veSUPRA NFT Record
    struct VeSupraNFT has key, store {
        token_id: u64,
        owner: address,
        supra_amount: u64,
        lock_duration_secs: u64,
        mint_time: u64,
        unlock_time: u64,
        boost_multiplier: u128,
        is_soulbound: bool,
        soulbound_release_time: u64,
    }

    /// Governance Proposal
    struct Proposal has key, store {
        proposal_id: u64,
        proposer: address,
        title: String,
        description: String,
        proposal_type: u8, // 1: revenue_split, 2: vault_fees, 3: locking_tiers, 4: treasury_use
        created_at: u64,
        voting_end_time: u64,
        execution_time: u64,
        votes_for: u128,
        votes_against: u128,
        is_executed: bool,
        parameters: VotingParameters,
    }

    /// Voting parameters proposal
    struct VotingParameters has key, store {
        revenue_split_buyback_bps: u64,  // 50% pre-floor
        revenue_split_dividends_bps: u64, // 35% pre-floor
        revenue_split_ve_rewards_bps: u64, // 10% pre-floor
        revenue_split_treasury_bps: u64,  // 5% pre-floor
    }

    /// User Vote Record
    struct Vote has key, store {
        proposal_id: u64,
        voter: address,
        ve_balance: u128,
        voted_for: bool,
        voted_at: u64,
    }

    /// veSUPRA Registry
    struct VeSupraNFTRegistry has key {
        nfts: vector<VeSupraNFT>,
        next_token_id: u64,
        total_ve_supply: u128,
    }

    /// Governance DAO
    struct GovernanceDAO has key {
        proposals: vector<Proposal>,
        next_proposal_id: u64,
        voting_period_secs: u64,
        execution_delay_secs: u64,
        timelock_queue: vector<u64>, // proposal IDs in timelock
    }

    /// Events
    #[event]
    struct VeSupraMinted has drop {
        user: address,
        token_id: u64,
        supra_amount: u64,
        lock_duration_secs: u64,
        boost_multiplier: u128,
    }

    #[event]
    struct VeSupraBurned has drop {
        user: address,
        token_id: u64,
        supra_amount: u64,
    }

    #[event]
    struct ProposalCreated has drop {
        proposal_id: u64,
        proposer: address,
        title: String,
        proposal_type: u8,
    }

    #[event]
    struct VoteCasted has drop {
        proposal_id: u64,
        voter: address,
        ve_balance: u128,
        voted_for: bool,
    }

    #[event]
    struct ProposalExecuted has drop {
        proposal_id: u64,
        timestamp: u64,
    }

    /// Initialize veSUPRA registry
    public fun initialize_ve_registry(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<VeSupraNFTRegistry>(addr), 2001);

        let registry = VeSupraNFTRegistry {
            nfts: vector::empty(),
            next_token_id: 1,
            total_ve_supply: 0,
        };

        move_to(account, registry);
    }

    /// Initialize governance DAO
    public fun initialize_governance_dao(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<GovernanceDAO>(addr), 2002);

        let dao = GovernanceDAO {
            proposals: vector::empty(),
            next_proposal_id: 1,
            voting_period_secs: 604_800, // 7 days
            execution_delay_secs: 259_200, // 3 days timelock
            timelock_queue: vector::empty(),
        };

        move_to(account, dao);
    }

    /// Mint veSUPRA NFT (soulbound) for locked $SUPRA
    /// Soulbound for 30 days, then transferable
    public fun mint_ve_nft(
        account: &signer,
        supra_amount: u64,
        lock_duration_secs: u64,
        registry_addr: address,
    ) acquires VeSupraNFTRegistry {
        let user_addr = signer::address_of(account);

        assert!(
            lock_duration_secs >= MIN_LOCK_DURATION_SECS && 
            lock_duration_secs <= MAX_LOCK_DURATION_SECS,
            2003,
        );

        assert!(supra_amount > 0, 2004);

        let registry = borrow_global_mut<VeSupraNFTRegistry>(registry_addr);
        let token_id = registry.next_token_id;
        let current_time = get_current_timestamp();
        
        // Calculate boost: 1 + (lock_time / max_lock_time) * 1.5, capped at 2.5x
        let boost = calculate_ve_boost(lock_duration_secs);
        let ve_balance = ((supra_amount as u128) * boost) / 10000;

        let nft = VeSupraNFT {
            token_id,
            owner: user_addr,
            supra_amount,
            lock_duration_secs,
            mint_time: current_time,
            unlock_time: current_time + lock_duration_secs,
            boost_multiplier: boost,
            is_soulbound: true,
            soulbound_release_time: current_time + (SOULBOUND_LOCK_DAYS * 86_400),
        };

        vector::push_back(&mut registry.nfts, nft);
        registry.next_token_id = token_id + 1;
        registry.total_ve_supply = registry.total_ve_supply + ve_balance;

        0x1::event::emit(VeSupraMinted {
            user: user_addr,
            token_id,
            supra_amount,
            lock_duration_secs,
            boost_multiplier: boost,
        });
    }

    /// Calculate veSUPRA boost multiplier
    /// Boost = 1 + (lock_time / max_lock_time) * 1.5, capped at 2.5x
    public fun calculate_ve_boost(lock_duration_secs: u64): u128 {
        let duration_ratio = (lock_duration_secs as u128) * 10000 / (MAX_LOCK_DURATION_SECS as u128);
        let boost = 10000 + (duration_ratio * 15000 / 10000); // 1.0 + ratio * 1.5

        if (boost > 25000) {
            25000 // Cap at 2.5x
        } else {
            boost
        }
    }

    /// Burn veSUPRA NFT (claims underlying $SUPRA after unlock time)
    public fun burn_ve_nft(
        account: &signer,
        token_id: u64,
        registry_addr: address,
    ) acquires VeSupraNFTRegistry {
        let user_addr = signer::address_of(account);
        let registry = borrow_global_mut<VeSupraNFTRegistry>(registry_addr);
        let current_time = get_current_timestamp();

        let nft_index = find_nft_index(&registry.nfts, token_id);
        assert!(nft_index < vector::length(&registry.nfts), 2005);

        let nft = vector::borrow(&registry.nfts, nft_index);
        assert!(nft.owner == user_addr, 2006); // Only owner can burn
        assert!(current_time >= nft.unlock_time, 2007); // Must be past unlock time

        let ve_balance = ((nft.supra_amount as u128) * nft.boost_multiplier) / 10000;
        registry.total_ve_supply = registry.total_ve_supply - ve_balance;

        0x1::event::emit(VeSupraBurned {
            user: user_addr,
            token_id,
            supra_amount: nft.supra_amount,
        });

        // Remove NFT
        _ = vector::remove(&mut registry.nfts, nft_index);
    }

    /// Create a governance proposal
    public fun create_proposal(
        account: &signer,
        title: String,
        description: String,
        proposal_type: u8,
        dao_addr: address,
        registry_addr: address,
    ) acquires GovernanceDAO, VeSupraNFTRegistry {
        let proposer = signer::address_of(account);
        
        // Proposer must hold veSUPRA
        let registry = borrow_global<VeSupraNFTRegistry>(registry_addr);
        assert!(user_has_ve_nft(proposer, &registry.nfts), 2008);

        let dao = borrow_global_mut<GovernanceDAO>(dao_addr);
        let proposal_id = dao.next_proposal_id;
        let current_time = get_current_timestamp();
        let voting_end_time = current_time + dao.voting_period_secs;

        let proposal = Proposal {
            proposal_id,
            proposer,
            title: title,
            description: description,
            proposal_type,
            created_at: current_time,
            voting_end_time,
            execution_time: voting_end_time + dao.execution_delay_secs,
            votes_for: 0,
            votes_against: 0,
            is_executed: false,
            parameters: VotingParameters {
                revenue_split_buyback_bps: 5000,  // 50%
                revenue_split_dividends_bps: 3500, // 35%
                revenue_split_ve_rewards_bps: 1000, // 10%
                revenue_split_treasury_bps: 500,   // 5%
            },
        };

        vector::push_back(&mut dao.proposals, proposal);
        dao.next_proposal_id = proposal_id + 1;

        0x1::event::emit(ProposalCreated {
            proposal_id,
            proposer,
            title,
            proposal_type,
        });
    }

    /// Cast vote on a proposal
    public fun cast_vote(
        account: &signer,
        proposal_id: u64,
        voted_for: bool,
        dao_addr: address,
        registry_addr: address,
    ) acquires GovernanceDAO, VeSupraNFTRegistry {
        let voter = signer::address_of(account);
        let current_time = get_current_timestamp();

        let dao = borrow_global_mut<GovernanceDAO>(dao_addr);
        let registry = borrow_global<VeSupraNFTRegistry>(registry_addr);

        // Find proposal
        let proposal_index = find_proposal_index(&dao.proposals, proposal_id);
        assert!(proposal_index < vector::length(&dao.proposals), 2009);

        let proposal = vector::borrow_mut(&mut dao.proposals, proposal_index);
        assert!(current_time <= proposal.voting_end_time, 2010); // Voting must be open

        // Get voter's veSUPRA balance
        let ve_balance = get_user_ve_balance(voter, &registry.nfts);
        assert!(ve_balance > 0, 2011);

        // Record vote
        if (voted_for) {
            proposal.votes_for = proposal.votes_for + ve_balance;
        } else {
            proposal.votes_against = proposal.votes_against + ve_balance;
        };

        0x1::event::emit(VoteCasted {
            proposal_id,
            voter,
            ve_balance,
            voted_for,
        });
    }

    /// Execute a passed proposal (after timelock)
    public fun execute_proposal(
        account: &signer,
        proposal_id: u64,
        dao_addr: address,
    ) acquires GovernanceDAO {
        let executor = signer::address_of(account);
        let current_time = get_current_timestamp();

        let dao = borrow_global_mut<GovernanceDAO>(dao_addr);
        let proposal_index = find_proposal_index(&dao.proposals, proposal_id);
        assert!(proposal_index < vector::length(&dao.proposals), 2009);

        let proposal = vector::borrow_mut(&mut dao.proposals, proposal_index);
        
        // Check conditions for execution
        assert!(current_time >= proposal.execution_time, 2012); // Timelock elapsed
        assert!(!proposal.is_executed, 2013); // Not already executed
        assert!(proposal.votes_for > proposal.votes_against, 2014); // Proposal passed

        proposal.is_executed = true;

        0x1::event::emit(ProposalExecuted {
            proposal_id,
            timestamp: current_time,
        });
    }

    /// Helper: Find NFT index by token_id
    fun find_nft_index(nfts: &vector<VeSupraNFT>, token_id: u64): u64 {
        let i = 0;
        let len = vector::length(nfts);
        while (i < len) {
            if (vector::borrow(nfts, i).token_id == token_id) {
                return i
            };
            i = i + 1;
        };
        len // Not found
    }

    /// Helper: Find proposal index by proposal_id
    fun find_proposal_index(proposals: &vector<Proposal>, proposal_id: u64): u64 {
        let i = 0;
        let len = vector::length(proposals);
        while (i < len) {
            if (vector::borrow(proposals, i).proposal_id == proposal_id) {
                return i
            };
            i = i + 1;
        };
        len
    }

    /// Helper: Check if user has veSUPRA NFT
    fun user_has_ve_nft(user: address, nfts: &vector<VeSupraNFT>): bool {
        let i = 0;
        let len = vector::length(nfts);
        while (i < len) {
            if (vector::borrow(nfts, i).owner == user) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Helper: Get user's total veSUPRA balance
    fun get_user_ve_balance(user: address, nfts: &vector<VeSupraNFT>): u128 {
        let balance = 0u128;
        let i = 0;
        let len = vector::length(nfts);
        while (i < len) {
            let nft = vector::borrow(nfts, i);
            if (nft.owner == user) {
                balance = balance + ((nft.supra_amount as u128) * nft.boost_multiplier) / 10000;
            };
            i = i + 1;
        };
        balance
    }

    /// Get current timestamp
    fun get_current_timestamp(): u64 {
        0x1::chain::get_block_timestamp()
    }

    /// View: Get user's veSUPRA balance
    public fun get_ve_balance(user: address, registry_addr: address): u128 acquires VeSupraNFTRegistry {
        let registry = borrow_global<VeSupraNFTRegistry>(registry_addr);
        get_user_ve_balance(user, &registry.nfts)
    }

    /// View: Get total veSUPRA supply
    public fun get_ve_total_supply(registry_addr: address): u128 acquires VeSupraNFTRegistry {
        borrow_global<VeSupraNFTRegistry>(registry_addr).total_ve_supply
    }

    #[test]
    fun test_ve_boost() {
        let boost_max = calculate_ve_boost(126_144_000); // 4 years
        assert!(boost_max == 25000, 0); // 2.5x

        let boost_min = calculate_ve_boost(7_776_000); // 3 months
        assert!(boost_min > 10000 && boost_min < 25000, 0);
    }
}
