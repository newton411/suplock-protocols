import { useState, useEffect } from 'react';

interface StarkeyWallet {
  address: string | null;
  isConnected: boolean;
  sendTransaction: (payload: any) => Promise<any>;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useStarkeyWallet = (): StarkeyWallet => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      // StarKey / Supra wallet injection
      if ((window as any).starkey) {
        const result = await (window as any).starkey.connect();
        setAddress(result.address);
        setIsConnected(true);
      } else {
        alert("Please install StarKey wallet extension");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendTransaction = async (payload: any) => {
    if (!(window as any).starkey) throw new Error("Wallet not connected");
    return await (window as any).starkey.sendTransaction(payload);
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  return { address, isConnected, sendTransaction, connect, disconnect };
};
