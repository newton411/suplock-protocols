import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, ArrowUpRight, Percent, Globe, Lock, Vote, Database, TrendingUp, Eye, EyeOff } from 'lucide-react';
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
          description="Deposit assets into any vault and your position automatically splits into Principal Tokens (PT) and Yield Tokens (YT) via our yield_vaults.move contract. PT represents your deposit, YT represents future earnings—both tradeable separately for maximum capital flexibility on Supra L1's high-speed infrastructure."
          tip="Advanced strategy: Sell PT for instant liquidity while keeping YT for long-term yield. Supra's 500K+ TPS enables seamless PT/YT trading."
        />
      </div>

      {/* Vault Strategies Explained */}
      <div className="max-w-5xl mx-auto space-y-6 mb-8">
        <h3 className="text-2xl font-bold neon-text uppercase tracking-tighter text-center mb-8">Understanding Your Vault Options</h3>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="matrix-card p-8 border-l-4 border-primary"
        >
          <div className="flex items-start gap-4 mb-6">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-primary mb-2 uppercase">Stable Vault (12.4% APY) - For Conservative Investors</h4>
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-primary">Best for:</strong> Investors who want steady, predictable returns with minimal risk.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                This vault holds SUPRA and generates yields primarily from protocol fees. It's the safest option—your principal is protected by the 10B floor that we're aggressively building.
              </p>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded text-xs text-muted-foreground">
                <strong className="text-primary">Revenue Source:</strong> Protocol fees (35% distributed to veSUPRA holders) and base APR (12%) paid directly by the protocol to reward participation.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="matrix-card p-8 border-l-4 border-accent"
        >
          <div className="flex items-start gap-4 mb-6">
            <TrendingUp className="w-8 h-8 text-accent shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-accent mb-2 uppercase">Delta-Neutral Vault (18.9% APY) - For Balanced Investors</h4>
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-accent">Best for:</strong> Investors seeking higher returns with moderate complexity.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                This strategy uses USDC (stablecoin) and hedging to capture yields while minimizing price volatility. It's "delta-neutral" because it doesn't care if SUPRA goes up or down—it profits from the yield farming mechanics itself.
              </p>
              <div className="p-3 bg-accent/5 border border-accent/20 rounded text-xs text-muted-foreground">
                <strong className="text-primary">Revenue Source:</strong> Combines staking rewards (Supra PoEL) with DeFi protocol yields and hedging gains. Higher complexity enables greater returns.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="matrix-card p-8 border-l-4 border-primary"
        >
          <div className="flex items-start gap-4 mb-6">
            <ArrowUpRight className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-primary mb-2 uppercase">Liquid Staking Vault (8.2% APY) - For Stakers</h4>
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-primary">Best for:</strong> ETH stakers who want to earn while participating in Supra.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Deposits stETH (liquid-staked Ethereum) and earns validator rewards while also earning Supra yields. You're essentially getting paid twice: once from Ethereum staking, once from SUPLOCK.
              </p>
              <div className="p-3 bg-primary/5 border border-primary/20 rounded text-xs text-muted-foreground">
                <strong className="text-primary">Revenue Source:</strong> ETH staking already yields approximately 4% annually. Combined with Supra yields, this equals 8.2% with established stability.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="matrix-card p-8 border-l-4 border-destructive bg-gradient-to-r from-destructive/5 to-transparent"
        >
          <div className="flex items-start gap-4 mb-6">
            <EyeOff className="w-8 h-8 text-destructive shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-destructive mb-2 uppercase">LP Vacuum Strategy (42.1% APY) - For Advanced Users ⚠️</h4>
              <p className="text-sm text-muted-foreground mb-4">
                <strong className="text-destructive">Best for:</strong> Experienced traders who understand DeFi mechanics and can handle volatility.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                The highest-yield strategy uses automated market maker (AMM) strategies to capture trading fees and MEV gains. <strong>MEV Protected</strong> means hackers can't see what you're doing—only the protocol knows.
              </p>
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded text-xs text-muted-foreground">
                <strong className="text-destructive">Revenue Source:</strong> Captures multiple yield streams including LP fees, market-making gains, and MEV rebates. Higher complexity presents proportionally higher capital risk. Deploy only funds you can afford to lose.
              </div>
            </div>
          </div>
        </motion.div>

        <div className="matrix-card p-8 bg-primary/5 border-2 border-primary/30">
          <h4 className="text-lg font-bold text-primary mb-6 uppercase">How PT/YT Splitting Works (Advanced)</h4>
          <p className="text-sm text-muted-foreground mb-6">
            Every vault deposit automatically splits into two tokens:
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-background/50 border border-primary/20 rounded">
              <div className="font-bold text-primary mb-2 uppercase text-sm">Principal Token (PT)</div>
              <p className="text-xs text-muted-foreground mb-3">Represents your initial deposit. Trade it for liquidity without losing your yield rights.</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Can be sold for cash immediately</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> No yield after sale</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Useful if you need emergency liquidity</li>
              </ul>
            </div>
            <div className="p-4 bg-background/50 border border-primary/20 rounded">
              <div className="font-bold text-primary mb-2 uppercase text-sm">Yield Token (YT)</div>
              <p className="text-xs text-muted-foreground mb-3">Represents all future earnings from your deposit. Keep it to earn 100% of profits.</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Captures all future yields</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Appreciation as vault grows</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Can be held or traded</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic border-t border-primary/20 pt-4">
            <strong>Example:</strong> You deposit 10 SUPRA via yield_vaults.move contract. You receive PT (worth 10 SUPRA, tradeable on Supra L1) + YT (worth future yields). If yields = 2 SUPRA/year, sell PT for 10 cash while keeping YT to earn the 2 SUPRA yield through automated smart contract distributions.
          </p>
        </div>
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
