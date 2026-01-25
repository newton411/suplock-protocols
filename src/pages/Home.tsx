import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  ShieldCheck, 
  Zap, 
  Database, 
  BarChart3, 
  TrendingUp, 
  ChevronRight, 
  Github, 
  Twitter, 
  Lock, 
  Repeat, 
  Globe, 
  ArrowRight,
  Download,
  FileText,
  User,
  Users,
  Activity,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsDashboard } from '../components/StatsDashboard';
import { Roadmap } from '../components/Roadmap';
import { YieldCalculator } from '../components/YieldCalculator';

export function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 matrix-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Next-Gen Supra L1 Tokenomics</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter leading-tight neon-text uppercase">
                Revolutionizing <br />
                <span className="text-primary font-black">$SUPRA</span> Tokenomics
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto uppercase tracking-wide font-mono leading-relaxed">
                "Burn to Floor. Yield Forever." <br />
                Deflation, Yields, and Automation built natively for the Supra ecosystem.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/locking" className="matrix-btn-primary w-full sm:w-auto">
                  Start Locking
                </Link>
                <Link to="/vaults" className="matrix-btn-secondary w-full sm:w-auto">
                  Explore Vaults
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-12 bg-primary/[0.02] border-y border-primary/10">
        <div className="container mx-auto px-4">
          <StatsDashboard />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 neon-text tracking-tighter uppercase">What is SUPLOCK?</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                SUPLOCK is a comprehensive DeFi protocol engineered to solve the long-term sustainability challenges of the $SUPRA token. By implementing a multi-layered burning and reward mechanism, we aim to establish a permanent price floor while maximizing holder value.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                <strong className="text-primary">In simple terms:</strong> Think of SUPLOCK like a reverse vending machine for $SUPRA. Instead of prices falling because of endless selling, we automatically buy and burn tokens to create scarcity—while rewarding you for participating.
              </p>
              <p className="text-muted-foreground mb-10 leading-relaxed">
                Our architecture combines vote-escrow locking (veSUPRA), governance incentives, and privacy-preserving yield vaults, all running on the ultra-high-performance Supra L1.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border-l-2 border-primary bg-primary/5">
                  <h4 className="text-primary font-bold uppercase text-xs mb-1">Founder</h4>
                  <p className="text-lg font-bold">@Newton_crypt</p>
                </div>
                <div className="p-4 border-l-2 border-primary bg-primary/5">
                  <h4 className="text-primary font-bold uppercase text-xs mb-1">L1 Chain</h4>
                  <p className="text-lg font-bold">Supra L1</p>
                </div>
              </div>
            </motion.div>
            
            <div className="relative">
              <div className="matrix-card p-1">
                <img 
                  src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3" 
                  alt="DeFi" 
                  className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-color" />
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-8 -left-8 matrix-card p-6 bg-background/90 backdrop-blur-md hidden md:block border-primary/50">
                <Activity className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm font-bold uppercase">Mainnet Beta Live</p>
                <p className="text-[10px] text-muted-foreground uppercase">Stability Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-primary/[0.01]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text tracking-tighter uppercase">Protocol Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto uppercase text-xs tracking-widest font-bold">Cutting-edge DeFi primitives on Supra L1</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Vote-Escrow Locking', desc: 'Lock $SUPRA to receive veSUPRA, granting governance power and a share of protocol fees.', icon: <Lock className="w-8 h-8" /> },
              { title: 'Deflationary Vaults', desc: 'Automated mechanisms that buy and burn $SUPRA to maintain a constant supply floor.', icon: <Flame className="w-8 h-8" /> },
              { title: 'Yield Optimization', desc: 'Privacy-preserving vaults that maximize returns via dual PoEL and delta-neutral strategies.', icon: <Repeat className="w-8 h-8" /> },
              { title: 'Governance DAO', desc: 'Full community control over protocol parameters, emissions, and treasury allocation.', icon: <Users className="w-8 h-8" /> },
              { title: 'AutoFi Primitives', desc: 'Intent-based execution engines that automate complex DeFi loops for maximum efficiency.', icon: <Zap className="w-8 h-8" /> },
              { title: 'Cross-Chain Burn', desc: 'HyperNova-powered bridges that allow burning assets from other chains to boost rewards.', icon: <Globe className="w-8 h-8" /> }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="matrix-card p-8 group hover:bg-primary/5 transition-colors"
              >
                <div className="p-3 bg-primary/10 rounded-sm w-fit mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary uppercase tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 neon-text tracking-tighter uppercase text-center">Why This Matters for $SUPRA</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="matrix-card p-8 border-l-4 border-primary"
              >
                <h3 className="text-xl font-bold mb-4 text-primary uppercase">The Supply Problem</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Most tokens face a fundamental issue: unlimited selling pressure crushes prices. $SUPRA needs active demand destruction to reach its 10B supply floor.
                </p>
                <p className="text-xs text-primary/60 italic">
                  SUPLOCK solves this by automatically redirecting protocol profits to buy and burn tokens—creating a "price floor" that protects your investment.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="matrix-card p-8 border-l-4 border-accent"
              >
                <h3 className="text-xl font-bold mb-4 text-accent uppercase">The Yield Opportunity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Passive holders get nothing. Active participants with SUPLOCK earn consistent yields while helping strengthen the token.
                </p>
                <p className="text-xs text-accent/60 italic">
                  Lock your tokens, earn yields, AND earn a share of protocol revenue—all while the supply floor strengthens beneath your position.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="matrix-card p-8 border-l-4 border-primary"
              >
                <h3 className="text-xl font-bold mb-4 text-primary uppercase">Community Ownership</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  In traditional finance, corporations make decisions for you. SUPLOCK puts YOU in control.
                </p>
                <p className="text-xs text-primary/60 italic">
                  veSUPRA holders vote on everything: fee distribution, vault parameters, even treasury spending. Your lock duration = your voting power.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="matrix-card p-8 border-l-4 border-accent"
              >
                <h3 className="text-xl font-bold mb-4 text-accent uppercase">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Traditional DeFi vaults leak information about your positions, enabling "MEV" (miners extracting value from you).
                </p>
                <p className="text-xs text-accent/60 italic">
                  SUPLOCK's LP Vacuum layer encrypts all yield strategies, protecting your profits from being frontrun or exploited.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="matrix-card p-8 md:p-12 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
            >
              <h3 className="text-2xl font-bold mb-6 uppercase">The Core Promise: "Burn to Floor. Yield Forever."</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10B</div>
                  <p className="text-sm text-muted-foreground">Supply floor target ensures price support as scarcity increases.</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">12-42%</div>
                  <p className="text-sm text-muted-foreground">Annual yields for locked holders, adjusted by lock duration.</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">∞</div>
                  <p className="text-sm text-muted-foreground">Perpetual fee-sharing with veSUPRA holders—forever.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Yield Calculator Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text tracking-tighter uppercase">Simulate Your Growth</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto uppercase text-xs tracking-widest font-bold">Calculate potential returns with SUPLOCK optimization</p>
          </div>
          <YieldCalculator />
        </div>
      </section>

      {/* Infographic Section */}
      <section className="py-24 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 neon-text tracking-tighter uppercase">Protocol Architecture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto uppercase text-xs tracking-widest font-bold">The $SUPRA Deflationary Engine</p>
          </div>
          
          <div className="matrix-card p-1 md:p-8 bg-black/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 relative aspect-video bg-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden">
                {/* Simulated Diagram */}
                <div className="absolute inset-0 matrix-grid opacity-10" />
                <div className="relative z-10 flex flex-col items-center gap-8 p-4 md:p-12 w-full max-w-2xl">
                  <div className="flex justify-between w-full">
                    <div className="p-4 border border-primary bg-background text-[10px] font-bold uppercase">Community Deposits</div>
                    <div className="p-4 border border-primary bg-background text-[10px] font-bold uppercase">External Yields</div>
                  </div>
                  <div className="w-0.5 h-12 bg-primary animate-pulse" />
                  <div className="p-6 border-2 border-primary bg-primary/10 text-center w-full">
                    <h4 className="text-primary font-bold uppercase tracking-widest mb-2">SUPLOCK Core Engine</h4>
                    <p className="text-[10px] text-muted-foreground">Automation • Optimization • Redistribution</p>
                  </div>
                  <div className="flex justify-between w-full items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-12 bg-primary" />
                      <div className="p-4 border border-orange-500 bg-orange-500/10 text-[10px] font-bold uppercase text-orange-500">Burn Vault (10B Floor)</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-12 bg-primary" />
                      <div className="p-4 border border-primary bg-primary/10 text-[10px] font-bold uppercase">veSUPRA Holders (Yield)</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
                  <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">1. Capital Inflow</h4>
                  <p className="text-xs text-muted-foreground">Holders deposit $SUPRA or iAssets to participate in the deflationary fly-wheel.</p>
                </div>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
                  <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">2. Yield Capture</h4>
                  <p className="text-xs text-muted-foreground">Natively optimized strategies capture PoEL and external DeFi yields.</p>
                </div>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
                  <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">3. Floor Maintenance</h4>
                  <p className="text-xs text-muted-foreground">A portion of all yields is redirected to the BurnVault to aggressively lower $SUPRA supply.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap">
        <Roadmap />
      </section>

      {/* Whitepaper Section */}
      <section id="whitepaper" className="py-24 bg-primary/[0.02]">
        <div className="container mx-auto px-4">
          <div className="matrix-card p-12 text-center max-w-4xl mx-auto border-2 border-primary/50 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text tracking-tighter uppercase">Deep Dive into $SUPRA</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
              Explore the technical implementation, mathematical models, and game theory behind the SUPLOCK Protocol. 
              Our whitepapers detail the transition from high-supply to the 10B floor, and the evolution toward fully autonomous DeFi.
            </p>
            <p className="text-sm text-primary/70 mb-8 italic">
              <strong>New to DeFi?</strong> Start with Phase 1 to understand the basics. Ready for advanced concepts? Phase 2 covers automation and governance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="https://gamma.app/docs/SUPLOCK-Protocol-n46yb80drrasx2f" 
                target="_blank"
                rel="noopener noreferrer"
                className="matrix-btn-primary flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> Phase 1: SUPLOCK Protocol
              </a>
              <a 
                href="https://gamma.app/docs/SUPLOCK-Phase-2-Autonomous-Yield-Engine-for-Supra-L1-esrcnhubfuncuq5" 
                target="_blank"
                rel="noopener noreferrer"
                className="matrix-btn-secondary flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" /> Phase 2: Autonomous Yield Engine
              </a>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center text-primary uppercase">What You'll Learn</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 border border-primary/20 bg-primary/5"
              >
                <h4 className="font-bold text-primary mb-3 uppercase">Phase 1: SUPLOCK Protocol</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Why $SUPRA needs supply destruction</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> How the 10B supply floor works</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> veSUPRA locking mechanics explained</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Yield generation strategies (simple version)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rotate-45" /> Fee distribution model</li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 border border-accent/20 bg-accent/5"
              >
                <h4 className="font-bold text-accent mb-3 uppercase">Phase 2: Autonomous Yield Engine</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rotate-45" /> Intent-based execution engines (AutoFi)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rotate-45" /> Cross-chain coordination with HyperNova</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rotate-45" /> Advanced yield strategies (delta-neutral, MEV protection)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rotate-45" /> Governance DAO architecture</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rotate-45" /> Long-term token economics (24+ month projections)</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit & Trust Section */}
      <section className="py-20 border-t border-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h4 className="text-xs font-bold uppercase tracking-[0.5em] text-muted-foreground mb-12">Security Partners & Audit Status</h4>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-12 h-12 mb-2" />
              <span className="text-xs font-bold font-mono">PeckShield (Planned)</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-12 h-12 mb-2" />
              <span className="text-xs font-bold font-mono">Supra Grants</span>
            </div>
            <div className="flex flex-col items-center">
              <Github className="w-12 h-12 mb-2" />
              <span className="text-xs font-bold font-mono">Open Source</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary/10">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter uppercase neon-text">Join the Revolution</h2>
          <p className="text-xl text-primary/80 mb-12 max-w-2xl mx-auto uppercase font-bold tracking-widest leading-relaxed">
            The era of "burn to floor" has begun. Secure your share of the $SUPRA future.
          </p>
          <div className="flex justify-center">
            <Link to="/locking" className="matrix-btn-primary group flex items-center gap-2 px-12 py-4">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full matrix-grid opacity-10 pointer-events-none" />
      </section>
    </div>
  );
}
