import { useState } from 'react';
import { EXPLORER_URL } from './config/contracts'; // adjust path if needed

export const useTransaction = () => {
  const [isConfirming, setIsConfirming] = useState(false);

  const waitForConfirmation = async (txHash: string, maxAttempts = 20): Promise<any> => {
    setIsConfirming(true);
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch('https://rpc-testnet.supra.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "getTransaction",
            params: [txHash],
            id: Date.now(),
          }),
        });

        const data = await response.json();
        if (data.result && data.result.success) {
          setIsConfirming(false);
          return data.result;
        }
      } catch (e) {
        // ignore transient errors
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3s poll
    }

    setIsConfirming(false);
    throw new Error("Transaction confirmation timeout");
  };

  return { waitForConfirmation, isConfirming };
};
