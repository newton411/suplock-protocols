import React from 'react';
import { useSupraContract } from '../hooks/useSupraContract';

export const VaultPanel = () => {
  const { executeTransaction, BCS } = useSupraContract();

  const handleDeposit = async () => {
    // Calls yield_vaults::deposit_and_split
    await executeTransaction('YIELD_VAULTS', 'deposit_and_split', [
      BCS.bcsSerializeUint64(100000000), // 1 SUPRA
      BCS.bcsSerializeUint64(0),         // Strategy ID
    ]);
  };

  return (
    <div className="border border-green-900 p-6 bg-black text-green-500 font-mono shadow-[0_0_15px_rgba(0,50,0,0.5)]">
      <h2 className="text-2xl mb-4 text-green-400 font-bold tracking-widest">YIELD_VAULT_INTERFACE&lt;/h2&gt;
      &lt;p className=&#34;text-xs text-green-800 mb-6&#34;&gt;ESTIMATED_APY: 12.4% [REAL_TIME]&lt;/p&gt;
      <button onClick={handleDeposit} className="w-full py-3 border border-green-400 hover:bg-green-400 hover:text-black transition-all">
        EXECUTE_DEPOSIT_AND_SPLIT
      </button>
    </div>
  );
};
