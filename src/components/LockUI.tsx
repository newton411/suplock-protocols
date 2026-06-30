import React, { useState } from 'react';
import { useSupraContract } from '../hooks/useSupraContract';

export const LockUI: React.FC = () => {
  const { executeTransaction, BCS } = useSupraContract();
  const [status, setStatus] = useState<string>('IDLE');

  const handleLock = async () => {
    try {
      setStatus('INITIATING');
      // Calls the real 'create_lock' function in your smart contract
      const txHash = await executeTransaction('CORE', 'create_lock', [
        BCS.bcsSerializeUint64(BigInt(100000000)), // 1.0 SUPRA
        BCS.bcsSerializeUint64(BigInt(86400))      // 24 Hour Lock
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
      <h2 className="text-xl mb-4 text-green-400">VAULT_LOCKER_V1</h2>
      <div className="mb-4 text-xs text-green-800">STATUS: {status}</div>
      <button 
        onClick={handleLock}
        className="w-full py-2 border border-green-500 hover:bg-green-500 hover:text-black transition-all"
      >
        EXECUTE_LOCK (1.0 SUPRA)
      </button>
    </div>
  );
};

export default LockUI;
