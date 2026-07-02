import React from 'react';
import { useSupraContract } from '../hooks/useSupraContract';
import { useWallet } from '../hooks/useStarkeyWallet';
import { toast } from 'sonner';

export const GovernancePanel = () => {
  const { execute } = useSupraContract();   // Correct method name
  const { connected, connect } = useWallet();

  const handleStake = async () => {
    if (!connected) {
      toast.error('Please connect wallet first');
      connect();
      return;
    }

    try {
      // Example: deposit to yield vault
      await execute('YIELD_VAULTS', 'deposit', ['100000000']); // 1 SUPRA in quants
      toast.success('Stake / Restake successful!');
    } catch (err: any) {
      toast.error(err.message || 'Transaction failed');
      console.error(err);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl border border-cyan-500/30">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Governance & Restaking</h2>
      <p className="text-sm text-gray-400 mb-6">Example action using real contract call</p>
      
      <button 
        onClick={handleStake}
        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 font-bold rounded-xl"
      >
        Test Stake / Restake
      </button>
    </div>
  );
};

export default GovernancePanel;
