import React from 'react';
import { useSupraContract } from '../hooks/useSupraContract';

export const GovernancePanel = () => {
  const { executeTransaction, BCS } = useSupraContract();

  const handleStake = async () => {
    // Calls restake::deposit
    await executeTransaction('RESTAKE', 'deposit', [
      BCS.bcsSerializeUint64(500000000) // 5 SUPRA for Voting Power
    ]);
  };

  return (
    <div className="border border-green-900 p-6 bg-black text-green-500 font-mono">
      <h3 className="text-lg mb-4 text-green-400">GOVERNANCE_PROTOCOL&lt;/h3&gt;
      <div className="mb-6 space-y-2 text-xs">
        &lt;p&gt;ACTIVE_PROPOSALS: 04&lt;/p&gt;
        &lt;p&gt;VOTING_POWER: 0.00&lt;/p&gt;
      &lt;/div&gt;
      <button onClick={handleStake} className="w-full py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-all">
        ACQUIRE_VOTING_POWER
      &lt;/button&gt;
    </div>
  );
};
