import React from 'react';
import LandGuardLogo from './LandGuardLogo';
import {
  LayoutDashboard, FolderKanban, Bell, GitPullRequestDraft,
  Map, BarChart2, Shield
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0, isDark = false }) {
  const navigationGroups = [
    {
      group: 'Executive Overview',
      items: [
        { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'GIS Spatial Map', icon: Map },
      ]
    },
    {
      group: 'Case Management',
      items: [
        { id: 'projects', label: 'Acquisition Portfolio', icon: FolderKanban },
        { id: 'alerts', label: 'Risk Alert Center', icon: Bell, badge: alertCount },
      ]
    },
    {
      group: 'Decision Support',
      items: [
        { id: 'bottlenecks', label: 'Bottleneck Analysis', icon: GitPullRequestDraft },
        { id: 'analytics', label: 'Model Audit & SHAP', icon: BarChart2 },
      ]
    }
  ];

  return (
    <aside className="w-60 bg-white dark:bg-[#0D141D] border-r border-[#E2E8F0] dark:border-[#263342] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 transition-colors duration-150">
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#263342] bg-[#F8FAFC]/50 dark:bg-[#111A24]/30">
          <div className="flex items-center gap-2.5">
            <LandGuardLogo className="w-7 h-7 shrink-0" isDark={isDark} />
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#0F2942] dark:text-[#F3F6FA] tracking-tight">
                LandGuard AI
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] font-medium leading-tight truncate">
                Risk Intelligence Platform
              </p>
              <div className="text-[10px] text-[#94A3B8] dark:text-[#6F7D8D] leading-tight">
                Infrastructure Portfolio
              </div>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="p-3 space-y-4 flex-1">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <div className="px-2.5 text-[10px] font-bold text-[#64748B] dark:text-[#6F7D8D] uppercase tracking-wider">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-colors duration-150 cursor-pointer text-left relative ${
                      isActive
                        ? 'bg-[#1D4ED8] dark:bg-[#2563EB] text-white font-semibold shadow-xs pl-3'
                        : 'text-[#334155] dark:text-[#9AA8B8] hover:bg-[#F1F5F9] dark:hover:bg-[#151F2B] hover:text-[#0F172A] dark:hover:text-[#F3F6FA]'
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span className="absolute left-0.5 top-1.5 bottom-1.5 w-1 bg-white rounded-full"></span>
                    )}

                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B] dark:text-[#6F7D8D]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono-num font-bold ${
                          isActive
                            ? 'bg-white text-[#1D4ED8]'
                            : 'bg-red-50 dark:bg-red-950/40 text-[#DC2626] dark:text-red-400 border border-red-200 dark:border-red-900/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* System Status Context Card */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#263342] bg-[#F8FAFC]/50 dark:bg-[#111A24]/40 space-y-2">
          <div className="p-2 bg-white dark:bg-[#111A24] rounded border border-[#E2E8F0] dark:border-[#263342] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#0F2942] dark:text-[#F3F6FA] font-medium text-[11px]">
                <Shield className="w-3 h-3 text-[#1D4ED8] dark:text-[#3B82F6]" />
                <span>System Status</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="text-[10px] text-[#64748B] dark:text-[#9AA8B8]">
              Risk Analysis Engine v2.4
            </div>
          </div>

          {/* Subdued Team Watermark */}
          <div className="text-center select-none pt-1">
            <span className="text-[9px] font-mono tracking-wider text-[#64748B]/60 dark:text-[#9AA8B8]/60 font-medium block">
              CYBERLEEK &bull; SIH 2026 &bull; PS 26017
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
