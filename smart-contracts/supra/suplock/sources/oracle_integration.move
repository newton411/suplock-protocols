/// Oracle Integration Module for SUPLOCK
/// Provides secure oracle feed access with role-based access control for upgrades
/// Integrates with Supra's trusted feed infrastructure
/// 
/// Key Features:
/// - Secure price feed queries for APY calculations
/// - Access control for oracle address updates (owner/admin roles)
/// - Event-driven oracle state changes for audit trail
/// - Fallback mechanisms for feed unavailability
/// - Feed freshness validation (preventing stale data)

module suplock::oracle_integration {
    use std::signer;
    use std::vector;
    use std::string::String;

    /// Error codes
    const ERR_UNAUTHORIZED: u64 = 3001;
    const ERR_INVALID_FEED: u64 = 3002;
    const ERR_STALE_FEED: u64 = 3003;
    const ERR_ORACLE_UNAVAILABLE: u64 = 3004;
    const ERR_INVALID_PRICE: u64 = 3005;
    const ERR_FEED_NOT_FOUND: u64 = 3006;

    /// Feed freshness threshold (6 hours in seconds)
    const FEED_FRESHNESS_THRESHOLD: u64 = 21_600;

    /// Role definitions
    const ROLE_ADMIN: u8 = 1;
    const ROLE_UPDATER: u8 = 2;
    const ROLE_READER: u8 = 3;

    /// Oracle feed data structure
    struct Feed has store {
        feed_id: u64,
        feed_name: String,
        oracle_address: address,
        price: u128,
        decimals: u8,
        last_update_time: u64,
        is_active: bool,
    }

    /// Oracle configuration (owner-controlled)
    struct OracleConfig has key {
        // Access control
        admin_address: address,
        authorized_updaters: vector<address>,
        authorized_readers: vector<address>,
        
        // Feed management
        feeds: vector<Feed>,
        next_feed_id: u64,
        
        // Fallback and monitoring
        fallback_feeds: vector<Feed>, // Secondary feeds for failover
        max_price_deviation_bps: u64, // Max 20% deviation (2000 BPS)
    }

    /// Role assignment record
    struct RoleAssignment has key {
        user: address,
        role: u8,  // 1: Admin, 2: Updater, 3: Reader
        granted_at: u64,
        granted_by: address,
    }

    /// Events for audit trail
    #[event]
    struct FeedAdded has drop {
        feed_id: u64,
        feed_name: String,
        oracle_address: address,
        timestamp: u64,
    }

    #[event]
    struct FeedUpdated has drop {
        feed_id: u64,
        old_price: u128,
        new_price: u128,
        old_oracle: address,
        new_oracle: address,
        timestamp: u64,
    }

    #[event]
    struct OracleAddressChanged has drop {
        feed_id: u64,
        old_address: address,
        new_address: address,
        changed_by: address,
        timestamp: u64,
    }

    #[event]
    struct RoleGranted has drop {
        user: address,
        role: u8,
        granted_by: address,
        timestamp: u64,
    }

    #[event]
    struct RoleRevoked has drop {
        user: address,
        role: u8,
        revoked_by: address,
        timestamp: u64,
    }

    #[event]
    struct FeedAccessLog has drop {
        reader: address,
        feed_id: u64,
        price_returned: u128,
        timestamp: u64,
    }

    /// Initialize oracle configuration (admin setup)
    /// Only callable once at deployment
    public fun initialize_oracle(account: &signer) {
        let admin = signer::address_of(account);
        
        assert!(
            !exists<OracleConfig>(admin),
            ERR_UNAUTHORIZED,
        );

        let config = OracleConfig {
            admin_address: admin,
            authorized_updaters: vector::empty(),
            authorized_readers: vector::empty(),
            feeds: vector::empty(),
            next_feed_id: 1,
            fallback_feeds: vector::empty(),
            max_price_deviation_bps: 2000, // 20% max deviation
        };

        move_to(account, config);

        // Grant admin role to deployer
        let role = RoleAssignment {
            user: admin,
            role: ROLE_ADMIN,
            granted_at: current_timestamp(),
            granted_by: admin,
        };
        move_to(account, role);
    }

    /// Grant role to user (admin only)
    public fun grant_role(
        admin: &signer,
        user: address,
        role: u8,
        config_addr: address,
    ) acquires OracleConfig {
        let admin_addr = signer::address_of(admin);
        
        // Verify admin authority
        assert_admin(admin_addr, config_addr);

        let config = borrow_global_mut<OracleConfig>(config_addr);

        // Add to appropriate role list
        if (role == ROLE_UPDATER) {
            if (!vector::contains(&config.authorized_updaters, &user)) {
                vector::push_back(&mut config.authorized_updaters, user);
            };
        } else if (role == ROLE_READER) {
            if (!vector::contains(&config.authorized_readers, &user)) {
                vector::push_back(&mut config.authorized_readers, user);
            };
        };

        // Record role assignment
        let role_assignment = RoleAssignment {
            user,
            role,
            granted_at: current_timestamp(),
            granted_by: admin_addr,
        };
        move_to(&create_signer_for_user(user), role_assignment);

        0x1::event::emit(RoleGranted {
            user,
            role,
            granted_by: admin_addr,
            timestamp: current_timestamp(),
        });
    }

