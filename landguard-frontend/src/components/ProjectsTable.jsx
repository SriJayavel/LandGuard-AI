import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { Search, Filter, ArrowUpDown, Sparkles, AlertTriangle, Layers, Building2, MapPin } from 'lucide-react';

export default function ProjectsTable({ cases = [], projects = [], onSelectCase, onSelectProject, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortAsc, setSortAsc] = useState(false);

  const dataList = cases && cases.length > 0 ? cases : projects;
  const handleSelect = onSelectCase || onSelectProject || (() => {});

  const districts = ['All', 'Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Kolhapur', 'Thane', 'Raigad'];
  const stages = ['All', 'Section 11 Notification', 'SIA Clearance', 'Section 19 Declaration', 'Award Inquiry', 'Compensation Payment', 'Land Possession'];
  const risks = ['All', 'High', 'Medium', 'Low'];

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(dataList)) return [];
    return dataList
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
  }, [dataList, searchTerm, selectedDistrict, selectedStage, selectedRisk, sortAsc]);

  if (loading) {
    return (
      <div className="glass-card p-12 text-center rounded-2xl space-y-3">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-cyan-300 font-medium animate-pulse">Loading Land Acquisition Cases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Control & Filter Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-slate-700/50 shadow-xl">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Case ID, District, or Project Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>District: {d}</option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[160px] truncate"
          >
            {stages.map((s) => (
              <option key={s} value={s}>Stage: {s}</option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {risks.map((r) => (
              <option key={r} value={r}>Risk: {r}</option>
            ))}
          </select>

          {/* Sort Button */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Score ({sortAsc ? 'Asc' : 'Desc'})</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Project Name & District</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Predicted Risk Score</th>
                <th className="py-3.5 px-4">Budget Offered</th>
                <th className="py-3.5 px-4 text-right">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No matching land acquisition cases found. Try adjusting filters or search term.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const scorePct = ((p.risk_score || 0) * 100).toFixed(1);
                  return (
                    <tr
                      key={p.case_id || p.project_id}
                      className="hover:bg-slate-800/40 transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {p.case_id || p.project_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {p.project_name || `${p.district} Infrastructure`}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{p.district} District</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {p.current_stage || p.stage}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-bold ${p.risk_score >= 0.7 ? 'text-rose-400' : p.risk_score >= 0.35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {scorePct}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">XGBoost</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                p.risk_score >= 0.7 ? 'bg-rose-500' : p.risk_score >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, p.risk_score * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-400 font-mono">
                        &#8377;{p.compensation_offered_cr} Cr
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSelect(p)}
                          className="py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs inline-flex items-center gap-1.5 transition-all shadow-md hover:shadow-cyan-500/25"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                          <span>Explain AI Risk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
