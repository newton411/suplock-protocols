import React from 'react';
import { motion } from 'framer-motion';
import { Vote, FileText, Users, TrendingUp, Globe, Lock, Zap, Database, Repeat, Share2, RefreshCw, BookOpen } from 'lucide-react';
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

      {/* Why Governance Matters */}
      <div className="max-w-4xl mx-auto space-y-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="matrix-card p-8 border-l-4 border-primary bg-gradient-to-r from-primary/10 to-transparent"
        >
          <h3 className="text-lg font-bold text-primary mb-4 uppercase">Why Governance Matters</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            In traditional finance, banks and fund managers decide everything. In SUPLOCK, <strong>YOU decide</strong>. Every veSUPRA token you hold is a vote—a direct say in how protocol revenue flows and what features get built.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This matters because protocol decisions directly affect your returns. Should we burn more tokens? Increase vault rewards? Distribute more fees? Your voice decides, not some centralized team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="matrix-card p-8 border-2 border-primary/30"
        >
          <h3 className="text-lg font-bold text-primary mb-6 uppercase">How Voting Works (4 Simple Steps)</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-bold text-primary">1</div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1 uppercase">Lock Your $SUPRA</h4>
                <p className="text-xs text-muted-foreground">Lock tokens for 3-48 months to receive veSUPRA governance tokens. More locked = more voting power.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-bold text-primary">2</div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1 uppercase">See Active Proposals</h4>
                <p className="text-xs text-muted-foreground">New proposals appear every week. Read the details, check if it benefits you, then decide.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-bold text-primary">3</div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1 uppercase">Cast Your Vote</h4>
                <p className="text-xs text-muted-foreground">Use your veSUPRA to vote FOR or AGAINST. You have 7 days. Each veSUPRA = 1 vote.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/20 border border-primary rounded-full flex items-center justify-center font-bold text-primary">4</div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1 uppercase">Changes Execute</h4>
                <p className="text-xs text-muted-foreground">If your vote passes (&gt;50%), the change happens automatically 3 days later (timelock for security).</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="matrix-card p-8 bg-accent/5 border-l-4 border-accent"
        >
          <h3 className="text-lg font-bold text-accent mb-6 uppercase">What You Can Vote On</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-accent font-bold text-lg mt-1">💰</span>
                <div>
                  <h4 className="font-bold text-primary uppercase text-sm">Revenue Distribution</h4>
                  <p className="text-xs text-muted-foreground">How protocol fees are split: burn%, dividends%, vault rewards%, treasury%</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-accent font-bold text-lg mt-1">⚙️</span>
                <div>
                  <h4 className="font-bold text-primary uppercase text-sm">Vault Parameters</h4>
                  <p className="text-xs text-muted-foreground">Adjust APY targets, risk levels, and which assets are supported</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-accent font-bold text-lg mt-1">🏦</span>
                <div>
                  <h4 className="font-bold text-primary uppercase text-sm">Treasury Allocation</h4>
                  <p className="text-xs text-muted-foreground">Decide where protocol funds go: audits, partnerships, grants, rewards</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-accent font-bold text-lg mt-1">🔒</span>
                <div>
                  <h4 className="font-bold text-primary uppercase text-sm">Locking Rules</h4>
                  <p className="text-xs text-muted-foreground">Minimum lock duration, boost multiplier formulas, early unlock penalties</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-accent font-bold text-lg mt-1">🌉</span>
                <div>
                  <h4 className="font-bold text-primary uppercase text-sm">New Integrations</h4>
                  <p className="text-xs text-muted-foreground">Whitelist new assets, activate cross-chain bridges, launch new vaults</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-accent font-bold text-lg mt-1">🛠️</span>
                <div>
                  <h4 className="font-bold text-primary uppercase text-sm">Protocol Upgrades</h4>
                  <p className="text-xs text-muted-foreground">Major changes to contracts or mechanics require community approval</p>
                </div>
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
          <h3 className="text-lg font-bold text-primary mb-4 uppercase">Real-World Voting Example</h3>
          <div className="space-y-4 text-sm">
            <div className="p-4 border border-primary/20 bg-background/50 rounded">
              <p className="font-bold mb-2">Proposal: "Increase USDC Vault APY from 18.9% to 22%"</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Your veSUPRA voting power:</span>
                  <span className="font-bold">175,000</span>
                </div>
                <div className="flex justify-between">
                  <span>You vote: FOR (Approved)</span>
                  <span className="font-bold">+175,000 votes</span>
                </div>
                <div className="border-t border-primary/10 pt-2">
                  <div className="flex justify-between mb-1">
                    <span>Total votes for proposal:</span>
                    <span className="font-bold">45.3M veSUPRA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Result:</span>
                    <span className="font-bold text-primary">PASSED (68% approval)</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              3 days later: The vault APY automatically increases to 22%, and everyone begins earning higher yields. Your governance power directly improved protocol performance.
            </p>
          </div>
        </motion.div>
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
