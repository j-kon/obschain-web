import { apiFetch } from './client';
import { BoundedCache } from './cache';
import {
  BaselineDetailResponse,
  BaselinesResponse,
  DistributionsResponse,
} from '../types';

const baselineDetailCache = new BoundedCache<string, BaselineDetailResponse>(100);
const distributionsCache = new BoundedCache<string, DistributionsResponse>(100);

export interface BaselinesQuery {
  network?: string;
  limit?: number;
  offset?: number;
}

export interface DistributionsQuery {
  baseline_run_id?: string;
  event_type?: string;
  metric?: string;
  limit?: number;
}

/**
 * Fetch list of historical baseline runs.
 */
export async function fetchBaselines(query?: BaselinesQuery): Promise<BaselinesResponse> {
  const params = new URLSearchParams();
  if (query?.network) params.set('network', query.network);
  if (query?.limit !== undefined) params.set('limit', String(query.limit));
  if (query?.offset !== undefined) params.set('offset', String(query.offset));

  const qs = params.toString();
  const endpoint = qs ? `/api/v1/research/baselines?${qs}` : '/api/v1/research/baselines';
  return apiFetch<BaselinesResponse>(endpoint);
}

/**
 * Fetch a specific baseline run and its associated distributions.
 * Cached in-memory by baseline_id.
 */
export async function fetchBaseline(id: string, bypassCache = false): Promise<BaselineDetailResponse> {
  const cleanId = encodeURIComponent(id.trim());
  if (!bypassCache) {
    const cached = baselineDetailCache.get(cleanId);
    if (cached) return cached;
  }

  const result = await apiFetch<BaselineDetailResponse>(`/api/v1/research/baselines/${cleanId}`);
  baselineDetailCache.set(cleanId, result);
  return result;
}

/**
 * Query statistical distributions by baseline run, event type, or metric.
 */
export async function fetchDistributions(
  query?: DistributionsQuery,
  bypassCache = false
): Promise<DistributionsResponse> {
  const params = new URLSearchParams();
  if (query?.baseline_run_id) params.set('baseline_run_id', query.baseline_run_id);
  if (query?.event_type) params.set('event_type', query.event_type);
  if (query?.metric) params.set('metric', query.metric);
  if (query?.limit !== undefined) params.set('limit', String(query.limit));

  const qs = params.toString();
  const endpoint = qs ? `/api/v1/research/distributions?${qs}` : '/api/v1/research/distributions';

  if (!bypassCache) {
    const cached = distributionsCache.get(endpoint);
    if (cached) return cached;
  }

  const result = await apiFetch<DistributionsResponse>(endpoint);
  distributionsCache.set(endpoint, result);
  return result;
}
