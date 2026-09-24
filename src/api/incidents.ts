import { apiFetch } from './client';
import { Incident, IncidentsResponse } from '../types';

export async function fetchIncidents(limit = 50, offset = 0): Promise<IncidentsResponse> {
  return apiFetch<IncidentsResponse>(`/api/v1/incidents?limit=${limit}&offset=${offset}`);
}

export async function fetchIncident(id: string): Promise<Incident> {
  const cleanId = encodeURIComponent(id.trim());
  return apiFetch<Incident>(`/api/v1/incidents/${cleanId}`);
}
