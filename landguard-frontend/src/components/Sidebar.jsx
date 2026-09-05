import React from 'react';
import {
  LayoutDashboard, FolderKanban, Bell, GitPullRequestDraft,
  Map, BarChart2, Shield, CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0 }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
    { id: 'bottlenecks', label: 'Bottlenecks', icon: GitPullRequestDraft },
    { id: 'map', label: 'GIS Map', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#D9E1EA] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#D9E1EA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#123B63] flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-[#123B63] tracking-tight">LandGuard AI</span>
                <span className="text-[10px] font-semibold bg-blue-50 text-[#1769AA] px-1.5 py-0.2 rounded border border-blue-200">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-[#667085] font-medium leading-tight mt-0.5">
                Land Acquisition Risk Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
            Platform Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#1769AA] text-white font-semibold shadow-xs'
                    : 'text-[#172033] hover:bg-[#F5F7FA] hover:text-[#123B63]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#667085]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white text-[#1769AA]' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Institutional User & System Status Footer */}
      <div className="p-4 border-t border-[#D9E1EA] bg-[#F8FAFC]">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#172033] text-xs">Govt. Officer Portal</div>
            <div className="text-[11px] text-[#667085]">Maharashtra State Portal</div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
