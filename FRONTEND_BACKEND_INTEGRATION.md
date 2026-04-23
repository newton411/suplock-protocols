# SUPLOCK Frontend-Backend Integration Guide

> **Status**: Complete Integration Ready  
> **Components**: Next.js Frontend + Express Backend + Move Smart Contracts  
> **Network**: Supra L1 Testnet

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│          suplock-dapp on Vercel/localhost:3000             │
├─────────────────────────────────────────────────────────────┤
│  ├─ Pages: Lock, Governance, Vaults, Dividends, Restake    │
│  ├─ Hooks: useApi, useWallet, useTheme                    │
│  ├─ Contexts: WalletContext, ThemeContext                  │
│  └─ Components: Responsive UI + Supra wallet integration   │
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express.js)                       │
│          suplock-api on Vercel/localhost:3001              │
├─────────────────────────────────────────────────────────────┤
│  ├─ /api/projections - Supply decay forecasting            │
│  ├─ /api/proposals - Governance proposals                  │
│  ├─ /api/governance/stats - DAO statistics                 │
│  ├─ /api/stats - Protocol statistics                       │
│  ├─ /api/calculate-dividends - Dividend calculations       │
│  ├─ /api/estimate-yield - Yield estimation                 │
│  └─ /health - Health check                                 │
┌─────────────────────────────────────────────────────────────┐
│         Smart Contracts (Move Language)                     │
│            Deployed on Supra Testnet                       │
├─────────────────────────────────────────────────────────────┤
│  ├─ suplock_core - Locking & yields                        │
│  ├─ vesupra - Governance NFTs & voting                     │
│  ├─ supreserve - Fee distribution                          │
│  ├─ yield_vaults - PT/YT splitting & restaking            │
│  ├─ oracle_integration - DVRF & price feeds               │
│  └─ restake_integration - EigenLayer & Symbiotic          │
└─────────────────────────────────────────────────────────────┘
```

---

## Development Setup

### 1. Install Dependencies (All Components)

```bash
# Root dependencies
cd /workspaces/suplock-protocols
npm install --legacy-peer-deps

# Frontend dApp
cd frontend/suplock-dapp
npm install

# Backend API
cd ../backend/suplock-api
npm install
```

### 2. Environment Configuration

Create `.env.local` in `frontend/suplock-dapp/`:

```env
# Supra Testnet Configuration
NEXT_PUBLIC_SUPRA_RPC_URL=https://rpc-testnet.supra.com
NEXT_PUBLIC_SUPRA_CHAIN_ID=8

# Smart Contract Addresses (from deployment)
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_CORE_STATE_ADDR=0x...
NEXT_PUBLIC_VE_REGISTRY_ADDR=0x...
NEXT_PUBLIC_SUPRESERVE_ADDR=0x...
NEXT_PUBLIC_VAULT_REGISTRY_ADDR=0x...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000

# Wallet
NEXT_PUBLIC_WALLET_PROVIDERS=starkey,petra,martian

# Feature Flags
NEXT_PUBLIC_ENABLE_RESTAKING=true
NEXT_PUBLIC_ENABLE_DVRF=true
NEXT_PUBLIC_ENABLE_COMPOUND_YIELD=true
```

Create `.env` in `backend/suplock-api/`:

```env
# Node
NODE_ENV=development
PORT=3001

# Supra RPC
SUPRA_RPC_URL=https://rpc-testnet.supra.com

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Local Development

### Option A: Run Individually

#### Terminal 1: Start Backend
```bash
cd backend/suplock-api
npm run dev
# API running on http://localhost:3001
# Health check: curl http://localhost:3001/health
```

#### Terminal 2: Start Frontend
```bash
cd frontend/suplock-dapp
npm run dev
# Frontend running on http://localhost:3000
```

### Option B: Docker Compose

