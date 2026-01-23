import React, { useState } from 'react';

interface Vault {
  id: string;
  name: string;
  type: 'SUPRA' | 'EigenLayer' | 'Symbiotic';
  apy: number;
  tvl: string;
  description: string;
  icon: string;
}

export const VaultPanel: React.FC = () => {
  const [vaults] = useState<Vault[]>([
    {
      id: 'supra-vault',
      name: 'SUPRA Vault',
      type: 'SUPRA',
      apy: 12.5,
      tvl: '$2.5M',
      description: 'Core SUPRA staking vault with boosted yields',
      icon: '⚡',
    },
    {
      id: 'eigenlayer-steth',
      name: 'EigenLayer stETH',
      type: 'EigenLayer',
      apy: 8.2,
      tvl: '$1.2M',
      description: 'Restake stETH through EigenLayer for additional rewards',
      icon: '🔷',
    },
    {
      id: 'symbiotic-supra',
      name: 'Symbiotic SUPRA',
      type: 'Symbiotic',
      apy: 15.8,
      tvl: '$800K',
      description: 'Dual restaking with Symbiotic protocol',
      icon: '🔗',
    },
  ]);

  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');

  const handleVaultAction = (vaultId: string) => {
    console.log(`${action}ing ${amount} to vault ${vaultId}`);
    setAmount('');
    setSelectedVault(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">$4.5M</div>
          <div className="text-gray-400">Total TVL</div>
        </div>
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">12.2%</div>
          <div className="text-gray-400">Avg APY</div>
        </div>
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">3</div>
          <div className="text-gray-400">Active Vaults</div>
        </div>
        <div className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gold">847</div>
          <div className="text-gray-400">Depositors</div>
        </div>
      </div>

      {/* Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vaults.map((vault) => (
          <div key={vault.id} className="bg-darkGray border border-gold/30 rounded-lg p-6 hover:border-gold transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{vault.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gold">{vault.name}</h3>
                  <span className="text-sm text-gray-400">{vault.type}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gold">{vault.apy}%</div>
                <div className="text-sm text-gray-400">APY</div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">{vault.description}</p>

            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">TVL:</span>
              <span className="text-gold font-bold">{vault.tvl}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedVault(vault.id);
                  setAction('deposit');
                }}
                className="flex-1 py-2 bg-gold hover:bg-darkGold text-dark font-bold rounded transition"
              >
                Deposit
              </button>
              <button
                onClick={() => {
                  setSelectedVault(vault.id);
                  setAction('withdraw');
                }}
                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded transition"
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedVault && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-darkGray border border-gold rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gold">
                {action === 'deposit' ? 'Deposit to' : 'Withdraw from'} {vaults.find(v => v.id === selectedVault)?.name}
              </h3>
              <button
                onClick={() => setSelectedVault(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-dark border border-gold rounded text-white"
                  placeholder="Enter amount"
                />
              </div>

              <div className="bg-dark rounded p-3 border border-gold/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Current APY:</span>
                  <span className="text-gold">{vaults.find(v => v.id === selectedVault)?.apy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Est. Annual Yield:</span>
                  <span className="text-gold">
                    {amount ? (parseFloat(amount) * (vaults.find(v => v.id === selectedVault)?.apy || 0) / 100).toFixed(2) : '0'} tokens
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleVaultAction(selectedVault)}
                  disabled={!amount}
                  className="flex-1 py-2 bg-gold hover:bg-darkGold text-dark font-bold rounded transition disabled:opacity-50"
                >
                  {action === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
                <button
                  onClick={() => setSelectedVault(null)}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PT/YT Splitting Section */}
      <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gold mb-4">Principal/Yield Token Splitting</h3>
        <p className="text-gray-300 mb-4">
          Split your vault positions into Principal Tokens (PT) and Yield Tokens (YT) for advanced trading strategies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark rounded p-4 border border-gold/30">
            <h4 className="text-lg font-bold text-gold mb-2">🎯 Principal Tokens (PT)</h4>
            <p className="text-gray-300 text-sm">
              Represents the underlying principal amount. Trade at discount to face value.
            </p>
          </div>
          <div className="bg-dark rounded p-4 border border-gold/30">
            <h4 className="text-lg font-bold text-gold mb-2">📈 Yield Tokens (YT)</h4>
            <p className="text-gray-300 text-sm">
              Represents future yield streams. Higher risk, higher potential returns.
            </p>
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-gold hover:bg-darkGold text-dark font-bold rounded transition">
          Split Position
        </button>
      </div>
    </div>
  );
};