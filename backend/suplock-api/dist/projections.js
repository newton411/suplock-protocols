"use strict";
// Revenue projections using whitepaper math
// S(t) = S_0 - b * (R/P) * t (supply decay model)
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateProjections = calculateProjections;
function calculateProjections(months) {
    const projections = [];
    // Initial parameters
    const S0 = 45200000000; // Current circulating supply
    const maxSupply = 100000000000;
    const floorThreshold = 10000000000;
    const burnRate = 250000000; // Monthly burn rate
    const feeGrowthRate = 1.05; // 5% monthly fee growth
    const initialMonthlyFee = 2000000; // $2M in USDC
    let currentCirculating = S0;
    let currentBurned = 8500000000;
    let currentFees = initialMonthlyFee;
    for (let month = 1; month <= months; month++) {
        // Update circulating supply (decay model)
        currentCirculating = Math.max(currentCirculating - burnRate, floorThreshold);
        currentBurned += burnRate;
        // Update fees (growth model)
        currentFees = Math.min(currentFees * feeGrowthRate, 10000000); // Cap at $10M
        // Determine distribution mode
        const isPostFloor = currentCirculating <= floorThreshold;
        // Calculate allocations based on floor status
        let buybackBps, dividendsBps, veRewardsBps, treasuryBps;
        if (isPostFloor) {
            buybackBps = 0;
            dividendsBps = 6500;
            veRewardsBps = 1250;
            treasuryBps = 1250;
        }
        else {
            buybackBps = 5000;
            dividendsBps = 3500;
            veRewardsBps = 1000;
            treasuryBps = 500;
        }
        // Calculate amounts
        const buybackAllocation = (currentFees * buybackBps) / 10000;
        const dividendAllocation = (currentFees * dividendsBps) / 10000;
        const veRewardsAllocation = (currentFees * veRewardsBps) / 10000;
        const treasuryAllocation = (currentFees * treasuryBps) / 10000;
        projections.push({
            month,
            circulatingSupply: Math.round(currentCirculating),
            burned: Math.round(currentBurned),
            totalFees: Math.round(currentFees),
            buybackAllocation: Math.round(buybackAllocation),
            dividendAllocation: Math.round(dividendAllocation),
            veRewardsAllocation: Math.round(veRewardsAllocation),
            treasuryAllocation: Math.round(treasuryAllocation),
            isPostFloor,
        });
    }
    return projections;
}
//# sourceMappingURL=projections.js.map