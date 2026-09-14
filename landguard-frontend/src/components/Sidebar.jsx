import React from 'react';
import LandGuardLogo from './LandGuardLogo';
import {
  LayoutDashboard, FolderKanban, Map, Sliders, FileText,
  ClipboardList, GitPullRequestDraft, BarChart2, X, ShieldCheck, Bell
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isDark = false,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const navigationGroups = [
    {
      group: 'INTELLIGENCE',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard
        },
        {
          id: 'alerts',
          label: 'Alert Center',
          icon: Bell,
          badge: '26'
        },
        {
          id: 'portfolio',
          label: 'Portfolio',
          icon: FolderKanban
        },
        {
          id: 'case-intelligence',
          label: 'Case Intelligence',
          icon: ShieldCheck,
          badge: 'TIER 1'
        },
        {
          id: 'map',
          label: 'GIS Intelligence',
          icon: Map
        },
      ]
    },
    {
      group: 'DECISION SUPPORT',
      items: [
        {
          id: 'simulator',
          label: 'Risk Simulator',
          icon: Sliders
        },
        {
          id: 'document-intake',
          label: 'Document Intelligence',
          icon: FileText
        },
        {
          id: 'actions',
          label: 'Action Tracker',
          icon: ClipboardList
        },
      ]
    },
    {
      group: 'DIAGNOSTICS',
      items: [
        {
          id: 'bottlenecks',
          label: 'Bottlenecks',
          icon: GitPullRequestDraft
        },
        {
          id: 'model-audit',
          label: 'Model Audit',
          icon: BarChart2
        },
      ]
    }
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] w-64 bg-white dark:bg-[#0D1117] border-r border-[#E2E8F0] dark:border-[rgba(255,255,255,0.07)] flex flex-col justify-between shrink-0 select-none z-50 transition-transform duration-150 shadow-xs ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Institutional Header */}
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[rgba(255,255,255,0.07)] bg-[#F8FAFC] dark:bg-[#0A0D14] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <LandGuardLogo className="w-7 h-7 shrink-0" isDark={isDark} />
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#EEF2F7] tracking-wide uppercase">
                  LANDGUARD AI
                </div>
                <div className="text-2xs text-[#475569] dark:text-[#7A8A9A] font-medium leading-tight truncate">
                  Risk Intelligence Platform
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 focus-ring rounded-lg cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grouped Administrative Navigation */}
          <nav className="p-3 space-y-4 flex-1">
            {navigationGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <div className="px-2 py-0.5 text-3xs font-bold text-[#64748B] dark:text-[#4D5C6E] uppercase tracking-wider">
                  {grp.group}
                </div>

                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors duration-100 cursor-pointer text-left relative focus-ring ${
                        isActive
                          ? 'bg-[#1D4ED8] dark:bg-[#1A3A7A] text-white font-semibold shadow-xs'
                          : 'text-[#334155] dark:text-[#B8C4D0] hover:bg-[#F1F5F9] dark:hover:bg-[#181E28] hover:text-[#0F172A] dark:hover:text-[#EEF2F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#64748B] dark:text-[#7A8A9A]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-3xs font-mono font-bold px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Platform Status Footer */}
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[rgba(255,255,255,0.07)] bg-[#F8FAFC] dark:bg-[#0A0D14] flex items-center justify-between text-3xs text-[#64748B] dark:text-[#4D5C6E]">
            <span className="font-semibold tracking-wider">LandGuard Intelligence</span>
            <span className="font-mono text-2xs">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
