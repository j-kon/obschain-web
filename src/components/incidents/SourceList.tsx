import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Globe, Database, GitBranch } from 'lucide-react';
import { Source, SourceCategory } from '../../types';
import { formatUtcTimestamp } from '../../utils/formatters';

interface SourceListProps {
  sources: Source[];
  className?: string;
}

export const SourceList: React.FC<SourceListProps> = ({
  sources,
  className = '',
}) => {
  if (!sources || sources.length === 0) return null;

  const getCategoryMeta = (cat: SourceCategory) => {
    switch (cat) {
      case 'OFFICIAL_TECHNICAL_REPORT':
        return {
          label: 'Official Technical Report',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />,
          badgeClass: 'bg-sky-950/40 text-sky-300 border-sky-600/40',
        };
      case 'BITCOIN_BLOCKCHAIN':
        return {
          label: 'Bitcoin Blockchain',
          icon: <Database className="w-3.5 h-3.5 text-amber-400" />,
          badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-600/40',
        };
      case 'LIQUID_BLOCKCHAIN':
        return {
          label: 'Liquid Blockchain',
          icon: <Database className="w-3.5 h-3.5 text-cyan-400" />,
          badgeClass: 'bg-cyan-950/40 text-cyan-300 border-cyan-600/40',
        };
      case 'SOURCE_REPOSITORY':
        return {
          label: 'Source Repository',
          icon: <GitBranch className="w-3.5 h-3.5 text-purple-400" />,
          badgeClass: 'bg-purple-950/40 text-purple-300 border-purple-600/40',
        };
      default:
        return {
          label: cat.replace(/_/g, ' '),
          icon: <Globe className="w-3.5 h-3.5 text-slate-400" />,
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="source-list"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            Primary Intelligence Sources &amp; Provenance ({sources.length})
          </h2>
          <p className="text-xs text-slate-400">
            ObsChain records canonical origin metadata, publication timestamps, and retrieval dates for every claim.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => {
          const meta = getCategoryMeta(src.source_category);
          return (
            <div
              key={src.id}
              className="p-4 rounded-xl bg-surface-subtle border border-surface-border space-y-3 font-mono text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.badgeClass}`}
                  >
                    {meta.icon}
                    <span>{meta.label}</span>
                  </span>

                  <span className="text-[11px] text-slate-400">
                    Reliability: {(src.reliability_score * 100).toFixed(0)}%
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm leading-snug">
                  {src.title}
                </h3>
                <div className="text-slate-400 text-xs">
                  Publisher: <span className="text-slate-200 font-semibold">{src.publisher}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border/60 space-y-2 text-[11px] text-slate-400">
                {src.publication_timestamp && (
                  <div>Published: {formatUtcTimestamp(src.publication_timestamp)}</div>
                )}
                {src.retrieved_timestamp && (
                  <div>Retrieved: {formatUtcTimestamp(src.retrieved_timestamp)}</div>
                )}

                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors hover:underline pt-1"
                  >
                    <span>View Primary Source</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                ) : (
                  <span className="text-slate-500 italic">No external URL provided</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
