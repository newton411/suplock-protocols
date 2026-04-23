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
    this.client = new SupraClient();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize with Supra testnet RPC
      await this.client.init({
        rpcUrl: 'https://rpc-testnet.supra.com',
        chainId: 7, // Supra testnet chain ID
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Supra SDK:', error);
      throw error;
    }
  }

  async getPrice(pairId: number): Promise<OraclePrice> {
    await this.initialize();

    try {
      const priceData = await this.client.getPrice(pairId);

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
    await this.initialize();

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
      // Get all available price feeds
      const feeds = await this.client.getAllPriceFeeds();

      return feeds.map(feed => ({
        feedId: feed.feedId,
        name: this.getPairName(feed.feedId),
        price: Number(feed.price) / Math.pow(10, feed.decimals),
        decimals: feed.decimals,
        lastUpdate: Number(feed.timestamp),
        isActive: true, // Assume active if available
      }));
    } catch (error) {
      console.error('Failed to get all feeds:', error);
      throw error;
    }
  }

  private getPairName(pairId: number): string {
    // Map pair IDs to human-readable names
    const pairNames: { [key: number]: string } = {
      0: 'BTC/USD',
      1: 'ETH/USD',
      2: 'USDT/USD',
      3: 'USDC/USD',
      4: 'BNB/USD',
      5: 'ADA/USD',
      6: 'XRP/USD',
      7: 'SOL/USD',
      8: 'DOT/USD',
      9: 'DOGE/USD',
      10: 'AVAX/USD',
      11: 'LTC/USD',
      12: 'BCH/USD',
      13: 'LINK/USD',
      14: 'UNI/USD',
      15: 'ALGO/USD',
      16: 'ICP/USD',
      17: 'FIL/USD',
      18: 'TRX/USD',
      19: 'ETC/USD',
      20: 'XLM/USD',
      21: 'VET/USD',
      22: 'THETA/USD',
      23: 'FTM/USD',
      24: 'HBAR/USD',
      25: 'EGLD/USD',
      26: 'NEAR/USD',
      27: 'FLOW/USD',
      28: 'MANA/USD',
      29: 'SAND/USD',
      30: 'AXS/USD',
      31: 'CHZ/USD',
      32: 'ENJ/USD',
      33: 'BAT/USD',
      34: 'SUSHI/USD',
      35: 'YFI/USD',
      36: 'COMP/USD',
      37: 'MKR/USD',
      38: 'AAVE/USD',
      39: 'CRV/USD',
      40: 'REN/USD',
      41: 'KNC/USD',
      42: 'ZRX/USD',
      43: 'BAL/USD',
      44: 'OMG/USD',
      45: 'LRC/USD',
      46: 'REP/USD',
      47: 'GNT/USD',
      48: 'STORJ/USD',
      49: 'ANT/USD',
      50: 'WAVES/USD',
      51: 'LSK/USD',
      52: 'STRAT/USD',
      53: 'ARK/USD',
      54: 'XEM/USD',
      55: 'QTUM/USD',
      56: 'BTG/USD',
      57: 'ZEC/USD',
      58: 'DASH/USD',
      59: 'XMR/USD',
      60: 'NEO/USD',
      61: 'GAS/USD',
      62: 'ONT/USD',
      63: 'IOTA/USD',
      64: 'XLM/USD',
      65: 'BTM/USD',
      66: 'ZIL/USD',
      67: 'ONT/USD',
      68: 'QTUM/USD',
      69: 'BTG/USD',
      70: 'ZEC/USD',
      71: 'DASH/USD',
      72: 'XMR/USD',
      73: 'NEO/USD',
      74: 'GAS/USD',
      75: 'ONT/USD',
      76: 'IOTA/USD',
      77: 'XLM/USD',
      78: 'BTM/USD',
      79: 'ZIL/USD',
      80: 'ICX/USD',
      81: 'SC/USD',
      82: 'XVG/USD',
      83: 'RDD/USD',
      84: 'BCN/USD',
      85: 'FCT/USD',
      86: 'PIVX/USD',
      87: 'XPM/USD',
      88: 'EMC/USD',
      89: 'BURST/USD',
      90: 'GRS/USD',
      91: 'NXT/USD',
      92: 'SBD/USD',
      93: 'STEEM/USD',
      94: 'ARDR/USD',
      95: 'WAVES/USD',
      96: 'STRAT/USD',
      97: 'ARK/USD',
      98: 'XEM/USD',
      99: 'QTUM/USD',
    };

    return pairNames[pairId] || `PAIR_${pairId}`;
  }

  // Get real-time price for a specific asset
  async getAssetPrice(asset: string): Promise<number> {
    const assetToPairId: { [key: string]: number } = {
      'BTC': 0,
      'ETH': 1,
      'USDT': 2,
      'USDC': 3,
      'BNB': 4,
      'ADA': 5,
      'XRP': 6,
      'SOL': 7,
      'DOT': 8,
      'DOGE': 9,
      'AVAX': 10,
      'LTC': 11,
      'LINK': 13,
      'UNI': 14,
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