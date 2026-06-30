import { SupraClient } from 'supra-l1-sdk';

export interface OraclePrice {
  pair: string;
  price: number;
  timestamp: number;
  decimals: number;
}

export interface OracleFeed {
  feedId: number;
  name: string;
  price: number;
  decimals: number;
  lastUpdate: number;
  isActive: boolean;
}

class SupraOracleService {
  private client: SupraClient;
  private isInitialized = false;

  constructor() {
    this.client = new SupraClient('https://rpc-testnet.supra.com');
  }

  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  async getPrice(pairId: number): Promise<OraclePrice> {
    await this.initialize();

    try {
      const priceData = await this.client.getOracleStoredPrice(pairId);
      if (!priceData) throw new Error(`No price data for pair ${pairId}`);

      return {
        pair: this.getPairName(pairId),
        price: Number(priceData.price) / Math.pow(10, priceData.decimals),
        timestamp: Number(priceData.timestamp),
        decimals: priceData.decimals,
      };
    } catch (error) {
      console.error(`Failed to get price for pair ${pairId}:`, error);
      throw error;
    }
  }

  async getMultiplePrices(pairIds: number[]): Promise<OraclePrice[]> {
    try {
      const prices = await Promise.all(
        pairIds.map(id => this.getPrice(id))
      );
      return prices;
    } catch (error) {
      console.error('Failed to get multiple prices:', error);
      throw error;
    }
  }

  async getAllFeeds(): Promise<OracleFeed[]> {
    await this.initialize();

    try {
      // For now, we manually list common feeds as the SDK might not have getAllPriceFeeds
      const commonPairIds = [0, 1, 2, 3, 7]; // BTC, ETH, USDT, USDC, SOL
      const prices = await this.getMultiplePrices(commonPairIds);

      return prices.map((price, index) => ({
        feedId: commonPairIds[index],
        name: price.pair,
        price: price.price,
        decimals: price.decimals,
        lastUpdate: price.timestamp,
        isActive: true,
      }));
    } catch (error) {
      console.error('Failed to get all feeds:', error);
      throw error;
    }
  }

  private getPairName(pairId: number): string {
    const pairNames: { [key: number]: string } = {
      0: 'BTC/USD',
      1: 'ETH/USD',
      2: 'USDT/USD',
      3: 'USDC/USD',
      7: 'SOL/USD',
      13: 'LINK/USD',
      38: 'AAVE/USD',
    };

    return pairNames[pairId] || `PAIR_${pairId}`;
  }

  async getAssetPrice(asset: string): Promise<number> {
    const assetToPairId: { [key: string]: number } = {
      'BTC': 0,
      'ETH': 1,
      'USDT': 2,
      'USDC': 3,
      'SOL': 7,
      'LINK': 13,
      'AAVE': 38,
    };

    const pairId = assetToPairId[asset.toUpperCase()];
    if (pairId === undefined) {
      throw new Error(`Asset ${asset} not supported`);
    }

    const priceData = await this.getPrice(pairId);
    return priceData.price;
  }
}

export const supraOracle = new SupraOracleService();
