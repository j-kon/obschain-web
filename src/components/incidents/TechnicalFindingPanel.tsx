import React from 'react';
import { Cpu, ExternalLink, GitPullRequest, GitCommit, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { TechnicalFinding } from '../../types';

interface TechnicalFindingPanelProps {
  findings: TechnicalFinding[];
  className?: string;
}

export const TechnicalFindingPanel: React.FC<TechnicalFindingPanelProps> = ({
  findings,
  className = '',
}) => {
  if (!findings || findings.length === 0) return null;

  return (
    <div
      className={`bg-surface-card border border-surface-border rounded-xl p-6 space-y-6 ${className}`}
      data-testid="technical-finding-panel"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-surface-border">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            Technical Finding &amp; Root Cause Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographic and consensus-critical software audit details for vulnerability remediation.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {findings.map((finding, idx) => {
          const prUrl =
            finding.repository_url && finding.pull_request_id
              ? `${finding.repository_url}/pull/${finding.pull_request_id}`
              : null;
          const commitUrl =
            finding.repository_url && finding.commit_hash
              ? `${finding.repository_url}/commit/${finding.commit_hash}`
              : null;

          return (
            <div key={idx} className="space-y-5">
              {/* Technical Meta Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border space-y-1 text-xs font-mono">
                  <div className="text-slate-400 text-[11px] uppercase">COMPONENT</div>
                  <div className="font-bold text-white text-sm">{finding.component}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border space-y-1 text-xs font-mono">
                  <div className="text-slate-400 text-[11px] uppercase">AFFECTED SUBSYSTEM</div>
                  <div className="font-bold text-slate-200 text-sm">{finding.area}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border space-y-1 text-xs font-mono">
                  <div className="text-slate-400 text-[11px] uppercase">VULNERABILITY CATEGORY</div>
                  <div className="font-bold text-rose-400 text-sm">{finding.category}</div>
                </div>
              </div>

              {/* Crucial Distinction Callout */}
              <div className="bg-amber-950/20 border border-amber-600/40 rounded-lg p-4 flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs font-mono">
                  <span className="font-bold text-amber-300 uppercase tracking-wide">
                    CRITICAL TECHNICAL DISTINCTION: NOT A SHA-256 COLLISION
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    This flaw was caused by unframed serialization of verification cache keys in the Elements daemon (concatenating distinct byte fields without length prefixes), allowing crafted proof tuples to collide in the cache lookup table. <strong>It was NOT a cryptographic hash collision against SHA-256.</strong>
                  </p>
                </div>
              </div>

              {/* Mechanism Description */}
              <div className="space-y-2 text-xs font-mono">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  VULNERABILITY MECHANISM
                </h4>
                <p className="text-slate-300 bg-surface-subtle p-4 rounded-lg border border-surface-border leading-relaxed">
                  {finding.root_cause_details}
                </p>
              </div>

              {/* Fix Summary & Hardening */}
              <div className="space-y-2 text-xs font-mono">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PERMANENT REMEDIATION</span>
                </h4>
                <p className="text-slate-300 bg-surface-subtle p-4 rounded-lg border border-surface-border leading-relaxed">
                  {finding.fix_summary}
                </p>
              </div>

              {/* External Fix References */}
              {(prUrl || commitUrl) && (
                <div className="pt-3 border-t border-surface-border/60 flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Upstream References:</span>

                  {prUrl && (
                    <a
                      href={prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border border border-surface-border text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Elements PR #{finding.pull_request_id}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {commitUrl && (
                    <a
                      href={commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-border border border-surface-border text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <GitCommit className="w-3.5 h-3.5" />
                      <span>Commit {finding.commit_hash}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
