import React from 'react';
import { ObservationSource } from '../types';
import { Globe, Radio, Server, Cpu } from 'lucide-react';

interface SourceBadgeProps {
  source?: ObservationSource | null;
  className?: string;
  short?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  className = '',
  short = false,
}) => {
  if (!source) {
    return null;
  }

  const provider = (source.provider || source.source_type || 'Unknown').toLowerCase();
  const transport = (source.transport || '').toLowerCase();

  let label = '';
  let Icon = Globe;
  let colorClasses = 'text-slate-300 bg-slate-900/60 border-slate-700/60';

  if (provider.includes('mempool')) {
    if (transport === 'websocket') {
      label = short ? 'mempool WS' : 'mempool.space WebSocket';
      Icon = Radio;
      colorClasses = 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40';
    } else {
      label = short ? 'mempool REST' : 'mempool.space REST';
      Icon = Globe;
      colorClasses = 'text-sky-400 bg-sky-950/30 border-sky-800/40';
    }
  } else if (provider.includes('bitcoin_core') || provider.includes('bitcoind')) {
    if (transport === 'zmq') {
      label = short ? 'Core ZMQ' : 'Bitcoin Core ZMQ';
      Icon = Cpu;
      colorClasses = 'text-amber-400 bg-amber-950/30 border-amber-800/40';
    } else {
      label = short ? 'Core RPC' : 'Bitcoin Core RPC';
      Icon = Server;
      colorClasses = 'text-purple-400 bg-purple-950/30 border-purple-800/40';
    }
  } else {
    label = `${source.provider} ${source.transport}`;
  }

  const tooltip = source.endpoint
    ? `Source: ${label} (${source.endpoint})`
    : `Source: ${label}`;

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${colorClasses} ${className}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
};
