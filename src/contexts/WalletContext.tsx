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
  sendTransaction: (transaction: {
    from?: string;
    to: string;
    value?: string | number;
    data?: string;
  }) => Promise<string | undefined>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    connected: false,
    account: null,
    loading: false,
    error: null,
  });

  const getStarKeyProvider = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const wallet = (window as Window & { starkey?: any }).starkey;
    if (!wallet) {
      return null;
    }

    const provider = wallet.supra || wallet.provider || wallet;
    const isValidProvider = Boolean(
      provider &&
        (provider.isStarkey || wallet.isStarkey || provider.connect || provider.requestAccounts || provider.on)
    );

    return isValidProvider ? provider : null;
  }, []);

  const syncWalletState = useCallback(
    (accounts: string[] | null | undefined, error?: string | null) => {
      if (!accounts || accounts.length === 0) {
        setState(prev => ({ ...prev, connected: false, account: null, loading: false, error: error ?? null }));
        localStorage.removeItem('starkey_connected');
        localStorage.removeItem('starkey_account');
        return;
      }

      setState({ connected: true, account: accounts[0], loading: false, error: error ?? null });
      localStorage.setItem('starkey_connected', 'true');
      localStorage.setItem('starkey_account', accounts[0]);
    },
    []
  );

  const checkConnectedWallet = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const provider = getStarKeyProvider();
      if (!provider) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const accounts = await provider.requestAccounts?.();
      if (accounts && accounts.length > 0) {
        syncWalletState(accounts);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Unable to inspect StarKey wallet state:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Unable to read StarKey wallet state.' }));
    }
  }, [getStarKeyProvider, syncWalletState]);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const provider = getStarKeyProvider();
      if (!provider) {
        setState({
          connected: false,
          account: null,
          loading: false,
          error: 'StarKey Wallet not installed. Please install the extension and try again.',
        });
        if (typeof window !== 'undefined') {
          window.open('https://starkey.app/', '_blank');
        }
        return;
      }

      const accounts = (await provider.connect?.()) ?? (await provider.requestAccounts?.());
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available');
      }

      syncWalletState(accounts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect StarKey wallet.';
      setState({ connected: false, account: null, loading: false, error: message });
      console.error('StarKey connection failed:', error);
    }
  }, [getStarKeyProvider, syncWalletState]);

  const disconnect = useCallback(async () => {
    try {
      const provider = getStarKeyProvider();
      await provider?.disconnect?.();
    } catch (error) {
      console.error('StarKey disconnect failed:', error);
    } finally {
      setState({ connected: false, account: null, loading: false, error: null });
      localStorage.removeItem('starkey_connected');
      localStorage.removeItem('starkey_account');
    }
  }, [getStarKeyProvider]);

  const sendTransaction = useCallback(
    async (transaction: { from?: string; to: string; value?: string | number; data?: string }) => {
      const provider = getStarKeyProvider();
      if (!provider) {
        throw new Error('StarKey Wallet not installed.');
      }

      return provider.sendTransaction?.(transaction);
    },
    [getStarKeyProvider]
  );

  useEffect(() => {
    checkConnectedWallet();
  }, [checkConnectedWallet]);

  useEffect(() => {
    const provider = getStarKeyProvider();
    if (!provider) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        void disconnect();
      } else {
        syncWalletState(accounts);
      }
    };

    const handleChainChanged = () => {
      void checkConnectedWallet();
    };

    provider.on?.('accountChanged', handleAccountsChanged);
    provider.on?.('accountsChanged', handleAccountsChanged);
    provider.on?.('chainChanged', handleChainChanged);

    return () => {
      provider.off?.('accountChanged', handleAccountsChanged);
      provider.off?.('accountsChanged', handleAccountsChanged);
      provider.off?.('chainChanged', handleChainChanged);
    };
  }, [checkConnectedWallet, disconnect, getStarKeyProvider, syncWalletState]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, sendTransaction }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    return {
      connected: false,
      account: null,
      loading: false,
      error: null,
      connect: async () => {},
      disconnect: () => {},
      sendTransaction: async () => undefined,
    } as WalletContextType;
  }
  return context;
};
