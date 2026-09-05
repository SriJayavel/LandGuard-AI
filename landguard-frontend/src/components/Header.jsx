import React from 'react';
import { LayoutDashboard, MapPin, BellRing, Lightbulb, ShieldCheck, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, stats, isBackendConnected = true, highAlertCount }) {
  const alertBadgeCount = highAlertCount !== undefined ? highAlertCount : (stats?.highRiskCount || 0);

  const tabs = [
    { id: 'table', label: 'Land Cases Portfolio', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Cartography Map', icon: MapPin },
    { id: 'alerts', label: 'High-Risk Priority Queue', icon: BellRing, badge: alertBadgeCount },
    { id: 'insights', label: 'Systemic Bottlenecks', icon: Lightbulb },
  ];

  return (
    <header className="solid-card p-4 sticky top-4 z-50 border border-gray-800 shadow-xl mb-6 bg-gray-900">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-md flex items-center justify-center border border-blue-500">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-white tracking-tight">
                LandGuard <span className="text-blue-500">AI</span>
              </h1>
              <span className="bg-gray-800 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-700">
                SIH 2026 &bull; PS 26017
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Infrastructure Land Acquisition Delay Prediction & SHAP Governance System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-gray-950 p-1.5 rounded-lg border border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-bold border border-blue-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Backend Status Dot */}
        <div className="flex items-center gap-2.5 text-xs text-gray-300 bg-gray-950 px-3.5 py-2 rounded-lg border border-gray-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-gray-300">
            {isBackendConnected ? 'API Backend Engine: Live' : 'Backend Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
}
