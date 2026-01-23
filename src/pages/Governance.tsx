import React from 'react';
import { motion } from 'framer-motion';
import { Vote, FileText, Users, TrendingUp, Globe, Lock, Zap, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { InfoPopover, protocolInfo } from '../components/ui/info-popover';
import { InfoBanner } from '../components/InfoBanner';

const Governance = () => {
  const proposals = [
    { id: 'SIP-004', title: 'Adjust Yield Vault Multipliers', status: 'Active', votes: '12.4M', endsIn: '2d 4h' },
    { id: 'SIP-003', title: 'Enable veSUPRA Dividend Distribution', status: 'Passed', votes: '45.1M', endsIn: 'Ended' },
    { id: 'SIP-002', title: 'Whitelist New Collateral Assets', status: 'Passed', votes: '38.9M', endsIn: 'Ended' },
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
          <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">DAO_Governance</h2>
          <InfoPopover {...protocolInfo.governance} />
        </div>
        <p className="text-primary/60 font-mono text-sm">Shape the future of SUPLOCK protocol through decentralized voting.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <InfoBanner
          title="Community-Driven Protocol"
          description="As a veSUPRA holder, you have real power over SUPLOCK. Vote on revenue distribution percentages, vault parameters, treasury allocations, and new feature proposals. One veSUPRA equals one vote."
          tip="Longer lock durations give you more veSUPRA, which means more voting power."
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Total Proposals', value: '142', icon: FileText },
          { label: 'Active Voters', value: '12.4K', icon: Users },
          { label: 'Participation Rate', value: '68.4%', icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="matrix-card p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 border border-primary/20">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-[10px] text-primary/40 uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-bold tracking-tighter neon-text">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold uppercase tracking-tighter neon-text">Active_Proposals</h3>
          <button className="matrix-btn-secondary py-1 px-4 text-xs">Create_Proposal</button>
        </div>

        <div className="grid gap-4">
          {proposals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="matrix-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary px-2 py-0.5 border border-primary/30 bg-primary/5 uppercase">{p.id}</span>
                  <span className={`text-[10px] uppercase font-bold ${p.status === 'Active' ? 'text-accent animate-pulse' : 'text-primary/40'}`}>
                    [{p.status}]
                  </span>
                </div>
                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{p.title}</h4>
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
                <div className="text-right">
                  <div className="text-[10px] text-primary/40 uppercase">Total Votes</div>
                  <div className="text-sm font-bold">{p.votes} veSUPRA</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-primary/40 uppercase">Time Remaining</div>
                  <div className="text-sm font-bold text-primary">{p.endsIn}</div>
                </div>
                <button className="matrix-btn-primary px-6 py-2 text-xs">View_Details</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Governance;
