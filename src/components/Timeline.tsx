import React from 'react';
import { TimelineEvent } from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import { Calendar } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-slate-400 font-mono text-sm py-4">
        No timeline events recorded yet.
      </div>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-border">
      {sorted.map((item, idx) => {
        const dateStr = new Date(item.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={item.id || idx} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-surface-base border-2 border-amber-500 group-hover:scale-125 transition-transform" />

            <div className="bg-surface-panel/60 border border-surface-border rounded-lg p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </h4>
                  <EvidenceBadge classification={item.classification} />
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dateStr}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
