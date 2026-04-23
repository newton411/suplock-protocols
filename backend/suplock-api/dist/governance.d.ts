export interface Proposal {
    id: number;
    title: string;
    description: string;
    type: 'revenue_split' | 'vault_fees' | 'locking_tiers' | 'treasury_use';
    creator: string;
    createdAt: string;
    votingEndsAt: string;
    votesFor: number;
    votesAgainst: number;
    status: 'active' | 'passed' | 'rejected' | 'executed';
    veSUPRARequired: number;
}
export interface GovernanceStats {
    totalProposals: number;
    activeProposals: number;
    passedProposals: number;
    totalVeSupply: number;
    uniqueVoters: number;
    averageTurnout: string;
}
export declare function getProposals(status?: string): Proposal[];
export declare function getGovernanceStats(): GovernanceStats;
//# sourceMappingURL=governance.d.ts.map