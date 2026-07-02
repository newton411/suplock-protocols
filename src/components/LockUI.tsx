import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useStarkeyWallet'; // Adjust path if needed
import { CONTRACTS, toQuants, getPairPrice, EXPLORER_URL } from '../config/contracts';

const LOCK_TIERS = [
  { days: 30,  multiplier: 1.0,  label: "1 Month" },
  { days: 90,  multiplier: 1.5,  label: "3 Months" },
  { days: 180, multiplier: 2.2,  label: "6 Months" },
  { days: 365, multiplier: 3.0,  label: "1 Year" },
  { days: 730, multiplier: 4.0,  label: "2 Years" },
];

export const LockUI: React.FC = () => {
  const { address, sendTransaction } = useWallet();
  const [amount, setAmount] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState(1); // Default 3 months
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0.42);
  const [txHash, setTxHash] = useState<string>('');

  // Real-time price ticker
  useEffect(() => {
    const fetchPrice = async () => {
      const p = await getPairPrice(0);
      setPrice(p);
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLock = async () => {
    if (!address || !amount) return;

    setLoading(true);
    try {
      const tier = LOCK_TIERS[selectedTier];
      const quantAmount = toQuants(amount);

      const payload = {
        function: `${CONTRACTS.CORE}::create_lock`,
        type_arguments: [],
        arguments: [quantAmount, tier.days.toString()],
      };

      const tx = await sendTransaction(payload);

      setTxHash(tx.hash);

      // Wait for confirmation (better finality)
      alert(`Transaction sent! Hash: ${tx.hash}\n\nView on explorer: \( {EXPLORER_URL}/tx/ \){tx.hash}`);

      // Optional: Poll for receipt here in future
    } catch (error: any) {
      console.error(error);
      alert("Transaction failed: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const selected = LOCK_TIERS[selectedTier];

  return (
    <div className="glass p-6 rounded-2xl border border-cyan-500/30">
      <h2 className="text-2xl font-bold mb-4 text-cyan-400">Lock SUPRA</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-400">Current SUPRA Price: <span className="text-green-400">${price.toFixed(4)}</span></p>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount to lock"
        className="w-full p-3 bg-black/50 border border-cyan-500/50 rounded-lg mb-4 text-white"
      />

      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Lock Duration (Tier)</p>
        <div className="grid grid-cols-5 gap-2">
          {LOCK_TIERS.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTier(idx)}
              className={`p-2 text-xs rounded-lg transition-all ${
                selectedTier === idx 
                  ? 'bg-cyan-500 text-black font-bold' 
                  : 'bg-black/50 border border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              {tier.label}<br/>
              <span className="opacity-75">+{tier.multiplier}x</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 text-sm text-gray-300">
        Projected Boost: <span className="text-green-400 font-bold">{selected.multiplier}x</span><br/>
        Unlock in {selected.days} days
      </div>

      <button
        onClick={handleLock}
        disabled={loading || !amount || !address}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 disabled:opacity-50 font-bold rounded-xl text-black"
      >
        {loading ? "Sending Transaction..." : `LOCK ${amount || ''} SUPRA`}
      </button>

      {txHash && (
        <p className="mt-3 text-xs text-center text-cyan-400">
          Tx: <a href={`\( {EXPLORER_URL}/tx/ \){txHash}`} target="_blank" className="underline">{txHash.slice(0, 8)}...</a>
        </p>
      )}
    </div>
  );
};
