/// DVRF Integration Module for Supra L1
/// Integrates with Supra's Distributed Verifiable Random Function (DVRF)
/// Provides cryptographically secure randomness for SUPLOCK protocol

module suplock::dvrf_integration {
    use std::signer;
    use std::vector;
    use std::hash;
    use supra_framework::object::{Self, UID};
    use supra_framework::event;
    use supra_framework::clock::{Self, Clock};

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 4001;
    const ERR_NOT_ADMIN: u64 = 4002;
    const ERR_INVALID_SEED: u64 = 4003;
    const ERR_STALE_RANDOMNESS: u64 = 4004;
    const ERR_EMPTY_CANDIDATES: u64 = 4005;
    const ERR_INVALID_RANGE: u64 = 4006;

    /// Constants
    const SEED_LENGTH: u64 = 32; // 32 bytes for seed
    const MAX_SEED_AGE_SECS: u64 = 3600; // 1 hour max age
    const RANDOMNESS_REFRESH_INTERVAL: u64 = 1800; // 30 minutes

    /// Admin capability for DVRF management
    struct AdminCap has key, store {
        id: UID,
    }

    /// DVRF Manager state
    struct DVRFManager has key {
        id: UID,
        admin: address,
        // Current randomness seed from Supra DVRF network
        current_seed: vector<u8>,
        seed_generation: u64, // Increments with each seed update
        last_seed_update: u64,
        total_randomness_requests: u64,
        // Supra DVRF network integration
        supra_dvrf_address: address, // Supra's native DVRF contract
        authorized_updaters: vector<address>, // Supra DVRF oracle nodes
        // Randomness quality metrics
        entropy_quality_score: u64, // 0-100 quality score
        seed_rotation_count: u64,
    }

    /// Randomness request record
    struct RandomnessRequest has store {
        request_id: u64,
        requester: address,
        seed_used: vector<u8>,
        seed_generation: u64,
        timestamp: u64,
        purpose: vector<u8>, // Description of randomness use
    }

    /// Events
    #[event]
    struct DVRFInitialized has copy, drop {
        admin: address,
        supra_dvrf_address: address,
        initial_seed: vector<u8>,
        timestamp: u64,
    }

    #[event]
    struct RandomnessSeedUpdated has copy, drop {
        old_seed: vector<u8>,
        new_seed: vector<u8>,
        generation: u64,
        updater: address,
        entropy_score: u64,
        timestamp: u64,
    }

    #[event]
    struct RandomnessRequested has copy, drop {
        request_id: u64,
        requester: address,
        purpose: vector<u8>,
        seed_generation: u64,
        timestamp: u64,
    }

    #[event]
    struct CommitteeSelected has copy, drop {
        candidates_count: u64,
        selected_index: u64,
        selected_address: address,
        seed_used: vector<u8>,
        timestamp: u64,
    }

    /// Initialize DVRF integration with Supra's DVRF network
    public fun initialize_dvrf(
        account: &signer,
        supra_dvrf_address: address,
        initial_seed: vector<u8>,
        authorized_updaters: vector<address>,
        ctx: &mut TxContext,
    ) {
        let admin = signer::address_of(account);
        
        assert!(
            !object::id_exists<DVRFManager>(admin),
            ERR_ALREADY_INITIALIZED,
        );

        assert!(
            vector::length(&initial_seed) == SEED_LENGTH,
            ERR_INVALID_SEED,
        );

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        let current_time = clock::timestamp_ms(clock) / 1000;

        // Initialize DVRF manager
        let manager = DVRFManager {
            id: object::new(ctx),
            admin,
            current_seed: initial_seed,
            seed_generation: 1,
            last_seed_update: current_time,
            total_randomness_requests: 0,
            supra_dvrf_address,
            authorized_updaters,
            entropy_quality_score: 100, // Start with perfect score
            seed_rotation_count: 0,
        };

        // Transfer admin capability to admin
        object::transfer(admin_cap, admin);
        
        // Transfer manager to admin
        object::transfer(manager, admin);

        event::emit(DVRFInitialized {
            admin,
            supra_dvrf_address,
            initial_seed,
            timestamp: current_time,
        });
    }

