import React from 'react';
import { motion } from 'framer-motion';
import { Database, Coins, ArrowDownToLine, RefreshCw, Globe, Lock, Vote, Zap, TrendingDown, Flame, Gift, Repeat, Share2, BookOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { InfoBanner } from '../components/InfoBanner';

const Reserve = () => {
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

      <div className="max-w-4xl mx-auto">
        <InfoBanner
          title="What is SUPReserve?"
          description="Every time someone uses SUPLOCK (swaps, stakes, or collects fees), the protocol automatically collects a small fee in USDC. SUPReserve distributes 100% of these profits back to veSUPRA holders. This is passive income—you earn even when you sleep."
          tip="Claim your rewards weekly to compound your gains. Every USDC claimed can be re-invested into vaults for higher yields."
        />
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

      {/* Fee Distribution Explained */}
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="matrix-card p-8 border-l-4 border-primary"
        >
          <h3 className="text-lg font-bold text-primary mb-4 uppercase">How Fee Distribution Works</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            The SUPReserve is like a dividend machine. Every transaction that happens on SUPLOCK generates protocol revenue—like parking lot fees for a busy mall. Here's how it flows:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded">
              <div className="font-bold text-primary text-sm mb-2 uppercase">Step 1: Revenue Collection</div>
              <p className="text-xs text-muted-foreground">
                Every vault deposit, swap, or governance action generates small fees—typically 0.25-0.5% per transaction. These fees are collected in USDC (stablecoins).
              </p>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded">
              <div className="font-bold text-primary text-sm mb-2 uppercase">Step 2: Distribution Decision</div>
              <p className="text-xs text-muted-foreground">
                Based on current circulating supply vs. 10B floor target, fees are split automatically:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
                <li><strong className="text-accent">Pre-Floor (Circulating &gt; 10B):</strong> 50% burn, 35% veSUPRA holders, 10% rewards, 5% treasury</li>
                <li><strong className="text-accent">Post-Floor (Circulating ≤ 10B):</strong> 0% burn, 65% veSUPRA holders, 12.5% rewards, 12.5% treasury</li>
              </ul>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded">
              <div className="font-bold text-primary text-sm mb-2 uppercase">Step 3: Your Claim</div>
              <p className="text-xs text-muted-foreground">
                Your share is proportional to your veSUPRA holdings. Lock 175,000 veSUPRA out of 84.2M total? You get 175,000 / 84.2M = 0.208% of all fees.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="matrix-card p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
        >
          <h3 className="text-lg font-bold text-primary mb-6 uppercase">The Two Distribution Modes Explained</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border border-primary/20 bg-background/50 rounded">
                <TrendingDown className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-primary text-sm mb-2 uppercase">Pre-Floor Mode (Right Now)</h4>
                  <p className="text-xs text-muted-foreground">
                    Current supply is HIGH. We're aggressively burning tokens to reach 10B. You still earn 35% of fees, but 50% goes to burns.
                  </p>
                <p className="text-accent/60 italic mt-2 font-mono\">Lower supply creates scarcity and increased price. Your veSUPRA appreciates accordingly.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border border-accent/20 bg-background/50 rounded">
                <Flame className="w-6 h-6 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-accent text-sm mb-2 uppercase">Post-Floor Mode (Future)</h4>
                  <p className="text-xs text-muted-foreground">
                    Once we hit 10B supply, burns stop. But YOU get 65% of fees instead of 35%. This is the huge payoff.
                  </p>
                  <div className="text-xs text-accent/60 mt-2 font-mono">
                    With stable supply and sustained demand, your rewards increase significantly from protocol growth.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="matrix-card p-8 border-l-4 border-accent"
        >
          <h3 className="text-lg font-bold text-accent mb-6 uppercase">Real-World Reward Examples</h3>
          <div className="space-y-4">
            <div className="p-4 border border-accent/20 bg-accent/5 rounded">
              <p className="font-bold text-accent text-sm mb-3">Scenario 1: You lock 100,000 SUPRA for 24 months</p>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between">
                  <span>Your veSUPRA:</span>
                  <span className="font-bold">175,000 (100k × 1.75 boost)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total veSUPRA in protocol:</span>
                  <span className="font-bold">84.2M</span>
                </div>
                <div className="flex justify-between">
                  <span>Your share:</span>
                  <span className="font-bold">175,000 / 84.2M = 0.208%</span>
                </div>
                <div className="border-t border-accent/20 pt-2">
                  <p className="font-bold mb-2 text-accent">If protocol collects $100,000 in fees (monthly):</p>
                  <div className="flex justify-between">
                    <span>35% distributed to veSUPRA:</span>
                    <span className="font-bold">$35,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your cut:</span>
                    <span className="font-bold text-accent">$35,000 × 0.208% = $72.80/month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-accent/20 bg-accent/5 rounded">
              <p className="font-bold text-accent text-sm mb-3">Scenario 2: Post-Floor Mode (6 months later)</p>
              <div className="text-xs text-muted-foreground space-y-2">
                <p className="mb-2">Same 175,000 veSUPRA, but now:</p>
                <div className="flex justify-between">
                  <span>65% distributed to veSUPRA:</span>
                  <span className="font-bold">$65,000 (vs $35,000 before)</span>
                </div>
                <div className="flex justify-between">
                  <span>Your cut:</span>
                  <span className="font-bold text-accent">$65,000 × 0.208% = $135.20/month</span>
                </div>
                <p className="text-accent/60 italic mt-2">
                  Your fee earnings nearly doubled (72.80 → 135.20) upon reaching the 10B floor. This represents the long-term incentive alignment for early participants.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="matrix-card p-8 bg-primary/5 border border-primary/20"
        >
          <h3 className="text-lg font-bold text-primary mb-4 uppercase">Why This Matters</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-primary">Traditional banks:</strong> They keep 99% of fees. You get a less than 1% savings rate.
            </p>
            <p>
              <strong className="text-primary">SUPLOCK:</strong> We return 65%+ of fees directly to you. This is wealth distribution at scale. The protocol grows, you grow with it—not bankers, not hedge funds, <strong>you</strong>.
            </p>
            <p className="italic border-t border-primary/10 pt-4">
              Every veSUPRA token you hold is a mini-business stake. The more fees the protocol generates, the wealthier you become. This is how you achieve financial independence.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reserve;
