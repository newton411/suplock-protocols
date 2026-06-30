import React from 'react';
import { useSupraContract } from '../hooks/useSupraContract';
import { useOracleFeeds } from '../hooks/useOracle';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';

export const OracleDashboard = () => {
  const { executeTransaction, BCS } = useSupraContract();
  const { feeds, loading, error } = useOracleFeeds();

  const handlePriceUpdate = async () => {
    try {
      // Calls oracle_integration::get_pair_price for BTC/USD (Pair 0)
      await executeTransaction('ORACLE', 'get_pair_price', [
        BCS.bcsSerializeUint64(0)
      ]);
    } catch (err) {
      console.error("Failed to update price on-chain:", err);
    }
  };

  return (
    <div className="matrix-card p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary neon-text tracking-tighter uppercase flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Oracle_Feed_Monitor
        </h2>
        <div className={`text-[10px] px-2 py-0.5 border ${error ? 'border-red-500 text-red-500' : 'border-primary/30 text-primary/60'} uppercase font-mono`}>
          {loading ? 'SYNCING...' : error ? 'ERROR' : 'CONNECTED'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {feeds.slice(0, 4).map((feed) => (
          <motion.div
            key={feed.feedId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">{feed.name}</span>
              <span className="text-[8px] text-primary/20 font-mono">ID: {feed.feedId}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-primary tracking-tighter group-hover:neon-text transition-all">
              ${feed.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[8px] text-primary/30 uppercase font-mono">
                Updated: {new Date(feed.lastUpdate * 1000).toLocaleTimeString()}
              </span>
              <div className="h-1 w-1 bg-primary animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={handlePriceUpdate}
        className="matrix-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        REFRESH_ON_CHAIN_DATA
      </button>

      <div className="pt-4 border-t border-primary/10">
        <p className="text-[8px] text-primary/30 uppercase font-mono leading-relaxed">
          Powered by Supra Distributed Oracle Network (DON). 
          Verifiable on-chain data with threshold cryptography.
        </p>
      </div>
    </div>
  );
};

export default OracleDashboard;
