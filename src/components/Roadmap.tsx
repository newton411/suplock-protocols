import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Rocket, Zap, Brain, Globe } from 'lucide-react';

interface Milestone {
  phase: string;
  timeline: string;
  title: string;
  items: string[];
  status: 'complete' | 'current' | 'upcoming';
  icon: React.ReactNode;
}

const milestones: Milestone[] = [
  {
    phase: 'Phase 1',
    timeline: 'Complete/Q1 2026',
    title: 'Foundation',
    items: [
      'Whitepaper launch & core protocol design',
      'Core contracts: BurnVault, LockStake, GovIncentivizer',
      'Deflation model to 10B floor implementation',
      'veSUPRA governance + USDC dividends architecture'
    ],
    status: 'complete',
    icon: <CheckCircle2 className="w-6 h-6" />
  },
  {
    phase: 'Phase 2',
    timeline: 'Q1-Q2 2026',
    title: 'Integration & Automation',
    items: [
      'iAssets support (dual PoEL yields + degen loops)',
      'AutoFi primitives: Intent execution & auto-arbitrage',
      'LiquidityHub: Unified routing to Supra DeFi ecosystem',
      'First audits & bug bounty program launch'
    ],
    status: 'current',
    icon: <Zap className="w-6 h-6" />
  },
  {
    phase: 'Phase 3',
    timeline: 'Q3-Q4 2026',
    title: 'Optimization & Expansion',
    items: [
      'Advanced AutoFi templates with AI-augmented oracles',
      'Reverse Bridge integration for cross-chain burns',
      'Enterprise Container: Institutional compliant vaults',
      'TVL targets: $100M+ via community incentives'
    ],
    status: 'upcoming',
    icon: <Brain className="w-6 h-6" />
  },
  {
    phase: 'Phase 4',
    timeline: '2027+',
    title: 'Maturity & Dominance',
    items: [
      'Reach 10B supply floor → Shift to "immortal" dividends',
      'Official Supra ecosystem grants & deep integration',
      'Cross-chain expansions via HyperNova bridgeless',
      'DAO full protocol control & global adoption'
    ],
    status: 'upcoming',
    icon: <Globe className="w-6 h-6" />
  }
];

export function Roadmap() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text tracking-tighter uppercase">Protocol Roadmap</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">The journey to a sustainable, deflationary Supra ecosystem.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-primary/20 hidden md:block" />

          <div className="space-y-12">
            {milestones.map((m, i) => (
              <motion.div
                key={m.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className="md:w-1/2 p-4 w-full">
                  <div className={`matrix-card p-6 ${m.status === 'current' ? 'border-primary' : 'opacity-80'}`}>
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      {m.icon}
                      <span className="font-bold tracking-widest uppercase text-sm">{m.phase} • {m.timeline}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-primary tracking-tight">{m.title}</h3>
                    <ul className="space-y-2">
                      {m.items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary font-bold">›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {m.status === 'current' && (
                      <div className="mt-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Current Focus</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${m.status === 'complete' ? 'bg-primary border-primary' : m.status === 'current' ? 'bg-background border-primary' : 'bg-background border-primary/20'}`} />
                </div>

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
