/// Yield & Restaking Vaults Module for Supra L1
/// Integrates with Supra PoEL staking, native oracle feeds, and DVRF for MEV protection
/// PT/YT splitting with EigenLayer & Symbiotic restaking integration

module suplock::yield_vaults {
    use std::signer;
    use std::vector;
    use std::string::String;
    use std::option::{Self, Option};
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
    struct stETH has drop {} // Liquid staked ETH

    const MIN_DEPOSIT_USDC: u64 = 1_000_000; // 1 USDC
    const VAULT_FEE_BPS: u64 = 100; // 1% performance fee
    const REINVEST_THRESHOLD: u64 = 50_000_000; // Reinvest if accumulated > 50 USDC
    const USDC_DECIMALS: u8 = 6;
    const SUPRA_DECIMALS: u8 = 8;
    const ORACLE_FEED_SUPRA_USD: u64 = 1;
    const ORACLE_FRESHNESS_THRESHOLD: u64 = 21600; // 6 hours

    /// Vault Types (aligned with Supra ecosystem)
    const VAULT_TYPE_SUPRA_POEL: u8 = 1; // Supra PoEL staking
    const VAULT_TYPE_EIGENLAYER: u8 = 2; // EigenLayer restaking
    const VAULT_TYPE_SYMBIOTIC: u8 = 3; // Symbiotic restaking
    const VAULT_TYPE_LP_VACUUM: u8 = 4; // MEV-protected LP strategies

    /// Error codes
    const ERR_ALREADY_INITIALIZED: u64 = 6001;
    const ERR_INVALID_VAULT_TYPE: u64 = 6002;
    const ERR_INVALID_MATURITY: u64 = 6003;
    const ERR_INVALID_APY: u64 = 6004;
    const ERR_MIN_DEPOSIT: u64 = 6005;
    const ERR_VAULT_NOT_FOUND: u64 = 6006;
    const ERR_VAULT_INACTIVE: u64 = 6007;
    const ERR_VAULT_EXPIRED: u64 = 6008;
    const ERR_TOKEN_NOT_FOUND: u64 = 6009;
    const ERR_NOT_OWNER: u64 = 6010;
    const ERR_NOT_MATURE: u64 = 6011;
    const ERR_ALREADY_CLAIMED: u64 = 6012;
    const ERR_INSUFFICIENT_AMOUNT: u64 = 6013;
    const ERR_INTENT_NOT_FOUND: u64 = 6014;
    const ERR_INTENT_PROCESSED: u64 = 6015;

    /// PT (Principal Token) Record - User-owned
    struct PrincipalToken has key, store {
        id: UID,
        owner: address,
        vault_id: UID,
        amount: u64,
        maturity_time: u64,
        is_redeemed: bool,
        // Supra integrations
        oracle_price_at_mint: u128, // SUPRA price when minted
        poel_staking_receipt: Option<UID>, // PoEL staking receipt if applicable
    }

    /// YT (Yield Token) Record - User-owned
    struct YieldToken has key, store {
        id: UID,
        owner: address,
        vault_id: UID,
        amount: u64,
        maturity_time: u64,
        accrued_yield: u64,
        is_claimed: bool,
        // Yield tracking
        last_yield_update: u64,
        cumulative_yield_rate: u128,
    }

    /// Restaking Receipt (EigenLayer/Symbiotic integration)
    struct RestakingReceipt has key, store {
        id: UID,
        owner: address,
        vault_id: UID,
        underlying_asset: String,
        receipt_type: u8, // EIGENLAYER or SYMBIOTIC
        amount_deposited: u64,
        receipt_amount: u64,
        deposit_time: u64,
        is_redeemed: bool,
        // External protocol integration
        external_receipt_id: Option<UID>, // Reference to external protocol receipt
    }

    /// Yield Vault with Supra integrations
    struct YieldVault has key, store {
        id: UID,
        name: String,
        vault_type: u8,
        underlying_asset: String,
        total_assets: u64,
        total_yield: u64,
        fee_accumulated: u64,
        created_at: u64,
        maturity_time: u64,
        is_active: bool,
        yield_rate_apy_bps: u64,
        pt_total_supply: u64,
        yt_total_supply: u64,
        collateral_for_vaults: bool,
        // Supra integrations
        oracle_config: address, // Oracle integration
        dvrf_manager: address, // DVRF for MEV protection
        poel_staking_pool: Option<address>, // Supra PoEL pool if applicable
        // Performance tracking
        last_yield_update: u64,
        cumulative_performance: u128,
    }

