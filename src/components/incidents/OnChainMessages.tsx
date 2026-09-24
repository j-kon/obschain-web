import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { OnChainMessage } from '../../types';
import { ChainBadge } from './ChainBadge';
import { EvidenceClassificationBadge } from './EvidenceClassificationBadge';
import { formatUtcTimestamp } from '../../utils/formatters';
import { getTransactionExplorerUrl, getBlockExplorerUrl } from '../../utils/explorer';

interface OnChainMessagesProps {
  messages: OnChainMessage[];
  className?: string;
}

export const OnChainMessages: React.FC<OnChainMessagesProps> = ({
  messages,
  className = '',
}) => {
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);

  const handleCopy = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(txid);
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  if (!messages || messages.length === 0) return null;

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="on-chain-messages-panel"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            On-Chain Communication Log ({messages.length})
          </h2>
          <p className="text-xs text-slate-400">
            Publicly observable OP_RETURN script payloads. Message presence is mathematically verified on-chain, but attributed sender identity remains separate.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((msg, index) => {
          const isActorClaim = msg.sender_attribution_confidence === 'UNVERIFIED';
          const shortTxid = `${msg.txid.slice(0, 10)}...${msg.txid.slice(-8)}`;
          const explorerUrl = getTransactionExplorerUrl(msg.txid, msg.chain);
          const isCopied = copiedTxid === msg.txid;

          return (
            <div
              key={msg.txid || index}
              className="bg-surface-subtle border border-surface-border rounded-xl p-5 space-y-4"
            >
              {/* Message Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
                <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                  <ChainBadge chain={msg.chain} size="sm" />
                  {msg.block_height && (
                    <a
                      href={getBlockExplorerUrl(msg.block_height, msg.chain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Block #{msg.block_height.toLocaleString()}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                  {msg.confirmed_at && (
                    <>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <span className="text-slate-400">{formatUtcTimestamp(msg.confirmed_at)}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <EvidenceClassificationBadge classification="ON_CHAIN_VERIFIED" size="sm" />
                </div>
              </div>

              {/* Message Content Body */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono space-y-2">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                  <span>DECODED SCRIPT TEXT ({msg.encoding})</span>
                </div>
                <div className="text-sm font-bold text-cyan-300 tracking-wide select-all">
                  &ldquo;{msg.decoded_text}&rdquo;
                </div>
                <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex items-center gap-2 overflow-hidden">
                  <span className="shrink-0 text-slate-400">Raw Hex:</span>
                  <span className="truncate font-mono text-slate-400">{msg.raw_hex}</span>
                </div>
              </div>

              {/* Attributed Sender Identity Warning Banner */}
              <div
                className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2.5 ${
                  isActorClaim
                    ? 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                    : 'bg-sky-950/20 border-sky-600/40 text-sky-200'
                }`}
              >
                {isActorClaim ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">
                      Sender Attribution: {msg.attributed_sender || 'Unidentified'}
                    </span>
                    <EvidenceClassificationBadge
                      classification={msg.sender_attribution_confidence}
                      size="sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isActorClaim
                      ? 'Important ObsChain Rule: The on-chain transaction content proves this message was recorded on the Bitcoin ledger. However, self-attributions (e.g. claiming to be an ethical white-hat) remain UNVERIFIED and must not be accepted as factual identity.'
                      : 'This communication is officially recognized by the identified project security response team.'}
                  </p>
                </div>
              </div>

              {/* Transaction Reference & Copy */}
              <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Tx Reference:</span>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{shortTxid}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
                <button
                  onClick={() => handleCopy(msg.txid)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-subtle hover:bg-surface-border text-slate-300 text-xs transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy TXID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
