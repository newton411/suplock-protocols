import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InfoPopoverProps {
  title: string;
  content: string;
  learnMore?: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function InfoPopover({
  title,
  content,
  learnMore,
  className = "",
  side = "top",
}: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center w-5 h-5 rounded-sm bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all cursor-help ${className}`}
          aria-label={`Learn more about ${title}`}
        >
          <HelpCircle className="w-3 h-3 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="w-80 bg-card/95 backdrop-blur-md border-primary/30 p-0 overflow-hidden"
      >
        <div className="bg-primary/10 px-4 py-2 border-b border-primary/20">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">
            {title}
          </h4>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {content}
          </p>
          {learnMore && (
            <p className="text-[10px] text-primary/60 italic border-t border-primary/10 pt-2">
              {learnMore}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Pre-defined info content for protocol concepts
export const protocolInfo = {
  veSupra: {
    title: "What is veSUPRA?",
    content:
      "veSUPRA (vote-escrow SUPRA) is a soulbound NFT you receive when locking $SUPRA tokens. It represents your governance power and entitles you to protocol revenue sharing. The longer you lock, the more veSUPRA power you receive.",
    learnMore:
      "veSUPRA is non-transferable for 30 days, then becomes tradeable. This prevents mercenary capital from manipulating governance.",
  },
  boostMultiplier: {
    title: "Yield Boost Multiplier",
    content:
      "Your yield boost increases based on lock duration. Lock for 3 months = 1.09x boost. Lock for 48 months (max) = 2.5x boost. Formula: 1 + (lock_time / 48) × 1.5",
    learnMore:
      "This incentivizes long-term commitment to the protocol while rewarding patient holders with significantly higher yields.",
  },
  supReserve: {
    title: "SUPReserve Flywheel",
    content:
      "SUPReserve is the protocol's automated fee distribution engine. All protocol fees (USDC) are collected here and distributed monthly: buybacks, dividends to veSUPRA holders, staking rewards, and treasury funding.",
    learnMore:
      "Distribution changes based on circulating supply. Above 10B: 50% burns. At/below 10B floor: 0% burns, 65% dividends.",
  },
  floorMechanism: {
    title: "10 Billion Floor Target",
    content:
      "SUPLOCK aims to reduce $SUPRA's circulating supply from ~45B to a permanent floor of 10B tokens. Protocol fees fund continuous buybacks and burns until this target is reached.",
    learnMore:
      "Once the floor is reached, burn allocation shifts to dividends, maximizing holder returns while maintaining supply stability.",
  },
  lpVacuum: {
    title: "LP Vacuum Privacy Layer",
    content:
      "LP Vacuum encrypts all trading intents to prevent MEV (Miner Extractable Value) attacks like front-running and sandwich attacks. Your trades remain private until execution.",
    learnMore:
      "Instead of being extracted by bots, MEV is captured internally and distributed to protocol participants.",
  },
  ptYt: {
    title: "PT/YT Token Splitting",
    content:
      "When you deposit into vaults, your position splits into Principal Tokens (PT) and Yield Tokens (YT). PT represents your original deposit, YT represents future yield - both are tradeable separately.",
    learnMore:
      "This enables advanced DeFi strategies: sell PT for instant liquidity while keeping YT for yield, or vice versa.",
  },
  restaking: {
    title: "Dual Restaking",
    content:
      "SUPLOCK integrates with EigenLayer (stETH → rstSUPRA) and Symbiotic (SUPRA → symSUPRA) for additional yield layers. Restaking lets you earn multiple yields on the same capital.",
    learnMore:
      "This compounds your returns by participating in multiple security networks simultaneously.",
  },
  governance: {
    title: "DAO Governance",
    content:
      "veSUPRA holders vote on protocol parameters: revenue distribution percentages, vault fee structures, treasury allocations, and new feature proposals. 7-day voting + 3-day timelock.",
    learnMore:
      "One veSUPRA = one vote. Longer locks give more veSUPRA, meaning long-term holders have proportionally more governance power.",
  },
  autoFi: {
    title: "What is AutoFi?",
    content:
      "AutoFi (Autonomous Finance) refers to self-executing DeFi protocols that operate without manual intervention. SUPLOCK automates yield optimization, fee distribution, and buyback mechanisms 24/7.",
    learnMore:
      "Traditional DeFi requires manual actions. AutoFi protocols like SUPLOCK execute optimal strategies automatically, reducing gas costs and missed opportunities.",
  },
  supraL1: {
    title: "Supra L1 Blockchain",
    content:
      "Supra is a high-performance Layer 1 blockchain featuring sub-second finality, integrated oracles, and cross-chain bridges. SUPLOCK is built natively on Supra for maximum efficiency.",
    learnMore:
      "Supra's architecture enables SUPLOCK to offer MEV protection, instant transactions, and seamless cross-chain operations.",
  },
};
