# Starkey Wallet Integration Guide

## Overview
The SUPLOCK Protocol now integrates with **Starkey Wallet**, the official Supra L1 wallet. This integration uses the Blink SDK (`@blinkdotnew/sdk`) and exposes the wallet API through `window.starkey`.

## Architecture

### WalletContext (`src/contexts/WalletContext.tsx`)
The core wallet integration is managed through React Context, providing:
- **State Management**: Connected status, account address, loading, and error states
- **Auto-detection**: Checks if Starkey Wallet is installed on component mount
- **Event Listeners**: Monitors wallet account changes and chain switches
- **Persistence**: Uses localStorage to retain connection state across sessions

### Key Features
- ✅ **Starkey Wallet Detection** – Checks for `window.starkey` availability
- ✅ **Account Management** – Request and track user accounts
- ✅ **Connection Persistence** – Remember wallet state in localStorage
- ✅ **Event Handling** – React to account/chain changes in real-time
- ✅ **Error Handling** – Gracefully handle missing wallet or connection failures

---

## Usage

### 1. **Wrap Your App with WalletProvider**
```tsx
import { WalletProvider } from '@/contexts/WalletContext';

<ErrorBoundary>
  <ThemeProvider>
    <WalletProvider>
      <Router>
        {/* Your routes */}
      </Router>
    </WalletProvider>
  </ThemeProvider>
</ErrorBoundary>
```

### 2. **Use the useWallet Hook**
```tsx
import { useWallet } from '@/contexts/WalletContext';

function MyComponent() {
  const { connected, account, loading, error, connect, disconnect } = useWallet();

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {loading && <p>Connecting...</p>}
      {connected ? (
        <>
          <p>Connected: {account}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

---

## Wallet Interface

### `window.starkey` API
The Starkey Wallet exposes the following interface:

```typescript
interface StarkeyWallet {
  requestAccounts(): Promise<string[]>  // Request account addresses
  on(event: string, callback: Function) // Listen to wallet events
  off(event: string, callback: Function) // Stop listening
}
```

### Supported Events
- `accountsChanged` – Fired when user switches accounts
- `chainChanged` – Fired when user switches networks

### Example: Direct Wallet Usage
```typescript
// Only use if you need direct wallet access
const accounts = await (window as any).starkey.requestAccounts();
console.log('Connected account:', accounts[0]);
```

---

## Integration in Components

### Navbar (Currently Integrated)
The Navbar component uses `useWallet` to:
- Display connection status
- Show abbreviated account address when connected
- Provide connect/disconnect buttons
- Display loading and error states

```tsx
const { connected, account, loading, error, connect, disconnect } = useWallet();

<button onClick={connected ? disconnect : connect} disabled={loading}>
  {connected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'INITIALIZE_WALLET'}
</button>
```

---

## Environment Setup

Add these to your `.env.example` and `.env` files:

```ini
# Starkey Wallet Configuration
VITE_ENABLE_WALLET_INTEGRATION=true
VITE_WALLET_NETWORK=mainnet  # or testnet
```

---

## Testing

### Unit Tests
```bash
npm run test  # Run all tests
```

Example test for wallet integration:
```tsx
import { renderHook, act } from '@testing-library/react';
import { WalletProvider } from '@/contexts/WalletContext';
import { useWallet } from '@/contexts/WalletContext';

test('connects to wallet', async () => {
  // Mock window.starkey
  (window as any).starkey = {
    requestAccounts: vi.fn().mockResolvedValue(['0x123...'])
  };

  const wrapper = ({ children }) => (
    <WalletProvider>{children}</WalletProvider>
  );

  const { result } = renderHook(() => useWallet(), { wrapper });

  await act(async () => {
    await result.current.connect();
  });

  expect(result.current.connected).toBe(true);
  expect(result.current.account).toBe('0x123...');
});
```

---

## Troubleshooting

### "Starkey Wallet not installed" Error
- **Solution**: Install the Starkey Wallet browser extension from the official Supra website
- **Link**: https://supra.com/wallets/starkey

### Account Not Connecting
- Ensure Starkey Wallet is installed and enabled
- Check browser console for error messages
- Try refreshing the page
- Verify you're on a supported network

### Account Changes Not Detected
- WalletContext automatically listens for `accountsChanged` events
- If events aren't firing, the wallet may need to be re-enabled in browser settings

### LocalStorage Issues
- Clear browser cache if connection state persists incorrectly
- The context will fallback to manual connection on next session

---

## Security Best Practices

1. **Never Store Private Keys** – The wallet extension handles all key management
2. **Validate Accounts** – Always verify the connected account before sensitive operations
3. **Handle Errors Gracefully** – Show user-friendly messages for connection failures
4. **Monitor for Disconnection** – Listen to `accountsChanged` events for unexpected disconnects

---

## Network Support

Starkey Wallet currently supports:
- **Supra L1 Mainnet**
- **Supra Testnet**
- **Supra Devnet**

The integration automatically detects the current network via `window.starkey`, so no manual configuration is needed.

---

## Future Enhancements

- [ ] Add wallet selector for multiple wallet support
- [ ] Implement transaction signing with Starkey
- [ ] Add wallet balance display
- [ ] Support hardware wallet (Ledger) via Starkey
- [ ] Add network switcher UI
- [ ] Implement smart contract interactions

---

## References

- **Starkey Wallet Docs**: https://docs.starkey.app/
- **Supra L1 SDK**: https://supra-l1-sdk-docs.example.com
- **Blink SDK**: https://docs.blinkdotnew.com

---

## Support

For issues or questions:
1. Check the Starkey Wallet documentation
2. Review the test file at `src/__tests__/Navbar.test.tsx`
3. Open an issue on GitHub with details and error logs