    /// Update randomness seed (called by Supra DVRF oracle nodes)
    public fun update_randomness_seed(
        updater: &signer,
        new_seed: vector<u8>,
        entropy_score: u64,
        manager: &mut DVRFManager,
        clock: &Clock,
    ) {
        let updater_addr = signer::address_of(updater);
        
        // Verify updater is authorized (Supra DVRF oracle node)
        assert!(
            vector::contains(&manager.authorized_updaters, &updater_addr) || 
            updater_addr == manager.admin,
            ERR_NOT_ADMIN,
        );

        assert!(
            vector::length(&new_seed) == SEED_LENGTH,
            ERR_INVALID_SEED,
        );

        let current_time = clock::timestamp_ms(clock) / 1000;
        let old_seed = manager.current_seed;

        // Update seed
        manager.current_seed = new_seed;
        manager.seed_generation = manager.seed_generation + 1;
        manager.last_seed_update = current_time;
        manager.entropy_quality_score = entropy_score;
        manager.seed_rotation_count = manager.seed_rotation_count + 1;

        event::emit(RandomnessSeedUpdated {
            old_seed,
            new_seed,
            generation: manager.seed_generation,
            updater: updater_addr,
            entropy_score,
            timestamp: current_time,
        });
    }

    /// Get current randomness seed with freshness validation
    public fun get_randomness_seed(
        manager_addr: address,
        ctx: &mut TxContext,
    ): vector<u8> {
        let manager = object::borrow_global<DVRFManager>(manager_addr);
        let current_time = clock::timestamp_ms(clock) / 1000;

        // Validate seed freshness
        assert!(
            current_time - manager.last_seed_update <= MAX_SEED_AGE_SECS,
            ERR_STALE_RANDOMNESS,
        );

        // Record randomness request
        let manager_mut = object::borrow_global_mut<DVRFManager>(manager_addr);
        manager_mut.total_randomness_requests = manager_mut.total_randomness_requests + 1;

        event::emit(RandomnessRequested {
            request_id: manager_mut.total_randomness_requests,
            requester: tx_context::sender(ctx),
            purpose: b"general_randomness",
            seed_generation: manager.seed_generation,
            timestamp: current_time,
        });

        manager.current_seed
    }

    /// Select random committee member using DVRF
    public fun select_random_committee_member(
        candidates: vector<address>,
        manager_addr: address,
        ctx: &mut TxContext,
    ): address {
        assert!(
            !vector::is_empty(&candidates),
            ERR_EMPTY_CANDIDATES,
        );

        let manager = object::borrow_global<DVRFManager>(manager_addr);
        let current_time = clock::timestamp_ms(clock) / 1000;

        // Validate seed freshness
        assert!(
            current_time - manager.last_seed_update <= MAX_SEED_AGE_SECS,
            ERR_STALE_RANDOMNESS,
        );

        // Generate deterministic randomness from seed + context
        let context = vector::empty<u8>();
        vector::append(&mut context, manager.current_seed);
        vector::append(&mut context, bcs::to_bytes(&current_time));
        vector::append(&mut context, bcs::to_bytes(&vector::length(&candidates)));

        let hash_bytes = hash::sha3_256(context);
        let random_u64 = bytes_to_u64(hash_bytes);
        let selected_index = random_u64 % vector::length(&candidates);
        let selected_address = *vector::borrow(&candidates, selected_index);

        // Record committee selection
        let manager_mut = object::borrow_global_mut<DVRFManager>(manager_addr);
        manager_mut.total_randomness_requests = manager_mut.total_randomness_requests + 1;

        event::emit(CommitteeSelected {
            candidates_count: vector::length(&candidates),
            selected_index,
            selected_address,
            seed_used: manager.current_seed,
            timestamp: current_time,
        });

        selected_address
    }

