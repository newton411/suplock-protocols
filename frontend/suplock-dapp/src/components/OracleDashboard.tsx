import React from 'react';
import { useSupraContract } from '../hooks/useSupraContract';

export const OracleDashboard = () => {
  const { executeTransaction, BCS } = useSupraContract();

  const handlePriceUpdate = async () => {
    // Calls oracle_integration::get_pair_price for BTC/USDT (Pair 0)
    await executeTransaction('ORACLE', 'get_pair_price', [
      BCS.bcsSerializeUint64(0)
    ]);
  };

  return (
    <div className="border border-green-900 p-6 bg-black text-green-500 font-mono">
      <h2 className="text-xl mb-4 text-green-400 font-bold underline">ORACLE_FEED_MONITOR&lt;/h2&gt;
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-green-900 p-2">
          &lt;span className=&#34;text-[10px] block&#34;&gt;BTC_USDT&lt;/span&gt;
          <span className="text-lg">FETCHING...</span>
        </div>
        <div className="border border-green-900 p-2">
          <span className="text-[10px] block">SUPRA_USDC&lt;/span&gt;
          &lt;span className=&#34;text-lg&#34;&gt;FETCHING...&lt;/span&gt;
        &lt;/div&gt;
      &lt;/div&gt;
      <button onClick={handlePriceUpdate} className="w-full py-2 bg-green-900 text-green-100 hover:bg-green-400 hover:text-black transition-all">
        REFRESH_ON_CHAIN_DATA
      </button>
    </div>
  );
};
