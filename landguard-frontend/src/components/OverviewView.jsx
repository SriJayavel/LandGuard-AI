import React, { useMemo } from 'react';
import RiskBadge from './RiskBadge';
import {
  FolderKanban, Clock,
  ArrowRight, ChevronRight, MapPin
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function OverviewView({
  cases = [],
  onSelectCase,
  onViewAllProjects,
  onViewAlerts,
  onViewBottlenecks,
  onViewMap
}) {
  const totalCases = cases.length || 600;
  const criticalCases = useMemo(() => cases.filter((c) => c.risk_level === 'High'), [cases]);
  const criticalCount = criticalCases.length || 265;
  const mediumCount = cases.filter((c) => c.risk_level === 'Medium').length || 215;
  const lowCount = cases.filter((c) => c.risk_level === 'Low').length || 120;

  const totalOutlayAtRisk = useMemo(() => {
    return criticalCases
      .reduce((sum, c) => sum + (parseFloat(c.compensation_offered_cr) || 16.5), 0)
      .toFixed(1);
  }, [criticalCases]);

  const avgDaysInStage = useMemo(() => {
    if (cases.length === 0) return 54.8;
    const totalDays = cases.reduce((acc, c) => acc + (parseInt(c.days_in_stage) || 45), 0);
    return (totalDays / cases.length).toFixed(1);
  }, [cases]);

  // Risk Distribution Data (Restrained: Red, Amber, Green)
  const riskDistribution = useMemo(() => [
    { name: 'Critical Risk', value: criticalCount, color: '#DC2626', pct: Math.round((criticalCount / totalCases) * 100) },
    { name: 'Elevated Risk', value: mediumCount, color: '#D97706', pct: Math.round((mediumCount / totalCases) * 100) },
    { name: 'Stable Process', value: lowCount, color: '#16A34A', pct: Math.round((lowCount / totalCases) * 100) },
  ], [criticalCount, mediumCount, lowCount, totalCases]);

  // Priority queue: Critical cases sorted by delay probability
  const topCriticalProjects = useMemo(() => {
    return [...criticalCases]
      .sort((a, b) => (parseFloat(b.risk_score) || 0) - (parseFloat(a.risk_score) || 0))
      .slice(0, 5);
  }, [criticalCases]);

  // Project lifecycle stages
  const projectStages = [
    { id: 'sec11', title: 'Preliminary Notification', section: 'Phase 1', cases: 112, stalled: 22, isBottleneck: false },
    { id: 'sia', title: 'Impact Assessment & Surveys', section: 'Phase 2', cases: 86, stalled: 18, isBottleneck: false },
    { id: 'sec19', title: 'Corridor Purpose Declaration', section: 'Phase 3', cases: 142, stalled: 48, isBottleneck: true },
    { id: 'sec23', title: 'Valuation & Claims Inquiry', section: 'Phase 4', cases: 138, stalled: 36, isBottleneck: false },
    { id: 'sec38', title: 'Compensation & Transfer', section: 'Phase 5', cases: 122, stalled: 29, isBottleneck: false },
  ];

  // District distribution
  const districtSummary = [
    { district: 'Amravati', critical: 34, total: 75, leadIssue: 'Valuation & multiplier appeals' },
    { district: 'Pune', critical: 31, total: 85, leadIssue: 'Judicial writ stays' },
    { district: 'Nashik', critical: 28, total: 70, leadIssue: 'Forest land diversion delays' },
    { district: 'Nagpur', critical: 24, total: 72, leadIssue: 'R&R township site objections' },
    { district: 'Aurangabad', critical: 22, total: 78, leadIssue: 'Industrial corridor compensation' },
    { district: 'Kolhapur', critical: 18, total: 68, leadIssue: 'Agricultural title reconciliation' },
  ];

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#0F2942] dark:text-[#F3F6FA] tracking-tight">
            Executive Risk Overview
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
            Real-time monitoring and delay risk intelligence across 600 land acquisition projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111A24] hover:bg-[#F8FAFC] dark:hover:bg-[#151F2B] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#263342] rounded transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            <span>{criticalCount} Critical Alerts</span>
          </button>
        </div>
      </div>

      {/* 1. Metric Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* DOMINANT CARD: Critical Cases & Exposure */}
        <div className="gov-card p-4 flex flex-col justify-between border-l-4 border-l-[#DC2626] sm:col-span-2 bg-[#FFFFFF] dark:bg-[#111A24]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#B91C1C] dark:text-red-400 uppercase tracking-wider">
              Priority Review Required
            </span>
            <span className="text-[11px] font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
              Litigation &amp; Valuation Risk
            </span>
          </div>

          <div className="my-3 flex flex-wrap items-baseline gap-4">
            <div>
              <span className="text-3xl font-bold font-mono-num text-[#DC2626]">
                {criticalCount}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#9AA8B8] ml-1.5 font-medium">
                High-Risk Cases
              </span>
            </div>
            <div className="border-l border-[#E2E8F0] dark:border-[#263342] pl-4">
              <span className="text-2xl font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                &#8377;{totalOutlayAtRisk} Cr
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#9AA8B8] ml-1.5 font-medium">
                Outlay at Risk
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] pt-2 border-t border-[#E2E8F0] dark:border-[#263342] flex items-center justify-between">
            <span>44% of monitored caseload has pending litigation or stage delay</span>
            <button
              onClick={onViewAlerts}
              className="text-[#1D4ED8] dark:text-[#3B82F6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Alert Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* SECONDARY CARD 1: Total Active Cases */}
        <div className="gov-card p-4 flex flex-col justify-between bg-white dark:bg-[#111A24]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#9AA8B8] uppercase tracking-wider">
              Monitored Portfolio
            </span>
            <FolderKanban className="w-4 h-4 text-[#64748B] dark:text-[#6F7D8D]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
              {totalCases}
            </span>
            <span className="text-xs text-[#64748B] dark:text-[#9AA8B8]">active cases</span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] pt-2 border-t border-[#E2E8F0] dark:border-[#263342]">
            Total Land Area: ~84,200 Acres
          </div>
        </div>

        {/* SECONDARY CARD 2: Average Stage Delay */}
        <div className="gov-card p-4 flex flex-col justify-between bg-white dark:bg-[#111A24]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#9AA8B8] uppercase tracking-wider">
              Avg Stage Duration
            </span>
            <Clock className="w-4 h-4 text-[#64748B] dark:text-[#6F7D8D]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
              {avgDaysInStage}d
            </span>
            <span className="text-xs text-[#64748B] dark:text-[#9AA8B8]">current phase</span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] pt-2 border-t border-[#E2E8F0] dark:border-[#263342]">
            Target Timeline: &le; 30 Days
          </div>
        </div>
      </div>

      {/* 2. Project Acquisition Lifecycle Breakdown */}
      <div className="gov-card p-4 space-y-3 bg-white dark:bg-[#111A24]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#263342] pb-2.5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
              Project Acquisition Lifecycle
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Case distribution across lifecycle milestones. Red flags indicate active procedural bottlenecks.
            </p>
          </div>
          <button
            onClick={onViewBottlenecks}
            className="text-xs font-semibold text-[#1D4ED8] dark:text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Bottleneck Analysis</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
          {projectStages.map((stg, idx) => (
            <div
              key={stg.id}
              className={`p-2.5 rounded border transition-colors ${
                stg.isBottleneck
                  ? 'bg-red-50/40 border-red-200 dark:bg-red-950/20 dark:border-red-900/40'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] dark:bg-[#151F2B] dark:border-[#263342]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-[#64748B] dark:text-[#9AA8B8]">
                <span className="font-mono-num font-semibold">Stage 0{idx + 1}</span>
                <span className="font-mono">{stg.section}</span>
              </div>
              <div className="font-semibold text-[#0F172A] dark:text-[#F3F6FA] text-xs mt-1 truncate">
                {stg.title}
              </div>
              <div className="mt-2 pt-2 border-t border-[#E2E8F0]/80 dark:border-[#263342]/80 flex justify-between text-[11px] font-mono-num">
                <span className="text-[#64748B] dark:text-[#9AA8B8]">{stg.cases} cases</span>
                <span className={stg.isBottleneck ? 'text-[#DC2626] font-bold' : 'text-[#64748B] dark:text-[#9AA8B8]'}>
                  {stg.stalled} stalled
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Grid: Priority Work Queue (2 Cols) + Risk Donut (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Work Queue */}
        <div className="lg:col-span-2 gov-card p-4 space-y-3 bg-white dark:bg-[#111824]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263342] pb-2.5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
                Priority Risk Intervention Queue
              </h2>
              <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Projects ranked by delay probability requiring operational review
              </p>
            </div>
            <button
              onClick={onViewAllProjects}
              className="text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All Projects ({totalCases})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#64748B] dark:text-[#9AA8B8] border-b border-[#E2E8F0] dark:border-[#263342] text-[11px] uppercase tracking-wider">
                  <th className="py-2 px-3 font-mono">Case ID</th>
                  <th className="py-2 px-3">Project Title</th>
                  <th className="py-2 px-3">District</th>
                  <th className="py-2 px-3">Phase</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263342]">
                {topCriticalProjects.map((p) => {
                  const caseId = p.case_id || p.project_id;
                  return (
                    <tr
                      key={caseId}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#151F2B] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono-num font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                        {caseId}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#0F172A] dark:text-[#F3F6FA] max-w-[200px] truncate">
                        {p.project_name}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] dark:text-[#9AA8B8]">
                        {p.district}
                      </td>
                      <td className="py-2.5 px-3 text-[#334155] dark:text-[#CBD5E1]">
                        {p.current_stage || p.stage}
                      </td>
                      <td className="py-2.5 px-3">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onSelectCase(p)}
                          className="px-2 py-1 text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Audit Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Donut Chart */}
        <div className="gov-card p-4 space-y-3 flex flex-col justify-between bg-white dark:bg-[#111A24]">
          <div className="border-b border-[#E2E8F0] dark:border-[#263342] pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
              Portfolio Risk Distribution
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Severity categorization across cases
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-[#151F2B] p-2 rounded shadow border border-[#E2E8F0] dark:border-[#263342] text-xs">
                          <span className="font-semibold block" style={{ color: d.color }}>{d.name}</span>
                          <span className="font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                            {d.value} cases ({d.pct}%)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#263342] text-xs">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#475569] dark:text-[#9AA8B8]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </span>
                <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                  {item.value} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Regional Risk Concentration Barometer */}
      <div className="gov-card p-4 space-y-3 bg-white dark:bg-[#111A24]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#263342] pb-2.5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
              <span>Regional Risk Concentration</span>
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Districts with highest active litigation and compensation dispute volume
            </p>
          </div>
          <button
            onClick={onViewMap}
            className="text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open GIS Map</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {districtSummary.map((d) => (
            <div
              key={d.district}
              className="p-2.5 bg-[#F8FAFC] dark:bg-[#151F2B] rounded border border-[#E2E8F0] dark:border-[#263342] space-y-1"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#0F172A] dark:text-[#F3F6FA]">{d.district}</span>
                <span className="font-mono-num font-bold text-[#DC2626]">{d.critical} critical</span>
              </div>
              <p className="text-[10px] text-[#64748B] dark:text-[#9AA8B8] truncate" title={d.leadIssue}>
                {d.leadIssue}
              </p>
              <div className="text-[10px] font-mono-num text-[#9AA8B8] dark:text-[#6F7D8D] pt-1">
                {d.total} total cases
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
