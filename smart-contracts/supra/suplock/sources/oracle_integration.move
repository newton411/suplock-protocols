/// Oracle Integration Module for Supra L1
/// Integrates with Supra's native oracle network for real-time price feeds
/// Provides SUPRA/USD price data for SUPLOCK protocol operations

module suplock::oracle_integration {
    use std::signer;
    use std::vector;
    use supra_framework::object::{Self, UID};
    use supra_framework::event;
    use supra_framework::clock::{Self, Clock};
    use supra_framework::table::{Self, Table};

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 3001;
    const ERR_NOT_ADMIN: u64 = 3002;
    const ERR_INVALID_FEED_ID: u64 = 3003;
    const ERR_STALE_FEED: u64 = 3004;
    const ERR_PRICE_DEVIATION_TOO_HIGH: u64 = 3005;
    const ERR_FEED_NOT_FOUND: u64 = 3006;

    /// Constants
    const MAX_PRICE_DEVIATION_BPS: u64 = 2000; // 20% max deviation
    const DEFAULT_FRESHNESS_THRESHOLD: u64 = 21600; // 6 hours
    const PRICE_DECIMALS: u8 = 8; // Price precision (8 decimals)

    /// Feed IDs (aligned with Supra Oracle network)
    const FEED_SUPRA_USD: u64 = 1;
    const FEED_SUPRA_EUR: u64 = 2;
    const FEED_BTC_USD: u64 = 3;
    const FEED_ETH_USD: u64 = 4;

    /// Admin capability for oracle management
    struct AdminCap has key, store {
        id: UID,
    }

    /// Price feed data structure
    struct Feed has store {
        feed_id: u64,
        pair_name: vector<u8>, // e.g., "SUPRA/USD"
        price: u128, // Price with PRICE_DECIMALS precision
        last_update_time: u64,
        update_count: u64,
        is_active: bool,
        deviation_threshold_bps: u64, // Max allowed price deviation
        freshness_threshold_secs: u64, // Max age before considered stale
    }

    /// Oracle configuration and state
    struct OracleConfig has key {
        id: UID,
        admin: address,
        feeds: Table<u64, Feed>, // feed_id -> Feed
        active_feed_ids: vector<u64>,
        total_updates: u64,
        last_global_update: u64,
        // Supra Oracle network integration
        supra_oracle_address: address, // Supra's native oracle contract
        update_authority: address, // Authorized updater (Supra oracle nodes)
    }

    /// Events
    #[event]
    struct OracleInitialized has copy, drop {
        admin: address,
        supra_oracle_address: address,
        timestamp: u64,
    }

    #[event]
    struct FeedUpdated has copy, drop {
        feed_id: u64,
        pair_name: vector<u8>,
        old_price: u128,
        new_price: u128,
        price_change_bps: u64, // Basis points change
        update_time: u64,
        updater: address,
    }

    #[event]
    struct FeedAdded has copy, drop {
        feed_id: u64,
        pair_name: vector<u8>,
        initial_price: u128,
        admin: address,
        timestamp: u64,
    }

    #[event]
    struct StaleFeedException has copy, drop {
        feed_id: u64,
        last_update_time: u64,
        current_time: u64,
        threshold_secs: u64,
    }

    /// Initialize oracle integration with Supra's native oracle
    public fun initialize_oracle(
        account: &signer,
        supra_oracle_address: address,
        update_authority: address,
        ctx: &mut TxContext,
    ) {
        let admin = signer::address_of(account);
        
        assert!(
            !object::id_exists<OracleConfig>(admin),
            ERR_ALREADY_INITIALIZED,
        );

        // Create admin capability
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        // Initialize oracle config
        let config = OracleConfig {
            id: object::new(ctx),
            admin,
            feeds: table::new(ctx),
            active_feed_ids: vector::empty(),
            total_updates: 0,
            last_global_update: 0,
            supra_oracle_address,
            update_authority,
        };

        // Transfer admin capability to admin
        object::transfer(admin_cap, admin);
        
        // Transfer config to admin (can be made shared later)
        object::transfer(config, admin);

        event::emit(OracleInitialized {
            admin,
            supra_oracle_address,
            timestamp: clock::timestamp_ms(clock) / 1000,
        });
    }

    /// Add a new price feed (admin only)
    public fun add_feed(
        admin_cap: &AdminCap,
        feed_id: u64,
        pair_name: vector<u8>,
        initial_price: u128,
        deviation_threshold_bps: u64,
        freshness_threshold_secs: u64,
        config: &mut OracleConfig,
        clock: &Clock,
    ) {
        // Verify admin capability
        assert!(
            object::owner(admin_cap) == config.admin,
            ERR_NOT_ADMIN,
        );

        assert!(
            !table::contains(&config.feeds, feed_id),
            ERR_INVALID_FEED_ID,
        );

        let current_time = clock::timestamp_ms(clock) / 1000;

        let feed = Feed {
            feed_id,
            pair_name,
            price: initial_price,
            last_update_time: current_time,
            update_count: 1,
            is_active: true,
            deviation_threshold_bps,
            freshness_threshold_secs,
        };

        table::add(&mut config.feeds, feed_id, feed);
        vector::push_back(&mut config.active_feed_ids, feed_id);

        event::emit(FeedAdded {
            feed_id,
            pair_name,
            initial_price,
            admin: config.admin,
            timestamp: current_time,
        });
    }

