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
export declare function calculateProjections(months: number): ProjectionMonth[];
//# sourceMappingURL=projections.d.ts.map