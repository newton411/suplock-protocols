import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';

const stats = [
  { label: 'TVL', value: '$45M' },
  { label: 'Participants', value: '12k+' },
  { label: 'Avg APY', value: '32.9%' },
  { label: '$SUPRA Burned', value: '12M+' },
  { label: 'Mainnet Beta', value: 'Supra L1' },
];

const optimizations = [
  {
    title: 'Stablecoin Yield Vaults + Peg‑Stability Burns',
    points: [
      'Accepts USDC/USDT/iAssets with SupraOracles monitoring',
      'AutoFi rebalances + burns during peg deviations',
      '10–20% fee revenue, burns feed $SUPRA scarcity',
    ],
  },
  {
    title: 'Cross‑Chain Stablecoin Locking + Bridgeless Burn Flywheel',
    points: [
      'Lock bridged stables via HyperNova with over‑collateralization',
      'Zero‑liq borrows with yield feeding the burn vault',
      'Swap/bridge fees drive TVL and revenue',
    ],
  },
  {
    title: 'Compliance & Integrity Layer',
    points: [
      'Optional KYC/AML hooks & oracle‑audited reserves',
      'MiCA‑aligned governance for institutional tiers',
      'Premium fees from compliance services',
    ],
  },
  {
    title: 'Frictionless Spend Enhancements',
    points: [
      'Stable yields for payments/remittances via Supra primitives',
      'Built–in yield simulator for merchant onboarding',
      'Merchant/processor fees provide revenue',
    ],
  },
  {
    title: 'Run‑Protection Safeguards',
    points: [
      'Oracle circuit breakers + diversified reserve basket',
      'Fee‑funded insurance pool against runs',
      'Insurance premiums help preserve TVL',
    ],
  },
];

const utilities = [
  {
    name: 'BurnVault',
    bullets: [
      'Auto‑unwrap & auto‑burn 10–20% of deposits',
      'Earn PoEL yields on remaining principal',
      'Supports iAssets and stablecoins seamlessly',
    ],
  },
  {
    name: 'LockStake',
    bullets: [
      'Dual‑yield locking with AutoFi compounding',
      'veSUPRA multipliers (up to 4× for Mythics)',
      'Time‑weighted rewards + early‑exit penalties',
    ],
  },
  {
    name: 'LiquidityHub',
    bullets: [
      'Aggregator router for SupraLend/Solido/Atmos',
      'MEV capture layer & stable‑peg checks',
      'Cross‑vault liquidity routing',
    ],
  },
  {
    name: 'GovIncentivizer',
    bullets: [
      'iAsset‑weighted voting power',
      'Parameter proposals (burn rates, stable pairs)',
      'Revenue share for active participants',
    ],
  },
  {
    name: 'NFT Integration',
    bullets: ['Stake NFTs for boosts (+35% APY)', 'Evolve mechanics unlock rarity bonuses'],
  },
  {
    name: 'AutoFi Primitives',
    bullets: ['Intent execution & auto‑arbitrage', 'Risk modules for peg stability/burn triggers'],
  },
  {
    name: 'HyperNova Cross‑Chain',
    bullets: ['Bridgeless stable locking and burns', 'Native liquidity across Supra L1 and EVMs'],
  },
  {
    name: 'Security Suite',
    bullets: ['PeckShield audit planned', 'Oracle proofs & over‑collateralization'],
  },
];

