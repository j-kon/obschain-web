import React from 'react';
import { Box, ExternalLink } from 'lucide-react';
import { getBlockExplorerUrl } from '../utils/explorer';

interface BlockLinkProps {
  height?: number | null;
  hash?: string | null;
}

export const BlockLink: React.FC<BlockLinkProps> = ({ height, hash }) => {
  if (!height && !hash) return null;

  const label = height ? `#${height.toLocaleString()}` : `${hash?.slice(0, 8)}...`;
  const url = height
    ? getBlockExplorerUrl(height)
    : getBlockExplorerUrl(hash!);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 font-mono text-xs text-sky-400 bg-sky-950/30 px-2 py-0.5 rounded border border-sky-800/40 hover:border-sky-600 transition-colors"
      title={`Block ${height || hash}`}
    >
      <Box className="w-3 h-3 text-sky-400" />
      <span>{label}</span>
      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
    </a>
  );
};
