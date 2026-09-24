import React from 'react';
import { ConnectionState } from '../types';
import { RefreshCw, Radio } from 'lucide-react';

interface LiveIndicatorProps {
  state: ConnectionState;
  showText?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  state,
  showText = true,
}) => {
  switch (state) {
    case 'connected':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono text-xs shadow-[0_0_10px_rgba(16,185,129,0.15)]"
          title="Live WebSocket connected. Receiving real-time Bitcoin events."
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {showText && <span className="font-bold tracking-wider">LIVE</span>}
        </div>
      );

    case 'connecting':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/40 border border-sky-500/40 text-sky-400 font-mono text-xs"
          title="Connecting to ObsChain WebSocket event stream..."
        >
          <Radio className="w-3 h-3 animate-pulse text-sky-400" />
          {showText && <span className="tracking-wide">CONNECTING</span>}
        </div>
      );

    case 'reconnecting':
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400 font-mono text-xs"
          title="Connection lost. Automatically reconnecting with backoff..."
        >
          <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
          {showText && <span className="tracking-wide">RECONNECTING</span>}
        </div>
      );

    case 'error':
    case 'disconnected':
    default:
      return (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/60 text-slate-400 font-mono text-xs"
          title="WebSocket offline. Live stream paused."
        >
          <span className="h-2 w-2 rounded-full border border-slate-500 bg-transparent" />
          {showText && <span className="tracking-wide">OFFLINE</span>}
        </div>
      );
  }
};
