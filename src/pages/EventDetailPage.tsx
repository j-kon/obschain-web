import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Database, Terminal } from 'lucide-react';
import { api } from '../api/client';
import { ChainEvent } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { TransactionLink } from '../components/TransactionLink';
import { BlockLink } from '../components/BlockLink';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ChainEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    api
      .getEventById(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingState message="Loading event details..." />;
  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events Feed</span>
        </Link>
        <ErrorState error={error || 'Event not found'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events Feed</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-surface-panel border border-surface-border rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={event.severity} />
              <EvidenceBadge
                classification={
                  event.confidence === 'VERIFIED_ON_CHAIN'
                    ? 'ON_CHAIN_VERIFIED'
                    : 'HEURISTIC'
                }
              />
              <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {event.event_type}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-mono text-white">
              {event.title}
            </h1>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(event.detected_at).toUTCString()}</span>
            </div>
            <div className="text-slate-400 mt-1">ID: {event.id}</div>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wide">
            Observation Summary
          </h3>
          <p className="text-slate-200 leading-relaxed text-sm bg-surface-card/60 p-4 rounded-lg border border-surface-border">
            {event.description}
          </p>
        </div>

        {/* Cryptographic Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-500" />
              Transaction ID (TXID)
            </span>
            {event.txid ? (
              <div className="pt-1">
                <TransactionLink txid={event.txid} truncate={false} />
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-400">Not directly bound to single tx</div>
            )}
          </div>

          <div className="p-4 bg-surface-card/40 rounded-lg border border-surface-border space-y-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Block Anchor
            </span>
            {event.block_height ? (
              <div className="flex items-center gap-2 pt-1">
                <BlockLink height={event.block_height} hash={event.block_hash} />
                <span className="text-xs font-mono text-slate-400">
                  {event.block_hash?.slice(0, 16)}...
                </span>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-400">Mempool observation (unconfirmed)</div>
            )}
          </div>
        </div>

        {/* Raw Metadata JSON Inspector */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold font-mono text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>Raw Observation Payload</span>
          </h3>
          <pre className="p-4 rounded-lg bg-[#06080D] border border-surface-border font-mono text-xs text-amber-400 overflow-x-auto leading-relaxed">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
