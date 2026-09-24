import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  ArrowRight,
  Shield,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { fetchIncidents } from '../api';
import { Incident } from '../types';
import { NetworkStatusCard } from '../components/NetworkStatusCard';
import { EventFeed } from '../components/EventFeed';
import { IncidentCard } from '../components/IncidentCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { LiveIndicator } from '../components/LiveIndicator';

export const HomePage: React.FC = () => {
  const {
    events,
    status,
    connectionState,
    loading,
    error,
    newEventCount,
    clearNewEventCount,
    refresh,
  } = useEvents();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchIncidents(3, 0)
      .then((res) => {
        if (mounted) {
          setIncidents(res.incidents || []);
          setIncidentsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIncidents([]);
          setIncidentsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-b from-surface-panel/90 via-surface-panel/60 to-surface-base p-6 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Autonomous Bitcoin Network Observation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-mono leading-tight">
            Observe Bitcoin. <br />
            <span className="text-amber-500">Understand the event.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-sans">
            ObsChain connects directly to Bitcoin mempool dynamics and block streams.
            It provides sovereign incident analysis, dormant coin detection, UTXO forensics,
            and cryptographic provenance without relying on third-party claims.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm font-mono transition-colors shadow-sm"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/incidents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 font-semibold text-sm font-mono transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Incidents Dossier</span>
            </Link>

            <button
              onClick={() => refresh()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-surface-panel hover:bg-surface-card border border-surface-border text-slate-300 text-xs font-mono transition-colors"
              title="Refresh telemetry and event feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Provenance Guarantee Badge */}
        <div className="mt-8 pt-4 border-t border-surface-border/60 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Strict Provenance Guarantee: Heuristics are never conflated with on-chain cryptographic facts.
          </span>
        </div>
      </section>

      {/* Network Status Card (Block Height, Connection, Events Observed, Detectors, Ingestion) */}
      <section>
        <NetworkStatusCard
          status={status}
          connectionState={connectionState}
          loading={loading}
        />
      </section>

      {/* Main Grid: Live Observation Feed + Active Incidents Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Live Observation Feed Column (2 cols) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-500" />
                  <span>Live Observation Feed</span>
                </h2>
                <LiveIndicator state={connectionState} showText={false} />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Real-time Bitcoin anomalies streamed directly from ObsChain detectors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/events"
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Advanced View &rarr;</span>
              </Link>
            </div>
          </div>

          {loading && events.length === 0 ? (
            <LoadingState message="Connecting to ObsChain and synchronizing observation feed..." />
          ) : error && events.length === 0 ? (
            <ErrorState
              error={error}
              onRetry={refresh}
            />
          ) : (
            <EventFeed
              events={events}
              limit={25}
              newEventCount={newEventCount}
              onClearNewEvents={clearNewEventCount}
            />
          )}
        </section>

        {/* Active Incidents Column (1 col) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Active Incidents</span>
            </h2>
            <Link
              to="/incidents"
              className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
            >
              View all &rarr;
            </Link>
          </div>

          {incidentsLoading ? (
            <LoadingState message="Checking incident records..." rows={2} />
          ) : incidents.length === 0 ? (
            <div className="p-6 rounded-xl border border-surface-border bg-surface-panel/60 space-y-3 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>No active ObsChain incidents.</span>
              </div>
              <p className="leading-relaxed">
                ObsChain has not recorded unmitigated security incidents or chain disruptions for this observation period.
              </p>
              <div className="pt-2 border-t border-surface-border/40 text-[11px] text-slate-400">
                Major past anomalies (including the Liquid network unpegged transaction case) can be inspected in the Incidents archive.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
