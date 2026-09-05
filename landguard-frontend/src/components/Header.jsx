import React from 'react';
import {
  LayoutList, Map, ShieldAlert, BarChart3, ShieldCheck,
  Activity, Terminal, Sparkles
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats, isBackendConnected = true }) {
  const alertBadgeCount = stats?.highRiskCount || 120;

  const tabs = [
    { id: 'table', label: 'Case Portfolio', icon: LayoutList },
    { id: 'map', label: 'GIS Spatial Map', icon: Map },
    { id: 'alerts', label: 'Early Warning Queue', icon: ShieldAlert, badge: alertBadgeCount },
    { id: 'insights', label: 'Bottleneck Analytics', icon: BarChart3 },
  ];

  return (
    <header className="craft-panel p-3.5 sticky top-3 z-50 shadow-2xl mb-6 backdrop-blur-xl border border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & GovTech Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-[0_0_16px_rgba(59,130,246,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#06080f] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-display font-bold text-white tracking-tight">
                LandGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/80">
                SIH 2026 &bull; PS 26017
              </span>
              <span className="hidden md:inline-flex text-[11px] font-mono text-slate-400 font-medium">
                TEAM CYBERLEEK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Infrastructure Land Acquisition Delay Prediction & SHAP Governance System
            </p>
          </div>
        </div>

        {/* Segmented View Switcher */}
        <nav className="flex items-center gap-1 bg-[#06080f] p-1 rounded-xl border border-white/10 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-900' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Telemetry Ticker */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] bg-[#06080f] px-3 py-1.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-semibold">Engine Live</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">LightGBM: <strong className="text-blue-400">75.8%</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Latency: <strong className="text-emerald-400">12ms</strong></span>
        </div>
      </div>
    </header>
  );
}
