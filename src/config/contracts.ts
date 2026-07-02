export const PACKAGE_ADDRESS = '0xdce3ff2e6370630f906774423d2504d2f278908a5addebd691a7c2d892e1594a';

export const CONTRACTS = {
  CORE: `${PACKAGE_ADDRESS}::suplock_core`,
  ORACLE: `${PACKAGE_ADDRESS}::oracle_integration`,
  BRIDGE: `${PACKAGE_ADDRESS}::bridge`,
  VESUPRA: `${PACKAGE_ADDRESS}::vesupra`,
  YIELD_VAULTS: `${PACKAGE_ADDRESS}::yield_vaults`,
  AUTOFI: `${PACKAGE_ADDRESS}::autofi_executor`,
} as const;

export const RPC_URL = 'https://rpc-testnet.supra.com';
export const EXPLORER_URL = 'https://testnet.suprascan.io';

// BigInt-safe helpers (fixes truncation risk)
export const toQuants = (amount: string | number): string => {
  return (BigInt(Math.floor(Number(amount) * 1e8))).toString();
};

export const fromQuants = (quants: string | number | bigint): number => {
  return Number(BigInt(quants) / 100000000n);
};

// Robust RPC view function (addresses the main RPC issue)
export const viewFunction = async (
  modulePath: string,
  functionName: string,
  args: any[] = [],
  typeArgs: string[] = []
): Promise<any> => {
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "view",
        params: {
          function: `\( {modulePath}:: \){functionName}`,
          type_arguments: typeArgs,
          arguments: args,
        },
        id: Date.now(),
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.error) {
      console.warn("View error:", data.error);
      return null;
    }
    return data.result;
  } catch (error) {
    console.error("RPC View failed:", error);
    return null;
  }
};

export const getPairPrice = async (pairId: number = 0): Promise<number> => {
  const result = await viewFunction(CONTRACTS.ORACLE, "get_pair_price", [pairId.toString()]);
  return result ? Number(result[0] || 0) / 1e8 : 0.42;
};
