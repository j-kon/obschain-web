import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  error: string | Error;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Observation Feed Error',
  error,
  onRetry,
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="p-6 rounded-lg border border-red-800/60 bg-red-950/20 text-red-300">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <h4 className="text-sm font-semibold text-red-200">{title}</h4>
          <p className="text-xs font-mono text-red-300/90 break-words leading-relaxed">
            {errorMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-xs font-mono font-medium rounded bg-red-900/60 hover:bg-red-800/80 text-white border border-red-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Query</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
