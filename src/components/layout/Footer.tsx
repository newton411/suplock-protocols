import React from 'react';
import { Github, Twitter, MessageSquare, ShieldAlert, Award, Globe } from 'lucide-react';

export function Footer() {
  const links = [
    {
      label: 'Twitter (X)',
      icon: <Twitter className="w-4 h-4" />,
      href: 'https://x.com/Newton_crypt',
      color: 'hover:text-primary',
    },
    {
      label: 'Discord',
      icon: <MessageSquare className="w-4 h-4" />,
      href: 'https://discord.gg/supralabs',
      color: 'hover:text-primary',
    },
    {
      label: 'GitHub',
      icon: <Github className="w-4 h-4" />,
      href: 'https://github.com/newton411/AI-solutions',
      color: 'hover:text-primary',
    },
  ];

  return (
    <footer className="border-t border-primary/20 bg-background/80 backdrop-blur-md py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary tracking-tighter mb-4 uppercase neon-text">
              SUPLOCK Protocol
            </h3>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-4">
              The premier deflationary engine and yield optimizer for the Supra ecosystem. Burn to
              Floor. Yield Forever. Founded by @Newton_crypt.
            </p>
            <p className="text-primary font-bold text-sm mb-6 tracking-widest uppercase">
              &quot;your bag = your voice&quot;
            </p>
            <div className="flex gap-4">
              {links.map((link) => (
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
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Resources
            </h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://gamma.app/docs/SUPLOCK-Protocol-n46yb80drrasx2f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors uppercase font-bold"
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors uppercase font-bold">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors uppercase font-bold">
                  Security Audits
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors uppercase font-bold">
                  Tokenomics
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
              Security
            </h4>
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
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Protocol Status:
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-primary font-bold uppercase">Mainnet Beta</span>
            </div>
          </div>
        </div>

        {/* Secondary page navigation */}
        <div className="mt-6 border-t border-primary/5 pt-6">
          <h5 className="text-xs font-bold uppercase text-primary mb-3">Pages</h5>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Overview
            </a>
            <a
              href="/nfts"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              NFTs
            </a>
            <a
              href="/locking"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Lock
            </a>
            <a
              href="/governance"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Governance
            </a>
            <a
              href="/vaults"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Vaults
            </a>
            <a
              href="/reserve"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Reserve
            </a>
            <a
              href="/restake"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Restake
            </a>
            <a
              href="/swap"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Swap
            </a>
            <a
              href="/bridge"
              className="px-2 py-1 text-muted-foreground hover:text-primary transition-colors"
            >
              Bridge
            </a>
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