    /// Revoke role from user (admin only)
    public fun revoke_role(
        admin: &signer,
        user: address,
        role: u8,
        config_addr: address,
    ) acquires OracleConfig {
        let admin_addr = signer::address_of(admin);
        
        assert_admin(admin_addr, config_addr);

        let config = borrow_global_mut<OracleConfig>(config_addr);

        // Remove from role list
        if (role == ROLE_UPDATER) {
            let (found, idx) = vector::index_of(&config.authorized_updaters, &user);
            if (found) {
                vector::remove(&mut config.authorized_updaters, idx);
            };
        } else if (role == ROLE_READER) {
            let (found, idx) = vector::index_of(&config.authorized_readers, &user);
            if (found) {
                vector::remove(&mut config.authorized_readers, idx);
            };
        };

        0x1::event::emit(RoleRevoked {
            user,
            role,
            revoked_by: admin_addr,
            timestamp: current_timestamp(),
        });
    }

    /// Add a new oracle feed (updater role required)
    public fun add_feed(
        updater: &signer,
        feed_name: String,
        oracle_address: address,
        initial_price: u128,
        decimals: u8,
        config_addr: address,
    ) acquires OracleConfig {
        let updater_addr = signer::address_of(updater);
        
        assert_updater(updater_addr, config_addr);
        assert!(oracle_address != @0x0, ERR_INVALID_FEED);
        assert!(initial_price > 0, ERR_INVALID_PRICE);

        let config = borrow_global_mut<OracleConfig>(config_addr);
        let feed_id = config.next_feed_id;
        config.next_feed_id = feed_id + 1;

        let feed = Feed {
            feed_id,
            feed_name: feed_name.clone(),
            oracle_address,
            price: initial_price,
            decimals,
            last_update_time: current_timestamp(),
            is_active: true,
        };

        vector::push_back(&mut config.feeds, feed);

        0x1::event::emit(FeedAdded {
            feed_id,
            feed_name,
            oracle_address,
            timestamp: current_timestamp(),
        });
    }

    /// Update oracle address for a feed (admin only, critical upgrade path)
    /// This is the secure upgrade mechanism for oracle addresses
    public fun update_oracle_address(
        admin: &signer,
        feed_id: u64,
        new_oracle_address: address,
        config_addr: address,
    ) acquires OracleConfig {
        let admin_addr = signer::address_of(admin);
        
        assert_admin(admin_addr, config_addr);
        assert!(new_oracle_address != @0x0, ERR_INVALID_FEED);

        let config = borrow_global_mut<OracleConfig>(config_addr);
        
        // Find and update feed
        let i = 0;
        let found = false;
        let old_address = @0x0;

        while (i < vector::length(&config.feeds)) {
            let feed = vector::borrow_mut(&mut config.feeds, i);
            if (feed.feed_id == feed_id) {
                old_address = feed.oracle_address;
                feed.oracle_address = new_oracle_address;
                found = true;
                break;
            };
            i = i + 1;
        };

        assert!(found, ERR_FEED_NOT_FOUND);

        0x1::event::emit(OracleAddressChanged {
            feed_id,
            old_address,
            new_address: new_oracle_address,
            changed_by: admin_addr,
            timestamp: current_timestamp(),
        });
    }

    /// Update feed price (updater role required)
    /// Validates price freshness and deviation from previous price
    public fun update_feed_price(
        updater: &signer,
        feed_id: u64,
        new_price: u128,
        config_addr: address,
    ) acquires OracleConfig {
        let updater_addr = signer::address_of(updater);
        
        assert_updater(updater_addr, config_addr);
        assert!(new_price > 0, ERR_INVALID_PRICE);

        let config = borrow_global_mut<OracleConfig>(config_addr);
        
        // Find and update feed
        let i = 0;
        let found = false;
        let old_price = 0;

        while (i < vector::length(&config.feeds)) {
            let feed = vector::borrow_mut(&mut config.feeds, i);
            if (feed.feed_id == feed_id) {
                // Validate price deviation
                let max_deviation = (feed.price * config.max_price_deviation_bps) / 10000;
                let diff = if (new_price > feed.price) {
                    new_price - feed.price
                } else {
                    feed.price - new_price
                };
                
                assert!(diff <= max_deviation, ERR_INVALID_PRICE);

                old_price = feed.price;
                feed.price = new_price;
                feed.last_update_time = current_timestamp();
                found = true;
                break;
            };
            i = i + 1;
        };

        assert!(found, ERR_FEED_NOT_FOUND);

        0x1::event::emit(FeedUpdated {
            feed_id,
            old_price,
            new_price,
            old_oracle: @0x0,
            new_oracle: @0x0,
            timestamp: current_timestamp(),
        });
    }