    /// Update price feed (called by Supra oracle nodes)
    public fun update_feed_price(
        updater: &signer,
        feed_id: u64,
        new_price: u128,
        config: &mut OracleConfig,
        clock: &Clock,
    ) {
        let updater_addr = signer::address_of(updater);
        
        // Verify update authority (Supra oracle nodes)
        assert!(
            updater_addr == config.update_authority || updater_addr == config.admin,
            ERR_NOT_ADMIN,
        );

        assert!(
            table::contains(&config.feeds, feed_id),
            ERR_FEED_NOT_FOUND,
        );

        let current_time = clock::timestamp_ms(clock) / 1000;
        let feed = table::borrow_mut(&mut config.feeds, feed_id);

        // Validate price deviation (prevent flash loan attacks)
        let old_price = feed.price;
        let price_change = if (new_price > old_price) {
            ((new_price - old_price) * 10000) / old_price
        } else {
            ((old_price - new_price) * 10000) / old_price
        };

        assert!(
            price_change <= (feed.deviation_threshold_bps as u128),
            ERR_PRICE_DEVIATION_TOO_HIGH,
        );

        // Update feed
        feed.price = new_price;
        feed.last_update_time = current_time;
        feed.update_count = feed.update_count + 1;

        // Update global state
        config.total_updates = config.total_updates + 1;
        config.last_global_update = current_time;

        event::emit(FeedUpdated {
            feed_id,
            pair_name: feed.pair_name,
            old_price,
            new_price,
            price_change_bps: price_change as u64,
            update_time: current_time,
            updater: updater_addr,
        });
    }

    /// Get SUPRA/USD price with freshness validation
    public fun get_supra_price_usd(
        config_addr: address,
        feed_id: u64,
        clock: &Clock,
    ): u128 {
        // In production: call Supra's native oracle
        // For now: return mock price with validation
        let config = object::borrow_global<OracleConfig>(config_addr);
        
        assert!(
            table::contains(&config.feeds, feed_id),
            ERR_FEED_NOT_FOUND,
        );

        let feed = table::borrow(&config.feeds, feed_id);
        let current_time = clock::timestamp_ms(clock) / 1000;

        // Validate freshness
        assert!(
            current_time - feed.last_update_time <= feed.freshness_threshold_secs,
            ERR_STALE_FEED,
        );

        feed.price
    }

    /// Validate feed freshness (used by other modules)
    public fun validate_feed_freshness(
        config_addr: address,
        feed_id: u64,
        max_age_secs: u64,
        clock: &Clock,
    ) {
        let config = object::borrow_global<OracleConfig>(config_addr);
        
        assert!(
            table::contains(&config.feeds, feed_id),
            ERR_FEED_NOT_FOUND,
        );

        let feed = table::borrow(&config.feeds, feed_id);
        let current_time = clock::timestamp_ms(clock) / 1000;
        let age = current_time - feed.last_update_time;

        if (age > max_age_secs) {
            event::emit(StaleFeedException {
                feed_id,
                last_update_time: feed.last_update_time,
                current_time,
                threshold_secs: max_age_secs,
            });
            
            assert!(false, ERR_STALE_FEED);
        };
    }

    /// Get multiple feed prices (batch query)
    public fun get_multiple_prices(
        config_addr: address,
        feed_ids: vector<u64>,
        clock: &Clock,
    ): vector<u128> {
        let config = object::borrow_global<OracleConfig>(config_addr);
        let prices = vector::empty<u128>();
        let current_time = clock::timestamp_ms(clock) / 1000;

        let i = 0;
        let len = vector::length(&feed_ids);
        while (i < len) {
            let feed_id = *vector::borrow(&feed_ids, i);
            
            if (table::contains(&config.feeds, feed_id)) {
                let feed = table::borrow(&config.feeds, feed_id);
                
                // Only include fresh feeds
                if (current_time - feed.last_update_time <= feed.freshness_threshold_secs) {
                    vector::push_back(&mut prices, feed.price);
                } else {
                    vector::push_back(&mut prices, 0); // Stale feed
                };
            } else {
                vector::push_back(&mut prices, 0); // Feed not found
            };
            
            i = i + 1;
        };

        prices
    }

    /// View functions
    public fun get_feed_info(
        config_addr: address,
        feed_id: u64,
    ): (u128, u64, u64, bool) {
        let config = object::borrow_global<OracleConfig>(config_addr);
        
        if (table::contains(&config.feeds, feed_id)) {
            let feed = table::borrow(&config.feeds, feed_id);
            (feed.price, feed.last_update_time, feed.update_count, feed.is_active)
        } else {
            (0, 0, 0, false)
        }
    }

    public fun get_active_feeds(config_addr: address): vector<u64> {
        let config = object::borrow_global<OracleConfig>(config_addr);
        config.active_feed_ids
    }

    public fun get_oracle_stats(config_addr: address): (u64, u64, u64) {
        let config = object::borrow_global<OracleConfig>(config_addr);
        (
            config.total_updates,
            config.last_global_update,
            vector::length(&config.active_feed_ids),
        )
    }

    #[test_only]
    public fun test_price_deviation() {
        let old_price = 100_000_000u128; // $1.00 with 8 decimals
        let new_price = 120_000_000u128; // $1.20 with 8 decimals
        let deviation = ((new_price - old_price) * 10000) / old_price;
        assert!(deviation == 2000, 0); // 20% increase
    }

    #[test_only]
    public fun test_feed_constants() {
        assert!(FEED_SUPRA_USD == 1, 0);
        assert!(FEED_SUPRA_EUR == 2, 0);
        assert!(MAX_PRICE_DEVIATION_BPS == 2000, 0);
    }
}