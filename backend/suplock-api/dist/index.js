"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const projections_1 = require("./projections");
const governance_1 = require("./governance");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware - CORS configuration for frontend communication
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'http://localhost:3001', // Local development (same origin)
    'http://127.0.0.1:3000', // Localhost alternative
    'https://suplock-dapp.vercel.app', // Production frontend
    'https://ai-solutions-gules-five.vercel.app',
    process.env.FRONTEND_URL || '', // Environment variable
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Get revenue projections
app.get('/api/projections', (req, res) => {
    try {
        const months = parseInt(req.query.months) || 24;
        const projections = (0, projections_1.calculateProjections)(months);
        res.json(projections);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate projections' });
    }
});
// Get governance proposals
app.get('/api/proposals', (req, res) => {
    try {
        const proposals = (0, governance_1.getProposals)();
        res.json(proposals);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
});
// Get governance statistics
app.get('/api/governance/stats', (req, res) => {
    try {
        const stats = (0, governance_1.getGovernanceStats)();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch governance stats' });
    }
});
// Get protocol statistics
app.get('/api/stats', (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
// Dividend calculation endpoint
app.post('/api/calculate-dividends', (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate dividends' });
    }
});
// Yield estimation endpoint
app.post('/api/estimate-yield', (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to estimate yield' });
    }
});
// Floor check status
app.get('/api/floor-status', (req, res) => {
    try {
        const circulatingSupply = 45200000000;
        const floorThreshold = 10000000000;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch floor status' });
    }
});
// MEV captured (LP Vacuum privacy layer)
app.get('/api/privacy/mev-captured', (req, res) => {
    try {
        res.json({
            mevCaptured: '123456.78',
            mevRouted: '123456.78',
            mevRoutedTo: 'SUPReserve',
            periodCoverage: 'Last 7 days',
            intentsProcessed: 1250,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map