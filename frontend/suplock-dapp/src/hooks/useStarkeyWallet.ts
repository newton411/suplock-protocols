'use client';
import { useState, useEffect, useCallback } from 'react';

export function useStarkeyWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = (window as any).starkey?.supra;

  const connect = useCallback(async () => {
    if (!provider) {
      window.open('https://starkey.app/', '_blank');
      setError('Please install StarKey wallet');
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await provider.connect();
      if (accounts?.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    if (provider) await provider.disconnect();
    setAddress(null);
    setIsConnected(false);
  }, [provider]);

  return { address, isConnected, isConnecting, error, connect, disconnect };
}
