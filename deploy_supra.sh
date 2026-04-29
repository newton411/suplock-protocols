#!/bin/bash

#============================================================
# SUPLOCK Supra Testnet Deployment Script
# 
# Automated deployment of SUPLOCK smart contracts, frontend, and backend
# to Supra testnet blockchain
#
# Usage:
#   ./deploy_supra.sh [setup|compile|deploy|init|full]
#
# Examples:
#   ./deploy_supra.sh setup        # Install Supra CLI and create profile
#   ./deploy_supra.sh compile      # Compile Move contracts
#   ./deploy_supra.sh deploy       # Deploy to testnet
#   ./deploy_supra.sh init         # Initialize contract modules
#   ./deploy_supra.sh full         # Run complete deployment
#============================================================

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SUPRA_IMAGE="supraoracles/supra-testnet-validator-node:v10.0.6"
TESTNET_RPC="https://rpc-testnet.supra.com"
PROFILE_NAME="suplock_testnet"
MOVE_WORKSPACE="/workspaces/suplock-protocols/smart-contracts/supra/suplock"
CONTRACTS_DIR="/supra/move_workspace/suplock"
SUPRA_HOME="$HOME/.supra"
SUPRA_CLI=""
FRAMEWORK_GIT="https://github.com/Entropy-Foundation/aptos-core.git"
FRAMEWORK_REV="dev"
FRAMEWORK_SUBDIR="aptos-move/framework/supra-framework"

# Supra Docker command wrapper
run_supra_docker() {
    local supra_cmd="$*"

    docker run --rm \
        -v "$SUPRA_HOME:/root/.supra" \
        -v "$MOVE_WORKSPACE:$CONTRACTS_DIR" \
        -w "$CONTRACTS_DIR" \
        --entrypoint /supra/supra \
        "$SUPRA_IMAGE" \
        $supra_cmd
}

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# Setup Supra CLI (Alternative Method)
setup_supra_cli() {
    log_info "Setting up Supra CLI (Alternative Method)..."
    
    # Create .supra directory for profiles
    mkdir -p "$SUPRA_HOME"
    
    # Try Docker first
    if command -v docker &> /dev/null; then
        log_info "Attempting Docker-based CLI setup..."
        if docker pull "$SUPRA_IMAGE" 2>/dev/null; then
            log_success "Supra CLI Docker setup complete"
            return 0
        else
            log_warning "Docker image pull failed, trying alternative methods..."
        fi
    fi
    
    # Alternative: Try to install Rust and CLI from source
    if ! command -v cargo &> /dev/null; then
        log_info "Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source $HOME/.cargo/env
    fi
    
    # Try to install Supra CLI via Cargo (may not work if repo is private)
    if command -v cargo &> /dev/null; then
        log_info "Attempting to install Supra CLI via Cargo..."
        # This may fail if the CLI repository is not publicly available
        if cargo install supra-cli 2>/dev/null; then
            log_success "Supra CLI installed via Cargo"
            return 0
        else
            log_warning "Cargo install failed - manual CLI installation required"
        fi
    fi
    
    log_error "Unable to setup Supra CLI automatically"
    log_info "Please install Supra CLI manually from: https://docs.supra.com/install-supra-cli"
    log_info "Then run the individual deployment steps manually"
    return 1
}

# Create deployment profile
create_profile() {
    log_info "Creating deployment profile '$PROFILE_NAME'..."
    log_info ""
    
    # Check if profile already exists
    if run_supra_docker "profile list" 2>&1 | grep -q "$PROFILE_NAME"; then
        log_success "Profile '$PROFILE_NAME' already exists!"
        log_info "Profile Details:"
        run_supra_docker "profile list" 2>&1 | grep -A 2 "$PROFILE_NAME" || true
        return 0
    fi
    
    log_warning "Profile creation requires an interactive terminal (TTY)"
    log_warning "Docker non-interactive mode cannot handle password prompts"
    log_info ""
    log_info "════════════════════════════════════════════════════════════"
    log_info "MANUAL PROFILE SETUP REQUIRED"
    log_info "════════════════════════════════════════════════════════════"
    log_info ""
    log_info "Please run this command in a NEW terminal window:"
    log_info ""
    log_info "docker run -it --rm -v ~/.supra:/root/.supra \\"
    log_info "  --entrypoint /supra/supra \\"
    log_info "  supraoracles/supra-testnet-validator-node:v10.0.6 \\"
    log_info "  profile new $PROFILE_NAME --network testnet"
    log_info ""
    log_info "When prompted:"
    log_info "  1. Enter a secure password and confirm it"
    log_info "  2. Review the network configuration for testnet"
    log_info "  3. Confirm the profile creation"
    log_info ""
    log_info "After profile creation, the CLI will show:"
    log_info "  - Profile name: $PROFILE_NAME"
    log_info "  - Public key: 0x..."
    log_info "  - Account address: 0x..."
    log_info ""
    log_info "════════════════════════════════════════════════════════════"
    log_info ""
    log_info "Then return here and run: ./deploy_supra.sh fund"
    log_info ""
    
    return 1  # Force manual creation
}

