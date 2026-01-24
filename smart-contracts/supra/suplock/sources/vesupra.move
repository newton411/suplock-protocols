/// veSUPRA Vote-Escrow Module for Supra L1
/// Integrates with Supra's native NFT system and oracle feeds for governance
/// Implements soulbound veSUPRA NFTs with DVRF-powered fair governance

module suplock::vesupra {
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};
    use std::string::{Self, String};
    use supra_framework::coin::{Self, Coin};
    use supra_framework::object::{Self, UID};
    use supra_framework::event;
    use supra_framework::clock::{Self, Clock};
    use supra_framework::table::{Self, Table};
    use suplock::oracle_integration;
    use suplock::dvrf_integration;

    /// Native token type
    struct SUPRA has drop {}

    const MAX_LOCK_DURATION_SECS: u64 = 126_144_000; // 4 years (aligned with Supra PoEL)
    const MIN_LOCK_DURATION_SECS: u64 = 7_776_000;   // 3 months
    const SOULBOUND_LOCK_DAYS: u64 = 30; // NFT soulbound for 30 days
    const VOTING_PERIOD_SECS: u64 = 604_800; // 7 days
    const EXECUTION_DELAY_SECS: u64 = 259_200; // 3 days timelock
    const ORACLE_FEED_SUPRA_USD: u64 = 1;

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 2001;
    const ERR_INVALID_LOCK_DURATION: u64 = 2002;
    const ERR_INVALID_AMOUNT: u64 = 2003;
    const ERR_NFT_NOT_FOUND: u64 = 2004;
    const ERR_NOT_OWNER: u64 = 2005;
    const ERR_STILL_SOULBOUND: u64 = 2006;
    const ERR_NOT_UNLOCKED: u64 = 2007;
    const ERR_NO_VESUPRA: u64 = 2008;
    const ERR_PROPOSAL_NOT_FOUND: u64 = 2009;
    const ERR_VOTING_CLOSED: u64 = 2010;
    const ERR_INSUFFICIENT_VOTING_POWER: u64 = 2011;
    const ERR_TIMELOCK_NOT_READY: u64 = 2012;
    const ERR_ALREADY_EXECUTED: u64 = 2013;
    const ERR_PROPOSAL_FAILED: u64 = 2014;

    /// Proposal types
    const PROPOSAL_TYPE_REVENUE_SPLIT: u8 = 1;
    const PROPOSAL_TYPE_VAULT_PARAMS: u8 = 2;
    const PROPOSAL_TYPE_LOCKING_TIERS: u8 = 3;
    const PROPOSAL_TYPE_TREASURY_USE: u8 = 4;

    /// veSUPRA NFT Record - User-owned with Supra object model
    struct VeSupraNFT has key, store {
        id: UID,
        owner: address,
        supra_amount: u64,
        lock_duration_secs: u64,
        mint_time: u64,
        unlock_time: u64,
        boost_multiplier: u128,
        is_soulbound: bool,
        soulbound_release_time: u64,
        // Supra integrations
        oracle_price_at_mint: u128, // SUPRA price when minted
        lock_position_id: UID, // Reference to suplock_core LockPosition
    }

    /// Governance Proposal with DVRF fairness
    struct Proposal has key, store {
        id: UID,
        proposal_id: u64,
        proposer: address,
        title: String,
        description: String,
        proposal_type: u8,
        created_at: u64,
        voting_end_time: u64,
        execution_time: u64,
        votes_for: u128,
        votes_against: u128,
        is_executed: bool,
        parameters: VotingParameters,
        // DVRF integration for fair proposal ordering
        dvrf_seed: vector<u8>,
        execution_priority: u64,
    }

    /// Voting parameters with Supra-specific settings
    struct VotingParameters has store {
        // Revenue distribution (basis points)
        revenue_split_buyback_bps: u64,  // 50% pre-floor, 0% post-floor
        revenue_split_dividends_bps: u64, // 35% pre-floor, 65% post-floor
        revenue_split_ve_rewards_bps: u64, // 10% pre-floor, 12.5% post-floor
        revenue_split_treasury_bps: u64,  // 5% pre-floor, 12.5% post-floor
        // Vault parameters
        vault_fee_bps: u64, // Performance fee
        min_deposit_usdc: u64, // Minimum deposit
        // Oracle settings
        oracle_freshness_threshold: u64, // Max feed age
        price_deviation_threshold_bps: u64, // Max price change
    }

    /// User Vote Record
    struct Vote has store {
        proposal_id: u64,
        voter: address,
        ve_balance: u128,
        voted_for: bool,
        voted_at: u64,
        dvrf_seed_used: vector<u8>, // For vote verification
    }

    /// veSUPRA Registry with efficient lookups
    struct VeSupraNFTRegistry has key {
        id: UID,
        nfts: Table<UID, VeSupraNFT>,
        user_nfts: Table<address, vector<UID>>, // User -> NFT IDs
        next_token_id: u64,
        total_ve_supply: u128,
        // Supra integrations
        oracle_config: address,
        dvrf_manager: address,
    }

    /// Governance DAO with DVRF integration
    struct GovernanceDAO has key {
        id: UID,
        proposals: Table<u64, Proposal>,
        active_proposal_ids: vector<u64>,
        votes: Table<u64, vector<Vote>>, // proposal_id -> votes
        next_proposal_id: u64,
        voting_period_secs: u64,
        execution_delay_secs: u64,
        timelock_queue: vector<u64>, // proposal IDs in timelock
        // Supra integrations
        dvrf_manager: address,
        oracle_config: address,
        // Governance stats
        total_proposals: u64,
        executed_proposals: u64,
        total_votes_cast: u64,
    }

    /// Events with Supra Oracle data
    #[event]
    struct VeSupraMinted has copy, drop {
        user: address,
        token_id: UID,
        supra_amount: u64,
        lock_duration_secs: u64,
        boost_multiplier: u128,
        supra_price_usd: u128,
        lock_position_id: UID,
        timestamp: u64,
    }

    #[event]
    struct VeSupraBurned has copy, drop {
        user: address,
        token_id: UID,
        supra_amount: u64,
        timestamp: u64,
    }

    #[event]
    struct ProposalCreated has copy, drop {
        proposal_id: u64,
        proposer: address,
        title: String,
        proposal_type: u8,
        dvrf_seed: vector<u8>,
        execution_priority: u64,
        timestamp: u64,
    }

    #[event]
    struct VoteCasted has copy, drop {
        proposal_id: u64,
        voter: address,
        ve_balance: u128,
        voted_for: bool,
        dvrf_seed: vector<u8>,
        timestamp: u64,
    }

    #[event]
    struct ProposalExecuted has copy, drop {
        proposal_id: u64,
        votes_for: u128,
        votes_against: u128,
        timestamp: u64,
    }

    /// Initialize veSUPRA registry with Supra integrations
    public fun initialize_ve_registry(
        account: &signer,
        oracle_config: address,
        dvrf_manager: address,
        ctx: &mut TxContext,
    ) {
        let admin = signer::address_of(account);
        
        assert!(
            !object::id_exists<VeSupraNFTRegistry>(admin),
            ERR_ALREADY_INITIALIZED,
        );

        let registry = VeSupraNFTRegistry {
            id: object::new(ctx),
            nfts: table::new(ctx),
            user_nfts: table::new(ctx),
            next_token_id: 1,
            total_ve_supply: 0,
            oracle_config,
            dvrf_manager,
        };

        object::transfer(registry, admin);
    }

    /// Initialize governance DAO with DVRF integration
    public fun initialize_governance_dao(
        account: &signer,
        dvrf_manager: address,
        oracle_config: address,
        ctx: &mut TxContext,
    ) {
        let admin = signer::address_of(account);
        
        assert!(
            !object::id_exists<GovernanceDAO>(admin),
            ERR_ALREADY_INITIALIZED,
        );

        let dao = GovernanceDAO {
            id: object::new(ctx),
            proposals: table::new(ctx),
            active_proposal_ids: vector::empty(),
            votes: table::new(ctx),
            next_proposal_id: 1,
            voting_period_secs: VOTING_PERIOD_SECS,
            execution_delay_secs: EXECUTION_DELAY_SECS,
            timelock_queue: vector::empty(),
            dvrf_manager,
            oracle_config,
            total_proposals: 0,
            executed_proposals: 0,
            total_votes_cast: 0,
        };

        object::transfer(dao, admin);
    }

    /// Mint veSUPRA NFT with Supra Oracle price tracking
    public fun mint_ve_nft(
        account: &signer,
        supra_amount: u64,
        lock_duration_secs: u64,
        lock_position_id: UID,
        registry: &mut VeSupraNFTRegistry,
        clock: &Clock,
        ctx: &mut TxContext,
    ): UID {
        let user_addr = signer::address_of(account);
        let current_time = clock::timestamp_ms(clock) / 1000;

        assert!(
            lock_duration_secs >= MIN_LOCK_DURATION_SECS && 
            lock_duration_secs <= MAX_LOCK_DURATION_SECS,
            ERR_INVALID_LOCK_DURATION,
        );
        assert!(supra_amount > 0, ERR_INVALID_AMOUNT);

        // Get current SUPRA price from oracle
        let supra_price_usd = oracle_integration::get_supra_price_usd(
            registry.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            clock,
        );
        
        // Calculate boost: 1 + (lock_time / max_lock_time) * 1.5, capped at 2.5x
        let boost = calculate_ve_boost(lock_duration_secs);
        let ve_balance = ((supra_amount as u128) * boost) / 10000;

        let nft_id = object::new(ctx);
        let nft_uid = object::uid_to_inner(&nft_id);

        let nft = VeSupraNFT {
            id: nft_id,
            owner: user_addr,
            supra_amount,
            lock_duration_secs,
            mint_time: current_time,
            unlock_time: current_time + lock_duration_secs,
            boost_multiplier: boost,
            is_soulbound: true,
            soulbound_release_time: current_time + (SOULBOUND_LOCK_DAYS * 86_400),
            oracle_price_at_mint: supra_price_usd,
            lock_position_id,
        };

        // Store NFT in registry
        table::add(&mut registry.nfts, nft_uid, nft);
        
        // Track user's NFTs
        if (!table::contains(&registry.user_nfts, user_addr)) {
            table::add(&mut registry.user_nfts, user_addr, vector::empty());
        };
        let user_nft_ids = table::borrow_mut(&mut registry.user_nfts, user_addr);
        vector::push_back(user_nft_ids, nft_uid);

        registry.next_token_id = registry.next_token_id + 1;
        registry.total_ve_supply = registry.total_ve_supply + ve_balance;

        event::emit(VeSupraMinted {
            user: user_addr,
            token_id: nft_uid,
            supra_amount,
            lock_duration_secs,
            boost_multiplier: boost,
            supra_price_usd,
            lock_position_id,
            timestamp: current_time,
        });

        nft_uid
    }

    /// Create governance proposal with DVRF fairness
    public fun create_proposal(
        account: &signer,
        title: String,
        description: String,
        proposal_type: u8,
        parameters: VotingParameters,
        dao: &mut GovernanceDAO,
        registry: &VeSupraNFTRegistry,
        clock: &Clock,
        ctx: &mut TxContext,
    ): u64 {
        let proposer = signer::address_of(account);
        let current_time = clock::timestamp_ms(clock) / 1000;
        
        // Proposer must hold veSUPRA
        assert!(user_has_ve_nft(proposer, registry), ERR_NO_VESUPRA);

        // Get DVRF randomness for fair proposal ordering
        let dvrf_seed = dvrf_integration::get_randomness_seed(
            dao.dvrf_manager,
            ctx,
        );

        let execution_priority = dvrf_integration::generate_random_in_range(
            1,
            1000000,
            b"proposal_priority",
            dao.dvrf_manager,
            ctx,
        );

        let proposal_id = dao.next_proposal_id;
        let voting_end_time = current_time + dao.voting_period_secs;
        let execution_time = voting_end_time + dao.execution_delay_secs;

        let proposal_uid = object::new(ctx);
        let proposal = Proposal {
            id: proposal_uid,
            proposal_id,
            proposer,
            title,
            description,
            proposal_type,
            created_at: current_time,
            voting_end_time,
            execution_time,
            votes_for: 0,
            votes_against: 0,
            is_executed: false,
            parameters,
            dvrf_seed,
            execution_priority,
        };

        table::add(&mut dao.proposals, proposal_id, proposal);
        vector::push_back(&mut dao.active_proposal_ids, proposal_id);
        table::add(&mut dao.votes, proposal_id, vector::empty());
        
        dao.next_proposal_id = proposal_id + 1;
        dao.total_proposals = dao.total_proposals + 1;

        event::emit(ProposalCreated {
            proposal_id,
            proposer,
            title,
            proposal_type,
            dvrf_seed,
            execution_priority,
            timestamp: current_time,
        });

        proposal_id
    }

    /// Cast vote with DVRF verification
    public fun cast_vote(
        account: &signer,
        proposal_id: u64,
        voted_for: bool,
        dao: &mut GovernanceDAO,
        registry: &VeSupraNFTRegistry,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let voter = signer::address_of(account);
        let current_time = clock::timestamp_ms(clock) / 1000;

        assert!(table::contains(&dao.proposals, proposal_id), ERR_PROPOSAL_NOT_FOUND);
        
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        assert!(current_time <= proposal.voting_end_time, ERR_VOTING_CLOSED);

        // Get voter's veSUPRA balance
        let ve_balance = get_user_ve_balance(voter, registry);
        assert!(ve_balance > 0, ERR_INSUFFICIENT_VOTING_POWER);

        // Get DVRF seed for vote verification
        let dvrf_seed = dvrf_integration::get_randomness_seed(
            dao.dvrf_manager,
            ctx,
        );

        // Record vote
        if (voted_for) {
            proposal.votes_for = proposal.votes_for + ve_balance;
        } else {
            proposal.votes_against = proposal.votes_against + ve_balance;
        };

        // Store vote record
        let vote = Vote {
            proposal_id,
            voter,
            ve_balance,
            voted_for,
            voted_at: current_time,
            dvrf_seed_used: dvrf_seed,
        };

        let proposal_votes = table::borrow_mut(&mut dao.votes, proposal_id);
        vector::push_back(proposal_votes, vote);
        dao.total_votes_cast = dao.total_votes_cast + 1;

        event::emit(VoteCasted {
            proposal_id,
            voter,
            ve_balance,
            voted_for,
            dvrf_seed,
            timestamp: current_time,
        });
    }

    /// Execute passed proposal after timelock
    public fun execute_proposal(
        account: &signer,
        proposal_id: u64,
        dao: &mut GovernanceDAO,
        clock: &Clock,
    ) {
        let current_time = clock::timestamp_ms(clock) / 1000;

        assert!(table::contains(&dao.proposals, proposal_id), ERR_PROPOSAL_NOT_FOUND);
        
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        
        // Check execution conditions
        assert!(current_time >= proposal.execution_time, ERR_TIMELOCK_NOT_READY);
        assert!(!proposal.is_executed, ERR_ALREADY_EXECUTED);
        assert!(proposal.votes_for > proposal.votes_against, ERR_PROPOSAL_FAILED);

        proposal.is_executed = true;
        dao.executed_proposals = dao.executed_proposals + 1;

        event::emit(ProposalExecuted {
            proposal_id,
            votes_for: proposal.votes_for,
            votes_against: proposal.votes_against,
            timestamp: current_time,
        });
    }

    /// Calculate veSUPRA boost multiplier (aligned with suplock_core)
    public fun calculate_ve_boost(lock_duration_secs: u64): u128 {
        let duration_ratio = (lock_duration_secs as u128) * 10000 / (MAX_LOCK_DURATION_SECS as u128);
        let boost = 10000 + (duration_ratio * 15000 / 10000); // 1.0 + ratio * 1.5

        if (boost > 25000) {
            25000 // Cap at 2.5x
        } else {
            boost
        }
    }

    /// Helper: Check if user has veSUPRA NFT
    fun user_has_ve_nft(user: address, registry: &VeSupraNFTRegistry): bool {
        table::contains(&registry.user_nfts, user) &&
        !vector::is_empty(table::borrow(&registry.user_nfts, user))
    }

    /// Helper: Get user's total veSUPRA balance
    fun get_user_ve_balance(user: address, registry: &VeSupraNFTRegistry): u128 {
        if (!table::contains(&registry.user_nfts, user)) {
            return 0
        };
        
        let user_nft_ids = table::borrow(&registry.user_nfts, user);
        let balance = 0u128;
        let i = 0;
        let len = vector::length(user_nft_ids);
        
        while (i < len) {
            let nft_id = *vector::borrow(user_nft_ids, i);
            if (table::contains(&registry.nfts, nft_id)) {
                let nft = table::borrow(&registry.nfts, nft_id);
                balance = balance + ((nft.supra_amount as u128) * nft.boost_multiplier) / 10000;
            };
            i = i + 1;
        };
        
        balance
    }

    /// View functions
    public fun get_ve_balance(user: address, registry: &VeSupraNFTRegistry): u128 {
        get_user_ve_balance(user, registry)
    }

    public fun get_ve_total_supply(registry: &VeSupraNFTRegistry): u128 {
        registry.total_ve_supply
    }

    public fun get_proposal_details(
        proposal_id: u64,
        dao: &GovernanceDAO,
    ): (String, u8, u128, u128, bool, u64) {
        assert!(table::contains(&dao.proposals, proposal_id), ERR_PROPOSAL_NOT_FOUND);
        
        let proposal = table::borrow(&dao.proposals, proposal_id);
        (
            proposal.title,
            proposal.proposal_type,
            proposal.votes_for,
            proposal.votes_against,
            proposal.is_executed,
            proposal.execution_time,
        )
    }

    #[test_only]
    public fun test_ve_boost() {
        let boost_max = calculate_ve_boost(126_144_000); // 4 years
        assert!(boost_max == 25000, 0); // 2.5x

        let boost_min = calculate_ve_boost(7_776_000); // 3 months
        assert!(boost_min > 10000 && boost_min < 25000, 0);
    }
}
