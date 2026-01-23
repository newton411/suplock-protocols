import React, { useState, useEffect } from 'react';

interface DividendData {
  totalAccumulated: number;
  claimable: number;
  nextDistribution: string;
  userShare: number;
  totalDistributed: number;
}

export const DividendPanel: React.FC = () => {
  const [dividendData, setDividendData] = useState<DividendData>({
    totalAccumulated: 125000,
    claimable: 245.67,
    nextDistribution: '2024-02-01',
    userShare: 0.0012,
    totalDistributed: 2345678,
  });

  const [claiming, setClaiming] = useState(false);

  const handleClaimDividends = async () => {
    setClaiming(true);
    try {
      // Mock claim transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Claiming ${dividendData.claimable} USDC dividends`);
      setDividendData(prev => ({ ...prev, claimable: 0 }));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dividend Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gold mb-4">💰 Your Dividends</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Claimable:</span>
              <span className="text-2xl font-bold text-gold">${dividendData.claimable.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Share:</span>
              <span className="text-gold">{(dividendData.userShare * 100).toFixed(4)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Distribution:</span>
              <span className="text-gold">{dividendData.nextDistribution}</span>
            </div>
          </div>
          <button
            onClick={handleClaimDividends}
            disabled={claiming || dividendData.claimable === 0}
            className="w-full mt-4 py-3 bg-gold hover:bg-darkGold text-dark font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? 'Claiming...' : dividendData.claimable > 0 ? 'Claim Dividends' : 'No Dividends Available'}
          </button>
        </div>

        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gold mb-4">📊 Protocol Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Accumulated:</span>
              <span className="text-gold">${dividendData.totalAccumulated.toLocaleString()} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Distributed:</span>
              <span className="text-gold">${dividendData.totalDistributed.toLocaleString()} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Distribution Rate:</span>
              <span className="text-gold">35% of fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUPReserve Distribution */}
      <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gold mb-4">🏦 SUPReserve Distribution</h3>
        <p className="text-gray-300 mb-6">
          All protocol fees are collected in USDC and automatically distributed according to the current mode.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark rounded-lg p-4 border border-gold/30">
            <h4 className="text-lg font-bold text-gold mb-3">🔥 Pre-Floor Mode (Current)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Buyback & Burn:</span>
                <span className="text-red-400 font-bold">50%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">USDC Dividends:</span>
                <span className="text-gold font-bold">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">veSUPRA Rewards:</span>
                <span className="text-blue-400 font-bold">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Treasury/POL:</span>
                <span className="text-green-400 font-bold">5%</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Active while circulating supply > 10B SUPRA
            </div>
          </div>

          <div className="bg-dark rounded-lg p-4 border border-gray-600 opacity-60">
            <h4 className="text-lg font-bold text-gray-400 mb-3">🎯 Post-Floor Mode</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Buyback & Burn:</span>
                <span className="text-gray-500 font-bold">0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">USDC Dividends:</span>
                <span className="text-gray-500 font-bold">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">veSUPRA Rewards:</span>
                <span className="text-gray-500 font-bold">12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Treasury/POL:</span>
                <span className="text-gray-500 font-bold">12.5%</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Activates when circulating supply ≤ 10B SUPRA
            </div>
          </div>
        </div>

        <div className="mt-6 bg-dark rounded-lg p-4 border border-gold/30">
          <h4 className="text-lg font-bold text-gold mb-2">📈 Floor Progress</h4>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Current Supply: 45.2B SUPRA</span>
            <span className="text-gray-400">Target: 10B SUPRA</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-gold h-3 rounded-full" 
              style={{ width: '22%' }}
            />
          </div>
          <div className="text-center text-sm text-gray-400 mt-2">
            22% progress to floor activation
          </div>
        </div>
      </div>

      {/* Dividend History */}
      <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gold mb-4">📋 Recent Distributions</h3>
        <div className="space-y-3">
          {[
            { date: '2024-01-01', amount: 234.56, claimed: true },
            { date: '2023-12-01', amount: 189.23, claimed: true },
            { date: '2023-11-01', amount: 156.78, claimed: true },
            { date: '2023-10-01', amount: 198.45, claimed: false },
          ].map((distribution, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
              <span className="text-gray-400">{distribution.date}</span>
              <span className="text-gold">${distribution.amount.toFixed(2)} USDC</span>
              <span className={`text-sm px-2 py-1 rounded ${
                distribution.claimed ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
              }`}>
                {distribution.claimed ? 'Claimed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};