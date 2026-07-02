import React from 'react';
import { useSupraContract } from '../hooks/useSupraContract';
import { useWallet } from '../hooks/useStarkeyWallet';
import { toast } from 'sonner';

export const GovernancePanel = () => {
  const { execute } = useSupraContract();           // Use existing 'execute'
  const { connected, connect } = useWallet();

  const handleStake = async () => {
    if (!connected) {
      toast.error('Please connect wallet first');
      connect();
      return;
    }

    try {
      await execute('YIELD_VAULTS', 'deposit', ['100000000']); // example 1 SUPRA
      toast.success('Stake successful!');
    } catch (err: any) {
      toast.error(err.message || 'Stake failed');
    }
  };

  return (
    <div className="glass p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-4">Governance & Restaking</h2>
      <button 
        onClick={handleStake}
        className="matrix-btn-primary w-full py-3"
      >
        Stake / Restake Example
      </button>
    </div>
  );
};

export default GovernancePanel;
