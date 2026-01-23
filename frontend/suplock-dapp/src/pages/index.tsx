import React, { useState } from 'react';
import Head from 'next/head';
import { WalletProvider } from '@/contexts/WalletContext';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { LockUI } from '@/components/LockUI';
import { TokenomicsCharts } from '@/components/TokenomicsCharts';
import { GovernancePanel } from '@/components/GovernancePanel';
import { VaultPanel } from '@/components/VaultPanel';
import { DividendPanel } from '@/components/DividendPanel';

type Tab = 'overview' | 'lock' | 'governance' | 'vaults' | 'dividends';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLocking, setIsLocking] = useState(false);

  const handleLock = async (amount: string, duration: number) => {
    setIsLocking(true);
    try {
      // Mock lock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Locked ${amount} SUPRA for ${duration} seconds`);
    } finally {
      setIsLocking(false);
    }
  };

  const tokenomicsData = {
    totalSupply: 100_000_000_000,
    burned: 8_500_000_000,
    dividendsPaid: 234_500_000,
    veRewards: 45_200_000,
  };

  return (
    <WalletProvider>
      <Head>
        <title>SUPLOCK - Sustainable DeFi Protocol</title>
        <meta name="description" content="SUPLOCK: Community-driven DeFi protocol on Supra L1" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-dark via-darkGray to-dark text-white">
        {/* Navigation */}
        <nav className="border-b border-gold/30 sticky top-0 z-50 bg-dark/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-3xl">⛓️</div>
              <h1 className="text-2xl font-bold text-gold">SUPLOCK</h1>
            </div>
            <div className="hidden md:flex gap-6">
              {(['overview', 'lock', 'governance', 'vaults', 'dividends'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize px-4 py-2 rounded transition ${
                    activeTab === tab
                      ? 'bg-gold text-dark font-bold'
                      : 'text-gold hover:bg-gold/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <WalletConnectButton />
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-fadeIn">
              <div className="text-center space-y-6 mb-12">
                <h2 className="text-5xl md:text-6xl font-bold">
                  Sustainable DeFi on <span className="text-gold">Supra L1</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Lock $SUPRA to earn boosted yields, participate in governance, and benefit from automated fee distribution. 
                  Built with privacy, security, and long-term sustainability in mind.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => setActiveTab('lock')}
                    className="px-8 py-3 bg-gold hover:bg-darkGold text-dark font-bold rounded-lg transition transform hover:scale-105"
                  >
                    Start Locking
                  </button>
                  <a
                    href="https://gamma.app/docs/Sustainable-DeFi-7jabltpt95th05k"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3 border-2 border-gold text-gold hover:bg-gold/10 font-bold rounded-lg transition"
                  >
                    View Whitepaper
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Locked', value: '12.5B SUPRA' },
                  { label: 'Circulating Supply', value: '45.2B SUPRA' },
                  { label: 'Protocol Fees', value: '$2.3M' },
                  { label: 'Active Vaults', value: '3' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-darkGray border border-gold/30 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-gold text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Tokenomics Charts */}
              <div>
                <h3 className="text-3xl font-bold text-gold mb-6 text-center">Tokenomics & Distribution</h3>
                <TokenomicsCharts data={tokenomicsData} />
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: '🔒 Vote-Escrow Locking',
                    description: 'Lock $SUPRA to mint veSUPRA NFTs. Up to 2.5x yield boost for 4-year locks.',
                  },
                  {
                    title: '🛡️ Privacy Layer',
                    description: 'LP Vacuum encrypts all user intents to prevent MEV, front-running, and sandwich attacks.',
                  },
                  {
                    title: '💰 Yield Vaults',
                    description: 'Split yields into PT/YT tokens. Dual restaking via EigenLayer and Symbiotic.',
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="bg-darkGray border border-gold/30 rounded-lg p-6 hover:border-gold transition">
                    <h4 className="text-xl font-bold text-gold mb-3">{feature.title}</h4>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lock Tab */}
          {activeTab === 'lock' && (
            <div className="animate-fadeIn space-y-8">
              <h2 className="text-4xl font-bold text-gold text-center">Lock Your $SUPRA</h2>
              <div className="max-w-2xl mx-auto space-y-8">
                <LockUI onLock={handleLock} isLoading={isLocking} />
                <div className="bg-darkGray border border-gold/30 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gold">How It Works</h3>
                  <ol className="space-y-3 text-gray-300">
                    <li><strong>1. Connect Wallet</strong> - Link your Supra wallet</li>
                    <li><strong>2. Choose Amount</strong> - Select how much $SUPRA to lock</li>
                    <li><strong>3. Select Duration</strong> - Lock for 3-48 months (boost up to 2.5x)</li>
                    <li><strong>4. Receive veSUPRA</strong> - Soulbound NFT for governance & dividends</li>
                    <li><strong>5. Earn Yield</strong> - Base APR + boost multiplier rewards</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Governance Tab */}
          {activeTab === 'governance' && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-gold text-center mb-8">Protocol Governance</h2>
              <GovernancePanel />
            </div>
          )}

          {/* Vaults Tab */}
          {activeTab === 'vaults' && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-gold text-center mb-8">Yield & Restaking</h2>
              <VaultPanel />
            </div>
          )}

          {/* Dividends Tab */}
          {activeTab === 'dividends' && (
            <div className="animate-fadeIn">
              <h2 className="text-4xl font-bold text-gold text-center mb-8">Claim Dividends</h2>
              <div className="max-w-2xl mx-auto">
                <DividendPanel />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gold/30 mt-20 py-8">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>SUPLOCK Protocol v0.1.0 • Built for Supra L1</p>
            <p className="mt-2 text-sm">
              <a href="https://gamma.app/docs/Sustainable-DeFi-7jabltpt95th05k" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-darkGold">
                Whitepaper
              </a>
              {' '} • {' '}
              <a href="#" className="text-gold hover:text-darkGold">GitHub</a>
              {' '} • {' '}
              <a href="#" className="text-gold hover:text-darkGold">Docs</a>
            </p>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
};

export default App;
