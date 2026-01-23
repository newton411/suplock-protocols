// Revenue projections using whitepaper math
// S(t) = S_0 - b * (R/P) * t (supply decay model)

export interface ProjectionMonth {
  month: number;
  circulatingSupply: number;
  burned: number;
  totalFees: number;
  buybackAllocation: number;
  dividendAllocation: number;
  veRewardsAllocation: number;
  treasuryAllocation: number;
  isPostFloor: boolean;
}

export function calculateProjections(months: number): ProjectionMonth[] {
  const projections: ProjectionMonth[] = [];

  // Initial parameters
  const S0 = 45_200_000_000; // Current circulating supply
  const maxSupply = 100_000_000_000;
  const floorThreshold = 10_000_000_000;
  const burnRate = 250_000_000; // Monthly burn rate
  const feeGrowthRate = 1.05; // 5% monthly fee growth
  const initialMonthlyFee = 2_000_000; // $2M in USDC

  let currentCirculating = S0;
  let currentBurned = 8_500_000_000;
  let currentFees = initialMonthlyFee;

  for (let month = 1; month <= months; month++) {
    // Update circulating supply (decay model)
    currentCirculating = Math.max(currentCirculating - burnRate, floorThreshold);
    currentBurned += burnRate;

    // Update fees (growth model)
    currentFees = Math.min(currentFees * feeGrowthRate, 10_000_000); // Cap at $10M

    // Determine distribution mode
    const isPostFloor = currentCirculating <= floorThreshold;

    // Calculate allocations based on floor status
    let buybackBps: number, dividendsBps: number, veRewardsBps: number, treasuryBps: number;

    if (isPostFloor) {
      buybackBps = 0;
      dividendsBps = 6500;
      veRewardsBps = 1250;
      treasuryBps = 1250;
    } else {
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
