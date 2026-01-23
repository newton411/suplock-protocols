import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, ArrowUpRight, Percent, Globe, Lock, Vote, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { InfoPopover, protocolInfo } from '../components/ui/info-popover';
import { InfoBanner } from '../components/InfoBanner';

const Vaults = () => {
  const vaults = [
    { name: 'SUPRA_STABLE_VAULT', apy: '12.4%', tvl: '$12.4M', risk: 'Low', icon: ShieldCheck },
    { name: 'USDC_DELTA_NEUTRAL', apy: '18.9%', tvl: '$8.2M', risk: 'Medium', icon: Zap },
    { name: 'ETH_LIQUID_STAKING', apy: '8.2%', tvl: '$24.1M', risk: 'Low', icon: ArrowUpRight },
    { name: 'LP_VACUUM_STRATEGY', apy: '42.1%', tvl: '$1.5M', risk: 'High', icon: Zap, hasPrivacy: true },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
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
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">Yield_Optimization_Vaults</h2>
          <InfoPopover {...protocolInfo.ptYt} />
        </div>
        <p className="text-primary/60 font-mono text-sm">Automated strategies for maximum capital efficiency on Supra L1.</p>
      </div>

      <div className="max-w-5xl mx-auto">
        <InfoBanner
          title="How AutoFi Vaults Work"
          description="Deposit assets into any vault and your position automatically splits into Principal Tokens (PT) and Yield Tokens (YT). PT represents your deposit, YT represents future earnings—both tradeable separately for maximum capital flexibility."
          tip="Advanced strategy: Sell PT for instant liquidity while keeping YT for long-term yield."
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vaults.map((v, i) => (
          <motion.div
            key={v.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="matrix-card p-8 flex flex-col justify-between group h-full"
          >
            <div className="space-y-6">
              <div className="w-12 h-12 border border-primary/30 flex items-center justify-center group-hover:border-primary transition-colors">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tighter uppercase group-hover:text-primary transition-colors">{v.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] px-1.5 py-0.5 border uppercase font-bold ${
                    v.risk === 'Low' ? 'border-primary/40 text-primary/60' : 
                    v.risk === 'Medium' ? 'border-accent/40 text-accent/60' : 'border-destructive/40 text-destructive/60'
                  }`}>Risk: {v.risk}</span>
                  {(v as any).hasPrivacy && (
                    <span className="flex items-center gap-1">
                      <span className="text-[8px] px-1.5 py-0.5 border border-accent/40 text-accent/60 uppercase font-bold">MEV Protected</span>
                      <InfoPopover {...protocolInfo.lpVacuum} className="scale-75" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-primary/40 uppercase tracking-widest">Target APY</div>
                  <div className="text-3xl font-bold tracking-tighter neon-text">{v.apy}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-[10px] text-primary/40 uppercase tracking-widest">TVL</div>
                  <div className="text-sm font-bold font-mono">{v.tvl}</div>
                </div>
              </div>
              <button className="matrix-btn-primary w-full py-3 text-sm">DEPOSIT_ASSETS</button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="matrix-card p-8 border-accent/30 bg-accent/5">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-accent/10 border border-accent/20">
            <Percent className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-2 flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold uppercase tracking-tighter text-accent">Boost Your Yields Up To 2.5x</h3>
            <p className="text-accent/60 font-mono text-sm">Lock SUPRA for veSUPRA to unlock the protocol yield booster. Your locking duration directly impacts your vault performance.</p>
          </div>
          <button className="matrix-btn-secondary border-accent text-accent hover:bg-accent/10 h-14 px-10 whitespace-nowrap">
            GO_TO_LOCKING
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Vaults;
