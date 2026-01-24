import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Bridge, Zap, Globe, Lock, Vote, Database, ArrowRight, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { InfoPopover, protocolInfo } from '../components/ui/info-popover';
import { InfoBanner } from '../components/InfoBanner';

const SwapBridge = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'bridge'>('swap');
  const [fromToken, setFromToken] = useState('SUPRA');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromChain, setFromChain] = useState('Supra L1');
  const [toChain, setToChain] = useState('Ethereum');

  const tokens = ['SUPRA', 'USDC', 'ETH', 'BTC', 'veSUPRA'];
  const chains = ['Supra L1', 'Ethereum', 'Polygon', 'Arbitrum', 'Base'];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'swap', label: 'Swap', icon: ArrowUpDown, path: '/swap' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
  ];

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

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

      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl sm:text-5xl font-bold neon-text tracking-tighter uppercase">
            {activeTab === 'swap' ? 'Token_Exchange_Interface' : 'Cross_Chain_Bridge'}
          </h2>
          <InfoPopover {...protocolInfo.hypernova} />
        </div>
        <p className="text-primary/60 font-mono text-sm">
          {activeTab === 'swap' 
            ? 'Swap tokens with zero slippage using HyperNova routing.' 
            : 'Bridge assets across chains with HyperNova security.'
          }
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex justify-center mb-8">
        <div className="matrix-card p-1 flex">
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-3 flex items-center gap-2 transition-all ${
              activeTab === 'swap'
                ? 'bg-primary/20 text-primary border border-primary'
                : 'text-primary/60 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">SWAP</span>
          </button>
          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-6 py-3 flex items-center gap-2 transition-all ${
              activeTab === 'bridge'
                ? 'bg-primary/20 text-primary border border-primary'
                : 'text-primary/60 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <Bridge className="w-4 h-4" />
            <span className="text-sm font-bold uppercase">BRIDGE</span>
          </button>
        </div>
      </div>

      <InfoBanner
        title={activeTab === 'swap' ? "Why Use SUPLOCK Swap?" : "Why Use SUPLOCK Bridge?"}
        description={activeTab === 'swap' 
          ? "Our swap uses HyperNova's advanced routing to find the best prices across all DEXs. Zero slippage on most trades, MEV protection, and automatic yield optimization for your swapped tokens."
          : "Bridge assets securely using HyperNova's cross-chain infrastructure. All bridged assets can be automatically deposited into yield vaults for immediate earning potential."
        }
        tip={activeTab === 'swap' 
          ? "Large swaps are automatically routed through multiple DEXs for optimal pricing."
          : "Bridge directly into vaults to start earning yields immediately on arrival."
        }
      />

      {activeTab === 'swap' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="matrix-card p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span>From_Token</span>
                <span>Balance: 1,000,000 {fromToken}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="w-full h-16 bg-primary/5 border border-primary/30 px-6 text-2xl font-bold focus:outline-none focus:border-primary transition-colors text-primary pr-24"
                  placeholder="0.00"
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 border border-primary/30 px-3 py-1 text-sm font-bold uppercase focus:outline-none focus:border-primary"
                >
                  {tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={swapTokens}
                className="p-3 bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary transition-all group"
              >
                <RefreshCw className="w-5 h-5 text-primary group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span>To_Token</span>
                <span>Balance: 0 {toToken}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  className="w-full h-16 bg-primary/5 border border-primary/30 px-6 text-2xl font-bold focus:outline-none focus:border-primary transition-colors text-primary pr-24"
                  placeholder="0.00"
                />
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 border border-primary/30 px-3 py-1 text-sm font-bold uppercase focus:outline-none focus:border-primary"
                >
                  {tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-primary/60">Exchange Rate</span>
                <span className="text-primary font-bold">1 {fromToken} = 0.85 {toToken}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary/60">Price Impact</span>
                <span className="text-primary font-bold">0.02%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary/60">Network Fee</span>
                <span className="text-primary font-bold">~$0.15</span>
              </div>
            </div>

            <button className="matrix-btn-primary w-full h-16 text-xl">
              EXECUTE_SWAP_ORDER
            </button>
          </div>

          <div className="matrix-card p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4">
              <ArrowUpDown className="w-20 h-20 text-primary/5 -rotate-12" />
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Swap_Metrics</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-primary/10 bg-primary/5">
                    <div className="text-[10px] text-primary/40 uppercase mb-1">24h Volume</div>
                    <div className="text-3xl font-bold tracking-tighter neon-text">$2.4M</div>
                  </div>
                  <div className="p-4 border border-primary/10 bg-primary/5">
                    <div className="text-[10px] text-primary/40 uppercase mb-1">Total Liquidity</div>
                    <div className="text-3xl font-bold tracking-tighter neon-text">$18.7M</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Features</h3>
                <ul className="space-y-2">
                  {[
                    'Zero slippage routing',
                    'MEV protection enabled',
                    'Auto-compound option',
                    'Cross-DEX aggregation'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-primary/60">
                      <div className="w-1 h-1 bg-primary rotate-45" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bridge' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="matrix-card p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span>From_Chain</span>
                <span>Network: {fromChain}</span>
              </div>
              <select
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
                className="w-full h-12 bg-primary/5 border border-primary/30 px-4 text-lg font-bold focus:outline-none focus:border-primary transition-colors text-primary uppercase"
              >
                {chains.map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span>Asset_Amount</span>
                <span>Balance: 1,000,000 {fromToken}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="w-full h-16 bg-primary/5 border border-primary/30 px-6 text-2xl font-bold focus:outline-none focus:border-primary transition-colors text-primary pr-24"
                  placeholder="0.00"
                />
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 border border-primary/30 px-3 py-1 text-sm font-bold uppercase focus:outline-none focus:border-primary"
                >
                  {tokens.map(token => (
                    <option key={token} value={token}>{token}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 border border-primary/30">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-widest">
                <span>To_Chain</span>
                <span>Network: {toChain}</span>
              </div>
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="w-full h-12 bg-primary/5 border border-primary/30 px-4 text-lg font-bold focus:outline-none focus:border-primary transition-colors text-primary uppercase"
              >
                {chains.map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-primary/60">Bridge Fee</span>
                <span className="text-primary font-bold">0.1% + Gas</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary/60">Estimated Time</span>
                <span className="text-primary font-bold">~2-5 minutes</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary/60">Security Level</span>
                <span className="text-primary font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  HyperNova
                </span>
              </div>
            </div>

            <button className="matrix-btn-primary w-full h-16 text-xl">
              INITIATE_BRIDGE_TRANSFER
            </button>
          </div>

          <div className="matrix-card p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4">
              <Bridge className="w-20 h-20 text-primary/5 -rotate-12" />
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Bridge_Stats</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-primary/10 bg-primary/5">
                    <div className="text-[10px] text-primary/40 uppercase mb-1">24h Bridge Volume</div>
                    <div className="text-3xl font-bold tracking-tighter neon-text">$8.9M</div>
                  </div>
                  <div className="p-4 border border-primary/10 bg-primary/5">
                    <div className="text-[10px] text-primary/40 uppercase mb-1">Total Bridged</div>
                    <div className="text-3xl font-bold tracking-tighter neon-text">$124M</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">Security</h3>
                <ul className="space-y-2">
                  {[
                    'HyperNova validation',
                    'Multi-sig security',
                    'Instant finality',
                    'Auto-vault deposit'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-primary/60">
                      <div className="w-1 h-1 bg-primary rotate-45" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Section */}
      <div className="matrix-card p-6 border-l-4 border-destructive bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-destructive mb-2 uppercase text-sm">Security Notice</h4>
            <p className="text-sm text-muted-foreground">
              Always verify recipient addresses and chain selections before confirming transactions. 
              {activeTab === 'bridge' 
                ? ' Cross-chain bridges are irreversible once confirmed.' 
                : ' Large swaps may experience temporary price impact.'
              }
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwapBridge;