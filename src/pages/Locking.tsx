import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Activity, Globe, Lock, Vote, Zap, Database, ArrowLeftRight, Network, RefreshCw } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { InfoPopover, protocolInfo } from '../components/ui/info-popover';
import { InfoBanner } from '../components/InfoBanner';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';

const Locking = () => {
  const [lockAmount, setLockAmount] = useState('');
  const [lockDuration, setLockDuration] = useState(12);

  const calculateBoost = (months: number) => {
    return (1 + (months / 48) * 1.5).toFixed(2);
  };

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
      className="max-w-4xl mx-auto space-y-8 px-4"
    >
      {/* Page Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4 border-b border-primary/20">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              relative px-4 py-2 flex items-center gap-2 transition-all border
              ${
                isActive
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
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">
            Token_Locking_Interface
          </h2>
          <InfoPopover {...protocolInfo.veSupra} />
        </div>
        <p className="text-primary/60 font-mono text-sm">
          Convert your SUPRA to veSUPRA for governance and yield rewards.
        </p>
      </div>

      <InfoBanner
        title="Why Lock Your $SUPRA?"
        description="Locking transforms your $SUPRA into veSUPRA, a vote-escrow token that grants you governance power, protocol revenue shares, and yield boosts up to 2.5x. The longer you lock, the greater your benefits."
        tip="Lock for 48 months to maximize your boost multiplier and governance influence."
      />

      {/* Information Sections - Collapsible */}
      <Accordion type="single" collapsible className="max-w-4xl mx-auto mb-8 space-y-3">
        <AccordionItem value="what-is-locking" className="matrix-card border-l-4 border-primary">
          <AccordionTrigger className="px-8 py-4 hover:bg-primary/5 transition-colors">
            <span className="text-lg font-bold text-primary uppercase">
              What Does &quot;Locking&quot; Mean?
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-8">
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              When you &quot;lock&quot; your $SUPRA tokens, you&rsquo;re voluntarily storing them in
              a smart contract for a set period (3 to 48 months). During this time, you cannot sell
              them. But here&rsquo;s what you gain:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 border border-primary/20">
                <div className="font-bold text-primary mb-2 uppercase text-sm">
                  ✓ Governance Votes
                </div>
                <p className="text-xs text-muted-foreground">
                  Every veSUPRA token = 1 vote in protocol decisions. Longer locks = more voting
                  power.
                </p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20">
                <div className="font-bold text-primary mb-2 uppercase text-sm">✓ Yield Rewards</div>
                <p className="text-xs text-muted-foreground">
                  Earn 12-42% APY depending on lock duration. Longer locks = higher rewards.
                </p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20">
                <div className="font-bold text-primary mb-2 uppercase text-sm">✓ Fee Sharing</div>
                <p className="text-xs text-muted-foreground">
                  Share in 30% of all protocol fees paid in USDC. Forever.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="boost-multiplier" className="matrix-card border-l-4 border-accent">
          <AccordionTrigger className="px-8 py-4 hover:bg-accent/5 transition-colors">
            <span className="text-lg font-bold text-accent uppercase">
              The Boost Multiplier Explained
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-8">
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Your boost multiplier ranges from 1.0x (3-month lock) to 2.5x (48-month lock). This
              multiplies your rewards:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-accent/5 border border-accent/20">
                <span className="text-sm">3-Month Lock</span>
                <span className="font-bold text-accent">1.0x = 12% APY</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/5 border border-accent/20">
                <span className="text-sm">12-Month Lock</span>
                <span className="font-bold text-accent">1.375x = 16.5% APY</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/5 border border-accent/20">
                <span className="text-sm">24-Month Lock</span>
                <span className="font-bold text-accent">1.75x = 21% APY</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent/5 border border-accent/20">
                <span className="text-sm">48-Month Lock (Maximum)</span>
                <span className="font-bold text-accent">2.5x = 30% APY</span>
              </div>
            </div>
            <p className="text-xs text-accent/60 mt-4 italic">
              <strong className="text-accent uppercase text-sm">Formula:</strong> The boost is
              calculated as <strong>1 + (lock_months / 48) &times; 1.5</strong>. Longer locks yield
              exponentially higher returns and voting power.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="example"
          className="matrix-card bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
        >
          <AccordionTrigger className="px-8 py-4 hover:bg-primary/5 transition-colors">
            <span className="text-lg font-bold uppercase">Real-World Example</span>
          </AccordionTrigger>
          <AccordionContent className="px-8">
            <div className="space-y-4 text-sm">
              <div className="p-4 border border-primary/20 bg-background/50">
                <p className="font-bold mb-2">Scenario: You lock 100,000 $SUPRA for 24 months</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>✓ Boost Multiplier: 1.75x</li>
                  <li>
                    ✓ Annual Yield: 100,000 × 21% = <strong>21,000 $SUPRA/year</strong>
                  </li>
                  <li>✓ Your voting power: 175,000 veSUPRA (100,000 × 1.75)</li>
                  <li>
                    ✓ Protocol fees: If protocol earns $100K/month, you get: 175,000 / 84.2M × 30% ={' '}
                    <strong>~0.62 USDC/month</strong>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic">
                That&rsquo;s in addition to your 21,000 $SUPRA/year in yields, AND you&rsquo;re
                helping strengthen the 10B supply floor by participating.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="matrix-card p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest">
              <span>Input_Amount</span>
              <span>Available: 1,000,000 SUPRA</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={lockAmount}
                onChange={(e) => setLockAmount(e.target.value)}
                className="w-full h-16 bg-primary/5 border border-primary/30 px-6 text-2xl font-bold focus:outline-none focus:border-primary transition-colors text-primary"
                placeholder="0.00"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40 uppercase">
                SUPRA
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest">
              <span>Lock_Duration</span>
              <span>{lockDuration} MONTHS</span>
            </div>
            <input
              type="range"
              min="3"
              max="48"
              step="1"
              value={lockDuration}
              onChange={(e) => setLockDuration(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-primary/20 rounded-none appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] opacity-40 uppercase tracking-[0.2em]">
              <span>3M</span>
              <span>12M</span>
              <span>24M</span>
              <span>36M</span>
              <span>48M</span>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex justify-between text-xs items-center">
              <span className="text-primary/60 flex items-center gap-1.5">
                Estimated Boost
                <InfoPopover {...protocolInfo.boostMultiplier} className="scale-90" />
              </span>
              <span className="text-primary font-bold tracking-tighter">
                {calculateBoost(lockDuration)}x
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-primary/60">Power Score</span>
              <span className="text-primary font-bold tracking-tighter">
                {lockAmount
                  ? (
                      parseFloat(lockAmount) * parseFloat(calculateBoost(lockDuration))
                    ).toLocaleString()
                  : '0'}
              </span>
            </div>
          </div>

          <button className="matrix-btn-primary w-full h-16 text-xl">EXECUTE_LOCK_CONTRACT</button>
        </div>

        <div className="matrix-card p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4">
            <LockKeyhole className="w-20 h-20 text-primary/5 -rotate-12" />
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">
                System_Metrics
              </h3>
              <div className="space-y-4">
                <div className="p-4 border border-primary/10 bg-primary/5">
                  <div className="text-[10px] text-primary/40 uppercase mb-1">
                    Total veSUPRA Power
                  </div>
                  <div className="text-3xl font-bold tracking-tighter neon-text">84.2M</div>
                </div>
                <div className="p-4 border border-primary/10 bg-primary/5">
                  <div className="text-[10px] text-primary/40 uppercase mb-1">Avg. Lock Time</div>
                  <div className="text-3xl font-bold tracking-tighter neon-text">34.2 MONTHS</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Benefits</h3>
              <ul className="space-y-2">
                {[
                  'Governance voting rights',
                  'Protocol revenue share',
                  'Priority vault access',
                  'veSUPRA NFT minting',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-primary/60">
                    <div className="w-1 h-1 bg-primary rotate-45" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] uppercase font-mono">Real-time Feed</span>
            </div>
            <span className="text-[10px] uppercase font-mono opacity-40 italic">
              Block #829102...
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Locking;
