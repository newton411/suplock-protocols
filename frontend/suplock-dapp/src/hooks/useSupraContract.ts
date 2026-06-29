import { CONTRACTS } from '../config/contracts';
import { BCS } from 'supra-l1-sdk';

export const useSupraContract = () => {
  const supra = (window as any).starkey?.supra;

  const executeTransaction = async (module: keyof typeof CONTRACTS, functionName: string, args: any[] = [], typeArgs: string[] = []) => {
    try {
      if (!supra) throw new Error("Starkey not available");
      const accounts = await supra.connect();
      if (!accounts?.length) throw new Error("No wallet connected");

      const payload = [accounts[0], 0, CONTRACTS[module], functionName, typeArgs, args];
      const result = await supra.createRawTransactionData(payload);
      return result;
    } catch (error: any) {
      console.error("Tx Error:", error.message);
      throw error;
    }
  };

  return { executeTransaction, BCS };
};
