'use client';
import React, { useState, useEffect } from 'react';
import { useStarkeyWallet } from '../hooks/useStarkeyWallet';
import { CONTRACTS, toQuants, getPairPrice } from '../config/contracts';

export const LockUI = () => {
  const { address, isConnected, connect, disconnect } = useStarkeyWallet();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(7776000); // 3 months
  const [loading, setLoading] = useState(false);
  const [supraPrice, setSupraPrice] = useState(0.42);

  // Real-time price ticker
  useEffect(() => {
    const interval = setInterval(async () => {
      const price = await getPairPrice(0);
      setSupraPrice(price);
    }, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLock = async () => {
    if (!isConnected || !amount) return;
    setLoading(true);
    try {
      const provider = (window as any).starkey?.supra;
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACTS.CORE}::create_lock`,
        type_arguments: [],
        arguments: [toQuants(amount), duration.toString()],
      };
      const tx = await provider.sendTransaction(payload);
      alert(`✅ Lock submitted! Tx: ${tx}`);
    } catch (err: any) {
      alert("❌ Failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border border-green-500/30 bg-black/70 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Lock SUPRA</h3>
        <div className="text-sm text-green-400">Price: ${supraPrice.toFixed(4)}</div>
      </div>

      {!isConnected ? (
        <button onClick={connect} className="w-full py-4 bg-green-600 font-bold rounded-xl">
          Connect StarKey Wallet
        </button>
      ) : (
        <>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (e.g. 1000)"
            className="w-full p-4 bg-black border border-green-500/30 text-green-400 mb-4 rounded-xl"
          />
          <button 
            onClick={handleLock}
            disabled={loading || !amount}
            className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold rounded-xl"
          >
            {loading ? "Sending Transaction..." : "LOCK ASSETS (Real Tx)"}
          </button>
          <button onClick={disconnect} className="mt-3 text-red-400 text-sm">Disconnect</button>
        </>
      )}
    </div>
  );
};