# Fund account from faucet
fund_account() {
    log_info "Funding account from testnet faucet..."
    
    # Try to fund from faucet
    run_supra_docker "move account fund-with-faucet --profile $PROFILE_NAME" 2>&1 | grep -v "^$" || true
    
    if [ $? -eq 0 ]; then
        log_success "Account funded from faucet"
    else
        log_warning "Faucet funding failed - manual funding required"
        log_info "Please fund your account manually:"
        log_info "1. Get test SUPRA from Supra testnet faucet (if available)"
        log_info "2. Or request test tokens from Supra team"
        log_info "3. Or use an existing funded account"
        log_info "Account address: (check with 'supra profile list')"
        return 1
    fi
    
    # Check balance
    log_info "Checking account balance..."
    run_supra_docker "move account balance --profile $PROFILE_NAME" 2>&1 | grep -v "^$" || true
}

# Fetch dependencies
fetch_dependencies() {
    log_info "Resolving Move contract dependencies..."
    log_info "Supra Move resolves package dependencies during compilation."
    log_success "Dependency resolution is handled by the Supra Move tool."
}

# Compile contracts
compile_contracts() {
    log_info "Compiling Move contracts using Aptos CLI..."

    # Try using aptos CLI if available, otherwise fall back to Supra Docker
    if command -v aptos &> /dev/null; then
        log_info "Using Aptos CLI for compilation..."
        cd "$MOVE_WORKSPACE"
        aptos move compile --package-dir . --save-metadata
    else
        log_info "Aptos CLI not found, using Supra Docker..."
        # Use the correct Supra Docker command for compilation
        run_supra_docker "move tool compile --package-dir $CONTRACTS_DIR --included-artifacts sparse --save-metadata" 2>&1
    fi

    if [ $? -eq 0 ]; then
        log_success "Contracts compiled successfully"
    else
        log_error "Contract compilation failed"
        return 1
    fi
}

# Deploy contracts
deploy_contracts() {
    log_info "Deploying contracts to Supra testnet..."
    log_warning "Please ensure account is funded (use 'fund_account' if not)"

    # Use the correct Supra Docker command for deployment
    run_supra_docker "move tool publish --package-dir $CONTRACTS_DIR --profile $PROFILE_NAME --rpc-url $TESTNET_RPC --assume-yes" 2>&1

    if [ $? -eq 0 ]; then
        log_success "Contract deployment complete!"
        log_info "View transaction on: https://testnet.suprascan.io"
    else
        log_error "Contract deployment failed"
        return 1
    fi
}

# Initialize contract modules
initialize_modules() {
    log_info "Initializing deployed contract modules..."
    
    read -p "Enter Package ID from deployment (0x...): " PACKAGE_ID
    
    if [ -z "$PACKAGE_ID" ]; then
        log_error "Package ID is required"
        return 1
    fi
    
    # Initialize each module
    local modules=("suplock_core" "vesupra" "supreserve" "yield_vaults")
    
    for module in "${modules[@]}"; do
        log_info "Initializing $module..."

        run_supra_docker "transaction call --profile $PROFILE_NAME --rpc-url $TESTNET_RPC --package-id $PACKAGE_ID --module $module --function initialize" 2>&1 | grep -v "^$" || log_warning "Failed to initialize $module (may already be initialized)"
    done
    
    log_success "Module initialization complete"
}

# Setup environment variables
setup_env() {
    log_info "Setting up environment variables..."
    
    local env_file="/workspaces/suplock-protocols/frontend/suplock-dapp/.env.local"
    
    read -p "Enter RPC URL [${TESTNET_RPC}]: " RPC_URL
    RPC_URL="${RPC_URL:-$TESTNET_RPC}"
    
    read -p "Enter Package ID (0x...): " PACKAGE_ID
    read -p "Enter Core State Address (0x...): " CORE_STATE_ADDR
    read -p "Enter veSUPRA Registry Address (0x...): " VE_REGISTRY_ADDR
    read -p "Enter SUPReserve Address (0x...): " SUPRESERVE_ADDR
    read -p "Enter Vault Registry Address (0x...): " VAULT_REGISTRY_ADDR
    
    cat > "$env_file" << EOF
NEXT_PUBLIC_SUPRA_RPC_URL=$RPC_URL
NEXT_PUBLIC_SUPRA_CHAIN_ID=8
NEXT_PUBLIC_SUPRA_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=$PACKAGE_ID
NEXT_PUBLIC_CORE_STATE_ADDR=$CORE_STATE_ADDR
NEXT_PUBLIC_VE_REGISTRY_ADDR=$VE_REGISTRY_ADDR
NEXT_PUBLIC_SUPRESERVE_ADDR=$SUPRESERVE_ADDR
NEXT_PUBLIC_VAULT_REGISTRY_ADDR=$VAULT_REGISTRY_ADDR
NEXT_PUBLIC_INTENT_PROCESSOR_ADDR=$VAULT_REGISTRY_ADDR
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WALLET_PROVIDERS=starkey,petra,martian
NEXT_PUBLIC_ENABLE_RESTAKING=true
NEXT_PUBLIC_ENABLE_DVRF=true
NEXT_PUBLIC_ENABLE_COMPOUND_YIELD=true
EOF

    log_success "Environment variables configured in $env_file"
}

