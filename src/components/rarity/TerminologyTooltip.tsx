import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TerminologyTooltipProps {
  term: 'eCDF' | 'Coin Age Destroyed' | 'satoshi-days' | 'basis points' | 'Tail Count' | 'Baseline Quality' | 'Impact Index';
  children?: React.ReactNode;
  className?: string;
}

const DEFINITIONS: Record<string, string> = {
  eCDF:
    'Empirical Cumulative Distribution Function: ranks an event against every exact historical occurrence in the baseline window without imposing parametric or normal distribution assumptions.',
  'Coin Age Destroyed':
    'The product of coin value and holding duration (satoshi-days). Quantifies the movement of dormant bitcoin supply.',
  'satoshi-days':
    'Unit of coin age. 1 satoshi held unspent for 1 day = 1 satoshi-day (100,000,000 satoshi-days = 1 BTC-day).',
  'basis points':
    'Proportional unit where 1 basis point (bp) equals 0.01% (100 bps = 1.00%). Used for precise ratio measurements.',
  'Tail Count':
    'The count of historical events in the baseline population that had a metric value equal to or more extreme than this event.',
  'Baseline Quality':
    'Reliability assessment of the historical window based on sample count (min 100), candidate coverage, and data completeness.',
  'Impact Index':
    'Experimental, event-type-specific composite index (0–100) scoring multivariable extremity. Not a trading, risk, or criminality score.',
};

export const TerminologyTooltip: React.FC<TerminologyTooltipProps> = ({
  term,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const definition = DEFINITIONS[term] || '';

  return (
    <span className={`relative inline-flex items-center gap-1 group ${className}`}>
      {children || <span>{term}</span>}
      <button
        type="button"
        className="text-zinc-500 hover:text-zinc-300 focus:outline-none focus:text-zinc-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={`Definition of ${term}`}
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 text-xs font-normal text-zinc-200 bg-zinc-900 border border-zinc-700/80 rounded-md shadow-xl backdrop-blur-md pointer-events-none"
        >
          <span className="font-semibold text-zinc-100 block mb-1">{term}</span>
          <span className="text-zinc-400 leading-relaxed block">{definition}</span>
        </span>
      )}
    </span>
  );
};
