import React from 'react';
import { motion } from 'framer-motion';
import { Database, Coins, ArrowDownToLine, RefreshCw, Globe, Lock, Vote, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Reserve = () => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-12 px-4"
    >
      {/* Page Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4 border-b border-primary/20 max-w-4xl mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              relative px-4 py-2 flex items-center gap-2 transition-all border
              ${isActive 
                ? 'bg-primary/20 border-primary text-primary neon-border' 
                : 'bg-primary/5 border-primary/20 text-primary/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40'
              }
            `}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">Fee_Distribution_System</h2>
        <p className="text-primary/60 font-mono text-sm">Real-time claim interface for protocol revenue and veSUPRA dividends.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="matrix-card p-10 space-y-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
          
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Your_Pending_Rewards
            </h3>
            <div className="text-6xl font-bold tracking-tighter neon-text">4,291.42</div>
            <div className="text-primary/40 font-mono text-xs tracking-widest uppercase">SUPRA Tokens</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-primary/10 bg-primary/5 space-y-1">
              <div className="text-[8px] text-primary/40 uppercase">Protocol Fees</div>
              <div className="text-lg font-bold">1,842.10</div>
            </div>
            <div className="p-4 border border-primary/10 bg-primary/5 space-y-1">
              <div className="text-[8px] text-primary/40 uppercase">veSUPRA Dividends</div>
              <div className="text-lg font-bold">2,449.32</div>
            </div>
          </div>

          <button className="matrix-btn-primary w-full h-16 text-xl flex items-center justify-center gap-4">
            <ArrowDownToLine className="w-6 h-6" /> CLAIM_ALL_REWARDS
          </button>
        </div>

        <div className="space-y-6">
          <div className="matrix-card p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Protocol_Revenue_Metrics</h4>
              <RefreshCw className="w-4 h-4 text-primary/40 animate-spin-slow" />
            </div>

            <div className="space-y-4">
              {[
                { label: 'Total Fees Collected', value: '$842,910' },
                { label: 'Distributed To veSUPRA', value: '$421,455' },
                { label: 'Protocol Treasury', value: '$210,727' },
                { label: 'Reserve Buybacks', value: '$210,727' },
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-primary/5">
                  <span className="text-xs text-primary/60 font-mono">{m.label}</span>
                  <span className="text-sm font-bold">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="matrix-card p-6 flex items-center gap-6">
            <div className="p-4 border border-primary/20 bg-primary/5 text-primary">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest">Global_Reserve_Backing</h4>
              <div className="text-xl font-bold tracking-tighter text-primary">125% COLLATERALIZED</div>
              <p className="text-[10px] text-primary/40 font-mono uppercase mt-1">Algorithmically maintained reserve health</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reserve;