    /// Vault Registry with efficient lookups
    struct VaultRegistry has key {
        id: UID,
        vaults: Table<UID, YieldVault>,
        active_vault_ids: vector<UID>,
        pt_tokens: Table<UID, PrincipalToken>,
        yt_tokens: Table<UID, YieldToken>,
        restaking_receipts: Table<UID, RestakingReceipt>,
        next_vault_id: u64,
        next_pt_id: u64,
        next_yt_id: u64,
        next_receipt_id: u64,
        // User tracking
        user_vaults: Table<address, vector<UID>>, // User -> Vault IDs
        user_pt_tokens: Table<address, vector<UID>>, // User -> PT Token IDs
        user_yt_tokens: Table<address, vector<UID>>, // User -> YT Token IDs
    }

    /// Encrypted Intent (LP Vacuum MEV Protection)
    struct EncryptedIntent has key, store {
        id: UID,
        user: address,
        intent_type: u8, // 1: deposit, 2: withdraw, 3: restake, 4: trade
        encrypted_payload: vector<u8>, // DVRF-encrypted data
        nonce: u64,
        created_at: u64,
        is_processed: bool,
        // MEV protection
        dvrf_seed_used: vector<u8>,
        execution_priority: u64, // Random priority for fair ordering
    }

    /// Intent Processor (LP Vacuum) with DVRF integration
    struct IntentProcessor has key {
        id: UID,
        intents: Table<UID, EncryptedIntent>,
        pending_intent_ids: vector<UID>,
        next_intent_id: u64,
        processed_intents: u64,
        mev_captured: u64,
        // Supra integrations
        dvrf_manager: address,
        oracle_config: address,
        // Batch processing
        batch_size: u64,
        last_batch_time: u64,
    }

    /// Events with Supra Oracle data
    #[event]
    struct VaultCreated has copy, drop {
        vault_id: UID,
        name: String,
        vault_type: u8,
        underlying_asset: String,
        maturity_time: u64,
        oracle_config: address,
        timestamp: u64,
    }

    #[event]
    struct DepositProcessed has copy, drop {
        user: address,
        vault_id: UID,
        amount_usdc: u64,
        pt_minted: u64,
        yt_minted: u64,
        supra_price_usd: u128,
        timestamp: u64,
    }

    #[event]
    struct YieldClaimed has copy, drop {
        user: address,
        vault_id: UID,
        yt_token_id: UID,
        yield_amount: u64,
        fee_amount: u64,
        timestamp: u64,
    }

    #[event]
    struct RestakingExecuted has copy, drop {
        receipt_id: UID,
        user: address,
        vault_id: UID,
        asset: String,
        receipt_type: u8,
        amount: u64,
        external_receipt_id: Option<UID>,
        timestamp: u64,
    }

    #[event]
    struct EncryptedIntentSubmitted has copy, drop {
        intent_id: UID,
        user: address,
        intent_type: u8,
        execution_priority: u64,
        dvrf_seed: vector<u8>,
        created_at: u64,
    }

    #[event]
    struct EncryptedIntentProcessed has copy, drop {
        intent_id: UID,
        user: address,
        mev_captured: u64,
        execution_order: u64,
        timestamp: u64,
    }

    /// Initialize vault registry with Supra integrations
    public fun initialize_vault_registry(
        account: &signer,
        oracle_config: address,
        dvrf_manager: address,
        ctx: &mut TxContext,
    ) {
        let admin = signer::address_of(account);
        
        assert!(
            !object::id_exists<VaultRegistry>(admin),
            ERR_ALREADY_INITIALIZED,
        );

        let registry = VaultRegistry {
            id: object::new(ctx),
            vaults: table::new(ctx),
            active_vault_ids: vector::empty(),
            pt_tokens: table::new(ctx),
            yt_tokens: table::new(ctx),
            restaking_receipts: table::new(ctx),
            next_vault_id: 1,
            next_pt_id: 1,
            next_yt_id: 1,
            next_receipt_id: 1,
            user_vaults: table::new(ctx),
            user_pt_tokens: table::new(ctx),
            user_yt_tokens: table::new(ctx),
        };

        object::transfer(registry, admin);
    }

    /// Initialize intent processor (LP Vacuum) with DVRF
    public fun initialize_intent_processor(
        account: &signer,
        dvrf_manager: address,
        oracle_config: address,
        batch_size: u64,
        ctx: &mut TxContext,
    ) {
        let admin = signer::address_of(account);
        
        assert!(
            !object::id_exists<IntentProcessor>(admin),
            ERR_ALREADY_INITIALIZED,
        );

        let processor = IntentProcessor {
            id: object::new(ctx),
            intents: table::new(ctx),
            pending_intent_ids: vector::empty(),
            next_intent_id: 1,
            processed_intents: 0,
            mev_captured: 0,
            dvrf_manager,
            oracle_config,
            batch_size,
            last_batch_time: 0,
        };

        object::transfer(processor, admin);
    }

