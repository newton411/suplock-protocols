import { SupraClient } from 'supra-l1-sdk';

// Testnet RPC - Use /rpc/v3/ (v1/v2 deprecated)
export const RPC_TESTNET = 'https://rpc-testnet.supra.com/';
export const RPC_MAINNET = 'https://rpc-mainnet.supra.com/';

let clientInstance: SupraClient | null = null;

/**
 * Initialize or retrieve the Supra RPC client
 * @param rpcUrl - RPC endpoint URL (defaults to testnet)
 * @returns SupraClient instance
 */
export async function getSupraClient(rpcUrl: string = RPC_TESTNET): Promise<SupraClient> {
  if (clientInstance && clientInstance['_nodeUrl'] === rpcUrl) {
    return clientInstance;
  }

  clientInstance = await SupraClient.init(rpcUrl);
  return clientInstance;
}

/**
 * Reset client instance (useful for switching networks)
 */
export function resetSupraClient(): void {
  clientInstance = null;
}

export { SupraClient };
