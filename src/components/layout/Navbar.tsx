import React from 'react';
import { Terminal, Wallet, Globe, Lock, Vote, Zap, Database, BookOpen, ArrowUpDown } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = ({ connected, account, connectWallet, onOpenLearn }: { connected: boolean, account: string, connectWallet: () => void, onOpenLearn?: () => void }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'swap', label: 'Swap', icon: ArrowUpDown, path: '/swap' },
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
          <img src="/suplock-logo.png" alt="SUPLOCK" className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tighter neon-text leading-none uppercase">SUPLOCK</h1>
            <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">Burn to Floor. Yield Forever.</span>
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

      <button
        onClick={connectWallet}
        className="matrix-btn-primary flex items-center gap-2 group min-w-[160px] justify-center"
      >
        <Wallet className="w-4 h-4 group-hover:animate-pulse" />
        <span className="text-xs">
          {connected ? account : 'INITIALIZE_WALLET'}
        </span>
      </button>
    </nav>
  );
};

export default Navbar;
