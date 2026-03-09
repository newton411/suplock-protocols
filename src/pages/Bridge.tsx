import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, ArrowRight, Info, Globe, Lock, Vote, Zap, Database, Repeat, BookOpen, RefreshCw } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Bridge = () => {
  const [amount, setAmount] = useState('');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'thesis', label: 'Thesis', icon: BookOpen, path: '/thesis' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
    { id: 'swap', label: 'Swap', icon: Repeat, path: '/swap' },
    { id: 'bridge', label: 'Bridge', icon: Share2, path: '/bridge' },
    { id: 'restake', label: 'Restake', icon: RefreshCw, path: '/restake' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto space-y-8 px-4 py-8"
    >
      {/* Page Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4 border-b border-primary/20">
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

      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">Cross_Chain_Bridge</h2>
        <p className="text-primary/60 font-mono text-sm">Transfer assets securely using HyperNova cross-chain architecture.</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="matrix-card p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Source_Network</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-primary bg-primary/10 flex items-center justify-center gap-2 cursor-pointer">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase">Supra L1</span>
              </div>
              <div className="p-4 border border-primary/20 bg-primary/5 flex items-center justify-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <span className="text-xs font-bold uppercase">Ethereum</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-background border border-primary/30 p-2">
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">Destination_Network</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-primary/20 bg-primary/5 flex items-center justify-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <span className="text-xs font-bold uppercase">Arbitrum</span>
              </div>
              <div className="p-4 border border-primary bg-primary/10 flex items-center justify-center gap-2 cursor-pointer">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase">Solana</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-primary/10">
            <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60">
              <span>Bridge_Amount</span>
              <span>Available: 5,000 SUPRA</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-xl font-bold w-full focus:outline-none text-primary"
                placeholder="0.0"
              />
              <span className="text-sm font-bold opacity-40">SUPRA</span>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 space-y-2 text-[10px] uppercase tracking-widest text-primary/60">
            <div className="flex justify-between">
              <span>Bridge Fee</span>
              <span>2.50 SUPRA</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time</span>
              <span>~30 Seconds</span>
            </div>
          </div>

          <button className="matrix-btn-primary w-full py-4 text-lg">
            INITIATE_BRIDGE_PROTOCOL
          </button>
        </div>

        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            The SUPLOCK Bridge utilizes Supra's HyperNova technology for trustless, decentralized asset transfers. No wrapped assets required—native-to-native execution.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Bridge;
