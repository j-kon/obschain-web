import React from 'react';
import { Activity, Box, Cpu } from 'lucide-react';
import { SystemStatus, ConnectionState } from '../types';
import { LiveIndicator } from './LiveIndicator';

interface NetworkStatusProps {
  status?: SystemStatus | null;
  connectionState?: ConnectionState;
  loading?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  status,
  connectionState = 'disconnected',
  loading = false,
}) => {
  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-surface-card px-3 py-1.5 rounded border border-surface-border animate-pulse">
        <Activity className="w-3.5 h-3.5 text-amber-500 animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
      {/* Live mode indicator */}
      <LiveIndicator state={connectionState} />

      {/* Tip Block Height */}
      {status?.tip_height ? (
        <div className="hidden sm:flex items-center gap-1.5 bg-surface-panel px-2.5 py-1.5 rounded border border-surface-border text-slate-300">
          <Box className="w-3.5 h-3.5 text-sky-400" />
          <span>#{status.tip_height.toLocaleString()}</span>
        </div>
      ) : null}

      {/* Detectors Active */}
      <div className="hidden md:flex items-center gap-1.5 bg-surface-panel px-2.5 py-1.5 rounded border border-surface-border text-slate-400">
        <Cpu className="w-3.5 h-3.5 text-purple-400" />
        <span>{status?.active_detectors?.length ?? 7} Detectors</span>
      </div>
    </div>
  );
};
