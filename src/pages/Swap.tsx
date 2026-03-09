import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Settings, Info, Globe, Lock, Vote, Zap, Database, Repeat, Share2, ArrowLeftRight, Network, RefreshCw } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { InfoPopover, protocolInfo } from '../components/ui/info-popover';

const Swap = () => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
    { id: 'swap', label: 'Swap', icon: ArrowLeftRight, path: '/swap' },
    { id: 'bridge', label: 'Bridge', icon: Network, path: '/bridge' },
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
        <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">Swap_Interface</h2>
        <p className="text-primary/60 font-mono text-sm">Instant token swaps powered by Supra L1 DEX engine.</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="matrix-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold uppercase tracking-wider text-primary">Swap</h3>
            <Settings className="w-5 h-5 text-primary/60 cursor-pointer hover:text-primary transition-colors" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60">
              <span>From</span>
              <span>Balance: 1,240.50</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 flex items-center gap-4">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-xl font-bold w-full focus:outline-none text-primary"
                placeholder="0.0"
              />
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 border border-primary/30 cursor-pointer">
                <span className="text-sm font-bold">SUPRA</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button className="bg-background border border-primary/30 p-2 hover:border-primary hover:neon-border transition-all">
              <ArrowDownUp className="w-4 h-4 text-primary" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60">
              <span>To (Estimated)</span>
              <span>Balance: 0.00</span>
            </div>
            <div className="bg-primary/5 border border-primary/20 p-4 flex items-center gap-4">
              <input
                type="number"
                value={toAmount}
                readOnly
                className="bg-transparent text-xl font-bold w-full focus:outline-none text-primary/60"
                placeholder="0.0"
              />
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 border border-primary/30 cursor-pointer">
                <span className="text-sm font-bold">USDC</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 space-y-2 text-[10px] uppercase tracking-widest text-primary/60">
            <div className="flex justify-between">
              <span>Exchange Rate</span>
              <span>1 SUPRA = 0.42 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Slippage Tolerance</span>
              <span>0.5%</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Received</span>
              <span>0.00 USDC</span>
            </div>
          </div>

          <button className="matrix-btn-primary w-full py-4 text-lg mt-4">
            CONFIRM_SWAP
          </button>
        </div>

        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            All swaps are executed via the Supra L1 native DEX protocol. SUPLOCK maintains its supply floor by capturing a 0.1% fee from every swap to fund the BurnVault.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Swap;
