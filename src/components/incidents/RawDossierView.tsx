import React, { useState } from 'react';
import { Code, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { Incident } from '../../types';

interface RawDossierViewProps {
  incident: Incident;
  className?: string;
}

export const RawDossierView: React.FC<RawDossierViewProps> = ({
  incident,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(incident, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-4 ${className}`}
      data-testid="raw-dossier-view"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 group-hover:text-white transition-colors">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase group-hover:text-amber-400 transition-colors">
                Raw Incident Dossier (JSON)
              </h2>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <p className="text-xs text-slate-400">
              Deterministic, unparsed payload for cryptographic verification and analytical tool ingestion.
            </p>
          </div>
        </button>

        {isOpen && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border border border-surface-border text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="relative mt-4">
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
};
