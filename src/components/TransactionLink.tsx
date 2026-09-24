import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface TransactionLinkProps {
  txid: string;
  truncate?: boolean;
}

export const TransactionLink: React.FC<TransactionLinkProps> = ({
  txid,
  truncate = true,
}) => {
  const [copied, setCopied] = useState(false);

  const displayTxid = truncate
    ? `${txid.slice(0, 8)}...${txid.slice(-8)}`
    : txid;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(txid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-800/40">
      <span title={txid} className="cursor-text select-all">
        {displayTxid}
      </span>
      <button
        onClick={handleCopy}
        className="text-slate-400 hover:text-slate-200 transition-colors"
        title="Copy transaction ID"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-400" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
      <a
        href={`https://mempool.space/tx/${txid}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-slate-400 hover:text-amber-400 transition-colors"
        title="View on mempool.space"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </span>
  );
};
