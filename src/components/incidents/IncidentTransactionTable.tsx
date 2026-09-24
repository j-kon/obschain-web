import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { IncidentTransaction } from '../../types';
import { ChainBadge } from './ChainBadge';
import { formatBtcFromSats, formatSats, formatUtcTimestamp } from '../../utils/formatters';
import { getTransactionExplorerUrl, getBlockExplorerUrl } from '../../utils/explorer';

interface IncidentTransactionTableProps {
  transactions: IncidentTransaction[];
  className?: string;
}

export const IncidentTransactionTable: React.FC<IncidentTransactionTableProps> = ({
  transactions,
  className = '',
}) => {
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);

  const handleCopy = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(txid);
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  const getRoleBadge = (role: string) => {
    const roleUpper = role.toUpperCase();
    switch (roleUpper) {
      case 'EXPLOIT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-600/40">
            EXPLOIT
          </span>
        );
      case 'PEG_OUT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-600/40">
            PEG OUT
          </span>
        );
      case 'RETURN':
      case 'RECOVERY':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
            RETURN
          </span>
        );
      case 'COMMUNICATION':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-600/40">
            MESSAGE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {role.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-4 ${className}`}
      data-testid="incident-transaction-table"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            Incident Transaction Register ({transactions.length})
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically structured ledger movements identified across Bitcoin mainnet and Liquid sidechain.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-surface-border text-slate-400 uppercase text-[11px] tracking-wider bg-surface-subtle/50">
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Chain</th>
              <th className="py-3 px-3">Transaction ID</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Block</th>
              <th className="py-3 px-3">Confirmed (UTC)</th>
              <th className="py-3 px-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/60">
            {transactions.map((tx) => {
              const shortTxid = `${tx.txid.slice(0, 10)}...${tx.txid.slice(-8)}`;
              const explorerUrl = getTransactionExplorerUrl(tx.txid, tx.chain);
              const isCopied = copiedTxid === tx.txid;

              return (
                <tr
                  key={tx.txid}
                  className="hover:bg-surface-subtle/50 transition-colors"
                >
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getRoleBadge(tx.role)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <ChainBadge chain={tx.chain} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 transition-colors hover:underline inline-flex items-center gap-1"
                        title={`View on explorer: ${tx.txid}`}
                      >
                        <span>{shortTxid}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <button
                        onClick={() => handleCopy(tx.txid)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy full TXID"
                      >
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-white">
                    {tx.amount_sats !== null && tx.amount_sats !== undefined ? (
                      <div className="space-y-0.5">
                        <div>{formatBtcFromSats(tx.amount_sats)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {formatSats(tx.amount_sats)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {tx.block_height ? (
                      <a
                        href={getBlockExplorerUrl(tx.block_height, tx.chain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-amber-400 transition-colors hover:underline inline-flex items-center gap-1"
                      >
                        <span>#{tx.block_height.toLocaleString()}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Mempool</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                    {tx.confirmed_at ? formatUtcTimestamp(tx.confirmed_at) : 'Unconfirmed'}
                  </td>
                  <td className="py-3 px-3 text-slate-400 max-w-xs truncate" title={tx.notes || ''}>
                    {tx.notes || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
