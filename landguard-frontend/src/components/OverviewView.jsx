import React, { useMemo } from 'react';
import RiskBadge from './RiskBadge';
import {
  ArrowRight, ChevronRight, AlertTriangle, Clock,
  FolderKanban, Activity, MapPin, Sliders, ClipboardList, Zap, X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function OverviewView({
  cases = [],
  onSelectCase = () => {},
  onViewAllProjects = () => {},
  onNavigate = () => {},
  selectedDivision = 'All Divisions',
  onResetDivision = () => {}
}) {
  const totalCases = cases.length || 600;

  // Derive metrics from live data or fall back to demo values
  const criticalCases = useMemo(() => cases.filter(c => c.risk_level === 'High'), [cases]);
  const mediumCases = useMemo(() => cases.filter(c => c.risk_level === 'Medium'), [cases]);
  const lowCases = useMemo(() => cases.filter(c => c.risk_level === 'Low'), [cases]);

  const criticalCount = cases.length > 0 ? criticalCases.length : 265;
  const mediumCount = cases.length > 0 ? mediumCases.length : 320;
  const lowCount = cases.length > 0 ? lowCases.length : 240;

  const totalOutlay = useMemo(() => {
    if (cases.length === 0) return '8,398.7';
    return criticalCases
      .reduce((sum, c) => sum + (parseFloat(c.compensation_offered_cr) || 16.5), 0)
      .toFixed(1);
  }, [cases, criticalCases]);

  const avgDays = useMemo(() => {
    if (cases.length === 0) return 60;
    const total = cases.reduce((acc, c) => acc + (parseInt(c.days_in_stage) || 45), 0);
    return Math.round(total / cases.length);
  }, [cases]);

  const criticalPct = Math.round((criticalCount / totalCases) * 100);

  // Risk distribution for donut
  const riskDistribution = [
    { name: 'High Risk', value: criticalCount, color: '#EF4444' },
    { name: 'Medium Risk', value: mediumCount, color: '#F59E0B' },
    { name: 'On Track', value: lowCount, color: '#10B981' },
  ];

  // Priority cases list
  const priorityCases = useMemo(() => {
    const demo = [
      { case_id: 'LA-1059', project_name: 'Aurangabad Industrial City Logistics Hub', district: 'Aurangabad', current_stage: 'Compensation', compensation_offered_cr: '50.3', risk_level: 'High', risk_score: 0.94, days_in_stage: 88 },
      { case_id: 'LA-1028', project_name: 'Nagpur Agri-Export Highway Widening', district: 'Nagpur', current_stage: 'Possession', compensation_offered_cr: '46.1', risk_level: 'High', risk_score: 0.91, days_in_stage: 72 },
      { case_id: 'LA-1068', project_name: 'Pune Agri-Export Highway Widening', district: 'Pune', current_stage: 'Award', compensation_offered_cr: '46.1', risk_level: 'High', risk_score: 0.89, days_in_stage: 81 },
      { case_id: 'LA-1041', project_name: 'Nashik Ring Road Expansion', district: 'Nashik', current_stage: 'Survey', compensation_offered_cr: '38.2', risk_level: 'High', risk_score: 0.86, days_in_stage: 55 },
      { case_id: 'LA-1055', project_name: 'Amravati Solar Corridor', district: 'Amravati', current_stage: 'Notification', compensation_offered_cr: '22.7', risk_level: 'High', risk_score: 0.82, days_in_stage: 34 },
    ];

    if (cases.length === 0) return demo;
    return [...cases]
      .filter(c => c.risk_level === 'High')
      .sort((a, b) => (parseFloat(b.risk_score) || 0) - (parseFloat(a.risk_score) || 0))
      .slice(0, 5)
      .map(c => ({ ...c, case_id: c.case_id || c.project_id }));
  }, [cases]);

  // District summary
  const districtSummary = useMemo(() => {
    const districts = ['Pune', 'Nagpur', 'Nashik', 'Amravati', 'Aurangabad', 'Kolhapur'];
    if (cases.length === 0) {
      return [
        { district: 'Pune', total: 102, critical: 41 },
        { district: 'Nagpur', total: 88, critical: 32 },
        { district: 'Nashik', total: 76, critical: 28 },
        { district: 'Amravati', total: 95, critical: 51 },
        { district: 'Aurangabad', total: 112, critical: 67 },
        { district: 'Kolhapur', total: 127, critical: 46 },
      ];
    }
    const map = {};
    cases.forEach(c => {
      const d = c.district || 'Maharashtra';
      if (!map[d]) map[d] = { district: d, total: 0, critical: 0 };
      map[d].total++;
      if (c.risk_level === 'High') map[d].critical++;
    });
    return Object.values(map).sort((a, b) => b.critical - a.critical).slice(0, 6);
  }, [cases]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#EEF2F7] tracking-tight">
              Overview
            </h1>
            {selectedDivision !== 'All Divisions' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                {selectedDivision}
                <button onClick={onResetDivision} className="hover:text-red-500 cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-[#7A8A9A] mt-0.5">
            {totalCases} active cases across Maharashtra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulate
          </button>
          <button
            onClick={() => onNavigate('actions')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#181E28] hover:bg-slate-50 dark:hover:bg-[#1E2533] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] text-slate-700 dark:text-[#B8C4D0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Log Action
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-red-500 col-span-2 sm:col-span-1 space-y-1">
          <div className="flex items-center gap-1 text-xs font-semibold text-red-500 uppercase tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-red-600 dark:text-red-400">{criticalCount}</span>
            <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">cases</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#7A8A9A]">₹{totalOutlay} Cr at risk</div>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#7A8A9A] uppercase tracking-wide">Total</span>
            <FolderKanban className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-800 dark:text-[#EEF2F7]">{totalCases}</span>
            <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">projects</span>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{lowCount} on schedule</div>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#7A8A9A] uppercase tracking-wide">Avg Duration</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-800 dark:text-[#EEF2F7]">{avgDays}</span>
            <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">days/stage</span>
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">+14d vs benchmark</div>
        </div>

        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#7A8A9A] uppercase tracking-wide">Risk Rate</span>
            <Activity className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-800 dark:text-[#EEF2F7]">{criticalPct}%</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#7A8A9A]">of portfolio stalled</div>
        </div>
      </div>

      {/* ── Priority Cases + Risk Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Cases */}
        <div className="glass-card p-4 lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-[#EEF2F7]">Priority Cases</h2>
            <button
              onClick={onViewAllProjects}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {priorityCases.map((proj) => (
              <div
                key={proj.case_id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0F131A] border border-slate-200 dark:border-[rgba(255,255,255,0.06)] hover:border-slate-300 dark:hover:border-[rgba(255,255,255,0.12)] transition-colors"
              >
                {/* ID + Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCase(proj)}
                      className="text-xs font-mono font-bold text-blue-600 dark:text-[#4D8EF0] hover:underline cursor-pointer shrink-0"
                    >
                      {proj.case_id}
                    </button>
                    <span className="text-xs font-medium text-slate-800 dark:text-[#B8C4D0] truncate">
                      {proj.project_name || 'Land Acquisition Project'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-[#7A8A9A]">
                      <MapPin className="w-3 h-3" />
                      {proj.district}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-[#4D5C6E]">·</span>
                    <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">{proj.current_stage}</span>
                    <span className="text-xs text-slate-400 dark:text-[#4D5C6E]">·</span>
                    <span className="text-xs font-mono text-red-500 dark:text-red-400">{proj.days_in_stage}d elapsed</span>
                  </div>
                </div>

                {/* Risk + Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <RiskBadge level={proj.risk_level} score={proj.risk_score} size="sm" />
                  <button
                    onClick={() => onNavigate('simulator')}
                    className="px-2 py-1 text-xs font-medium rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer transition-colors"
                  >
                    <Zap className="w-3 h-3 inline mr-0.5" />
                    Simulate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Donut */}
        <div className="glass-card p-4 flex flex-col space-y-3">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#EEF2F7]">Risk Distribution</h2>

          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-[#181E28] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-xs shadow-lg">
                          <div className="font-semibold mb-0.5" style={{ color: d.color }}>{d.name}</div>
                          <div className="text-slate-600 dark:text-[#B8C4D0]">{d.value} cases</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-[rgba(255,255,255,0.07)] pt-3">
            {riskDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-[#B8C4D0]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold font-mono text-slate-800 dark:text-[#EEF2F7]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Regional Breakdown ── */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-[#EEF2F7] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-500" />
            Regional Breakdown
          </h2>
          <button
            onClick={() => onNavigate('map')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            Open Map <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {districtSummary.map(d => {
            const critRate = d.total > 0 ? Math.round((d.critical / d.total) * 100) : 0;
            return (
              <div
                key={d.district}
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F131A] border border-slate-200 dark:border-[rgba(255,255,255,0.06)] space-y-1.5"
              >
                <div className="text-xs font-semibold text-slate-800 dark:text-[#EEF2F7] truncate">{d.district}</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-800 dark:text-[#EEF2F7]">{d.total}</span>
                  {d.critical > 0 && (
                    <span className="text-xs font-bold text-red-500 dark:text-red-400">{d.critical} ⚠</span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#181E28] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: `${critRate}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-[#7A8A9A]">{critRate}% critical</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Full Portfolio', icon: FolderKanban, action: onViewAllProjects, color: 'text-blue-500' },
          { label: 'Bottleneck Analysis', icon: Activity, action: () => onNavigate('bottlenecks'), color: 'text-amber-500' },
          { label: 'GIS Map', icon: MapPin, action: () => onNavigate('map'), color: 'text-emerald-500' },
          { label: 'What-If Simulator', icon: Sliders, action: () => onNavigate('simulator'), color: 'text-violet-500' },
        ].map(link => {
          const Icon = link.icon;
          return (
            <button
              key={link.label}
              onClick={link.action}
              className="glass-card p-3 flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-[#181E28] transition-colors cursor-pointer group"
            >
              <Icon className={`w-4 h-4 shrink-0 ${link.color}`} />
              <span className="text-xs font-medium text-slate-700 dark:text-[#B8C4D0] group-hover:text-slate-900 dark:group-hover:text-[#EEF2F7] transition-colors">
                {link.label}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