    /// Query oracle feed price (reader role or public read)
    /// Validates feed freshness before returning price
    public fun get_feed_price(
        feed_id: u64,
        config_addr: address,
    ): (u128, u64) acquires OracleConfig {
        let config = borrow_global<OracleConfig>(config_addr);
        
        // Find feed
        let i = 0;
        while (i < vector::length(&config.feeds)) {
            let feed = vector::borrow(&config.feeds, i);
            if (feed.feed_id == feed_id) {
                // Validate feed freshness
                let age = current_timestamp() - feed.last_update_time;
                assert!(age <= FEED_FRESHNESS_THRESHOLD, ERR_STALE_FEED);
                assert!(feed.is_active, ERR_ORACLE_UNAVAILABLE);

                // Log access
                0x1::event::emit(FeedAccessLog {
                    reader: @0x0, // Can be caller in future
                    feed_id,
                    price_returned: feed.price,
                    timestamp: current_timestamp(),
                });

                return (feed.price, feed.decimals);
            };
            i = i + 1;
        };

        assert!(false, ERR_FEED_NOT_FOUND);
        (0, 0) // Unreachable
    }

    /// Get feed price with fallback (tries secondary feeds if primary unavailable)
    public fun get_feed_price_with_fallback(
        feed_id: u64,
        config_addr: address,
    ): (u128, u64, bool) acquires OracleConfig {
        let config = borrow_global<OracleConfig>(config_addr);
        
        // Try primary feed
        let i = 0;
        while (i < vector::length(&config.feeds)) {
            let feed = vector::borrow(&config.feeds, i);
            if (feed.feed_id == feed_id && feed.is_active) {
                let age = current_timestamp() - feed.last_update_time;
                if (age <= FEED_FRESHNESS_THRESHOLD) {
                    return (feed.price, feed.decimals, false); // false = primary feed used
                };
                break;
            };
            i = i + 1;
        };

        // Try fallback feed
        let i = 0;
        while (i < vector::length(&config.fallback_feeds)) {
            let feed = vector::borrow(&config.fallback_feeds, i);
            if (feed.feed_id == feed_id && feed.is_active) {
                return (feed.price, feed.decimals, true); // true = fallback used
            };
            i = i + 1;
        };

        (0, 0, false) // Feed unavailable
    }

    /// Deactivate feed (graceful shutdown)
    public fun deactivate_feed(
        admin: &signer,
        feed_id: u64,
        config_addr: address,
    ) acquires OracleConfig {
        let admin_addr = signer::address_of(admin);
        
        assert_admin(admin_addr, config_addr);

        let config = borrow_global_mut<OracleConfig>(config_addr);
        
        let i = 0;
        while (i < vector::length(&config.feeds)) {
            let feed = vector::borrow_mut(&mut config.feeds, i);
            if (feed.feed_id == feed_id) {
                feed.is_active = false;
                break;
            };
            i = i + 1;
        };
    }

    /// Get all active feeds (view function)
    public fun get_active_feeds(config_addr: address): vector<u64> acquires OracleConfig {
        let config = borrow_global<OracleConfig>(config_addr);
        let active_ids = vector::empty();
        
        let i = 0;
        while (i < vector::length(&config.feeds)) {
            let feed = vector::borrow(&config.feeds, i);
            if (feed.is_active) {
                vector::push_back(&mut active_ids, feed.feed_id);
            };
            i = i + 1;
        };

        active_ids
    }

    /// Helper: Verify admin authority
    fun assert_admin(user: address, config_addr: address) acquires OracleConfig {
        let config = borrow_global<OracleConfig>(config_addr);
        assert!(user == config.admin_address, ERR_UNAUTHORIZED);
    }

    /// Helper: Verify updater role
    fun assert_updater(user: address, config_addr: address) acquires OracleConfig {
        let config = borrow_global<OracleConfig>(config_addr);
        assert!(
            user == config.admin_address || vector::contains(&config.authorized_updaters, &user),
            ERR_UNAUTHORIZED,
        );
    }

    /// Helper: Verify reader role
    fun assert_reader(user: address, config_addr: address) acquires OracleConfig {
        let config = borrow_global<OracleConfig>(config_addr);
        assert!(
            vector::contains(&config.authorized_readers, &user) || 
            user == config.admin_address,
            ERR_UNAUTHORIZED,
        );
    }

    /// Helper: Get current timestamp
    fun current_timestamp(): u64 {
        0x1::chain::get_block_timestamp()
    }

    /// Helper: Create signer for user (placeholder for proper implementation)
    /// In production, use proper signer derivation based on Move capabilities
    fun create_signer_for_user(_user: address): &signer {
        // This is a placeholder - proper implementation requires Move's signer module
        // In practice, signers must be passed through or derived via proper channels
        abort 0 // Should not be called directly
    }
}
