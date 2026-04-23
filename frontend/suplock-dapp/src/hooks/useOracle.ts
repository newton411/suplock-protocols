import { useState, useEffect } from 'react';
import { supraOracle, OraclePrice, OracleFeed } from '../services/oracle';

export const useOraclePrice = (pairId: number) => {
  const [price, setPrice] = useState<OraclePrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        const priceData = await supraOracle.getPrice(pairId);
        setPrice(priceData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price');
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, [pairId]);

  return { price, loading, error };
};

export const useMultipleOraclePrices = (pairIds: number[]) => {
  const [prices, setPrices] = useState<OraclePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const priceData = await supraOracle.getMultiplePrices(pairIds);
        setPrices(priceData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      } finally {
        setLoading(false);
      }
    };

    if (pairIds.length > 0) {
      fetchPrices();

      // Refresh prices every 30 seconds
      const interval = setInterval(fetchPrices, 30000);

      return () => clearInterval(interval);
    }
  }, [pairIds]);

  return { prices, loading, error };
};

export const useOracleFeeds = () => {
  const [feeds, setFeeds] = useState<OracleFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const feedData = await supraOracle.getAllFeeds();
        setFeeds(feedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch feeds');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();

    // Refresh feeds every 60 seconds
    const interval = setInterval(fetchFeeds, 60000);

    return () => clearInterval(interval);
  }, []);

  return { feeds, loading, error };
};

export const useAssetPrice = (asset: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true);
        const assetPrice = await supraOracle.getAssetPrice(asset);
        setPrice(assetPrice);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asset price');
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, [asset]);

  return { price, loading, error };
};