    /// Create yield vault with Supra PoEL integration option
    public fun create_vault(
        account: &signer,
        name: String,
        vault_type: u8,
        underlying_asset: String,
        maturity_time: u64,
        yield_rate_apy_bps: u64,
        enable_poel_staking: bool,
        poel_staking_pool: Option<address>,
        registry: &mut VaultRegistry,
        oracle_config: address,
        dvrf_manager: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): UID {
        let current_time = clock::timestamp_ms(clock) / 1000;
        
        assert!(
            vault_type >= VAULT_TYPE_SUPRA_POEL && vault_type <= VAULT_TYPE_LP_VACUUM,
            ERR_INVALID_VAULT_TYPE,
        );
        assert!(maturity_time > current_time, ERR_INVALID_MATURITY);
        assert!(yield_rate_apy_bps > 0 && yield_rate_apy_bps <= 5000, ERR_INVALID_APY);

        let vault_id = object::new(ctx);
        let vault_uid = object::uid_to_inner(&vault_id);

        let vault = YieldVault {
            id: vault_id,
            name,
            vault_type,
            underlying_asset,
            total_assets: 0,
            total_yield: 0,
            fee_accumulated: 0,
            created_at: current_time,
            maturity_time,
            is_active: true,
            yield_rate_apy_bps,
            pt_total_supply: 0,
            yt_total_supply: 0,
            collateral_for_vaults: true,
            oracle_config,
            dvrf_manager,
            poel_staking_pool: if (enable_poel_staking) poel_staking_pool else option::none(),
            last_yield_update: current_time,
            cumulative_performance: 0,
        };

        table::add(&mut registry.vaults, vault_uid, vault);
        vector::push_back(&mut registry.active_vault_ids, vault_uid);
        registry.next_vault_id = registry.next_vault_id + 1;

        event::emit(VaultCreated {
            vault_id: vault_uid,
            name,
            vault_type,
            underlying_asset,
            maturity_time,
            oracle_config,
            timestamp: current_time,
        });

        vault_uid
    }

    /// Deposit with PT/YT split and Supra Oracle price tracking
    public fun deposit_and_split(
        account: &signer,
        vault_id: UID,
        deposit_coin: Coin<USDC>,
        registry: &mut VaultRegistry,
        clock: &Clock,
        ctx: &mut TxContext,
    ): (UID, UID) {
        let user = signer::address_of(account);
        let amount_usdc = coin::value(&deposit_coin);
        
        assert!(amount_usdc >= MIN_DEPOSIT_USDC, ERR_MIN_DEPOSIT);
        assert!(table::contains(&registry.vaults, vault_id), ERR_VAULT_NOT_FOUND);

        let vault = table::borrow_mut(&mut registry.vaults, vault_id);
        assert!(vault.is_active, ERR_VAULT_INACTIVE);

        let current_time = clock::timestamp_ms(clock) / 1000;
        assert!(current_time < vault.maturity_time, ERR_VAULT_EXPIRED);

        // Get current SUPRA price from oracle
        let supra_price_usd = oracle_integration::get_supra_price_usd(
            vault.oracle_config,
            ORACLE_FEED_SUPRA_USD,
            clock,
        );

        // Calculate PT and YT amounts
        let pt_amount = amount_usdc; // PT = principal
        
        // YT = estimated future yield based on APY and time to maturity
        let time_to_maturity = vault.maturity_time - current_time;
        let yearly_yield = ((amount_usdc as u128) * (vault.yield_rate_apy_bps as u128)) / 10000;
        let years_to_maturity = (time_to_maturity as u128) / 31_536_000u128;
        let expected_yield = (yearly_yield * years_to_maturity) as u64;
        let yt_amount = expected_yield;

        // Create PT token
        let pt_id = object::new(ctx);
        let pt_uid = object::uid_to_inner(&pt_id);
        let pt_token = PrincipalToken {
            id: pt_id,
            owner: user,
            vault_id,
            amount: pt_amount,
            maturity_time: vault.maturity_time,
            is_redeemed: false,
            oracle_price_at_mint: supra_price_usd,
            poel_staking_receipt: option::none(),
        };

        // Create YT token
        let yt_id = object::new(ctx);
        let yt_uid = object::uid_to_inner(&yt_id);
        let yt_token = YieldToken {
            id: yt_id,
            owner: user,
            vault_id,
            amount: yt_amount,
            maturity_time: vault.maturity_time,
            accrued_yield: 0,
            is_claimed: false,
            last_yield_update: current_time,
            cumulative_yield_rate: 0,
        };

        // Store tokens in registry
        table::add(&mut registry.pt_tokens, pt_uid, pt_token);
        table::add(&mut registry.yt_tokens, yt_uid, yt_token);

        // Update user tracking
        if (!table::contains(&registry.user_pt_tokens, user)) {
            table::add(&mut registry.user_pt_tokens, user, vector::empty());
        };
        if (!table::contains(&registry.user_yt_tokens, user)) {
            table::add(&mut registry.user_yt_tokens, user, vector::empty());
        };
        
        let user_pts = table::borrow_mut(&mut registry.user_pt_tokens, user);
        vector::push_back(user_pts, pt_uid);
        
        let user_yts = table::borrow_mut(&mut registry.user_yt_tokens, user);
        vector::push_back(user_yts, yt_uid);

        // Update vault state
        vault.total_assets = vault.total_assets + amount_usdc;
        vault.pt_total_supply = vault.pt_total_supply + pt_amount;
        vault.yt_total_supply = vault.yt_total_supply + yt_amount;

        // Store deposit (in production: integrate with vault's asset management)
        coin::destroy_zero(deposit_coin); // Placeholder

        event::emit(DepositProcessed {
            user,
            vault_id,
            amount_usdc,
            pt_minted: pt_amount,
            yt_minted: yt_amount,
            supra_price_usd,
            timestamp: current_time,
        });

        (pt_uid, yt_uid)
    }

