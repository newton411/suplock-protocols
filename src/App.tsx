import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixBackground from './components/MatrixBackground';
import CRTOverlay from './components/CRTOverlay';
import Navbar from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LearnDrawer } from './components/LearnDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages - Lazy loaded
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Locking = React.lazy(() => import('./pages/Locking'));
const Governance = React.lazy(() => import('./pages/Governance'));
const Vaults = React.lazy(() => import('./pages/Vaults'));
const Reserve = React.lazy(() => import('./pages/Reserve'));
const Nfts = React.lazy(() => import('./pages/Nfts').then(m => ({ default: m.Nfts })));

function App() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState('');
  const [learnDrawerOpen, setLearnDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const connectWallet = () => {
    setAccount('0x7a...f2e1');
    setConnected(true);
  };

  // Fallback component for lazy-loaded routes
  const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary/60 text-sm font-mono">LOADING...</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen relative flex flex-col selection:bg-primary/30 selection:text-primary overflow-x-hidden">
            <AnimatePresence>
              {loading && (
                <motion.div
                  key="loader"
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-primary"
                >
                  <MatrixBackground />
                  <div className="w-full max-w-md space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-primary/30 pb-2">
                      <span>[SYSTEM_BOOT]</span>
                      <span className="animate-pulse">RUNNING...</span>
                    </div>
                    <div className="space-y-1 text-primary/80">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>&gt; Initializing core protocols...</motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>&gt; Establishing secure handshake with Supra L1...</motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>&gt; Loading LP vacuum shied...</motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>&gt; Verifying DAO governance signatures...</motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>&gt; Decrypting vault yield strategies...</motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-white font-bold">&gt; ACCESS GRANTED</motion.div>
                    </div>
                    <div className="h-1 bg-primary/20 w-full overflow-hidden">
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-primary w-1/3"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <MatrixBackground />
            <CRTOverlay />

            {/* Ticker Tape */}
            <div className="bg-primary text-black text-[8px] font-bold py-1 overflow-hidden whitespace-nowrap z-[60] relative uppercase tracking-[0.2em]">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                SYSTEM_ACCESS: GRANTED | SECURITY_LEVEL: OMEGA | PROTOCOL: SUPLOCK v1.0.4 | NETWORK: SUPRA_L1_MAINNET | REVENUE_DISTRIBUTION: ACTIVE | VE_LOCKING: ENABLED | MEV_PROTECTION: SHIELD_ON | SYSTEM_ACCESS: GRANTED | SECURITY_LEVEL: OMEGA | PROTOCOL: SUPLOCK v1.0.4 | NETWORK: SUPRA_L1_MAINNET | REVENUE_DISTRIBUTION: ACTIVE | VE_LOCKING: ENABLED | MEV_PROTECTION: SHIELD_ON
              </motion.div>
            </div>

            <Navbar connected={connected} account={account} connectWallet={connectWallet} onOpenLearn={() => setLearnDrawerOpen(true)} />
            <LearnDrawer isOpen={learnDrawerOpen} onClose={() => setLearnDrawerOpen(false)} />

            <main className="flex-1 relative z-10">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/locking" element={<Locking />} />
                  <Route path="/governance" element={<Governance />} />
                  <Route path="/vaults" element={<Vaults />} />
                  <Route path="/reserve" element={<Reserve />} />
                  <Route path="/nfts" element={<Nfts />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
