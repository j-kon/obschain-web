import { apiFetch } from './client';
import { SystemStatus } from '../types';

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}

export async function fetchStatus(): Promise<SystemStatus> {
  return apiFetch<SystemStatus>('/api/v1/status');
}
