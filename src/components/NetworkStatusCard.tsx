import React from 'react';
import {
  Activity,
  Box,
  Cpu,
  Radio,
  Clock,
  Database,
  Layers,
} from 'lucide-react';
import { SystemStatus, ConnectionState } from '../types';
import { LiveIndicator } from './LiveIndicator';

interface NetworkStatusCardProps {
  status: SystemStatus | null;
  connectionState: ConnectionState;
  loading?: boolean;
}

export const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({
  status,
  connectionState,
  loading = false,
}) => {
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const renderSourceStatus = (label: string, stateStr?: string) => {
    const s = (stateStr || '').toLowerCase();
    let badgeClass = 'bg-slate-900 text-slate-400 border-slate-700/60';
    let text = 'Not Configured';

    if (s.includes('connected') || s.includes('configured') || s.includes('running') || s.includes('active')) {
      badgeClass = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      text = 'Connected';
    } else if (s.includes('reconnecting')) {
      badgeClass = 'bg-amber-950/40 text-amber-400 border-amber-800/40';
      text = 'Reconnecting';
    } else if (s.includes('disconnected') || s.includes('offline') || s.includes('failed')) {
      badgeClass = 'bg-red-950/40 text-red-400 border-red-800/40';
      text = 'Disconnected';
    } else if (s.includes('not_configured') || s.includes('disabled') || !stateStr) {
      badgeClass = 'bg-slate-900/60 text-slate-400 border-slate-800';
      text = 'Not configured';
    }

    return (
      <div className="flex items-center justify-between py-1 border-b border-surface-border/40 last:border-0 text-xs font-mono">
        <span className="text-slate-400">{label}</span>
        <span className={`px-2 py-0.5 rounded border text-[11px] ${badgeClass}`}>
          {text}
        </span>
      </div>
    );
  };

  if (loading && !status) {
    return (
      <div className="p-6 bg-surface-panel border border-surface-border rounded-xl space-y-4 animate-pulse font-mono text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span>Loading Bitcoin network status...</span>
          <Activity className="w-4 h-4 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  const isOffline = !status && connectionState !== 'connected';

  return (
    <div className="bg-surface-panel border border-surface-border rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Observation Telemetry
          </span>
          <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <span>Bitcoin Network Status</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            Network: <span className="text-amber-400 font-semibold">{status?.network || 'Bitcoin'}</span>
          </div>
          <LiveIndicator state={connectionState} />
        </div>
      </div>

      {isOffline ? (
        <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-400 text-xs font-mono">
          <p className="font-semibold">ObsChain backend telemetry offline.</p>
          <p className="text-slate-400 mt-1">
            Ensure the ObsChain Rust backend service is running on the configured host.
          </p>
        </div>
      ) : (
        <>
          {/* Primary 4 Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-surface-card/60 rounded-lg border border-surface-border space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-sky-400" />
                Tip Block Height
              </span>
              <div className="text-2xl font-bold font-mono text-white">
                {status?.tip_height ? `#${status.tip_height.toLocaleString()}` : 'Syncing...'}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Source: mempool / node
              </span>
            </div>

            <div className="p-4 bg-surface-card/60 rounded-lg border border-surface-border space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Connection State
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 capitalize pt-1">
                {connectionState}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                WebSocket event stream
              </span>
            </div>

            <div className="p-4 bg-surface-card/60 rounded-lg border border-surface-border space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Events Observed
              </span>
              <div className="text-2xl font-bold font-mono text-white">
                {status?.events_detected !== undefined
                  ? status.events_detected.toLocaleString()
                  : '0'}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Total anomalies detected
              </span>
            </div>

            <div className="p-4 bg-surface-card/60 rounded-lg border border-surface-border space-y-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Active Detectors
              </span>
              <div className="text-2xl font-bold font-mono text-white">
                {status?.active_detectors?.length ?? 7}
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                Continuous chain analysis
              </span>
            </div>
          </div>

          {/* Secondary Details: Ingestion Sources & Uptime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  Ingestion Sources
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Provenance</span>
              </div>
              {renderSourceStatus('mempool REST', status?.sources?.mempool_rest)}
              {renderSourceStatus('mempool WebSocket', status?.sources?.mempool_websocket)}
              {renderSourceStatus('Bitcoin Core (RPC/ZMQ)', status?.sources?.bitcoin_core)}
            </div>

            <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Engine Runtime
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  v{status?.version || '0.1.0'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-surface-border/40">
                <span className="text-slate-400">Backend Uptime</span>
                <span className="text-slate-200">
                  {status?.uptime_seconds !== undefined
                    ? formatUptime(status.uptime_seconds)
                    : 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-surface-border/40">
                <span className="text-slate-400">Storage Engine</span>
                <span className="text-slate-200">{status?.storage_backend || 'In-Memory (Bounded)'}</span>
              </div>

              {status?.active_detectors && status.active_detectors.length > 0 && (
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  <span className="text-slate-400 block mb-1">Registered Detectors:</span>
                  <div className="flex flex-wrap gap-1">
                    {status.active_detectors.map((d) => (
                      <span
                        key={d}
                        className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                      >
                        {d.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
