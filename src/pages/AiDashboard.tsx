import React from 'react';
import { LockUI } from '../components/LockUI';
import { useStarkeyWallet } from '../hooks/useStarkeyWallet';

const AiDashboard = () => {
  const { address, isConnected, connect } = useStarkeyWallet();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 neon-text">SUPLOCK Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Lock Component */}
          <div>
            <LockUI />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-cyan-500/30">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Wallet Status</h2>
              <p className="text-green-400 text-lg">
                {isConnected 
                  ? `✅ Connected: ${address?.slice(0, 8)}...` 
                  : 'Wallet not connected'}
              </p>
              {!isConnected && (
                <button 
                  onClick={connect}
                  className="mt-4 px-6 py-2 bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDashboard;
