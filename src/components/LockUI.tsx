import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useStarkeyWallet'; // adjust if hook path differs
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
  const [selectedTier, setSelectedTier] = useState<number>(1); // default 3 months
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number>(0.42);
  const [txHash, setTxHash] = useState<string>('');

  // Live price ticker
  useEffect(() => {
    const fetchPrice = async () => {
      const p = await getPairPrice(0);
      if (p > 0) setPrice(p);
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLock = async () => {
    if (!address || !amount || Number(amount) <= 0) {
      alert("Please enter a valid amount and connect wallet");
      return;
    }

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

      setTxHash(tx.hash || tx);

      alert(`✅ Lock Transaction Sent!\n\nTx Hash: ${tx.hash || tx}\n\nView: \( {EXPLORER_URL}/tx/ \){tx.hash || tx}`);
    } catch (error: any) {
      console.error(error);
      alert("Transaction failed: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const selected = LOCK_TIERS[selectedTier];

  return (
    <div className="glass-card p-6 rounded-2xl border border-cyan-400/30 bg-black/60">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
        Lock SUPRA — Yield Forever
      </h2>

      <div className="mb-4 text-sm">
        Current Price: <span className="text-green-400 font-medium">${price.toFixed(4)}</span>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.0 SUPRA"
        className="w-full p-4 bg-black/70 border border-cyan-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 mb-6"
      />

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Select Lock Tier</p>
        <div className="grid grid-cols-5 gap-2">
          {LOCK_TIERS.map((tier, index) => (
            <button
              key={index}
              onClick={() => setSelectedTier(index)}
              className={`p-3 text-xs rounded-xl transition-all border ${
                selectedTier === index 
                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold' 
                  : 'bg-black/50 border-cyan-500/30 hover:border-cyan-400'
              }`}
            >
              {tier.label}<br />
              <span className="opacity-75">+{tier.multiplier}x</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-300 mb-6">
        Boost: <span className="text-green-400 font-bold">{selected.multiplier}x</span> | 
        Unlock in {selected.days} days
      </div>

      <button
        onClick={handleLock}
        disabled={loading || !amount || !address}
        className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 via-green-500 to-emerald-500 hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {loading ? "CONFIRMING ON SUPRA..." : `LOCK ${amount || ''} SUPRA`}
      </button>

      {txHash && (
        <p className="mt-4 text-center text-xs text-cyan-400 break-all">
          Tx: <a href={`\( {EXPLORER_URL}/tx/ \){txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
            {txHash.slice(0, 12)}...
          </a>
        </p>
      )}
    </div>
  );
};
