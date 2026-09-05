import React from 'react';
import { LayoutDashboard, MapPin, BellRing, Lightbulb, ShieldAlert } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats, isBackendConnected = true, highAlertCount }) {
  const alertBadgeCount = highAlertCount !== undefined ? highAlertCount : (stats?.highRiskCount || 0);

  const tabs = [
    { id: 'table', label: 'Dashboard & Cases', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Map View', icon: MapPin },
    { id: 'alerts', label: 'High-Risk Queue', icon: BellRing, badge: alertBadgeCount },
    { id: 'insights', label: 'Bottleneck Analytics', icon: Lightbulb },
  ];

  return (
    <header className="glass-card rounded-2xl p-4 sticky top-4 z-50 border border-slate-700/60 shadow-2xl mb-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                LandGuard <span className="text-cyan-400">AI</span>
              </h1>
              <span className="bg-cyan-950/80 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800/50">
                SIH 2026 — PS 26017
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Predict ➔ Explain ➔ Alert ➔ Act | Team CyberLeek
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Backend Connection Health Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
            }`}
          />
          <span>{isBackendConnected ? 'Flask Engine Live (:5000)' : 'Connecting Backend...'}</span>
        </div>
      </div>
    </header>
  );
}
