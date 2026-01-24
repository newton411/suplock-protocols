import React, { createContext, useState, useCallback } from 'react';

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

  const connectWallet = useCallback(async () => {
    try {
      // Only allow Starkey Wallet (Supra L1)
      if (typeof window !== 'undefined' && (window as any).starkey) {
        const accounts = await (window as any).starkey.request({ method: 'starkey_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setBalance('1000'); // TODO: fetch real balance from Supra L1
        }
      } else {
        alert('Starkey Wallet is required. Please install it from https://supra.com/wallets/starkey');
      }
    } catch (error) {
      console.error('Failed to connect Starkey Wallet:', error);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setBalance('0');
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet, balance }}>
      {children}
    </WalletContext.Provider>
  );
};
