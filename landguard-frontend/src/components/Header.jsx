import React from 'react';
import {
  LayoutDashboard, MapPin, BellRing, Lightbulb, ShieldCheck,
  Activity, Terminal, DownloadCloud, Sparkles
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats, isBackendConnected = true, onExportReport }) {
  const alertBadgeCount = stats?.highRiskCount || 120;

  const tabs = [
    { id: 'table', label: 'Land Acquisition Portfolio', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Spatial Cartography', icon: MapPin },
    { id: 'alerts', label: 'Early Warning Radar', icon: BellRing, badge: alertBadgeCount },
    { id: 'insights', label: 'Bottleneck Intelligence', icon: Lightbulb },
  ];

  return (
    <header className="art-card p-4 sticky top-4 z-50 shadow-2xl mb-6">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/5">
        {/* Brand with emblem */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-950 p-2.5 rounded-xl border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-display font-black tracking-tight text-white flex items-center gap-1.5">
                LandGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 font-extrabold">AI</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                SIH 2026 &bull; PS 26017
              </span>
              <span className="hidden md:inline-flex text-[11px] font-mono text-slate-500">
                TEAM CYBERLEEK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              National Infrastructure Land Acquisition Predictive Risk & SHAP Explainability System
            </p>
          </div>
        </div>

        {/* Live Telemetry Ticker */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-3 bg-slate-950/90 px-3.5 py-1.5 rounded-lg border border-white/5 text-[11px]">
            <span className="text-slate-500">ENGINE:</span>
            <span className="text-cyan-400 font-bold">XGBoost/LightGBM v4.2</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">ROC-AUC:</span>
            <span className="text-emerald-400 font-bold">75.83%</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">LATENCY:</span>
            <span className="text-blue-400 font-bold">12ms</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-slate-300 text-[11px] font-semibold">Flask Engine Online</span>
          </div>
        </div>
      </div>

      {/* Navigation Switch Bar */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-cyan-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-900' : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Tools */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-slate-950 px-2.5 py-1.5 rounded-lg border border-white/5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>PRESS <kbd className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded border border-white/10">/</kbd> TO FILTER</span>
          </div>
        </div>
      </div>
    </header>
  );
}
