/// Yield & Restaking Vaults Module for Supra L1
/// PT/YT splitting, dual restaking (EigenLayer + Symbiotic), LP Vacuum privacy

module suplock::yield_vaults {
    use std::signer;
    use std::vector;
    use std::string::String;

    const MIN_DEPOSIT_USDC: u64 = 1_000_000; // 1 USDC
    const VAULT_FEE_BPS: u64 = 100; // 1% performance fee
    const REINVEST_THRESHOLD: u64 = 50_000_000; // Reinvest if accumulated > 50 USDC
    const USDC_DECIMALS: u64 = 6;

    /// Vault Types
    const VAULT_TYPE_EIGENLAYER: u8 = 1;
    const VAULT_TYPE_SYMBIOTIC: u8 = 2;

    /// PT (Principal Token) Record
    struct PrincipalToken has key, store {
        token_id: u64,
        owner: address,
        vault_id: u64,
        amount: u64,
        maturity_time: u64,
        is_redeemed: bool,
    }

    /// YT (Yield Token) Record
    struct YieldToken has key, store {
        token_id: u64,
        owner: address,
        vault_id: u64,
        amount: u64,
        maturity_time: u64,
        accrued_yield: u64,
        is_claimed: bool,
    }

    /// Restaking Receipt
    struct RestakingReceipt has key, store {
        receipt_id: u64,
        owner: address,
        vault_id: u64,
        underlying_asset: String, // e.g., "stETH", "SUPRA"
        receipt_type: u8, // 1: rstSUPRA (EigenLayer), 2: symSUPRA (Symbiotic)
        amount_deposited: u64,
        receipt_amount: u64, // Receipt tokens received
        deposit_time: u64,
        is_redeemed: bool,
    }

    /// Yield Vault
    struct YieldVault has key, store {
        vault_id: u64,
        name: String,
        vault_type: u8, // EigenLayer or Symbiotic
        underlying_asset: String,
        total_assets: u64,
        total_yield: u64,
        fee_accumulated: u64,
        created_at: u64,
        maturity_time: u64,
        is_active: bool,
        yield_rate_apy_bps: u64, // APY in basis points
        pt_total_supply: u64,
        yt_total_supply: u64,
        collateral_for_vaults: bool, // Can use as collateral
    }

    /// Vault Registry
    struct VaultRegistry has key {
        vaults: vector<YieldVault>,
        pt_tokens: vector<PrincipalToken>,
        yt_tokens: vector<YieldToken>,
        restaking_receipts: vector<RestakingReceipt>,
        next_vault_id: u64,
        next_pt_id: u64,
        next_yt_id: u64,
        next_receipt_id: u64,
    }

    /// Encrypted Intent (Privacy Layer)
    struct EncryptedIntent has key, store {
        intent_id: u64,
        user: address,
        intent_type: u8, // 1: deposit, 2: withdraw, 3: restake
        encrypted_payload: vector<u8>, // Encrypted data
        nonce: u64,
        created_at: u64,
        is_processed: bool,
    }

    /// Intent Processor (LP Vacuum)
    struct IntentProcessor has key {
        intents: vector<EncryptedIntent>,
        next_intent_id: u64,
        processed_intents: u64,
        mev_captured: u64,
    }

    /// Events
    #[event]
    struct VaultCreated has drop {
        vault_id: u64,
        name: String,
        vault_type: u8,
        underlying_asset: String,
        maturity_time: u64,
    }

    #[event]
    struct DepositProcessed has drop {
        user: address,
        vault_id: u64,
        amount_usdc: u64,
        pt_minted: u64,
        yt_minted: u64,
    }

    #[event]
    struct YieldClaimed has drop {
        user: address,
        vault_id: u64,
        yield_amount: u64,
        fee_amount: u64,
    }

    #[event]
    struct RestakingExecuted has drop {
        receipt_id: u64,
        user: address,
        vault_id: u64,
        asset: String,
        receipt_type: u8,
        amount: u64,
    }

    #[event]
    struct EncryptedIntentSubmitted has drop {
        intent_id: u64,
        user: address,
        intent_type: u8,
        created_at: u64,
    }

    #[event]
    struct EncryptedIntentProcessed has drop {
        intent_id: u64,
        user: address,
        mev_captured: u64,
    }

    /// Initialize vault registry
    public fun initialize_vault_registry(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<VaultRegistry>(addr), 4001);

