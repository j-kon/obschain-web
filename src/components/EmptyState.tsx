import React from 'react';
import { Terminal } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items observed',
  description = 'No matching blockchain observations found for the current query parameters.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-surface-border rounded-lg bg-surface-panel/20">
      <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
        <Terminal className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-mono bg-surface-card hover:bg-surface-border border border-surface-border rounded text-slate-200 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
