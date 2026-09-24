import React from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { SystemStatus } from '../types';

interface NetworkStatusProps {
  status?: SystemStatus | null;
  loading?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  status,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-surface-card px-3 py-1.5 rounded border border-surface-border animate-pulse">
        <Activity className="w-3.5 h-3.5 text-amber-500 animate-spin" />
        <span>Synchronizing telemetry...</span>
      </div>
    );
  }

  const isMock = status?.is_mock_feed ?? true;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
      <div className="flex items-center gap-2 bg-surface-panel px-3 py-1.5 rounded border border-surface-border">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="text-slate-300 font-medium">Bitcoin Mainnet</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 bg-surface-panel px-3 py-1.5 rounded border border-surface-border text-slate-400">
        <Cpu className="w-3.5 h-3.5 text-sky-400" />
        <span>{status?.active_detectors?.length || 2} Detectors Active</span>
      </div>

      {isMock && (
        <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-600/70 text-amber-300 px-3 py-1.5 rounded">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold tracking-wide">SIMULATED / MOCK DATA FEED</span>
        </div>
      )}
    </div>
  );
};
