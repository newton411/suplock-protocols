# SUPLOCK Deployment - Quick Start

## 🎯 Your Immediate Task: Complete Profile Creation

The Docker terminal is waiting for you to enter your Supra profile password.

### Step 1: Switch to Docker Terminal
You should see a prompt like:
```
? Create a strong password using combination of uppercase and lowercase letters,
 numbers and special characters:  
[Your password must have a score ≥ 3 (out of 4).]
```

### Step 2: Enter Password
Type a strong password (example: `SupLock2026!Test`):
- Must include uppercase AND lowercase
- Must include numbers
- Must include special characters (!@#$%^&*)
- Score must be ≥ 3 out of 4

### Step 3: Confirm Password
When prompted for confirmation, enter the same password again.

### Step 4: Review Settings
The CLI will show testnet configuration - press Enter to confirm.

---

## 📦 After Profile Creation

Once profile is created (you'll see success message), run these commands:

### Deploy Contracts
```bash
./deploy_supra.sh compile    # Compiles Move contracts
./deploy_supra.sh deploy     # Publishes to Supra testnet
```

**IMPORTANT:** Save the **Package ID** from the deployment output!

### Setup Environment Variables
```bash
./deploy_supra.sh env
```

When prompted for **veSUPRA Registry Address**, use:
```
0x{YOUR_PACKAGE_ID}::vesupra
```

Example: If Package ID is `0x123abc`, then use `0x123abc::vesupra`

---

## 🔍 For All Registry Addresses

After deployment, your Package ID is `0xabc123...`

Use these addresses in environment setup:

| Field | Value |
|-------|-------|
| Package ID | `0xabc123...` |
| Core State | `0xabc123...::suplock_core` |
| **veSUPRA Registry** | `0xabc123...::vesupra` |
| SUPReserve | `0xabc123...::supreserve` |
| Vault Registry | `0xabc123...::yield_vaults` |

---

## ✅ Complete Checklist

- [ ] Profile password entered (currently waiting)
- [ ] `./deploy_supra.sh deploy` executed
- [ ] Package ID saved
- [ ] `./deploy_supra.sh env` executed with addresses
- [ ] `.env.local` created with all addresses
- [ ] `./deploy_supra.sh frontend` deployed
- [ ] `./deploy_supra.sh backend` deployed

---

## 📚 Detailed Guides

For more information, see:
- **DEPLOYMENT_INSTRUCTIONS.md** - Complete step-by-step guide
- **VESUPRA_REGISTRY_GUIDE.md** - Registry address details
- **SUPRA_TESTNET_DEPLOYMENT.md** - Supra-specific configuration

---

## 💡 Remember

**veSUPRA Registry Address = Package ID + `::vesupra`**

That's it! The rest of the addresses follow the same pattern with different module names.

---

**Need help? Check the troubleshooting section in DEPLOYMENT_INSTRUCTIONS.md**
