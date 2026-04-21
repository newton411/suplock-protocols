import { SupraAccount, SupraClient } from 'supra-l1-sdk';

/**
 * StarKey provider interface (injected by wallet extension)
 */
export interface StarKeyProvider {
  connect(): Promise<string[]>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  getAccounts(): Promise<string[]>;
  signTransaction(transaction: any): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    starkey?: {
      supra?: StarKeyProvider;
    };
  }
}

/**
 * Get the StarKey provider from window
 * Guards for SSR/Next.js environments
 */
export function getStarKeyProvider(): StarKeyProvider | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if ('starkey' in window && window.starkey?.supra) {
    return window.starkey.supra;
  }

  return null;
}

/**
 * Check if StarKey wallet is installed
 */
export function isStarKeyInstalled(): boolean {
  return getStarKeyProvider() !== null;
}

/**
 * Connect to StarKey wallet
 * Returns the connected account address
 */
export async function connectStarKey(): Promise<string> {
  const provider = getStarKeyProvider();

  if (!provider) {
    throw new Error(
      'StarKey wallet not found. Install from https://starkey.app'
    );
  }

  try {
    const accounts = await provider.connect();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from StarKey');
    }

    return accounts[0]; // First account is the connected one
  } catch (error) {
    if (error instanceof Error && error.message.includes('already connected')) {
      // If already connected, get the current accounts
      const accounts = await provider.getAccounts();
      if (accounts.length > 0) {
        return accounts[0];
      }
    }
    throw error;
  }
}

/**
 * Get all connected accounts from StarKey
 */
export async function getStarKeyAccounts(): Promise<string[]> {
  const provider = getStarKeyProvider();

  if (!provider) {
    throw new Error('StarKey wallet not found');
  }

  return provider.getAccounts();
}

/**
 * Check if already connected to StarKey
 */
export async function isStarKeyConnected(): Promise<boolean> {
  const provider = getStarKeyProvider();

  if (!provider) {
    return false;
  }

  try {
    return await provider.isConnected();
  } catch {
    return false;
  }
}

/**
 * Disconnect from StarKey wallet
 */
export async function disconnectStarKey(): Promise<void> {
  const provider = getStarKeyProvider();

  if (!provider) {
    throw new Error('StarKey wallet not found');
  }

  try {
    await provider.disconnect();
  } catch (error) {
    console.warn('Error disconnecting StarKey:', error);
  }
}

/**
 * Get account balance from Supra testnet
 */
export async function getBalanceFromSupra(
  client: SupraClient,
  address: string
): Promise<bigint> {
  try {
    const accountInfo = await client.getAccountInfo(address);
    return BigInt(accountInfo.amount || 0);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return BigInt(0);
  }
}

/**
 * Format quants to SUPRA tokens
 * 1 SUPRA = 100,000,000 quants
 */
export function formatQuantsToSupra(quants: bigint | number): string {
  const QUANTS_PER_SUPRA = BigInt(100_000_000);
  const quantsBigInt = typeof quants === 'number' ? BigInt(quants) : quants;
  const integerPart = quantsBigInt / QUANTS_PER_SUPRA;
  const fractionalPart = quantsBigInt % QUANTS_PER_SUPRA;

  const formatted = parseFloat(
    `${integerPart}.${fractionalPart.toString().padStart(8, '0')}`
  ).toFixed(4);

  return formatted;
}

/**
 * Format SUPRA tokens to quants
 */
export function formatSupraToQuants(supra: number | string): bigint {
  const QUANTS_PER_SUPRA = BigInt(100_000_000);
  const supraNum = typeof supra === 'string' ? parseFloat(supra) : supra;
  return BigInt(Math.floor(supraNum * 1e8));
}

/**
 * Listen for wallet account changes
 */
export function onAccountChange(callback: (account: string | null) => void): () => void {
  const provider = getStarKeyProvider();

  if (!provider) {
    return () => {};
  }

  const handleAccountsChanged = (accounts: string[]) => {
    callback(accounts.length > 0 ? accounts[0] : null);
  };

  provider.on('accountsChanged', handleAccountsChanged);

  // Return unsubscribe function
  return () => {
    provider.off('accountsChanged', handleAccountsChanged);
  };
}

/**
 * Listen for wallet disconnection
 */
export function onDisconnect(callback: () => void): () => void {
  const provider = getStarKeyProvider();

  if (!provider) {
    return () => {};
  }

  provider.on('disconnect', callback);

  return () => {
    provider.off('disconnect', callback);
  };
}
