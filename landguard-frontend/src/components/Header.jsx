import React from 'react';
import {
  LayoutDashboard, MapPin, BellRing, Lightbulb, ShieldCheck,
  Activity, Terminal, Cpu, CheckCircle2
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats, isBackendConnected = true }) {
  const alertBadgeCount = stats?.highRiskCount || 120;

  const tabs = [
    { id: 'table', label: 'Case Portfolio', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Spatial Map', icon: MapPin },
    { id: 'alerts', label: 'Early Warning Queue', icon: BellRing, badge: alertBadgeCount },
    { id: 'insights', label: 'Bottleneck Analytics', icon: Lightbulb },
  ];

  return (
    <header className="cockpit-card p-3.5 sticky top-3 z-50 shadow-2xl mb-5 bg-[#0e1422]">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-white/5">
        {/* Brand & GovTech Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center border border-blue-400/40 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight font-heading">
                LandGuard <span className="text-blue-500 font-extrabold">AI</span>
              </h1>
              <span className="bg-blue-950 text-blue-300 font-mono text-[10px] font-bold px-2 py-0.2 rounded border border-blue-800">
                SIH 2026 &bull; PS 26017
              </span>
              <span className="hidden md:inline-flex text-[11px] font-mono text-slate-400 font-semibold">
                TEAM CYBERLEEK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              National Infrastructure Land Acquisition Predictive Risk & SHAP Governance Cockpit
            </p>
          </div>
        </div>

        {/* Real-Time Telemetry Bar */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden lg:flex items-center gap-2.5 bg-[#090d16] px-3 py-1 rounded-md border border-white/5 text-[11px]">
            <span className="text-slate-500">MODEL:</span>
            <span className="text-blue-400 font-bold">LightGBM v4.2</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">ROC-AUC:</span>
            <span className="text-emerald-400 font-bold">75.83%</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">LATENCY:</span>
            <span className="text-blue-400 font-bold">12ms</span>
          </div>

          <div className="flex items-center gap-2 bg-[#090d16] px-2.5 py-1 rounded-md border border-white/5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-semibold">Flask Engine Online</span>
          </div>
        </div>
      </div>

      {/* Navigation Switch Bar */}
      <div className="pt-2.5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm border border-blue-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-white text-blue-900' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Keyboard Shortcut Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-[#090d16] px-2.5 py-1 rounded-md border border-white/5">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>PRESS <kbd className="text-blue-400 bg-slate-900 px-1 py-0.5 rounded border border-white/10 font-bold">/</kbd> TO SEARCH</span>
        </div>
      </div>
    </header>
  );
}
