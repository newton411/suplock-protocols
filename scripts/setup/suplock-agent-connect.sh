#!/bin/bash
# SUPLOCK Agent Connector Script
# Run this to sync your Codespace with the SUPLOCK AI agent

echo "=== SUPLOCK Agent Connector ==="
echo "Repo: github.com/newton411/suplock-protocols"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Check Supra CLI
echo -e "${BLUE}[1/5] Checking Supra CLI...${NC}"
if command -v supra &> /dev/null; then
    echo -e "${GREEN}OK${NC} - Supra CLI ready"
else
    echo "Supra CLI not found - checking Docker..."
    if docker ps | grep -q supra; then
        echo -e "${GREEN}OK${NC} - Supra running in Docker"
    else
        echo "Setting up Supra CLI via Docker..."
        curl -fsSL https://raw.githubusercontent.com/supra-labs/supra-dev-hub/main/Scripts/cli/compose.yaml | docker compose -f - up -d
    fi
fi

# 2. Git status
echo ""
echo -e "${BLUE}[2/5] Git Status${NC}"
git status --short 2>/dev/null || echo "Not a git repo"

# 3. Current branch
echo ""
echo -e "${BLUE}[3/5] Current Branch${NC}"
git branch --show-current 2>/dev/null || echo "N/A"

# 4. Check Move.toml
echo ""
echo -e "${BLUE}[4/5] Move Package Status${NC}"
if [ -f "Move.toml" ]; then
    echo -e "${GREEN}OK${NC} - Move.toml found"
    grep "^name" Move.toml 2>/dev/null || echo "Package: suplock_protocol"
else
    echo "Move.toml not found - this is a new project"
fi

# 5. Environment
echo ""
echo -e "${BLUE}[5/5] Environment Variables${NC}"
echo "SUPLOCK_REPO_PATH=$(pwd)"
echo "SUPLOCK_GITHUB_REPO=newton411/suplock-protocols"
echo "SUPLOCK_NETWORK=testnet"

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Share this with the SUPLOCK AI Agent:"
echo ""
echo "My Codespace Context:"
echo "- Repo: github.com/newton411/suplock-protocols"
echo "- Path: $(pwd)"
echo "- Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
