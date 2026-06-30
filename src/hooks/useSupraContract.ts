import { CONTRACTS } from '../config/contracts';
import { BCS } from 'supra-l1-sdk';

export const useSupraContract = () => {
  const executeTransaction = async (
    module: keyof typeof CONTRACTS,
    func: string,
    args: any[] = [],
    typeArgs: string[] = []
  ) => {
    try {
      const starkey = (window as any).starkey;
      if (!starkey) {
        throw new Error("StarKey wallet not found. Please install the extension.");
      }

      // Ensure we are connected
      const accounts = await starkey.connect();
      if (!accounts || accounts.length === 0) {
        throw new Error("No account connected. Please connect your StarKey wallet.");
      }

      const account = accounts[0];

      // Prepare the payload for Starkey
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACTS[module]}::${func}`,
        type_arguments: typeArgs,
        arguments: args,
      };

      console.log(`🚀 Executing ${CONTRACTS[module]}::${func} with payload:`, payload);

      // Sign and submit the transaction
      const txHash = await starkey.signAndSubmitTransaction(payload);
      
      console.log("✅ Transaction submitted successfully:", txHash);
      return txHash;
    } catch (err: any) {
      console.error("❌ Transaction execution failed:", err);
      throw err;
    }
  };

  return { executeTransaction, BCS };
};
