import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock, Vote, Zap, Database, RefreshCw, ArrowDownRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Restake = () => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
    { id: 'restake', label: 'Restake', icon: RefreshCw, path: '/restake' },
  ];

  const protocols = [
    {
      id: 'supralend',
      name: 'Supralend',
      description:
        'Stake SUPRA in Supralend pools and earn lending yield. Restake here to double‑dip into SUPLOCK vaults.',
      icon: ArrowDownRight,
    },
    {
      id: 'solido',
      name: 'Solido Money',
      description:
        'Convert your iSUPRA / iAssets from Solido Money into SUPRA or stSUPRA and redeploy into SUPLOCK strategies.',
      icon: ArrowDownRight,
    },
    {
      id: 'atmos',
      name: 'Atmos Protocol',
      description:
        'Atmos LP positions with SUPRA pairs can be imported and restaked to earn protocol revenue plus SUPLOCK yields.',
      icon: ArrowDownRight,
    },
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

      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">
          Cross‑Protocol Restaking
        </h2>
        <p className="text-primary/60 font-mono text-sm">
          Bring SUPRA / stSUPRA from Supralend, Solido Money, Atmos and other Supra pools and
          vaults; restake them on SUPLOCK to compound your earnings.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {protocols.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="matrix-card p-8 border-l-4 border-primary"
          >
            <div className="flex items-start gap-4 mb-6">
              <h3 className="text-2xl font-bold text-primary capitalize">{p.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
            <button className="matrix-btn-primary w-full h-12 flex items-center justify-center gap-2">
              <p.icon className="w-4 h-4" /> RESTAKE_FROM_{p.id.toUpperCase()}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="matrix-card p-8 border-l-4 border-accent bg-accent/5"
        >
          <h3 className="text-lg font-bold text-accent mb-4 uppercase">iAsset Conversion</h3>
          <p className="text-sm text-muted-foreground">
            If you hold derivative assets (iSUPRA, iAssets) from partner protocols, you can convert
            them into SUPRA or stSUPRA here and then deposit into any SUPLOCK vault or pool. This
            ensures your capital is fully reusable and earning on both platforms.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Restake;