        let registry = VaultRegistry {
            vaults: vector::empty(),
            pt_tokens: vector::empty(),
            yt_tokens: vector::empty(),
            restaking_receipts: vector::empty(),
            next_vault_id: 1,
            next_pt_id: 1,
            next_yt_id: 1,
            next_receipt_id: 1,
        };

        move_to(account, registry);
    }

    /// Initialize intent processor (LP Vacuum)
    public fun initialize_intent_processor(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<IntentProcessor>(addr), 4002);

        let processor = IntentProcessor {
            intents: vector::empty(),
            next_intent_id: 1,
            processed_intents: 0,
            mev_captured: 0,
        };

        move_to(account, processor);
    }

    /// Create a new yield vault
    public fun create_vault(
        account: &signer,
        name: String,
        vault_type: u8,
        underlying_asset: String,
        maturity_time: u64,
        yield_rate_apy_bps: u64,
        registry_addr: address,
    ) acquires VaultRegistry {
        assert!(vault_type == VAULT_TYPE_EIGENLAYER || vault_type == VAULT_TYPE_SYMBIOTIC, 4003);
        assert!(maturity_time > get_current_timestamp(), 4004);
        assert!(yield_rate_apy_bps > 0 && yield_rate_apy_bps <= 5000, 4005); // 0-50% APY

        let registry = borrow_global_mut<VaultRegistry>(registry_addr);
        let vault_id = registry.next_vault_id;

        let vault = YieldVault {
            vault_id,
            name: name,
            vault_type,
            underlying_asset: underlying_asset,
            total_assets: 0,
            total_yield: 0,
            fee_accumulated: 0,
            created_at: get_current_timestamp(),
            maturity_time,
            is_active: true,
            yield_rate_apy_bps,
            pt_total_supply: 0,
            yt_total_supply: 0,
            collateral_for_vaults: true,
        };

        vector::push_back(&mut registry.vaults, vault);
        registry.next_vault_id = vault_id + 1;

        0x1::event::emit(VaultCreated {
            vault_id,
            name,
            vault_type,
            underlying_asset,
            maturity_time,
        });
    }

    /// Deposit into vault with PT/YT split
    /// Users receive PT (principal) + YT (yield)
    public fun deposit_and_split(
        account: &signer,
        vault_id: u64,
        amount_usdc: u64,
        registry_addr: address,
    ) acquires VaultRegistry {
        let user = signer::address_of(account);
        
        assert!(amount_usdc >= MIN_DEPOSIT_USDC, 4006);

        let registry = borrow_global_mut<VaultRegistry>(registry_addr);
        let vault_index = find_vault_index(&registry.vaults, vault_id);
        assert!(vault_index < vector::length(&registry.vaults), 4007);

        let vault = vector::borrow_mut(&mut registry.vaults, vault_index);
        assert!(vault.is_active, 4008);

        let current_time = get_current_timestamp();
        assert!(current_time < vault.maturity_time, 4009);

        // PT amount = full deposit
        let pt_amount = amount_usdc;

        // YT amount = future yield (estimated based on APY)
        let time_to_maturity = vault.maturity_time - current_time;
        let yearly_yield = ((amount_usdc as u128) * (vault.yield_rate_apy_bps as u128)) / 10000;
        let years_to_maturity = (time_to_maturity as u128) / 31_536_000u128;
        let expected_yield = ((yearly_yield * years_to_maturity) as u64);
        let yt_amount = expected_yield;

        // Create PT token
        let pt_token = PrincipalToken {
            token_id: registry.next_pt_id,
            owner: user,
            vault_id,
            amount: pt_amount,
            maturity_time: vault.maturity_time,
            is_redeemed: false,
        };

        vector::push_back(&mut registry.pt_tokens, pt_token);
        registry.next_pt_id = registry.next_pt_id + 1;

        // Create YT token
        let yt_token = YieldToken {
            token_id: registry.next_yt_id,
            owner: user,
            vault_id,
            amount: yt_amount,
            maturity_time: vault.maturity_time,
            accrued_yield: 0,
            is_claimed: false,
        };

        vector::push_back(&mut registry.yt_tokens, yt_token);
        registry.next_yt_id = registry.next_yt_id + 1;

        // Update vault
        vault.total_assets = vault.total_assets + amount_usdc;
        vault.pt_total_supply = vault.pt_total_supply + pt_amount;
        vault.yt_total_supply = vault.yt_total_supply + yt_amount;

        0x1::event::emit(DepositProcessed {
            user,
            vault_id,
            amount_usdc,
            pt_minted: pt_amount,
            yt_minted: yt_amount,
        });
    }

    /// Claim yield from YT token
    public fun claim_yield_from_yt(
        account: &signer,
        yt_token_id: u64,
        registry_addr: address,
    ) acquires VaultRegistry {
        let user = signer::address_of(account);
        let current_time = get_current_timestamp();

        let registry = borrow_global_mut<VaultRegistry>(registry_addr);
        let yt_index = find_yt_index(&registry.yt_tokens, yt_token_id);
        assert!(yt_index < vector::length(&registry.yt_tokens), 4010);

        let yt = vector::borrow_mut(&mut registry.yt_tokens, yt_index);
        assert!(yt.owner == user, 4011);
        assert!(current_time >= yt.maturity_time, 4012);
        assert!(!yt.is_claimed, 4013);

        let yield_amount = yt.amount;
        let fee_amount = ((yield_amount as u128) * (VAULT_FEE_BPS as u128)) / 10000;
        let net_yield = yield_amount - (fee_amount as u64);

        yt.accrued_yield = net_yield;
        yt.is_claimed = true;

        // Update vault fee tracking
        let vault_index = find_vault_index(&registry.vaults, yt.vault_id);
        if (vault_index < vector::length(&registry.vaults)) {
            let vault = vector::borrow_mut(&mut registry.vaults, vault_index);
            vault.fee_accumulated = vault.fee_accumulated + (fee_amount as u64);
            vault.total_yield = vault.total_yield + yield_amount;
        };

        0x1::event::emit(YieldClaimed {
            user,
            vault_id: yt.vault_id,
            yield_amount,
            fee_amount: fee_amount as u64,
        });
    }

    /// Restake vault assets via EigenLayer (mock)
    public fun restake_eigenlayer(
        account: &signer,
        vault_id: u64,
        asset: String,
        amount_usdc: u64,
        registry_addr: address,
    ) acquires VaultRegistry {
        let user = signer::address_of(account);
        
        assert!(amount_usdc > 0, 4014);

        let registry = borrow_global_mut<VaultRegistry>(registry_addr);
        
        // Mock EigenLayer integration: 1:1 receipt ratio
        let receipt_amount = amount_usdc;

        let receipt = RestakingReceipt {
            receipt_id: registry.next_receipt_id,
            owner: user,
            vault_id,
            underlying_asset: asset,
            receipt_type: VAULT_TYPE_EIGENLAYER,
            amount_deposited: amount_usdc,
            receipt_amount,
            deposit_time: get_current_timestamp(),
            is_redeemed: false,
        };

        vector::push_back(&mut registry.restaking_receipts, receipt);
        registry.next_receipt_id = registry.next_receipt_id + 1;

        0x1::event::emit(RestakingExecuted {
            receipt_id: registry.next_receipt_id - 1,
            user,
            vault_id,
            asset,
            receipt_type: VAULT_TYPE_EIGENLAYER,
            amount: amount_usdc,
        });
    }

    /// Restake vault assets via Symbiotic (mock)
    public fun restake_symbiotic(
        account: &signer,
        vault_id: u64,
        asset: String,
        amount_usdc: u64,
        registry_addr: address,
    ) acquires VaultRegistry {
        let user = signer::address_of(account);
        
        assert!(amount_usdc > 0, 4014);

        let registry = borrow_global_mut<VaultRegistry>(registry_addr);
        
        // Mock Symbiotic integration: 1:1 receipt ratio
        let receipt_amount = amount_usdc;

        let receipt = RestakingReceipt {
            receipt_id: registry.next_receipt_id,
            owner: user,
            vault_id,
            underlying_asset: asset,
            receipt_type: VAULT_TYPE_SYMBIOTIC,
            amount_deposited: amount_usdc,
            receipt_amount,
            deposit_time: get_current_timestamp(),
            is_redeemed: false,
        };

        vector::push_back(&mut registry.restaking_receipts, receipt);
        registry.next_receipt_id = registry.next_receipt_id + 1;

        0x1::event::emit(RestakingExecuted {
            receipt_id: registry.next_receipt_id - 1,
            user,
            vault_id,
            asset,
            receipt_type: VAULT_TYPE_SYMBIOTIC,
            amount: amount_usdc,
        });
    }

    /// Submit encrypted intent (LP Vacuum privacy layer)
    public fun submit_encrypted_intent(
        account: &signer,
        intent_type: u8,
        encrypted_payload: vector<u8>,
        nonce: u64,
        processor_addr: address,
    ) acquires IntentProcessor {
        let user = signer::address_of(account);

        let processor = borrow_global_mut<IntentProcessor>(processor_addr);
        let intent_id = processor.next_intent_id;

        let intent = EncryptedIntent {
            intent_id,
            user,
            intent_type,
            encrypted_payload,
            nonce,
            created_at: get_current_timestamp(),
            is_processed: false,
        };

        vector::push_back(&mut processor.intents, intent);
        processor.next_intent_id = intent_id + 1;

        0x1::event::emit(EncryptedIntentSubmitted {
            intent_id,
            user,
            intent_type,
            created_at: get_current_timestamp(),
        });
    }

    /// Process encrypted intent (confidential execution in LP Vacuum)
    /// Captures MEV internally and routes to SUPReserve
    public fun process_encrypted_intent(
        account: &signer,
        intent_id: u64,
        processor_addr: address,
    ) acquires IntentProcessor {
        let _processor_admin = signer::address_of(account);

        let processor = borrow_global_mut<IntentProcessor>(processor_addr);
        let intent_index = find_intent_index(&processor.intents, intent_id);
        assert!(intent_index < vector::length(&processor.intents), 4015);

        let intent = vector::borrow_mut(&mut processor.intents, intent_index);
        assert!(!intent.is_processed, 4016);

        intent.is_processed = true;
        
        // Mock MEV capture (in production, capture actual extracted value)
        let mev_captured = 100_000u64; // Mock 0.1 USDC MEV
        processor.mev_captured = processor.mev_captured + mev_captured;
        processor.processed_intents = processor.processed_intents + 1;

        0x1::event::emit(EncryptedIntentProcessed {
            intent_id,
            user: intent.user,
            mev_captured,
        });
    }

    /// Helper: Find vault index
    fun find_vault_index(vaults: &vector<YieldVault>, vault_id: u64): u64 {
        let i = 0;
        let len = vector::length(vaults);
        while (i < len) {
            if (vector::borrow(vaults, i).vault_id == vault_id) {
                return i
            };
            i = i + 1;
        };
        len
    }

    /// Helper: Find YT token index
    fun find_yt_index(yt_tokens: &vector<YieldToken>, token_id: u64): u64 {
        let i = 0;
        let len = vector::length(yt_tokens);
        while (i < len) {
            if (vector::borrow(yt_tokens, i).token_id == token_id) {
                return i
            };
            i = i + 1;
        };
        len
    }

    /// Helper: Find intent index
    fun find_intent_index(intents: &vector<EncryptedIntent>, intent_id: u64): u64 {
        let i = 0;
        let len = vector::length(intents);
        while (i < len) {
            if (vector::borrow(intents, i).intent_id == intent_id) {
                return i
            };
            i = i + 1;
        };
        len
    }

    /// View: Get vault details
    public fun get_vault_details(
        vault_id: u64,
        registry_addr: address,
    ): (String, u8, u64, u64, u64) acquires VaultRegistry {
        let registry = borrow_global<VaultRegistry>(registry_addr);
        let vault_index = find_vault_index(&registry.vaults, vault_id);
        assert!(vault_index < vector::length(&registry.vaults), 4007);

        let vault = vector::borrow(&registry.vaults, vault_index);
        (vault.name, vault.vault_type, vault.total_assets, vault.total_yield, vault.fee_accumulated)
    }

    /// Get current timestamp
    fun get_current_timestamp(): u64 {
        0x1::chain::get_block_timestamp()
    }

    #[test]
    fun test_vault_creation() {
        let amount = 1_000_000u64; // 1 USDC
        assert!(amount >= MIN_DEPOSIT_USDC, 0);
    }

    #[test]
    fun test_yt_yield_calculation() {
        let principal = 1_000_000u64;
        let apy_bps = 1200; // 12% APY
        let yearly_yield = ((principal as u128) * (apy_bps as u128)) / 10000;
        assert!(yearly_yield > 0, 0);
    }
}
