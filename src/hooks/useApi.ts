import { useState, useEffect } from 'react';
import { apiService, ProtocolStats, FloorStatus, Proposal, GovernanceStats, ProjectionMonth, MEVData } from '../services/api';

export function useProtocolStats() {
  const [data, setData] = useState<ProtocolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await apiService.getProtocolStats();
        setData(stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}

export function useFloorStatus() {
  const [data, setData] = useState<FloorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const status = await apiService.getFloorStatus();
        setData(status);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch floor status');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}

export function useProposals() {
  const [data, setData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const proposals = await apiService.getProposals();
        setData(proposals);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}

export function useGovernanceStats() {
  const [data, setData] = useState<GovernanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await apiService.getGovernanceStats();
        setData(stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch governance stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}

export function useProjections(months: number = 24) {
  const [data, setData] = useState<ProjectionMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const projections = await apiService.getProjections(months);
        setData(projections);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projections');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [months]);

  return { data, loading, error };
}

export function useMEVData() {
  const [data, setData] = useState<MEVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const mevData = await apiService.getMEVData();
        setData(mevData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch MEV data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s for MEV data
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}