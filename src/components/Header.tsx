import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Github } from 'lucide-react';
import { Navigation } from './Navigation';
import { NetworkStatus } from './NetworkStatus';
import { SystemStatus } from '../types';

interface HeaderProps {
  status?: SystemStatus | null;
  loading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, loading }) => {
  return (
    <header className="sticky top-0 z-50 bg-surface-base/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-500 group-hover:border-amber-400 group-hover:scale-105 transition-all">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                  Obs<span className="text-amber-500">Chain</span>
                </span>
                <span className="hidden md:block text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Bitcoin Network Observation
                </span>
              </div>
            </Link>

            <div className="hidden lg:block h-6 w-[1px] bg-surface-border" />

            <div className="hidden md:block">
              <Navigation />
            </div>
          </div>

          {/* Network status and External links */}
          <div className="flex items-center gap-4">
            <NetworkStatus status={status} loading={loading} />

            <a
              href="https://github.com/j-kon/obschain"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-surface-card border border-transparent hover:border-surface-border transition-colors"
              title="View Backend on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-2 border-t border-surface-border/50">
          <Navigation />
        </div>
      </div>
    </header>
  );
};
