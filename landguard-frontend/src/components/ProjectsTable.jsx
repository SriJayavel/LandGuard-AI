import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { Search, ArrowUpDown, Filter, ChevronRight } from 'lucide-react';

export default function ProjectsTable({ cases = [], onSelectCase, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortAsc, setSortAsc] = useState(false);

  const districts = ['All', 'Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Kolhapur', 'Thane', 'Raigad'];
  const stages = ['All', 'Section 11 Notification', 'SIA Clearance', 'Section 19 Declaration', 'Award Inquiry', 'Compensation Payment', 'Land Possession'];
  const risks = ['All', 'High', 'Medium', 'Low'];

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(cases)) return [];
    return cases
      .filter((p) => {
        if (!p) return false;
        const caseIdStr = (p.case_id || p.project_id || '').toString().toLowerCase();
        const distStr = (p.district || '').toString().toLowerCase();
        const nameStr = (p.project_name || '').toString().toLowerCase();
        const searchStr = searchTerm.toLowerCase();

        const matchesSearch = caseIdStr.includes(searchStr) || distStr.includes(searchStr) || nameStr.includes(searchStr);
        const matchesDistrict = selectedDistrict === 'All' || p.district === selectedDistrict;
        const matchesStage = selectedStage === 'All' || (p.current_stage || p.stage) === selectedStage;
        const matchesRisk = selectedRisk === 'All' || p.risk_level === selectedRisk;
        return matchesSearch && matchesDistrict && matchesStage && matchesRisk;
      })
      .sort((a, b) => {
        const scoreA = parseFloat(a.risk_score) || 0;
        const scoreB = parseFloat(b.risk_score) || 0;
        return sortAsc ? scoreA - scoreB : scoreB - scoreA;
      });
  }, [cases, searchTerm, selectedDistrict, selectedStage, selectedRisk, sortAsc]);

  if (loading) {
    return (
      <div className="gov-card p-12 text-center rounded space-y-2">
        <p className="text-xs font-semibold text-[#1769AA]">Loading project data...</p>
        <p className="text-[11px] text-[#667085]">Retrieving cases from state land acquisition database</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl font-bold text-[#172033] tracking-tight">Land Acquisition Case Portfolio</h2>
        <p className="text-xs text-[#667085] mt-0.5">
          Comprehensive register of active statutory acquisition cases with machine learning risk scoring
        </p>
      </div>

      {/* Administrative Filter Bar */}
      <div className="gov-card p-3 flex flex-wrap items-center justify-between gap-3 bg-white">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID, Project Name, or District..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F5F7FA] text-[#172033] placeholder-[#667085] text-xs pl-9 pr-3 py-1.5 rounded border border-[#D9E1EA] focus:outline-none focus:border-[#1769AA] transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#F5F7FA] text-[#172033] px-2.5 py-1.5 rounded border border-[#D9E1EA] focus:outline-none focus:border-[#1769AA] cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>District: {d}</option>
            ))}
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-[#F5F7FA] text-[#172033] px-2.5 py-1.5 rounded border border-[#D9E1EA] focus:outline-none focus:border-[#1769AA] cursor-pointer max-w-[160px] truncate"
          >
            {stages.map((s) => (
              <option key={s} value={s}>Stage: {s}</option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-[#F5F7FA] text-[#172033] px-2.5 py-1.5 rounded border border-[#D9E1EA] focus:outline-none focus:border-[#1769AA] cursor-pointer"
          >
            {risks.map((r) => (
              <option key={r} value={r}>Risk: {r}</option>
            ))}
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-white hover:bg-[#F5F7FA] text-[#172033] font-medium px-2.5 py-1.5 rounded border border-[#D9E1EA] flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#1769AA]" />
            <span>Score ({sortAsc ? 'Asc' : 'Desc'})</span>
          </button>
        </div>
      </div>

      {/* Serious Enterprise Data Table */}
      <div className="gov-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#667085] border-b border-[#D9E1EA] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-mono">Case ID</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Current Phase</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Delay Probability</th>
                <th className="py-3 px-4">Budget Outlay</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E1EA]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#667085] text-xs">
                    No projects match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const probPct = ((p.risk_score || 0) * 100).toFixed(0);
                  const isCritical = p.risk_score >= 0.7;

                  return (
                    <tr key={p.case_id || p.project_id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[#1769AA]">
                        {p.case_id || p.project_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#172033]">
                        {p.project_name}
                      </td>
                      <td className="py-3 px-4 text-[#667085]">
                        {p.district}
                      </td>
                      <td className="py-3 px-4 text-[#172033]">
                        {p.current_stage || p.stage}
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden border border-[#D9E1EA]">
                            <div
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-[#DC2626]' : p.risk_score >= 0.35 ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, p.risk_score * 100))}%` }}
                            ></div>
                          </div>
                          <span className={`font-mono font-semibold text-xs ${isCritical ? 'text-[#DC2626]' : 'text-[#172033]'}`}>
                            {probPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#172033]">
                        &#8377;{p.compensation_offered_cr} Cr
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectCase(p)}
                          className="text-xs font-semibold text-[#1769AA] hover:text-[#123B63] hover:underline cursor-pointer inline-flex items-center gap-0.5"
                        >
                          <span>View Case</span>
                          <span aria-hidden="true">&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#D9E1EA] flex items-center justify-between text-xs text-[#667085] px-4">
          <span>Showing {filteredProjects.length} of {cases.length} cases</span>
          <span>Statutory Framework: RFCTLARR Act 2013</span>
        </div>
      </div>
    </div>
  );
}
