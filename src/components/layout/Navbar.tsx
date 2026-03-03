import React, { useState, useEffect } from 'react';
import { Terminal, Wallet, Globe, Lock, Vote, Zap, Database, BookOpen, Sparkles, Menu, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';

const Navbar = ({ onOpenLearn }: { onOpenLearn?: () => void }) => {
  const { connected, account, loading, error, connect, disconnect } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // close mobile menu when navigation occurs
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navItems = [
    { id: 'nfts', label: 'NFTs', icon: Sparkles, path: '/nfts' },
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
  ];

  const anchorLinks = [
    { label: 'About', href: '/#about' },
    { label: 'Features', href: '/#features' },
    { label: 'Roadmap', href: '/#roadmap' },
    { label: 'Whitepaper', href: '/#whitepaper' },
  ];

  return (
    <nav className="h-20 border-b border-primary/30 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between bg-black/50">
      <div className="flex items-center gap-8">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border-2 border-primary flex items-center justify-center neon-border group-hover:scale-110 transition-transform">
            <Terminal className="w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tighter neon-text leading-none uppercase">SUPLOCK</h1>
            <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">your bag = your voice</span>
          </div>
        </NavLink>

        <div className="hidden xl:flex items-center gap-6">
          {anchorLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              className="text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          {onOpenLearn && (
            <button
              onClick={onOpenLearn}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent/70 hover:text-accent transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Learn
            </button>
          )}
        </div>
      </div>

      {/* desktop nav items */}
      <div className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              relative px-4 py-2 flex items-center gap-2 transition-all hover:bg-primary/10 group
              ${isActive ? 'text-primary' : 'text-primary/40'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'neon-text' : ''}`} />
                <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary neon-border"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* mobile menu toggle */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setMobileOpen((o) => !o)} className="p-2">
          <Menu className="w-6 h-6 text-primary/60" />
        </button>
      </div>

      {/* mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 left-0 right-0 bg-black/90 flex flex-col items-center py-4 space-y-2 z-50 lg:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="text-primary/80 hover:text-primary px-4 py-2 w-full text-center"
              >
                {item.label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        {error && (
          <div className="hidden sm:block text-xs text-destructive font-mono bg-destructive/10 px-2 py-1 rounded border border-destructive/30">
            {error}
          </div>
        )}
        
        <button
          onClick={connected ? disconnect : connect}
          disabled={loading}
          className={`matrix-btn-primary flex items-center gap-2 group min-w-[160px] justify-center transition-all ${
            loading ? 'opacity-50 cursor-wait' : ''
          }`}
        >
          {connected ? (
            <>
              <LogOut className="w-4 h-4" />
              <span className="text-xs">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </>
          ) : (
            <>
              <Wallet className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
              <span className="text-xs">{loading ? 'CONNECTING...' : 'INITIALIZE_WALLET'}</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
