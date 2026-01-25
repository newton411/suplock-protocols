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
      // Mock wallet connection for Supra L1
      if (typeof window !== 'undefined' && (window as any).supraWallet) {
        const accounts = await (window as any).supraWallet.requestAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          setBalance('1000'); // Mock balance
        }
      } else {
        // Fallback: simulate wallet connection
        const mockAddress = '0x' + Math.random().toString(16).slice(2);
        setAddress(mockAddress);
        setIsConnected(true);
        setBalance('1000');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
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
