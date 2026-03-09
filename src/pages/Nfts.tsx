import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Shield,
  Cpu,
  TrendingUp,
  Gavel,
  Lock,
  RefreshCw,
  Info,
  Play,
  X,
  Sparkles,
  ChevronRight,
  Database,
  Eye,
  Activity,
  Repeat,
  Share2,
  BookOpen,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

const NFT_COLLECTION = [
  {
    id: 'mythic',
    title: '𝗠𝘆𝘁𝗵𝗶𝗰 – 𝗬𝗶𝗲𝗹𝗱 𝗘𝗻𝗴𝗶𝗻𝗲 𝗖𝗼𝗿𝗲',
    rarity: 'Mythic',
    color: '#FFD700', // Gold
    bgGlow: 'rgba(255, 215, 0, 0.2)',
    videoUrl: 'https://adilo.bigcommand.com/watch/f1ZXUXLQ',
    description: '𝙔𝙞𝙚𝙡𝙙 𝙁𝙤𝙧𝙚𝙫𝙚𝙧 — immortal holder-protocol alignment after the 10B floor.',
    maxSupply: 66,
    traits: [
      { icon: Zap, label: 'APY Boost', value: '+35%', detail: 'Stacks with PoEL + AutoFi' },
      {
        icon: Database,
        label: 'Dividend Share',
        value: '1%',
        detail: 'Post-floor treasury revenue',
      },
      {
        icon: Shield,
        label: 'Exclusive Vault',
        value: 'Mythic',
        detail: 'Private LiquidityHub access',
      },
      {
        icon: Gavel,
        label: 'Gov Power',
        value: '4×',
        detail: 'Voting multiplier + priority queue',
      },
    ],
    mechanics: [
      {
        label: 'Evolve Mechanic',
        description:
          'Stake 90+ days to unlock "Immortal Thesis" trait (+5% permanent burn contribution)',
      },
    ],
  },
  {
    id: 'legendary',
    title: '𝙇𝙚𝙜𝙚𝙣𝙙𝙖𝙧𝙮 – 𝘼𝙪𝙩𝙤𝙁𝙞 𝘼𝙧𝙘𝙝𝙞𝙩𝙚𝙘𝙩',
    rarity: 'Legendary',
    color: '#E11D48', // Rose/Red
    bgGlow: 'rgba(225, 29, 72, 0.2)',
    videoUrl: 'https://adilo.bigcommand.com/watch/iWFbArBp',
    description: 'The master of efficiency and risk mitigation in the SUPLOCK ecosystem.',
    maxSupply: 200,
    traits: [
      {
        icon: Cpu,
        label: 'AutoFi Efficiency',
        value: '+25%',
        detail: 'Faster rebalancing + MEV capture',
      },
      { icon: Shield, label: 'Risk Shield', value: 'Priority', detail: 'Auto-hedge on volatility' },
      {
        icon: TrendingUp,
        label: 'Treasury Share',
        value: '0.5%',
        detail: 'Share from AutoFi profits',
      },
      { icon: Gavel, label: 'Gov Power', value: '2.5×', detail: 'Early strategy template access' },
    ],
    mechanics: [
      { label: 'Yield Bonus', description: '+10% yield bonus on degen loops when staked' },
    ],
  },
  {
    id: 'rare',
    title: '𝙍𝙖𝙧𝙚 – 𝘿𝙚𝙛𝙡𝙖𝙩𝙞𝙤𝙣 𝙀𝙢𝙗𝙚𝙧',
    rarity: 'Rare',
    color: '#22C55E', // Green
    bgGlow: 'rgba(34, 197, 94, 0.2)',
    videoUrl: 'https://adilo.bigcommand.com/watch/5Kpck50T',
    description: '𝙀𝙩𝙚𝙧𝙣𝙖𝙡 𝙛𝙡𝙖𝙢𝙚 𝙤𝙛 𝙥𝙚𝙧𝙢𝙖𝙣𝙚𝙣𝙩 𝙨𝙪𝙥𝙥𝙡𝙮 𝙙𝙚𝙨𝙩𝙧𝙪𝙘𝙩𝙞𝙤𝙣.',
    maxSupply: 400,
    traits: [
      { icon: Flame, label: 'Burn Rate', value: '+8%', detail: 'Personal burn on deposits' },
      { icon: TrendingUp, label: 'Revenue Share', value: '3%', detail: 'Bonus $SUPRA pre-floor' },
      { icon: Gavel, label: 'Gov Power', value: '1.5×', detail: 'Governance weight boost' },
      {
        icon: Activity,
        label: 'Passive Yield',
        value: '2-5%',
        detail: 'From protocol burn events',
      },
    ],
    mechanics: [
      {
        label: 'Evolution Path',
        description: 'Burn extra $SUPRA to evolve to Legendary (limited path)',
      },
    ],
  },
];

const VideoModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  // Extract video ID from adilo link if possible or just use iframe
  // Adilo allows embedding via iframe
  const embedUrl = url.replace('/watch/', '/embed/');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl aspect-video bg-black border border-primary/30 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 border border-white/10 text-white hover:bg-primary hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </motion.div>
    </motion.div>
  );
};

export const Nfts = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Globe, path: '/' },
    { id: 'thesis', label: 'Thesis', icon: BookOpen, path: '/thesis' },
    { id: 'nfts', label: 'NFTs', icon: Sparkles, path: '/nfts' },
    { id: 'lock', label: 'Lock', icon: Lock, path: '/locking' },
    { id: 'governance', label: 'DAO', icon: Vote, path: '/governance' },
    { id: 'vaults', label: 'Vaults', icon: Zap, path: '/vaults' },
    { id: 'reserve', label: 'Reserve', icon: Database, path: '/reserve' },
    { id: 'swap', label: 'Swap', icon: Repeat, path: '/swap' },
    { id: 'bridge', label: 'Bridge', icon: Share2, path: '/bridge' },
    { id: 'restake', label: 'Restake', icon: RefreshCw, path: '/restake' },
  ];

  return (
    <div className="container mx-auto px-6 py-12 relative">
      <AnimatePresence>
        {selectedVideo && <VideoModal url={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      </AnimatePresence>

      {/* Page Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4 border-b border-primary/20 mb-8">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 space-y-4"
      >
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Genesis Collection
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
          SUPLOCK <span className="text-primary neon-text">Genesis</span> NFTs
        </h1>
        <p className="text-primary/60 max-w-2xl text-sm leading-relaxed uppercase tracking-wider font-medium">
          The ultimate utility layer for the SUPLOCK Protocol. Genesis NFTs provide permanent yield
          boosts, governance multipliers, and exclusive access to the vault privacy layer.
        </p>

        {/* secondary nav */}
        <div className="flex justify-center gap-6 mt-6">
          <a href="#collection" className="text-sm uppercase neon-text hover:underline">
            Collection
          </a>
          <a href="#mechanics" className="text-sm uppercase neon-text hover:underline">
            Mechanics
          </a>
          <a href="#evolve" className="text-sm uppercase neon-text hover:underline">
            Evolve
          </a>
        </div>
      </motion.div>

      <div id="collection" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {NFT_COLLECTION.map((nft, index) => (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            {/* Background Glow */}
            <div
              className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: nft.bgGlow }}
            />

            <Card className="h-full bg-black/40 border-primary/20 hover:border-primary/50 transition-all backdrop-blur-md overflow-hidden flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-black to-primary/5">
                {/* NFT Placeholder Image/Video Preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-24 h-24 text-primary/10 animate-pulse" />
                </div>

                {/* Rarity Badge */}
                <div className="absolute top-4 left-4">
                  <Badge
                    className="px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none"
                    style={{ backgroundColor: nft.color, color: '#000' }}
                  >
                    {nft.rarity}
                  </Badge>
                </div>

                {/* Video Play Button */}
                <button
                  onClick={() => setSelectedVideo(nft.videoUrl)}
                  className="absolute inset-0 flex items-center justify-center group/play"
                >
                  <div className="w-16 h-16 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-primary group-hover/play:border-primary transition-all">
                    <Play className="w-6 h-6 text-white group-hover/play:text-black fill-current" />
                  </div>
                </button>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-8 h-8 rounded-full bg-black/50 border border-primary/30 flex items-center justify-center text-primary cursor-help">
                          <Info className="w-4 h-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-primary/50 text-xs text-primary max-w-[200px] uppercase font-bold tracking-wider">
                        Max Supply: {nft.maxSupply}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                  {nft.title}
                </CardTitle>
                <p className="text-[10px] text-primary/50 uppercase font-bold tracking-widest">
                  {nft.description}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {nft.traits.map((trait, i) => (
                    <div
                      key={i}
                      className="p-3 border border-primary/10 bg-primary/5 flex flex-col gap-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <trait.icon className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-bold text-primary/60 uppercase">
                          {trait.label}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{trait.value}</div>
                      <div className="text-[8px] font-medium text-primary/40 uppercase leading-tight">
                        {trait.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-4">
                  {nft.mechanics.map((mech, i) => (
                    <div key={i} className="p-3 border border-dashed border-primary/20 bg-black/20">
                      <div className="flex items-center gap-2 mb-1">
                        <RefreshCw className="w-3 h-3 text-primary animate-spin-slow" />
                        <span className="text-[10px] font-black text-primary uppercase">
                          {mech.label}
                        </span>
                      </div>
                      <p className="text-[9px] text-primary/60 uppercase leading-relaxed">
                        {mech.description}
                      </p>
                    </div>
                  ))}

                  <Button className="w-full matrix-btn-primary h-12 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                    <span>MINT NOW</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-24 p-8 border border-primary/20 bg-black/40 backdrop-blur-md max-w-4xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge
              variant="outline"
              className="text-primary border-primary/50 uppercase tracking-[0.2em] px-4 py-1"
            >
              NFT Staking
            </Badge>
            <h2 className="text-3xl font-black uppercase italic">
              Maximize Your <span className="text-primary">Yields</span>
            </h2>
            <p className="text-primary/60 text-sm leading-relaxed uppercase">
              Stake your Genesis NFTs to activate their permanent traits. Staked NFTs provide active
              boosts to your $SUPRA yields and voting power within the SUPLOCK DAO.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-primary/60">Global Staking APR Bonus</span>
                <span className="text-primary">+12.5% AVG</span>
              </div>
              <Progress value={65} className="h-1 bg-primary/20" />
            </div>
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary hover:text-black h-12 uppercase tracking-widest text-xs font-bold w-full md:w-auto px-8"
            >
              Explore Staking Pools
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 border border-primary/10 bg-primary/5 flex flex-col items-center text-center gap-2">
              <Eye className="w-8 h-8 text-primary/40" />
              <div className="text-2xl font-black text-white">4.2k</div>
              <div className="text-[10px] font-bold text-primary/60 uppercase">Total Views</div>
            </div>
            <div className="p-6 border border-primary/10 bg-primary/5 flex flex-col items-center text-center gap-2">
              <Lock className="w-8 h-8 text-primary/40" />
              <div className="text-2xl font-black text-white">82%</div>
              <div className="text-[10px] font-bold text-primary/60 uppercase">Floor Locked</div>
            </div>
            <div className="p-6 border border-primary/10 bg-primary/5 flex flex-col items-center text-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary/40" />
              <div className="text-2xl font-black text-white">2.4x</div>
              <div className="text-[10px] font-bold text-primary/60 uppercase">Avg Boost</div>
            </div>
            <div className="p-6 border border-primary/10 bg-primary/5 flex flex-col items-center text-center gap-2">
              <Sparkles className="w-8 h-8 text-primary/40" />
              <div className="text-2xl font-black text-white">666</div>
              <div className="text-[10px] font-bold text-primary/60 uppercase">Total Items</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
