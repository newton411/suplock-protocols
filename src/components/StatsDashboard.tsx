import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldCheck, Database, BarChart3, TrendingDown, Users } from 'lucide-react';

export function StatsDashboard() {
  const [stats, setStats] = useState({
    burned: 12543029,
    tvl: 45293041,
    apy: 32.5,
    stakers: 12402
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        burned: prev.burned + Math.floor(Math.random() * 50),
        tvl: prev.tvl + (Math.random() > 0.5 ? 100 : -50),
        apy: Math.max(15, Math.min(150, prev.apy + (Math.random() - 0.5))),
        stakers: prev.stakers + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: 'Total $SUPRA Burned', value: stats.burned.toLocaleString(), sub: 'Goal: 10B Floor', icon: <Flame className="w-5 h-5" />, color: 'text-orange-500' },
    { label: 'Total Value Locked', value: `$${stats.tvl.toLocaleString()}`, sub: '+12.4% (24h)', icon: <Database className="w-5 h-5" />, color: 'text-blue-500' },
    { label: 'Current Avg APY', value: `${stats.apy.toFixed(1)}%`, sub: 'Phase 2 Loops Active', icon: <BarChart3 className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Total Participants', value: stats.stakers.toLocaleString(), sub: 'On Supra L1', icon: <Users className="w-5 h-5" />, color: 'text-purple-500' }
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
