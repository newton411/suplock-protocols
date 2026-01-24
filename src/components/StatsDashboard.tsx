import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Database, BarChart3, Users } from 'lucide-react';
import { useProtocolStats } from '../hooks/useApi';

export function StatsDashboard() {
  const { data: protocolStats, loading, error } = useProtocolStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="matrix-card p-5 animate-pulse">
            <div className="h-4 bg-primary/20 rounded mb-2"></div>
            <div className="h-8 bg-primary/20 rounded mb-1"></div>
            <div className="h-3 bg-primary/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center p-4">
        Failed to load protocol stats: {error}
      </div>
    );
  }

  const items = [
    { label: 'Total $SUPRA Burned', value: protocolStats?.totalBurned || '0', sub: 'Goal: 10B Floor', icon: <Flame className="w-5 h-5" />, color: 'text-orange-500' },
    { label: 'Total Value Locked', value: protocolStats?.totalLocked || '0', sub: 'SUPRA Locked', icon: <Database className="w-5 h-5" />, color: 'text-blue-500' },
    { label: 'Protocol Fees', value: `$${protocolStats?.protocolFees || '0'}`, sub: 'Monthly Revenue', icon: <BarChart3 className="w-5 h-5" />, color: 'text-primary' },
    { label: 'veSUPRA Holders', value: protocolStats?.veSUPRAHolders?.toLocaleString() || '0', sub: 'Active Participants', icon: <Users className="w-5 h-5" />, color: 'text-purple-500' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="matrix-card p-5 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 bg-background border border-primary/20 rounded-sm group-hover:border-primary/50 transition-colors`}>
              {item.icon}
            </div>
            <div className="h-1 w-8 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/2 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">{item.label}</p>
          <h4 className="text-2xl font-bold font-mono text-primary neon-text tracking-tighter mb-1">
            {item.value}
          </h4>
          <p className="text-[10px] text-primary/60 uppercase tracking-widest">{item.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
