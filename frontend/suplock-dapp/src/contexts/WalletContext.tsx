'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { SupraClient } from 'supra-l1-sdk';
import {
  connectStarKey,
  disconnectStarKey,
  isStarKeyInstalled,
  getBalanceFromSupra,
  formatQuantsToSupra,
  onAccountChange,
  onDisconnect,
} from '@/lib/starkey-wallet';
import { getSupraClient, RPC_TESTNET } from '@/lib/supra-client';

export interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isStarKeyInstalled: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  balance: string;
  client: SupraClient | null;
  loading: boolean;
  error: string | null;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState('0');
  const [client, setClient] = useState<SupraClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);

  // Initialize Supra client and check wallet installation
  useEffect(() => {
    const initializeClient = async () => {
      try {
        const supraClient = await getSupraClient(RPC_TESTNET);
        setClient(supraClient);
        setIsWalletInstalled(isStarKeyInstalled());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize client';
        setError(message);
        console.error('Error initializing Supra client:', err);
      }
    };

    initializeClient();
  }, []);

  // Fetch balance when address changes
  useEffect(() => {
    if (!address || !client) return;

    const fetchBalance = async () => {
      try {
        const balanceQuants = await getBalanceFromSupra(client, address);
        const balanceSupra = formatQuantsToSupra(balanceQuants);
        setBalance(balanceSupra);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setBalance('0');
      }
    };

    // Fetch immediately
    fetchBalance();

    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address, client]);

  // Listen for wallet account changes
  useEffect(() => {
    if (!isWalletInstalled) return;

    const unsubscribe = onAccountChange((newAccount) => {
      if (newAccount) {
        setAddress(newAccount);
        setIsConnected(true);
      } else {
        setAddress(null);
        setIsConnected(false);
        setBalance('0');
      }
    });

    return unsubscribe;
  }, [isWalletInstalled]);

  // Listen for wallet disconnect
  useEffect(() => {
    if (!isWalletInstalled) return;

    const unsubscribe = onDisconnect(() => {
      setAddress(null);
      setIsConnected(false);
      setBalance('0');
      setError('Wallet disconnected');
    });

    return unsubscribe;
  }, [isWalletInstalled]);

  const connectWallet = useCallback(async () => {
    if (!isWalletInstalled) {
      setError('StarKey wallet not installed. Install from https://starkey.app');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connectedAddress = await connectStarKey();
      setAddress(connectedAddress);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [isWalletInstalled]);

  const disconnectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await disconnectStarKey();
      setAddress(null);
      setIsConnected(false);
      setBalance('0');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(message);
      console.error('Wallet disconnection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: WalletContextType = {
    address,
    isConnected,
    isStarKeyInstalled: isWalletInstalled,
    connectWallet,
    disconnectWallet,
    balance,
    client,
    loading,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
