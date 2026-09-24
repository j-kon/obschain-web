import { apiFetch } from './client';
import {
  Incident,
  IncidentsResponse,
  IncidentTimelineResponse,
  IncidentEvidenceResponse,
  IncidentGraph,
} from '../types';

/**
 * Fetch paginated list of security incidents from the ObsChain backend.
 */
export async function fetchIncidents(limit = 50, offset = 0): Promise<IncidentsResponse> {
  return apiFetch<IncidentsResponse>(`/api/v1/incidents?limit=${limit}&offset=${offset}`);
}

/**
 * Fetch a specific incident dossier by Case ID (e.g. "OC-2026-0001") or UUID.
 */
export async function fetchIncident(id: string): Promise<Incident> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<Incident>(`/api/v1/incidents/${cleanId}`);
}

/**
 * Fetch chronological timeline milestones for an incident.
 */
export async function fetchIncidentTimeline(id: string): Promise<IncidentTimelineResponse> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<IncidentTimelineResponse>(`/api/v1/incidents/${cleanId}/timeline`);
}

/**
 * Fetch structured evidence items for an incident.
 */
export async function fetchIncidentEvidence(id: string): Promise<IncidentEvidenceResponse> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<IncidentEvidenceResponse>(`/api/v1/incidents/${cleanId}/evidence`);
}

/**
 * Fetch forensic relationship graph (nodes & edges) for an incident.
 */
export async function fetchIncidentGraph(id: string): Promise<IncidentGraph> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<IncidentGraph>(`/api/v1/incidents/${cleanId}/graph`);
}
