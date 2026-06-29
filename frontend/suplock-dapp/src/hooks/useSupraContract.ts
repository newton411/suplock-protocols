import { CONTRACTS } from '../config/contracts';

export const useSupraContract = () => {
  const execute = async (module: keyof typeof CONTRACTS, func: string, args: any[] = []) => {
    try {
      const starkey = (window as any).starkey;
      if (!starkey) throw new Error("StarKey wallet not found");

      const accounts = await starkey.connect();
      if (!accounts?.length) throw new Error("No account connected");

      const payload = {
        type: "entry_function_payload",
        function: `\( {CONTRACTS[module]}:: \){func}`,
        type_arguments: [],
        arguments: args,
      };

      const tx = await starkey.signAndSubmitTransaction(payload);
      console.log("✅ Transaction submitted:", tx);
      return tx;
    } catch (err: any) {
      console.error("❌ Transaction failed:", err);
      throw err;
    }
  };

  return { execute };
};
