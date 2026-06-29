import React, { useState } from 'react';
import { useSupraContract } from '../hooks/useSupraContract';
import { toQuants } from '../config/contracts';

export const LockUI = () => {
  const { execute } = useSupraContract();
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(7776000); // 3 months in seconds
  const [loading, setLoading] = useState(false);

  const handleLock = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const tx = await execute('CORE', 'create_lock', [
        toQuants(amount),
        duration.toString(),
      ]);
      alert(`Lock successful! Tx: ${tx.hash}`);
    } catch (err: any) {
      alert("Failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border border-green-500/30 bg-black/50">
      <h3 className="text-xl font-bold mb-4">Lock SUPRA</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (e.g. 1000)"
        className="w-full p-3 bg-black border border-green-500/30 text-green-400 mb-4"
      />
      <button 
        onClick={handleLock}
        disabled={loading}
        className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold"
      >
        {loading ? "Sending..." : "LOCK ASSETS (Real Transaction)"}
      </button>
    </div>
  );
};
