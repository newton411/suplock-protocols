import React, { useState } from 'react';

interface LockUIProps {
  onLock: (amount: string, duration: number) => Promise<void>;
  isLoading: boolean;
}

export const LockUI: React.FC<LockUIProps> = ({ onLock, isLoading }) => {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('7776000'); // 3 months default
  const [boost, setBoost] = useState(1.0);

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dur = parseInt(e.target.value);
    setDuration(e.target.value);
    
    // Calculate boost: 1 + (lock_time / max_lock_time) * 1.5
    const maxDuration = 126_144_000; // 4 years
    const calculatedBoost = 1 + (dur / maxDuration) * 1.5;
    setBoost(Math.min(calculatedBoost, 2.5)); // Cap at 2.5x
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && duration) {
      await onLock(amount, parseInt(duration));
      setAmount('');
    }
  };

  return (
    <div className="bg-darkGray border border-gold rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gold mb-4">Lock $SUPRA</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Amount (SUPRA)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            className="w-full px-4 py-2 bg-dark border border-gold rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Lock Duration
          </label>
          <select
            value={duration}
            onChange={handleDurationChange}
            className="w-full px-4 py-2 bg-dark border border-gold rounded text-white focus:outline-none focus:ring-2 focus:ring-gold"
            disabled={isLoading}
          >
            <option value="7776000">3 Months (1.0x)</option>
            <option value="15552000">6 Months (1.25x)</option>
            <option value="31104000">1 Year (1.75x)</option>
            <option value="62208000">2 Years (2.15x)</option>
            <option value="126144000">4 Years (2.5x)</option>
          </select>
        </div>

        <div className="bg-dark rounded p-3 border border-gold/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Boost Multiplier:</span>
            <span className="text-gold font-bold text-lg">{boost.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-300">Est. Annual Yield:</span>
            <span className="text-gold">{amount ? ((parseFloat(amount) * 0.12 * boost).toFixed(2)) : '0'} SUPRA</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount}
          className="w-full py-3 bg-gold hover:bg-darkGold text-dark font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isLoading ? 'Locking...' : 'Lock SUPRA'}
        </button>
      </form>
    </div>
  );
};