export const StablecoinThesis = () => {
  // helper formats animated numbers back into original string with suffix
  const formatAnimated = (orig: string, anim: number) => {
    if (orig.includes('M')) return `$${anim.toFixed(1)}M`;
    if (orig.includes('k')) return `${anim.toFixed(0)}k+`;
    if (orig.includes('%')) return `${anim.toFixed(1)}%`;
    return orig;
  };

  // state used for simple count-up animation on stats
  const [animatedStats, setAnimatedStats] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    // simple linear animation for numeric components
    stats.forEach((s, i) => {
      const digits = parseFloat(s.value.replace(/[^0-9\.]/g, '')) || 0;
      let current = 0;
      const step = Math.max(1, digits / 60);
      const interval = setInterval(() => {
        current += step;
        if (current >= digits) {
          current = digits;
          clearInterval(interval);
        }
        setAnimatedStats((prev) => {
          const next = [...prev];
          next[i] = current;
          return next;
        });
      }, 30);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative overflow-hidden"
    >
      {/* hero */}
      <section className="relative h-screen flex items-center justify-center text-center bg-black">
        <div className="absolute inset-0 opacity-20">
          {/* matrix background is global; we rely on it */}
        </div>
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 space-y-6 px-4">
          <h1 className="text-4xl md:text-6xl font-bold neon-text tracking-tight uppercase">
            SUPLOCK Stablecoin Thesis:
            <br />
            Enhancing Crypto&apos;s Sound Money Engine
          </h1>
          <p className="text-primary/60 text-lg">Burn to Floor. Yield Forever – Now for Stables</p>
          <a
            href="/whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="matrix-btn-primary px-8 py-4 text-xl mt-4 inline-block"
          >
            Explore Whitepaper
          </a>
        </div>
      </section>

      <section className="container mx-auto px-6 py-20 space-y-16">
        {/* overview + stats */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold neon-text uppercase text-center">Thesis Overview</h2>
          <p className="text-primary/60 max-w-3xl mx-auto text-center">
            SUPLOCK closes the gaps in existing stablecoin designs by combining sound money
            integrity, run protection, elasticity and cross‑chain interoperability with a
            frictionless participation model. Our deflationary flywheel is driven by veSUPRA
            locking, yield optimization, and on‑chain burns that support a 10B floor for $SUPRA.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="matrix-card p-6 text-center neon-border hover:neon-border-lg transition-all hover:scale-105"
              >
                <div className="text-primary/60 text-sm uppercase tracking-widest">
                  {s.label}
                </div>
                <div className="text-2xl font-bold neon-text mt-2">
                  {formatAnimated(s.value, animatedStats[i])}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* optimizations */}
        <div className="space-y-12">
          {optimizations.map((opt, idx) => (
            <motion.div
              key={opt.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="matrix-card p-8 flex flex-col md:flex-row items-start gap-6 hover:scale-105 hover:neon-border-lg transition-transform"
            >
              <LinkIcon className="w-8 h-8 text-primary/40" />
              <div>
                <h3 className="text-xl font-bold uppercase neon-text mb-2">{opt.title}</h3>
                <ul className="list-disc list-inside text-primary/60 space-y-2">
                  {opt.points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* utilities grid */}
        <div>
          <h2 className="text-3xl font-bold neon-text uppercase text-center mb-8">
            Smart Contract Utilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {utilities.map((u, idx) => (
              <motion.div
                key={u.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="matrix-card p-6 hover:neon-border transition-all hover:scale-105"
              >
                <h4 className="text-lg font-bold neon-text mb-2">{u.name}</h4>
                <ul className="list-disc list-inside text-primary/60 space-y-1">
                  {u.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* implementation path & flywheel */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold neon-text uppercase text-center">
            Implementation & Revenue Flywheel
          </h2>
          <ul className="list-disc list-inside text-primary/60 space-y-2 max-w-3xl mx-auto">
            <li>
              Short‑term rollout of vaults and cross‑chain mechanics; medium‑term
              governance/compliance modules.
            </li>
            <li>Fees are collected on swaps, vaults, bridges and premium services.</li>
            <li>
              Collected fees are automatically split between redistribution, governance rewards and
              protocol burns that feed the 10B $SUPRA scarcity engine.
            </li>
            <li>
              Over time the auto‑burn flywheel reduces supply, supporting stability and value.
            </li>
            <li>
              Risk mitigation via audits, MEV shields, circuit breakers and diversified reserves.
            </li>
          </ul>
        </div>
      </section>
    </motion.div>
  );
};

export default StablecoinThesis;