```bash
# From project root
docker-compose up

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## API Integration from Frontend

### 1. Configure API Client

Location: `frontend/suplock-dapp/src/hooks/useApi.ts`

```typescript
import { useCallback, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async <T,>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return { data, loading: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { error: errorMessage, loading: false };
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  return { fetch, loading, error };
};
```

### 2. Fetch Projections in Components

```typescript
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

export const ProjectionChart = () => {
  const { fetch, loading, error } = useApi();
  const [projections, setProjections] = useState([]);

  useEffect(() => {
    const loadProjections = async () => {
      const response = await fetch('/api/projections?months=24');
      if (response.data) {
        setProjections(response.data);
      }
    };

    loadProjections();
  }, [fetch]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {projections.length > 0 && (
        <LineChart data={projections} />
      )}
    </div>
  );
};
```

### 3. Fetch Governance Data

```typescript
// In a governance page component
const { data: proposals } = await fetch('/api/proposals');
const { data: stats } = await fetch('/api/governance/stats');

// Render governance UI with data
```

### 4. Calculate Dividends

```typescript
const calculateDividends = async () => {
  const response = await fetch('/api/calculate-dividends', {
    method: 'POST',
    body: JSON.stringify({
      veSUPRABalance: userBalance,
      totalVeSupply: totalVeSUPRA,
      accumulatedFees: protocolFees,
    }),
  });

  return response.data;
};
```

---

## Wallet Integration

### Supported Wallets

1. **Starkey Wallet** (Primary)
   - Installation: https://starkey.app
   - Network: Supra Testnet
   - Features: Transaction signing, account management

2. **Petra Wallet** (Secondary)
   - Installation: Petra wallet extension
   - Network: Supports Supra

3. **Martian Wallet** (Tertiary)
   - Installation: Martian wallet extension

### Wallet Connection Flow

Location: `frontend/suplock-dapp/src/contexts/WalletContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  account: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    try {
      // Connect to Starkey/Petra/Martian
      const wallet = window.supraWallet || window.martianWallet || window.petraWallet;
      
      if (!wallet) throw new Error('No Supra wallet detected');

      const accounts = await wallet.connect();
      setAccount(accounts[0]);
      setConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('walletAddress', accounts[0]);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    setAccount(null);
    setConnected(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider value={{ account, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
```

---

## Smart Contract Interaction

### 1. Read Contract State

Use `supra-l1-sdk` for reading:

```typescript
import { SunyaSdk } from 'supra-l1-sdk';

const sdk = new SunyaSdk({
  rpcUrl: process.env.NEXT_PUBLIC_SUPRA_RPC_URL,
  chainId: parseInt(process.env.NEXT_PUBLIC_SUPRA_CHAIN_ID || '8'),
});

// Get lock position
const lockData = await sdk.getObject({
  id: lockPositionId,
  options: { showContent: true },
});

// Get veSUPRA balance
const veSUPRA = await sdk.getDynamicFieldObject({
  parentId: veSUPRARegistryId,
  name: userAddress,
});
```

### 2. Write Contract State (Submit Transactions)

```typescript
const submitLockTransaction = async (amount: bigint, months: number) => {
  const signer = new Signer(userPrivateKey); // From wallet
  
  const tx = new TransactionBuilder()
    .moveCall({
      target: `${packageId}::suplock_core::create_lock`,
      arguments: [amount, months * 30 * 24 * 60 * 60], // Convert to seconds
      typeArguments: [],
    })
    .build();

  const response = await sdk.signAndExecuteTransaction(signer, tx);
  return response.digest;
};
```

### 3. Listen for Events

```typescript
// Use backend API for event notifications
const pollForEvents = async (txDigest: string) => {
  const response = await fetch(`http://localhost:3001/api/events/${txDigest}`);
  const events = await response.json();
  
  // Update UI based on events
  events.forEach(event => {
    if (event.type === 'LockCreated') {
      console.log('Lock created:', event.data);
    }
  });
};
```

---

## Backend API Details

### Health Check
```bash
GET /health
Response: { "status": "healthy", "timestamp": "2026-04-21T12:00:00Z" }
```

### Projections Endpoint
```bash
GET /api/projections?months=24

Response: [
  {
    month: 1,
    circulatingSupply: 45200000000,
    totalBurned: 8500000000,
    decayRate: 0.02,
    price: 150,
    marketCap: 6780000000000
  },
  ...
]
```

### Governance Proposals
```bash
GET /api/proposals

Response: [
  {
    id: 1,
    title: "Increase veSUPRA rewards",
    author: "0x...",
    votes: 5000000,
    status: "active",
    endTime: 1718476800
  },
  ...
]
```

### Calculate Dividends
```bash
POST /api/calculate-dividends

Body: {
  "veSUPRABalance": 1000000,
  "totalVeSupply": 45000000,
  "accumulatedFees": 25000000
}

Response: {
  "veSUPRABalance": 1000000,
  "accumulatedFees": 25000000,
  "dividendPerShare": "555555.56",
  "userDividends": "555555.56"
}
```

---

## Testing Integration

### 1. Unit Tests

```bash
# Frontend
cd frontend/suplock-dapp
npm run test

# Backend
cd backend/suplock-api
npm run test
```

### 2. Integration Tests

```bash
# Test end-to-end flow
npm run test:integration
```

### 3. Manual Testing

#### Test Wallet Connection
1. Install Starkey wallet
2. Click "Connect Wallet" button
3. Approve connection in wallet popup
4. Verify address displays in header

#### Test Lock Creation
1. Connect wallet with testnet SUPRA
2. Go to "Lock" tab
3. Enter amount and duration
4. Click "Create Lock"
5. Approve transaction in wallet
6. Verify lock appears in dashboard

#### Test Governance
1. Go to "Governance" tab
2. View proposals from `/api/proposals`
3. Vote on active proposals
4. Check voting power in veSUPRA balance

---

## Deployment

### Production Build

```bash
# Frontend
cd frontend/suplock-dapp
npm run build && npm run start

# Backend
cd backend/suplock-api
npm run build && npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend/suplock-dapp
vercel

# Deploy backend (using Functions)
cd ../backend/suplock-api
vercel serverless --backend vercel-functions
```

### Deploy to Docker

```bash
# Build images
docker build -t suplock-frontend ./frontend/suplock-dapp
docker build -t suplock-backend ./backend/suplock-api

# Run containers
docker run -p 3000:3000 suplock-frontend
docker run -p 3001:3001 suplock-backend
```

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Update `FRONTEND_URL` in backend .env and ensure origin is in allowedOrigins list

### Issue: API Not Responding
```bash
curl http://localhost:3001/health
# If no response, backend isn't running
# Start with: npm run dev
```

### Issue: Wallet Not Detected
**Solution**: Install wallet extension and refresh page, ensure network is Supra testnet

### Issue: Smart Contract Calls Failing
**Solution**: Verify contract addresses in `.env.local` match deployment addresses

### Issue: Projections Not Loading
```bash
# Check backend API response
curl http://localhost:3001/api/projections?months=24
# If error, verify backend is running and dependencies are installed
```

---

## Performance Optimization

### Frontend
- Use React Query for caching API responses
- Implement lazy loading for charts
- Optimize images and code splitting
- Use CDN for static assets

### Backend
- Implement in-memory caching for projections
- Use database indexes for queries
- Add rate limiting: npm install express-rate-limit
- Monitor with APM tools

### Smart Contracts
- Batch operations to reduce gas
- Use aggregators for global state reads
- Optimize storage patterns
- Test on testnet before mainnet

---

## Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full deployment steps
- [SUPRA_TESTNET_DEPLOYMENT.md](SUPRA_TESTNET_DEPLOYMENT.md) - Supra-specific deployment
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference guide
- [ARCHITECTURE_REFERENCE.md](ARCHITECTURE_REFERENCE.md) - Architecture details

---

## Support & Resources

- **Supra Docs**: https://docs.supra.com
- **Supra Testnet**: https://testnet.suprascan.io
- **Move Language**: https://move-language.github.io/
- **Github Issues**: https://github.com/Entropy-Foundation/supra-move-stdlib/issues

---

**Integration Guide Version**: 1.0.0  
**Last Updated**: April 21, 2026  
**Status**: Production Ready ✅