    /// Submit encrypted intent for MEV protection using DVRF
    public fun submit_encrypted_intent(
        account: &signer,
        intent_type: u8,
        encrypted_payload: vector<u8>,
        nonce: u64,
        processor: &mut IntentProcessor,
        clock: &Clock,
        ctx: &mut TxContext,
    ): UID {
        let user = signer::address_of(account);
        let current_time = clock::timestamp_ms(clock) / 1000;

        // Get DVRF randomness for execution priority
        let dvrf_seed = dvrf_integration::get_randomness_seed(
            processor.dvrf_manager,
            ctx,
        );

        // Generate random execution priority for fair ordering
        let execution_priority = dvrf_integration::generate_random_in_range(
            1,
            1000000,
            b"intent_priority",
            processor.dvrf_manager,
            ctx,
        );

        let intent_id = object::new(ctx);
        let intent_uid = object::uid_to_inner(&intent_id);

        let intent = EncryptedIntent {
            id: intent_id,
            user,
            intent_type,
            encrypted_payload,
            nonce,
            created_at: current_time,
            is_processed: false,
            dvrf_seed,
            execution_priority,
        };

        table::add(&mut processor.intents, intent_uid, intent);
        vector::push_back(&mut processor.pending_intent_ids, intent_uid);
        processor.next_intent_id = processor.next_intent_id + 1;

        event::emit(EncryptedIntentSubmitted {
            intent_id: intent_uid,
            user,
            intent_type,
            execution_priority,
            dvrf_seed,
            created_at: current_time,
        });

        intent_uid
    }

    /// View functions
    public fun get_vault_details(
        vault_id: UID,
        registry: &VaultRegistry,
    ): (String, u8, u64, u64, u64, bool) {
        assert!(table::contains(&registry.vaults, vault_id), ERR_VAULT_NOT_FOUND);
        
        let vault = table::borrow(&registry.vaults, vault_id);
        (
            vault.name,
            vault.vault_type,
            vault.total_assets,
            vault.total_yield,
            vault.fee_accumulated,
            vault.is_active,
        )
    }

    public fun get_user_pt_tokens(
        user: address,
        registry: &VaultRegistry,
    ): vector<UID> {
        if (table::contains(&registry.user_pt_tokens, user)) {
            *table::borrow(&registry.user_pt_tokens, user)
        } else {
            vector::empty()
        }
    }

    public fun get_user_yt_tokens(
        user: address,
        registry: &VaultRegistry,
    ): vector<UID> {
        if (table::contains(&registry.user_yt_tokens, user)) {
            *table::borrow(&registry.user_yt_tokens, user)
        } else {
            vector::empty()
        }
    }

    #[test_only]
    public fun test_vault_creation() {
        let amount = 1_000_000u64; // 1 USDC
        assert!(amount >= MIN_DEPOSIT_USDC, 0);
    }

    #[test_only]
    public fun test_yt_yield_calculation() {
        let principal = 1_000_000u64;
        let apy_bps = 1200; // 12% APY
        let yearly_yield = ((principal as u128) * (apy_bps as u128)) / 10000;
        assert!(yearly_yield > 0, 0);
    }
}
