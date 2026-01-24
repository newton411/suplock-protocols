import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, MessageSquare, ExternalLink, ShieldAlert, Award, Globe, Users, Zap, Coins, Lock, Repeat } from 'lucide-react';

export function Footer() {
  const links = [
    { label: 'Official X (Twitter)', icon: <Twitter className="w-4 h-4" />, href: 'https://x.com/i/status/2015011212321309038', color: 'hover:text-primary' },
    { label: 'Founder X', icon: <Twitter className="w-4 h-4" />, href: 'https://x.com/Newton_crypt', color: 'hover:text-accent' },
    { label: 'Discord', icon: <MessageSquare className="w-4 h-4" />, href: 'https://discord.gg/supralabs', color: 'hover:text-primary' },
    { label: 'GitHub', icon: <Github className="w-4 h-4" />, href: 'https://github.com/newton411/AI-solutions', color: 'hover:text-primary' }
  ];

  return (
    <footer className="border-t border-primary/20 bg-background/80 backdrop-blur-md py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/suplock-logo.png" alt="SUPLOCK" className="w-8 h-8" />
              <h3 className="text-2xl font-bold text-primary tracking-tighter uppercase neon-text">SUPLOCK Protocol</h3>
            </div>
            <p className="text-primary/80 font-bold mb-2 uppercase tracking-wide">
              "Burn to Floor. Yield Forever."
            </p>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-6">
              The premier deflationary engine and yield optimizer for the Supra ecosystem. 
              Founded by @Newton_crypt.
            </p>
            <div className="flex gap-4">
              {links.map(link => (
                <a 
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-primary/5 border border-primary/20 rounded-sm ${link.color} transition-all hover:border-primary/50`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">Whitepaper</a></li>
              <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">Security Audits</a></li>
              <li><a href="#" className="hover:text-primary transition-colors uppercase font-bold">Tokenomics</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Security</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <span>Planned Audits: PeckShield</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="w-4 h-4 text-primary" />
                <span>Supra Grants: Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            © 2026 SUPLOCK Protocol. All rights reserved. Built for the Supra Community.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Protocol Status:</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-bold uppercase">Mainnet Beta</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none">
        <Globe className="w-64 h-64" />
      </div>
    </footer>
  );
}
