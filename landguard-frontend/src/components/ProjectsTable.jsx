import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { Search, ArrowUpDown, Sparkles, MapPin, Building2, Layers } from 'lucide-react';

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
      <div className="solid-card p-12 text-center rounded-xl space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-blue-400 font-medium">Loading Land Acquisition Cases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="solid-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-gray-800 bg-gray-900">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Case ID, District, or Infrastructure Project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-950 text-gray-100 placeholder-gray-500 text-xs pl-9 pr-4 py-2 rounded-md border border-gray-800 focus:outline-none focus:border-blue-500 transition-all font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-gray-950 text-gray-200 px-3 py-2 rounded-md border border-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            {districts.map((d) => (
              <option key={d} value={d}>District: {d}</option>
            ))}
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-gray-950 text-gray-200 px-3 py-2 rounded-md border border-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium max-w-[160px] truncate"
          >
            {stages.map((s) => (
              <option key={s} value={s}>Stage: {s}</option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-gray-950 text-gray-200 px-3 py-2 rounded-md border border-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            {risks.map((r) => (
              <option key={r} value={r}>Risk: {r}</option>
            ))}
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-3 py-2 rounded-md border border-gray-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Score ({sortAsc ? 'Asc' : 'Desc'})</span>
          </button>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="solid-card rounded-xl overflow-hidden border border-gray-800 shadow-xl bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-950 text-gray-400 border-b border-gray-800 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 font-mono">Case ID</th>
                <th className="py-3.5 px-4">Project & District</th>
                <th className="py-3.5 px-4">Statutory Stage</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">XGBoost Risk Score</th>
                <th className="py-3.5 px-4">Compensation Outlay</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 font-sans">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-xs">
                    No land acquisition cases matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const scorePct = ((p.risk_score || 0) * 100).toFixed(1);
                  return (
                    <tr
                      key={p.case_id || p.project_id}
                      className="hover:bg-gray-800/60 transition-colors duration-150 group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                        {p.case_id || p.project_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                          {p.project_name || `${p.district} Project`}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{p.district} District</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 font-medium">
                        {p.current_stage || p.stage}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`font-mono font-bold ${p.risk_score >= 0.7 ? 'text-red-400' : p.risk_score >= 0.35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {scorePct}%
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">XGBoost</span>
                          </div>
                          <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                p.risk_score >= 0.7 ? 'bg-red-500' : p.risk_score >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, p.risk_score * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                        &#8377;{p.compensation_offered_cr} Cr
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSelect(p)}
                          className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-blue-500"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                          <span>SHAP Analysis</span>
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
