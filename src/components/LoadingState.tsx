import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Querying ObsChain node telemetry...',
  rows = 3,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 border border-surface-border/50 rounded-lg bg-surface-panel/40">
      <div className="flex items-center gap-3 text-amber-500 font-mono text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{message}</span>
      </div>
      <div className="w-full max-w-md space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-800/60 rounded animate-pulse"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
