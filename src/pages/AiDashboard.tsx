import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Search, 
  Bell, 
  Moon, 
  ChevronDown, 
  Flame, 
  Database, 
  BarChart3, 
  Users, 
  LayoutDashboard, 
  TrendingUp, 
  Lock, 
  GitBranch, 
  ArrowLeftRight, 
  Image as ImageIcon, 
  Github, 
  Settings, 
  UserCircle,
  ExternalLink,
  Cpu,
  ShieldCheck,
  Activity,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Terminal,
  BrainCircuit
} from 'lucide-react';
import { useSupraContract } from '../hooks/useSupraContract';
import { useOracleFeeds } from '../hooks/useOracle';
import { toast } from 'sonner';

// --- Stylized Branding Graphic ---
const SuplockLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-[0_0_10px_rgba(0,255,64,0.5)]">
    <rect x="20" y="20" width="60" height="60" rx="4" fill="none" stroke="#00ff40" strokeWidth="4" />
    <path d="M40 50 L50 60 L70 40" fill="none" stroke="#00ff40" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#00ff40" strokeWidth="2" strokeDasharray="8 4" className="animate-spin-slow" />
  </svg>
);

const AiDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeDropdown, setActiveTabDropdown] = useState<string | null>(null);
  const { feeds } = useOracleFeeds();
  const { executeTransaction } = useSupraContract();

  // Mock data for AI insights
  const aiInsights = [
    { title: 'Liquidity Optimization', desc: 'AI suggests shifting 12% to Stable Vault for 2.4% APY gain.', confidence: 94 },
    { title: 'Security Alert', desc: 'Anomalous bridge activity detected on Polygon. OMEGA Shield active.', confidence: 99 },
    { title: 'Whale Movement', desc: '1.2M $SUPRA locked for 48 months by wallet 0x4f...a2b.', confidence: 88 }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-primary selection:text-black">
      {/* --- Matrix Background (Canvas simulated by CSS/SVG) --- */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,64,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,64,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* --- Sidebar --- */}
        <aside className="w-16 flex-shrink-0 bg-[#050505] border-r border-primary/20 flex flex-col items-center py-6 gap-4">
          <div className="mb-8 hover:scale-110 transition-transform cursor-pointer">
            <SuplockLogo />
          </div>
          
          <nav className="flex flex-col gap-2">
            {[
              { id: 'overview', icon: LayoutDashboard },
              { id: 'chart', icon: TrendingUp },
              { id: 'vault', icon: Database },
              { id: 'lock', icon: Lock },
              { id: 'bridge', icon: GitBranch },
              { id: 'swap', icon: ArrowLeftRight },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-10 h-10 flex items-center justify-center transition-all ${
                  activeTab === item.id 
                    ? 'text-primary border-l-2 border-primary bg-primary/5 shadow-[inset_0_0_12px_rgba(0,255,64,0.1)]' 
                    : 'text-white/30 hover:text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </nav>

          <div className="w-8 h-px bg-white/10 my-4" />

          <div className="flex flex-col gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-primary"><ImageIcon className="w-5 h-5" /></button>
            <button className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-primary"><Users className="w-5 h-5" /></button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-primary"><Github className="w-5 h-5" /></a>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-primary"><Settings className="w-5 h-5" /></button>
            <button className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-primary"><UserCircle className="w-5 h-5" /></button>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-14 bg-[#050505] border-b border-primary/20 flex items-center px-6 gap-6 relative">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f2ff] via-[#00ff40] via-[#ff0080] to-[#ff4400]" />
            
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <Zap className="w-3 h-3 text-primary" />
              <span>{new Date().toDateString().toUpperCase()}</span>
              <span className="text-primary ml-2 animate-pulse">{new Date().toLocaleTimeString()}</span>
            </div>

            <div className="flex-1 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="EXECUTE_COMMAND..." 
                className="w-full bg-[#0d0d0d] border border-white/10 py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-all rounded-sm"
              />
            </div>

            <div className="ml-auto flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 border border-white/10 text-[9px] text-white/40">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#00ff40]" />
                NETWORK: SUPRA_L1
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <button className="hover:text-primary"><Bell className="w-4 h-4" /></button>
                <button className="hover:text-primary"><Cpu className="w-4 h-4" /></button>
                <button className="hover:text-primary"><Moon className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-3 pl-6 border-l border-white/10 group cursor-pointer">
                <div className="text-right">
                  <div className="text-[10px] font-bold">0xAI_AGENT</div>
                  <div className="text-[8px] text-white/30">ID: OMEGA-411</div>
                </div>
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-black font-bold text-xs rounded-sm">0X</div>
                <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-primary" />
              </div>
            </div>
          </header>

          {/* Ticker */}
          <div className="h-6 bg-black border-b border-primary/10 overflow-hidden flex items-center">
            <div className="flex whitespace-nowrap animate-ticker gap-12 px-6">
              {[
                { label: '$SUPRA', val: '$2.418', change: '+12.4%', up: true },
                { label: 'TOTAL_BURNED', val: '12.5M' },
                { label: 'TVL', val: '$45.3M' },
                { label: 'AVG_APY', val: '32.5%', up: true },
                { label: 'SECURITY', val: 'OMEGA', color: 'text-primary' },
                { label: 'AI_LOGIC', val: 'OPTIMIZED', color: 'text-cyan-400' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-wider">
                  <span className="text-white/20">{item.label}</span>
                  <span className={item.color || 'text-primary'}>{item.val}</span>
                  {item.change && <span className={item.up ? 'text-primary' : 'text-red-500'}>▲ {item.change}</span>}
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                { label: '$SUPRA', val: '$2.418', change: '+12.4%', up: true },
                { label: 'TOTAL_BURNED', val: '12.5M' },
                { label: 'TVL', val: '$45.3M' },
                { label: 'AVG_APY', val: '32.5%', up: true },
                { label: 'SECURITY', val: 'OMEGA', color: 'text-primary' },
                { label: 'AI_LOGIC', val: 'OPTIMIZED', color: 'text-cyan-400' }
              ].map((item, i) => (
                <div key={`dup-${i}`} className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-wider">
                  <span className="text-white/20">{item.label}</span>
                  <span className={item.color || 'text-primary'}>{item.val}</span>
                  {item.change && <span className={item.up ? 'text-primary' : 'text-red-500'}>▲ {item.change}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Page Command Bar (DROPDOWNS BELOW PAGES) */}
          <div className="bg-[#0a0a0a] border-b border-primary/20 px-6 py-2 flex items-center justify-between">
            <div className="flex gap-4">
              {/* Dropdown 1: Protocol Section */}
              <div className="relative">
                <button 
                  onClick={() => setActiveTabDropdown(activeDropdown === 'category' ? null : 'category')}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 hover:border-primary/50 text-[10px] font-bold uppercase transition-all"
                >
                  <Filter className="w-3 h-3 text-primary" />
                  Category: {activeTab.toUpperCase()}
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeDropdown === 'category' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-1 left-0 w-48 bg-[#0a0a0a] border border-primary/30 p-1 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    >
                      {['overview', 'vaults', 'governance', 'nfts', 'bridge'].map((cat) => (
                        <button 
                          key={cat}
                          className="w-full text-left px-3 py-2 text-[10px] uppercase hover:bg-primary/10 hover:text-primary transition-colors border-b border-white/5 last:border-0"
                          onClick={() => { setActiveTab(cat); setActiveTabDropdown(null); }}
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dropdown 2: Timeframe */}
              <div className="relative">
                <button 
                  onClick={() => setActiveTabDropdown(activeDropdown === 'time' ? null : 'time')}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 hover:border-primary/50 text-[10px] font-bold uppercase transition-all"
                >
                  <Activity className="w-3 h-3 text-cyan-400" />
                  Timeframe: 1 Month
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'time' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="matrix-btn-primary px-6 py-1.5 text-[10px]">INITIALIZE_AI_SCAN</button>
              <button className="bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 text-[10px] font-bold hover:bg-primary hover:text-black transition-all">CONNECT_NODES</button>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'TOTAL_BURNED', val: '12,543,029', icon: Flame, color: 'text-primary', glow: 'shadow-[0_0_15px_rgba(0,255,64,0.3)]' },
                { label: 'TVL_CAPACITY', val: '$45,293,041', icon: Database, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(0,242,255,0.3)]' },
                { label: 'AVERAGE_APY', val: '32.5%', icon: BarChart3, color: 'text-pink-500', glow: 'shadow-[0_0_15px_rgba(255,0,128,0.3)]' },
                { label: 'TOTAL_USERS', val: '12,402', icon: Users, color: 'text-yellow-500', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0a0a0a] border border-primary/20 p-5 relative overflow-hidden group hover:border-primary/50 transition-all"
                >
                  {/* Top color bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] ${stat.color.replace('text-', 'bg-')}`} />
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] text-white/40 tracking-[2px] uppercase">{stat.label}</span>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold tracking-tighter ${stat.color} drop-shadow-sm`}>
                    {stat.val}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse" />
                    <span className="text-[8px] text-white/20 uppercase">Real-time sync active</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dashboard Core Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Visual/Chart Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0a0a0a] border border-primary/20 p-6 rounded-sm relative overflow-hidden h-[400px]">
                  <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#00ff40,transparent_70%)]" />
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-sm border border-primary/30">
                        <SuplockLogo />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest">Protocol_Neural_Network</h3>
                        <div className="flex items-center gap-2 text-[10px] text-primary">
                          <span className="animate-pulse">●</span> LIVE_LOGIC_STREAM
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['1D', '1W', '1M', '1Y'].map(t => (
                        <button key={t} className={`px-3 py-1 text-[9px] border ${t === '1M' ? 'border-primary text-primary bg-primary/5' : 'border-white/10 text-white/40'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stylized SVG Chart / Neural Network Representation */}
                  <div className="relative h-64 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                      <defs>
                        <linearGradient id="neuralGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ff0080" />
                          <stop offset="50%" stopColor="#00f2ff" />
                          <stop offset="100%" stopColor="#00ff40" />
                        </linearGradient>
                      </defs>
                      {/* Connection Lines */}
                      <path d="M50 150 Q200 50 400 120 T750 80" fill="none" stroke="url(#neuralGrad)" strokeWidth="3" className="drop-shadow-[0_0_15px_rgba(0,255,64,0.5)]" />
                      <path d="M50 120 Q200 180 400 100 T750 140" fill="none" stroke="#00f2ff" strokeWidth="1" strokeDasharray="5 5" opacity="0.3" />
                      
                      {/* Interaction Nodes */}
                      {[50, 200, 400, 600, 750].map((x, i) => (
                        <g key={i} className="hover:scale-125 transition-transform cursor-pointer origin-center">
                          <circle cx={x} cy={Math.sin(x) * 50 + 100} r="4" fill="#fff" className="animate-pulse" />
                          <circle cx={x} cy={Math.sin(x) * 50 + 100} r="8" fill="none" stroke="rgba(0,255,64,0.5)" strokeWidth="1" />
                        </g>
                      ))}
                    </svg>
                    
                    {/* Floating Info Overlays */}
                    <div className="absolute top-10 left-1/4 p-2 bg-black/80 border border-primary/30 text-[9px] uppercase backdrop-blur-md">
                      <div className="text-primary font-bold mb-1">NODE_04: STABLE_VAULT</div>
                      <div className="text-white/60">Flow: +2.4M SUPRA</div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[8px] text-white/20 uppercase tracking-widest border-t border-white/5 pt-4">
                    <span>Alpha_Logic_Engine_v2.0</span>
                    <span>Last_Computation: 0.002ms ago</span>
                    <span>Status: Nominal</span>
                  </div>
                </div>

                {/* AI Insights Board */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#050505] border border-primary/10 p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> AI_Reasoning_Engine
                    </h4>
                    <div className="space-y-4 overflow-y-auto h-48 custom-scrollbar">
                      {aiInsights.map((insight, i) => (
                        <div key={i} className="p-3 bg-white/5 border-l-2 border-primary/50 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1 text-[8px] text-primary/30">CONF: {insight.confidence}%</div>
                          <div className="text-[10px] font-bold text-white/80 mb-1">{insight.title}</div>
                          <p className="text-[9px] text-white/40 leading-relaxed">{insight.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-[#050505] border border-cyan-500/10 p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> System_Logs
                    </h4>
                    <div className="bg-black p-3 font-mono text-[8px] text-cyan-400/60 h-48 overflow-y-auto space-y-1 custom-scrollbar">
                      <div>&gt; Initializing Supra_L1_Connection...</div>
                      <div>&gt; Validating Smart_Contract_Interfaces...</div>
                      <div>&gt; Core::suplock_core [CONNECTED]</div>
                      <div>&gt; Integration::oracle [SYNCING]</div>
                      <div>&gt; Fetching Oracle Pair 0 (BTC/USD)...</div>
                      <div className="text-primary">&gt; Received: $92,410.42</div>
                      <div>&gt; Calculating Governance_Multiplier...</div>
                      <div>&gt; Status: All systems nominal.</div>
                      <div className="animate-pulse">_</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel / Portfolio Sidebar */}
              <div className="space-y-6">
                <div className="bg-[#0a0a0a] border border-primary/20 p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary/20 flex items-center justify-center border border-primary/40 rounded-sm">
                      <SuplockLogo />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-tight">MY_PORTFOLIO</h3>
                      <div className="text-[9px] text-white/30 tracking-widest">SUPRA L1 NETWORK</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] text-white/40 uppercase mb-1">Estimated Balance</div>
                    <div className="text-3xl font-black text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(0,255,64,0.3)]">$8,089.42</div>
                    <div className="text-[9px] text-primary/60 mt-1 uppercase flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> +12.4% vs last week
                    </div>
                  </div>

                  <a 
                    href="#" 
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-primary/50 transition-all group"
                  >
                    <span className="text-[10px] font-bold uppercase">View Official Site</span>
                    <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-primary transition-colors" />
                  </a>

                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Asset Breakdown</h4>
                    {[
                      { label: 'LOCKED_SUPRA', val: '2,500.00', usd: '$6,045', color: 'bg-primary' },
                      { label: 'VAULT_USDC', val: '1,200.00', usd: '$1,200', color: 'bg-cyan-400' },
                      { label: 'STAKED_NFTS', val: '3', usd: '$844', color: 'bg-pink-500' }
                    ].map((asset, i) => (
                      <div key={i} className="flex justify-between items-center group">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-3 ${asset.color}`} />
                          <div className="text-[10px] group-hover:text-white transition-colors">{asset.label}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold">{asset.val}</div>
                          <div className="text-[8px] text-white/30">{asset.usd}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="matrix-btn-primary w-full py-4 text-xs font-black tracking-widest uppercase mt-4">
                    MANAGE_ASSETS
                  </button>
                </div>

                {/* Network Health */}
                <div className="bg-[#0a0a0a] border border-primary/20 p-6 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck className="w-16 h-16 text-primary rotate-12" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Network_Health</h4>
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase">
                        <span>TPS Load</span>
                        <span className="text-primary">4,291</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[45%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase">
                        <span>Block Time</span>
                        <span className="text-primary">0.42s</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 w-[92%]" />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-[8px] text-white/30 uppercase italic">
                        All protocol nodes validated by OMEGA-SHIELD cryptography.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00ff4022;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00ff4044;
        }
      `}</style>
    </div>
  );
};

export default AiDashboard;
