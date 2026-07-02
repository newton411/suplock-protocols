import React, { createContext, useEffect, useState, useCallback } from 'react';

export interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  balance: string;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');

  const getStarKeyProvider = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const wallet = (window as Window & { starkey?: any }).starkey;
    if (!wallet) {
      return null;
    }

    const provider = wallet.supra || wallet.provider || wallet;
    const isValidProvider = Boolean(provider && (provider.isStarkey || wallet.isStarkey || provider.connect || provider.requestAccounts || provider.on));
    return isValidProvider ? provider : null;
  }, []);

  const syncWalletState = useCallback((accounts: string[] | null | undefined) => {
    if (!accounts || accounts.length === 0) {
      setAddress(null);
      setIsConnected(false);
      setBalance('0');
      return;
    }

    setAddress(accounts[0]);
    setIsConnected(true);
    setBalance('0');
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const provider = getStarKeyProvider();
      if (!provider) {
        console.warn('No StarKey wallet provider detected. Please install the extension.');
        if (typeof window !== 'undefined') {
          window.open('https://starkey.app/', '_blank');
        }
        return;
      }

      const accounts = (await provider.connect?.()) ?? (await provider.requestAccounts?.());
      syncWalletState(accounts);
    } catch (error) {
      console.error('Failed to connect StarKey wallet:', error);
    }
  }, [getStarKeyProvider, syncWalletState]);

  const disconnectWallet = useCallback(async () => {
    try {
      const provider = getStarKeyProvider();
      await provider?.disconnect?.();
    } catch (error) {
      console.error('Failed to disconnect StarKey wallet:', error);
    } finally {
      setAddress(null);
      setIsConnected(false);
      setBalance('0');
    }
  }, [getStarKeyProvider]);

  useEffect(() => {
    const provider = getStarKeyProvider();
    if (!provider) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      syncWalletState(accounts);
    };

    provider.on?.('accountChanged', handleAccountsChanged);
    provider.on?.('accountsChanged', handleAccountsChanged);

    return () => {
      provider.off?.('accountChanged', handleAccountsChanged);
      provider.off?.('accountsChanged', handleAccountsChanged);
    };
  }, [getStarKeyProvider, syncWalletState]);

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet, balance }}>
      {children}
    </WalletContext.Provider>
  );
};
