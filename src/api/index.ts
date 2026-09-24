export * from './client';
export * from './status';
export * from './events';
export * from './incidents';
export * from './websocket';

// Central api namespace for backward compatibility and clean ergonomics
import { fetchHealth, fetchStatus } from './status';
import { fetchEvents, fetchEvent } from './events';
import { fetchIncidents, fetchIncident } from './incidents';
import { API_BASE_URL } from './client';

export const api = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },
  getHealth: fetchHealth,
  getStatus: fetchStatus,
  getEvents: fetchEvents,
  getEventById: fetchEvent,
  getIncidents: fetchIncidents,
  getIncidentById: fetchIncident,
};
