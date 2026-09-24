import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { useEvents } from '../context/EventContext';
import { Terminal, Shield, Activity } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { status, connectionState, loading } = useEvents();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
      <Header
        status={status}
        connectionState={connectionState}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ status, connectionState }} />
      </main>

      <footer className="bg-surface-panel/90 border-t border-surface-border py-8 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>ObsChain &bull; Bitcoin Network Observation Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Cryptographic Provenance Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              Realtime Anomaly Ingestion
            </span>
          </div>

          <div className="text-slate-400">
            Open Source &bull; Separate Rust Backend &amp; Web Frontend
          </div>
        </div>
      </footer>
    </div>
  );
};
