// Governance data and proposal management

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

const mockProposals: Proposal[] = [
  {
    id: 1,
    title: 'Increase buyback allocation to 60%',
    description: 'Redirect dividends to increase buyback and burn from 50% to 60%',
    type: 'revenue_split',
    creator: '0x1234...5678',
    createdAt: '2026-01-10',
    votingEndsAt: '2026-01-17',
    votesFor: 8_500_000,
    votesAgainst: 1_200_000,
    status: 'active',
    veSUPRARequired: 1000,
  },
  {
    id: 2,
    title: 'Add stETH LST vault',
    description: 'Deploy new EigenLayer vault for staked Ethereum',
    type: 'vault_fees',
    creator: '0x8901...2345',
    createdAt: '2026-01-08',
    votingEndsAt: '2026-01-15',
    votesFor: 7_200_000,
    votesAgainst: 900_000,
    status: 'active',
    veSUPRARequired: 1000,
  },
  {
    id: 3,
    title: 'Adjust locking tier multipliers',
    description: 'Fine-tune boost multipliers for optimal incentive alignment',
    type: 'locking_tiers',
    creator: '0x5678...9012',
    createdAt: '2026-01-01',
    votingEndsAt: '2026-01-08',
    votesFor: 5_800_000,
    votesAgainst: 1_500_000,
    status: 'passed',
    veSUPRARequired: 1000,
  },
  {
    id: 4,
    title: 'Treasury allocation for marketing',
    description: 'Allocate $100K from treasury for community marketing initiatives',
    type: 'treasury_use',
    creator: '0x3456...7890',
    createdAt: '2025-12-25',
    votingEndsAt: '2026-01-01',
    votesFor: 4_500_000,
    votesAgainst: 2_300_000,
    status: 'executed',
    veSUPRARequired: 1000,
  },
];

export function getProposals(status?: string): Proposal[] {
  if (status) {
    return mockProposals.filter((p) => p.status === status);
  }
  return mockProposals;
}

export function getGovernanceStats(): GovernanceStats {
  const activeProposals = mockProposals.filter((p) => p.status === 'active').length;
  const passedProposals = mockProposals.filter((p) => p.status === 'passed').length;

  return {
    totalProposals: mockProposals.length,
    activeProposals,
    passedProposals,
    totalVeSupply: 45_000_000,
    uniqueVoters: 1250,
    averageTurnout: '62.5%',
  };
}
