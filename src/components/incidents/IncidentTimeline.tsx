import React, { useState } from 'react';
import {
  Calendar,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  Radio,
  Lock,
  MessageSquare,
  Wrench,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { TimelineEntry, TimelineCategory } from '../../types';
import { EvidenceClassificationBadge } from './EvidenceClassificationBadge';
import { formatUtcTimestamp } from '../../utils/formatters';
import { getTransactionExplorerUrl, getBlockExplorerUrl } from '../../utils/explorer';

interface IncidentTimelineProps {
  timeline: TimelineEntry[];
  className?: string;
}

type FilterOption = 'ALL' | 'ON_CHAIN' | TimelineCategory;

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  timeline,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter items
  const filtered = timeline.filter((item) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ON_CHAIN') {
      return item.classification === 'ON_CHAIN_VERIFIED';
    }
    return item.category === activeFilter;
  });

  const getCategoryIcon = (cat: TimelineCategory) => {
    switch (cat) {
      case 'EXPLOIT':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'ON_CHAIN_MOVEMENT':
        return <Radio className="w-4 h-4 text-amber-400" />;
      case 'CONTAINMENT':
        return <Lock className="w-4 h-4 text-orange-400" />;
      case 'COMMUNICATION':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'DISCLOSURE':
        return <ShieldAlert className="w-4 h-4 text-sky-400" />;
      case 'PATCH':
        return <Wrench className="w-4 h-4 text-purple-400" />;
      case 'RECOVERY':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'NETWORK_RESTART':
        return <RefreshCw className="w-4 h-4 text-teal-400" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="incident-timeline"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Incident Investigation Timeline ({timeline.length} Milestones)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological reconstruction of on-chain operations, communications, disclosures, and patches.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-surface-subtle'
            }`}
          >
            All ({timeline.length})
          </button>
          <button
            onClick={() => setActiveFilter('ON_CHAIN')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFilter === 'ON_CHAIN'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-surface-subtle'
            }`}
          >
            ✓ On-chain
          </button>
          <button
            onClick={() => setActiveFilter('EXPLOIT')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFilter === 'EXPLOIT'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-surface-subtle'
            }`}
          >
            Exploit
          </button>
          <button
            onClick={() => setActiveFilter('COMMUNICATION')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFilter === 'COMMUNICATION'
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-surface-subtle'
            }`}
          >
            Communication
          </button>
          <button
            onClick={() => setActiveFilter('RECOVERY')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFilter === 'RECOVERY'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-surface-subtle'
            }`}
          >
            Recovery
          </button>
          <button
            onClick={() => setActiveFilter('PATCH')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeFilter === 'PATCH'
                ? 'bg-purple-950/60 text-purple-300 border border-purple-600/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 bg-surface-subtle'
            }`}
          >
            Patch
          </button>
        </div>
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-border">
        {filtered.map((item) => {
          const isVerified = item.classification === 'ON_CHAIN_VERIFIED';
          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Point */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isVerified
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'bg-surface-card border-surface-border text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              {/* Milestone Card */}
              <div className="bg-surface-subtle border border-surface-border rounded-xl p-4 sm:p-5 space-y-3 transition-colors hover:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1 rounded bg-slate-800/80 border border-slate-700">
                      {getCategoryIcon(item.category)}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-xs font-mono text-slate-300 font-semibold">
                      {formatUtcTimestamp(item.timestamp)}
                    </span>
                  </div>

                  <EvidenceClassificationBadge classification={item.classification} size="sm" />
                </div>

                <div>
                  <h3 className="text-sm font-bold font-mono text-white tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Linked References: Transactions & Blocks */}
                {(item.transaction_txids.length > 0 || item.block_heights.length > 0) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border/60 text-xs font-mono">
                    {item.block_heights.map((h) => (
                      <a
                        key={h}
                        href={getBlockExplorerUrl(h)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-card border border-surface-border hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-colors"
                        title="View confirmed block in explorer"
                      >
                        <span>Block #{h.toLocaleString()}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ))}

                    {item.transaction_txids.map((txid) => {
                      const shortTxid = `${txid.slice(0, 10)}...${txid.slice(-8)}`;
                      const isLiquid = txid.startsWith('f24a4b179b5cc');
                      const explorerUrl = getTransactionExplorerUrl(txid, isLiquid ? 'LIQUID' : 'BITCOIN');

                      return (
                        <div
                          key={txid}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-card border border-surface-border"
                        >
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                            title={`View ${isLiquid ? 'Liquid' : 'Bitcoin'} transaction: ${txid}`}
                          >
                            <span>Tx: {shortTxid}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                          <button
                            onClick={() => handleCopy(txid, txid)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy full TXID"
                          >
                            {copiedId === txid ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
