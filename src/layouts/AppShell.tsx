import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { api } from '../api/client';
import { SystemStatus } from '../types';
import { Terminal, Shield, Activity } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .getStatus()
      .then((data) => {
        if (mounted) {
          setStatus(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Backend status unreachable, using local fallback telemetry:', err);
        if (mounted) {
          setStatus({
            status: 'offline_or_simulated',
            version: '0.1.0',
            network: 'bitcoin-mainnet',
            engine: 'ObsChain Core (Mock Feed)',
            timestamp: new Date().toISOString(),
            uptime_seconds: 0,
            active_detectors: [
              'large_transaction_detector',
              'long_block_interval_detector',
            ],
            storage_backend: 'in-memory (simulated)',
            is_mock_feed: true,
            mock_data_disclaimer:
              'Simulated demonstration telemetry. Backend is offline or running standalone.',
          });
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
      <Header status={status} loading={loading} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ status }} />
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
