import { SupraClient } from 'supra-l1-sdk';
import { CONTRACTS, RPC_URL } from '../config/contracts';
import { apiService } from './api';

const client = new SupraClient(RPC_URL);

export const normalizeViewValue = (value: unknown): number => {
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 0;
    if (Array.isArray(value[0])) return 0;
    return normalizeViewValue(value[0]);
  }
  if (value && typeof value === 'object') {
    const maybeValue = (value as Record<string, unknown>).value;
    if (maybeValue !== undefined) return normalizeViewValue(maybeValue);
  }
  return 0;
};

export const formatReadableAmount = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return '0';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), suffixes.length - 1);
  const scaled = abs / 1000 ** tier;
  const precision = scaled >= 100 ? 0 : digits;
  const rounded = scaled.toFixed(precision);

  return `${Number(rounded).toLocaleString()}${suffixes[tier]}`;
};

export const readContractMetric = async (module: keyof typeof CONTRACTS, func: string, args: string[] = []) => {
  try {
    const fullName = `${CONTRACTS[module]}::${func}`;
    const response = await client.invokeViewMethod(fullName, [], args);
    return normalizeViewValue(response);
  } catch (error) {
    console.error(`Failed to read ${module}::${func}`, error);
    throw error;
  }
};

export const readProtocolMetrics = async () => {
  try {
    const [totalLocked, totalBurned, accumulatedFees] = await Promise.all([
      readContractMetric('CORE', 'get_total_locked_supra', [CONTRACTS.CORE]),
      readContractMetric('SUPRESERVE', 'get_total_burned', [CONTRACTS.SUPRESERVE]),
      readContractMetric('SUPRESERVE', 'get_accumulated_fees', [CONTRACTS.SUPRESERVE]),
    ]);

    return {
      totalLocked,
      totalBurned,
      accumulatedFees,
    };
  } catch (error) {
    console.warn('Falling back to backend metrics because on-chain reads were unavailable.', error);
    const stats = await apiService.getProtocolStats();
    const floorStatus = await apiService.getFloorStatus();

    return {
      totalLocked: Number(stats.totalLocked.replace(/[^0-9.-]+/g, '')) || 0,
      totalBurned: Number(stats.totalBurned.replace(/[^0-9.-]+/g, '')) || 0,
      accumulatedFees: Number(stats.protocolFees.replace(/[^0-9.-]+/g, '')) || 0,
      floor: floorStatus,
    } as any;
  }
};
