import React from 'react';
import { useOracleFeeds, useAssetPrice } from '../hooks/useOracle';

export const OracleDashboard: React.FC = () => {
  const { feeds, loading: feedsLoading, error: feedsError } = useOracleFeeds();
  const { price: btcPrice, loading: btcLoading } = useAssetPrice('BTC');
  const { price: ethPrice, loading: ethLoading } = useAssetPrice('ETH');
  const { price: usdcPrice, loading: usdcLoading } = useAssetPrice('USDC');

  if (feedsLoading && btcLoading && ethLoading && usdcLoading) {
    return (
      <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          <span className="ml-2 text-gold">Loading oracle data...</span>
        </div>
      </div>
    );
  }

  if (feedsError) {
    return (
      <div className="bg-darkGray border border-red-500/30 rounded-lg p-6">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold">Oracle Connection Error</p>
          <p className="text-sm mt-2">{feedsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gold mb-4">🔮 Supra Oracle Dashboard</h2>
        <p className="text-gray-400 text-sm">
          Real-time price feeds powered by Supra's decentralized oracle network
        </p>
      </div>

      {/* Key Asset Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold mb-3">₿ Bitcoin</h3>
          <div className="text-3xl font-bold text-white">
            {btcLoading ? '...' : `$${btcPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`}
          </div>
          <p className="text-gray-400 text-sm mt-2">BTC/USD</p>
        </div>

        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold mb-3">Ξ Ethereum</h3>
          <div className="text-3xl font-bold text-white">
            {ethLoading ? '...' : `$${ethPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`}
          </div>
          <p className="text-gray-400 text-sm mt-2">ETH/USD</p>
        </div>

        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold mb-3">💲 USDC</h3>
          <div className="text-3xl font-bold text-white">
            {usdcLoading ? '...' : `$${usdcPrice?.toFixed(4) || 'N/A'}`}
          </div>
          <p className="text-gray-400 text-sm mt-2">USDC/USD</p>
        </div>
      </div>

      {/* All Available Feeds */}
      <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gold mb-4">📊 All Oracle Feeds</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/30">
                <th className="text-left py-2 px-4 text-gold font-semibold">Asset Pair</th>
                <th className="text-right py-2 px-4 text-gold font-semibold">Price</th>
                <th className="text-right py-2 px-4 text-gold font-semibold">Last Update</th>
                <th className="text-center py-2 px-4 text-gold font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {feeds.slice(0, 20).map((feed) => (
                <tr key={feed.feedId} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-white font-medium">{feed.name}</td>
                  <td className="py-3 px-4 text-right text-white">
                    ${feed.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {new Date(feed.lastUpdate * 1000).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      feed.isActive
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                        : 'bg-red-900/30 text-red-400 border border-red-500/30'
                    }`}>
                      {feed.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {feeds.length > 20 && (
          <p className="text-gray-400 text-sm mt-4 text-center">
            Showing first 20 feeds. {feeds.length - 20} more available.
          </p>
        )}
      </div>

      {/* Oracle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold mb-3">📈 Total Feeds</h3>
          <div className="text-3xl font-bold text-white">{feeds.length}</div>
          <p className="text-gray-400 text-sm mt-2">Active price feeds available</p>
        </div>

        <div className="bg-darkGray border border-gold/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold mb-3">⚡ Update Frequency</h3>
          <div className="text-3xl font-bold text-white">30s</div>
          <p className="text-gray-400 text-sm mt-2">Real-time price updates</p>
        </div>
      </div>
    </div>
  );
};