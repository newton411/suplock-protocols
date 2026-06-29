import { CONTRACTS } from '../config/contracts';
import { BCS } from 'supra-l1-sdk';

export const useSupraContract = () => {
  const supra = (window as any).starkey?.supra;
  const executeTransaction = async (module: keyof typeof CONTRACTS, func: string, args: any[] = []) => {
    const accs = await supra?.connect();
    const payload = [accs[0], 0, CONTRACTS[module], func, [], args];
    return await supra.createRawTransactionData(payload);
  };
  return { executeTransaction, BCS };
};
