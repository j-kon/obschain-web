import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Radio,
  AlertTriangle,
  Layers,
  Zap,
  ArrowRight,
  TrendingUp,
  Cpu,
  Shield,
  Box,
} from 'lucide-react';
import { api } from '../api/client';
import { ChainEvent, Incident } from '../types';
import { EventCard } from '../components/EventCard';
import { IncidentCard } from '../components/IncidentCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([api.getEvents(5, 0), api.getIncidents(3, 0)])
      .then(([eventsRes, incidentsRes]) => {
        if (mounted) {
          setEvents(eventsRes.events || []);
          setIncidents(incidentsRes.incidents || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError((err as Error).message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl border border-surface-border bg-gradient-to-b from-surface-panel to-surface-base p-8 sm:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Autonomous Bitcoin Network Observation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
            Observe Bitcoin. <br />
            <span className="text-amber-500">Understand the event.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            ObsChain observes raw Bitcoin blocks, mempool dynamics, and structural anomalies.
            It provides sovereign incident analysis, forensic timelines, and evidence provenance
            without trusting third-party claims.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm font-mono transition-colors"
            >
              <span>Explore Events Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/incidents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-card hover:bg-surface-border border border-surface-border text-slate-200 font-semibold text-sm font-mono transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Active Incidents</span>
            </Link>
          </div>
        </div>

        {/* Technical disclaimer badge */}
        <div className="mt-8 pt-4 border-t border-surface-border/60 flex items-center gap-2 text-xs font-mono text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>
            Strict Provenance Guarantee: Heuristics are never conflated with on-chain cryptographic facts.
          </span>
        </div>
      </section>

      {/* Network Telemetry & Mempool Activity Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <span>Network Status &amp; Mempool Activity</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Snapshot Height #884,920
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-panel border border-surface-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Mempool Congestion</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              142.5 <span className="text-sm font-normal text-slate-400">vMB</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">~95 blocks to clear backlog</p>
          </div>

          <div className="bg-surface-panel border border-surface-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Median Fee Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              24.8 <span className="text-sm font-normal text-slate-400">sat/vB</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Priority target: 36 sat/vB</p>
          </div>

          <div className="bg-surface-panel border border-surface-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Last Block Interval</span>
              <Box className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              9.2 <span className="text-sm font-normal text-slate-400">min</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Target: 10.0 min (Normal)</p>
          </div>

          <div className="bg-surface-panel border border-surface-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>Active Detectors</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              2 <span className="text-sm font-normal text-slate-400">Online</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Large Tx + Long Interval</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Latest Observed Events & Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Events Column (2 cols) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <span>Latest Observed Events</span>
            </h2>
            <Link
              to="/events"
              className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
            >
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Loading latest chain observations..." />
          ) : error ? (
            <ErrorState error={error} />
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </section>

        {/* Active Incidents Column (1 col) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Active Incidents</span>
            </h2>
            <Link
              to="/incidents"
              className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
            >
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Loading incident dossiers..." rows={2} />
          ) : error ? (
            <ErrorState error={error} />
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Blocks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Recent Bitcoin Blocks (Sample Feed)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Source: mempool / node RPC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono border border-surface-border rounded-lg bg-surface-panel/40">
            <thead className="bg-surface-panel border-b border-surface-border text-xs text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Height</th>
                <th className="py-3 px-4">Hash</th>
                <th className="py-3 px-4">Tx Count</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Miner Tag</th>
                <th className="py-3 px-4">Interval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-300">
              <tr className="hover:bg-surface-card/60 transition-colors">
                <td className="py-3 px-4 font-bold text-amber-400">#884,920</td>
                <td className="py-3 px-4 text-xs text-slate-400">000000000000000000021b34e569...</td>
                <td className="py-3 px-4">2,912</td>
                <td className="py-3 px-4">1.64 MB</td>
                <td className="py-3 px-4 text-sky-400">Foundry USA</td>
                <td className="py-3 px-4 text-emerald-400">9.2 min</td>
              </tr>
              <tr className="hover:bg-surface-card/60 transition-colors">
                <td className="py-3 px-4 font-bold text-amber-400">#884,919</td>
                <td className="py-3 px-4 text-xs text-slate-400">000000000000000000030991c490...</td>
                <td className="py-3 px-4">3,140</td>
                <td className="py-3 px-4">1.71 MB</td>
                <td className="py-3 px-4 text-sky-400">AntPool</td>
                <td className="py-3 px-4 text-emerald-400">11.4 min</td>
              </tr>
              <tr className="hover:bg-surface-card/60 transition-colors">
                <td className="py-3 px-4 font-bold text-amber-400">#884,918</td>
                <td className="py-3 px-4 text-xs text-slate-400">00000000000000000001f37e42d8...</td>
                <td className="py-3 px-4">4,520</td>
                <td className="py-3 px-4">1.94 MB</td>
                <td className="py-3 px-4 text-sky-400">AntPool</td>
                <td className="py-3 px-4 text-amber-400 font-semibold">74.0 min (ANOMALY)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
