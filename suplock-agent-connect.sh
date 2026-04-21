#!/bin/bash
echo "=== SUPLOCK Agent Connector ==="

# 1. Check Supra CLI
echo "[1/4] Supra CLI..."
if command -v supra &> /dev/null; then
    echo "OK - Supra CLI installed"
else
    echo "Setting up Supra CLI via Docker..."
    curl https://raw.githubusercontent.com/supra-labs/supra-dev-hub/refs/heads/main/Scripts/cli/compose.yaml | docker compose -f - up -d
fi

# 2. Git status
echo ""
echo "[2/4] Git Status"
git status --short

echo ""
echo "[3/4] Move Package"
if [ -f "Move.toml" ]; then
    echo "OK - Move.toml found"
else
    echo "NOT FOUND - Run: supra move tool init"
fi

echo ""
echo "[4/4] Environment Variables"
echo "export SUPLOCK_REPO_PATH=\"$(pwd)\""
echo "export SUPLOCK_NETWORK=\"testnet\""

echo ""
echo "=== Ready! Share this info with the agent ==="
