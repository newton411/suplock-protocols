export const PACKAGE_ADDRESS = '0xdce3ff2e6370630f906774423d2504d2f278908a5addebd691a7c2d892e1594a';

export const CONTRACTS = {
  CORE: `${PACKAGE_ADDRESS}::suplock_core`,
  INTEGRATION: `${PACKAGE_ADDRESS}::suplock_integration`,
  ORACLE: `${PACKAGE_ADDRESS}::oracle_integration`,
  BRIDGE: `${PACKAGE_ADDRESS}::bridge`,
  GENESIS_NFT: `${PACKAGE_ADDRESS}::genesis_nft`,
  YIELD_VAULTS: `${PACKAGE_ADDRESS}::yield_vaults`,
} as const;

export const RPC_URL = 'https://rpc-testnet.supra.com';
export const EXPLORER_URL = 'https://testnet.suprascan.io';

export const toQuants = (amount: number | string): string => 
  (BigInt(Math.floor(Number(amount) * 1e8))).toString();

export const fromQuants = (quants: string | number): number => 
  Number(quants) / 1e8;

// Real-time Oracle Helper
export const getPairPrice = async (pairId: number = 0): Promise<number> => {
  try {
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "view",
        params: {
          function: `${CONTRACTS.ORACLE}::get_pair_price`,
          type_arguments: [],
          arguments: [pairId.toString()],
        },
        id: 1,
      }),
    });
    const data = await res.json();
    return Number(data.result?.[0] || 0) / 1e8;
  } catch (e) {
    console.error("Oracle error:", e);
    return 0.42; // fallback
  }
};
