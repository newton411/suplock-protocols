import React from 'react';
import { LockUI } from '../components/LockUI';
import { useWallet } from '../hooks/useStarkeyWallet';

const AiDashboard = () => {
  const { address, isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 neon-text">SUPLOCK Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LockUI - Prominently placed */}
          <div>
            <LockUI />
          </div>

          {/* Quick Stats / Other Panels */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Wallet Status</h2>
              <p className="text-green-400">
                {isConnected ? `Connected: ${address?.slice(0,8)}...` : 'Wallet not connected'}
              </p>
            </div>

            {/* Add more panels here later (Vaults, Swap summary, etc.) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDashboard;
