import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { calculateProjections } from './projections';
import { getProposals, getGovernanceStats } from './governance';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-solutions-gules-five.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get revenue projections
app.get('/api/projections', (req: Request, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 24;
    const projections = calculateProjections(months);
    res.json(projections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate projections' });
  }
});

// Get governance proposals
app.get('/api/proposals', (req: Request, res: Response) => {
  try {
    const proposals = getProposals();
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get governance statistics
app.get('/api/governance/stats', (req: Request, res: Response) => {
  try {
    const stats = getGovernanceStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch governance stats' });
  }
});

// Get protocol statistics
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = {
      totalLocked: '12,500,000,000',
      circulatingSupply: '45,200,000,000',
      totalBurned: '8,500,000,000',
      protocolFees: '2,345,678',
      activeVaults: 3,
      veSUPRAHolders: 1250,
      governanceProposals: 8,
      timestamp: new Date().toISOString(),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Dividend calculation endpoint
app.post('/api/calculate-dividends', (req: Request, res: Response) => {
  try {
    const { veSUPRABalance, totalVeSupply, accumulatedFees } = req.body;

    if (!veSUPRABalance || !totalVeSupply || !accumulatedFees) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const dividendPerShare = (accumulatedFees * veSUPRABalance) / totalVeSupply;

    res.json({
      veSUPRABalance,
      accumulatedFees,
      dividendPerShare: dividendPerShare.toFixed(2),
      userDividends: dividendPerShare.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate dividends' });
  }
});

// Yield estimation endpoint
app.post('/api/estimate-yield', (req: Request, res: Response) => {
  try {
    const { amount, lockDurationMonths, boostMultiplier } = req.body;

    if (!amount || !lockDurationMonths || !boostMultiplier) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const baseAPR = 0.12; // 12% base APR
    const years = lockDurationMonths / 12;
    const totalYield = amount * baseAPR * years * boostMultiplier;

    res.json({
      principalAmount: amount,
      lockDurationMonths,
      boostMultiplier,
      baseAPR: (baseAPR * 100).toFixed(2) + '%',
      estimatedYield: totalYield.toFixed(2),
      totalValue: (amount + totalYield).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to estimate yield' });
  }
});

// Floor check status
app.get('/api/floor-status', (req: Request, res: Response) => {
  try {
    const circulatingSupply = 45_200_000_000;
    const floorThreshold = 10_000_000_000;
    const isPostFloor = circulatingSupply <= floorThreshold;

    res.json({
      circulatingSupply,
      floorThreshold,
      isPostFloor,
      percentToFloor: ((circulatingSupply / floorThreshold) * 100).toFixed(2),
      distribution: isPostFloor
        ? {
          mode: 'Post-Floor',
          buybackAndBurn: '0%',
          dividends: '65%',
          veRewards: '12.5%',
          treasury: '12.5%',
        }
        : {
          mode: 'Pre-Floor',
          buybackAndBurn: '50%',
          dividends: '35%',
          veRewards: '10%',
          treasury: '5%',
        },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floor status' });
  }
});

// MEV captured (LP Vacuum privacy layer)
app.get('/api/privacy/mev-captured', (req: Request, res: Response) => {
  try {
    res.json({
      mevCaptured: '123456.78',
      mevRouted: '123456.78',
      mevRoutedTo: 'SUPReserve',
      periodCoverage: 'Last 7 days',
      intentsProcessed: 1250,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MEV data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`SUPLOCK API running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/projections?months=24');
  console.log('  GET  /api/proposals');
  console.log('  GET  /api/governance/stats');
  console.log('  GET  /api/stats');
  console.log('  GET  /api/floor-status');
  console.log('  GET  /api/privacy/mev-captured');
  console.log('  POST /api/calculate-dividends');
  console.log('  POST /api/estimate-yield');
});
