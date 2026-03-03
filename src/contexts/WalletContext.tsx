import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface WalletState {
  connected: boolean;
  account: string | null;
  loading: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: null,
    loading: false,
    error: null,
  });

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnectedWallet();
  }, []);

  const checkConnectedWallet = useCallback(async () => {
    try {
      // Check if window.starkey is available (Starkey Wallet extension)
      if (typeof window !== 'undefined' && (window as any).starkey) {
        const wallet = (window as any).starkey;
        
        // Get connected accounts if any
        try {
          const accounts = await wallet.requestAccounts?.();
          if (accounts && accounts.length > 0) {
            setState({
              connected: true,
              account: accounts[0],
              loading: false,
              error: null,
            });
          }
        } catch (err) {
          // Wallet is available but user hasn't connected yet
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    } catch (err) {
      console.error('Error checking connected wallet:', err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check if Starkey Wallet is installed
      if (!((window as any).starkey)) {
        setState({
          connected: false,
          account: null,
          loading: false,
          error: 'Starkey Wallet not installed. Please install the Starkey Wallet extension.',
        });
        return;
      }

      const wallet = (window as any).starkey;

      // Request account access from Starkey Wallet
      const accounts = await wallet.requestAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available');
      }

      const account = accounts[0];

      setState({
        connected: true,
        account,
        loading: false,
        error: null,
      });

      // Persist connection state
      localStorage.setItem('starkey_connected', 'true');
      localStorage.setItem('starkey_account', account);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setState({
        connected: false,
        account: null,
        loading: false,
        error: errorMessage,
      });
      console.error('Wallet connection error:', err);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      account: null,
      loading: false,
      error: null,
    });
    localStorage.removeItem('starkey_connected');
    localStorage.removeItem('starkey_account');
  }, []);

  // Listen for wallet account changes
  useEffect(() => {
    if (!((window as any).starkey)) return;

    const wallet = (window as any).starkey;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({
          ...prev,
          account: accounts[0],
          connected: true,
        }));
        localStorage.setItem('starkey_account', accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Re-check wallet state when chain changes
      checkConnectedWallet();
    };

    // Some wallets provide these events
    if (wallet.on) {
      wallet.on('accountsChanged', handleAccountsChanged);
      wallet.on('chainChanged', handleChainChanged);

      return () => {
        wallet.off?.('accountsChanged', handleAccountsChanged);
        wallet.off?.('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnectedWallet, disconnect]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