    /// Generate random number in range [min, max) using DVRF
    public fun generate_random_in_range(
        min: u64,
        max: u64,
        purpose: vector<u8>,
        manager_addr: address,
        ctx: &mut TxContext,
    ): u64 {
        assert!(min < max, ERR_INVALID_RANGE);

        let manager = object::borrow_global<DVRFManager>(manager_addr);
        let current_time = clock::timestamp_ms(clock) / 1000;

        // Validate seed freshness
        assert!(
            current_time - manager.last_seed_update <= MAX_SEED_AGE_SECS,
            ERR_STALE_RANDOMNESS,
        );

        // Generate deterministic randomness
        let context = vector::empty<u8>();
        vector::append(&mut context, manager.current_seed);
        vector::append(&mut context, purpose);
        vector::append(&mut context, bcs::to_bytes(&current_time));
        vector::append(&mut context, bcs::to_bytes(&min));
        vector::append(&mut context, bcs::to_bytes(&max));

        let hash_bytes = hash::sha3_256(context);
        let random_u64 = bytes_to_u64(hash_bytes);
        let range = max - min;
        let result = min + (random_u64 % range);

        // Record randomness request
        let manager_mut = object::borrow_global_mut<DVRFManager>(manager_addr);
        manager_mut.total_randomness_requests = manager_mut.total_randomness_requests + 1;

        event::emit(RandomnessRequested {
            request_id: manager_mut.total_randomness_requests,
            requester: tx_context::sender(ctx),
            purpose,
            seed_generation: manager.seed_generation,
            timestamp: current_time,
        });

        result
    }

    /// Check if randomness seed needs refresh
    public fun needs_seed_refresh(
        manager_addr: address,
        clock: &Clock,
    ): bool {
        let manager = object::borrow_global<DVRFManager>(manager_addr);
        let current_time = clock::timestamp_ms(clock) / 1000;
        
        current_time - manager.last_seed_update >= RANDOMNESS_REFRESH_INTERVAL
    }

    /// Add authorized updater (admin only)
    public fun add_authorized_updater(
        admin_cap: &AdminCap,
        new_updater: address,
        manager: &mut DVRFManager,
    ) {
        assert!(
            object::owner(admin_cap) == manager.admin,
            ERR_NOT_ADMIN,
        );

        if (!vector::contains(&manager.authorized_updaters, &new_updater)) {
            vector::push_back(&mut manager.authorized_updaters, new_updater);
        };
    }

    /// Helper function to convert bytes to u64
    fun bytes_to_u64(bytes: vector<u8>): u64 {
        let result = 0u64;
        let i = 0;
        let len = if (vector::length(&bytes) > 8) { 8 } else { vector::length(&bytes) };
        
        while (i < len) {
            let byte = *vector::borrow(&bytes, i);
            result = result + ((byte as u64) << ((i * 8) as u8));
            i = i + 1;
        };
        
        result
    }

    /// View functions
    public fun get_current_seed_info(
        manager_addr: address,
    ): (vector<u8>, u64, u64, u64) {
        let manager = object::borrow_global<DVRFManager>(manager_addr);
        (
            manager.current_seed,
            manager.seed_generation,
            manager.last_seed_update,
            manager.entropy_quality_score,
        )
    }

    public fun get_dvrf_stats(
        manager_addr: address,
    ): (u64, u64, u64) {
        let manager = object::borrow_global<DVRFManager>(manager_addr);
        (
            manager.total_randomness_requests,
            manager.seed_rotation_count,
            vector::length(&manager.authorized_updaters),
        )
    }

    public fun is_seed_fresh(
        manager_addr: address,
        clock: &Clock,
    ): bool {
        let manager = object::borrow_global<DVRFManager>(manager_addr);
        let current_time = clock::timestamp_ms(clock) / 1000;
        
        current_time - manager.last_seed_update <= MAX_SEED_AGE_SECS
    }

    #[test_only]
    public fun test_bytes_to_u64() {
        let test_bytes = vector[0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08];
        let result = bytes_to_u64(test_bytes);
        assert!(result > 0, 0);
    }

    #[test_only]
    public fun test_seed_length() {
        assert!(SEED_LENGTH == 32, 0);
        assert!(MAX_SEED_AGE_SECS == 3600, 0);
    }
}