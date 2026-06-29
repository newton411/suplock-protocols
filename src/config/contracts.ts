export const PACKAGE_ADDRESS = '0xdce3ff2e6370630f906774423d2504d2f278908a5addebd691a7c2d892e1594a';
export const CONTRACTS = {
  CORE: `${PACKAGE_ADDRESS}::suplock_core`,
  INTEGRATION: `${PACKAGE_ADDRESS}::suplock_integration`,
  ORACLE: `${PACKAGE_ADDRESS}::oracle_integration`,
  AUTOFI: `${PACKAGE_ADDRESS}::autofi_executor`,
  BRIDGE: `${PACKAGE_ADDRESS}::bridge`,
  GENESIS_NFT: `${PACKAGE_ADDRESS}::genesis_nft`,
  RESTAKE: `${PACKAGE_ADDRESS}::restake`,
  AI_AGENT: `${PACKAGE_ADDRESS}::suplock_ai_agent`,
  SUPRESERVE: `${PACKAGE_ADDRESS}::supreserve`,
  YIELD_VAULTS: `${PACKAGE_ADDRESS}::yield_vaults`,
} as const;
export const RPC_URL = 'https://rpc-testnet.supra.com';
export const EXPLORER_URL = 'https://testnet.suprascan.io';
