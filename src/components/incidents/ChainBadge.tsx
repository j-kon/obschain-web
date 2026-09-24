import React from 'react';
import { Chain } from '../../types';

interface ChainBadgeProps {
  chain: Chain;
  className?: string;
  size?: 'sm' | 'md';
}

export const ChainBadge: React.FC<ChainBadgeProps> = ({
  chain,
  className = '',
  size = 'md',
}) => {
  const isBitcoin = chain === 'BITCOIN';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (isBitcoin) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wide uppercase transition-colors bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses} ${className}`}
        title="Bitcoin Mainnet Consensus Layer"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span>Bitcoin</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium tracking-wide uppercase transition-colors bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ${sizeClasses} ${className}`}
      title="Liquid Network Federated Sidechain"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
      <span>Liquid</span>
    </span>
  );
};
