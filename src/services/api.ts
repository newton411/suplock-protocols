const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://suplock-api.vercel.app' 
  : 'http://localhost:3001';

export interface ProtocolStats {
  totalLocked: string;
  circulatingSupply: string;
  totalBurned: string;
  protocolFees: string;
  activeVaults: number;
  veSUPRAHolders: number;
  governanceProposals: number;
  timestamp: string;
}

export interface FloorStatus {
  circulatingSupply: number;
  floorThreshold: number;
  isPostFloor: boolean;
  percentToFloor: string;
  distribution: {
    mode: string;
    buybackAndBurn: string;
    dividends: string;
    veRewards: string;
    treasury: string;
  };
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  type: string;
  creator: string;
  createdAt: string;
  votingEndsAt: string;
  votesFor: number;
  votesAgainst: number;
  status: string;
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

export interface MEVData {
  mevCaptured: string;
  mevRouted: string;
  mevRoutedTo: string;
  periodCoverage: string;
  intentsProcessed: number;
  timestamp: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getProtocolStats(): Promise<ProtocolStats> {
    return this.fetchApi<ProtocolStats>('/api/stats');
  }

  async getFloorStatus(): Promise<FloorStatus> {
    return this.fetchApi<FloorStatus>('/api/floor-status');
  }

  async getProposals(): Promise<Proposal[]> {
    return this.fetchApi<Proposal[]>('/api/proposals');
  }

  async getGovernanceStats(): Promise<GovernanceStats> {
    return this.fetchApi<GovernanceStats>('/api/governance/stats');
  }

  async getProjections(months: number = 24): Promise<ProjectionMonth[]> {
    return this.fetchApi<ProjectionMonth[]>(`/api/projections?months=${months}`);
  }

  async getMEVData(): Promise<MEVData> {
    return this.fetchApi<MEVData>('/api/privacy/mev-captured');
  }

  async calculateDividends(data: {
    veSUPRABalance: number;
    totalVeSupply: number;
    accumulatedFees: number;
  }) {
    return this.fetchApi('/api/calculate-dividends', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async estimateYield(data: {
    amount: number;
    lockDurationMonths: number;
    boostMultiplier: number;
  }) {
    return this.fetchApi('/api/estimate-yield', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async healthCheck() {
    return this.fetchApi('/health');
  }
}

export const apiService = new ApiService();