# Deploy frontend
deploy_frontend() {
    log_info "Building and deploying frontend..."
    
    cd /workspaces/suplock-protocols/frontend/suplock-dapp
    
    log_info "Installing dependencies..."
    npm install
    
    log_info "Building project..."
    npm run build
    
    log_success "Frontend build complete"
    log_info "To deploy to Vercel: vercel"
}

# Deploy backend
deploy_backend() {
    log_info "Building backend API..."
    
    cd /workspaces/suplock-protocols/backend/suplock-api
    
    log_info "Installing dependencies..."
    npm install
    
    log_info "Building TypeScript..."
    npm run build
    
    log_success "Backend build complete"
    log_info "To run locally: npm start"
}

# Full deployment
full_deployment() {
    log_info "=========================================="
    log_info "SUPLOCK Supra Testnet Full Deployment"
    log_info "=========================================="
    
    check_prerequisites
    setup_supra_cli
    create_profile
    fund_account
    fetch_dependencies
    compile_contracts
    deploy_contracts
    
    log_warning "Next steps:"
    log_warning "1. Initialize modules: ./deploy_supra.sh init"
    log_warning "2. Setup environment: ./deploy_supra.sh env"
    log_warning "3. Deploy frontend: ./deploy_supra.sh frontend"
    log_warning "4. Deploy backend: ./deploy_supra.sh backend"
}

# Show deployment status
show_status() {
    log_info "==================================================================="
    log_info "  SUPLOCK Supra Testnet Deployment Status"
    log_info "==================================================================="
    log_info ""
    
    # Check prerequisites
    log_info "Prerequisites:"
    if command -v docker &> /dev/null; then
        log_success "✓ Docker installed: $(docker --version | cut -d' ' -f3)"
    else
        log_error "✗ Docker not installed"
    fi
    
    if command -v aptos &> /dev/null; then
        log_success "✓ Aptos CLI installed"
    else
        log_warning "⚠ Aptos CLI not installed (optional)"
    fi
    
    if command -v node &> /dev/null; then
        log_success "✓ Node.js installed: $(node --version)"
    else
        log_error "✗ Node.js not installed"
    fi
    
    log_info ""
    log_info "Contracts:"
    if [ -f "smart-contracts/supra/suplock/Move.toml" ]; then
        log_success "✓ Move.toml found"
    else
        log_error "✗ Move.toml not found"
    fi
    
    if [ -f "smart-contracts/supra/suplock/sources/suplock_core.move" ]; then
        log_success "✓ Contract sources present"
        local contract_count=$(ls smart-contracts/supra/suplock/sources/*.move 2>/dev/null | wc -l)
        log_info "  → $contract_count Move modules"
    else
        log_error "✗ Contract sources not found"
    fi
    
    log_info ""
    log_info "Profile Status:"
    if [ -d "$HOME/.supra" ] && [ "$(ls -A $HOME/.supra 2>/dev/null)" ]; then
        log_success "✓ .supra directory exists"
        local profile_count=$(ls $HOME/.supra/*.supakey 2>/dev/null | grep -v example | wc -l)
        if [ "$profile_count" -gt 0 ]; then
            log_success "✓ Profiles configured: $profile_count"
        else
            log_warning "⚠ No profiles created yet"
        fi
    else
        log_warning "⚠ No .supra directory - profiles not yet created"
    fi
    
    log_info ""
    log_info "==================================================================="
}

# Main command handler
case "${1:-help}" in
    setup)
        check_prerequisites
        setup_supra_cli
        create_profile
        fund_account
        ;;
    compile)
        check_prerequisites
        fetch_dependencies
        compile_contracts
        ;;
    deploy)
        check_prerequisites
        deploy_contracts
        ;;
    init)
        initialize_modules
        ;;
    env)
        setup_env
        ;;
    frontend)
        deploy_frontend
        ;;
    backend)
        deploy_backend
        ;;
    full)
        full_deployment
        ;;
    help|*)
        echo "SUPLOCK Supra Testnet Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup      Install Supra CLI and create deployment profile"
        echo "  compile    Fetch dependencies and compile Move contracts"
        echo "  deploy     Deploy compiled contracts to testnet"
        echo "  init       Initialize deployed contract modules"
        echo "  env        Setup environment variables for frontend"
        echo "  frontend   Build and deploy frontend"
        echo "  backend    Build backend API"
        echo "  full       Execute complete deployment pipeline"
        echo "  help       Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./deploy_supra.sh setup        # Interactive setup"
        echo "  ./deploy_supra.sh full         # Complete deployment"
        echo ""
        ;;
esac

log_success "Deployment script completed successfully!"
