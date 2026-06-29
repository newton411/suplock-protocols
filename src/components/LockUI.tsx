import React, { useState } from 'react';
import { useSupraContract } from '../hooks/useSupraContract';

export const LockUI: React.FC = () => {
  const { executeTransaction, BCS } = useSupraContract();
  const [status, setStatus] = useState&lt;string&gt;('IDLE');

  const handleLock = async () => {
    try {
      setStatus('INITIATING');
      // Calls the real 'create_lock' function in your smart contract
      const txHash = await executeTransaction('CORE', 'create_lock', [
        BCS.bcsSerializeUint64(100000000), // 1.0 SUPRA
        BCS.bcsSerializeUint64(86400)      // 24 Hour Lock
      ]);
      setStatus('SUCCESS');
      console.log("Transaction Hash:", txHash);
    } catch (err) {
      setStatus('ERROR');
      console.error(err);
    }
  };

  return (
    <div className="p-4 border border-green-900 bg-black text-green-500 font-mono">
      <h2 className="text-xl mb-4 text-green-400">VAULT_LOCKER_V1&lt;/h2&gt;
      &lt;div className=&#34;mb-4 text-xs text-green-800&#34;&gt;STATUS: {status}&lt;/div&gt;
      <button 
        onClick={handleLock}
        className="w-full py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-all"
      >
        EXECUTE_LOCK (1.0 SUPRA)
      &lt;/button&gt;
    &lt;/div&gt;
  );
};

export default LockUI;
