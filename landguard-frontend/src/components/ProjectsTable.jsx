import React, { useState, useMemo, useRef, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import {
  Search, ArrowUpDown, Sparkles, MapPin, Building2,
  Filter, ChevronRight, Hash, X, Check
} from 'lucide-react';

export default function ProjectsTable({ cases = [], projects = [], onSelectCase, onSelectProject, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortAsc, setSortAsc] = useState(false);
  const searchInputRef = useRef(null);

  const dataList = cases && cases.length > 0 ? cases : projects;
  const handleSelect = onSelectCase || onSelectProject || (() => {});

  const districts = ['All', 'Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Kolhapur', 'Thane', 'Raigad'];
  const stages = ['All', 'Section 11 Notification', 'SIA Clearance', 'Section 19 Declaration', 'Award Inquiry', 'Compensation Payment', 'Land Possession'];
  const risks = ['All', 'High', 'Medium', 'Low'];

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      <div className="craft-panel p-16 text-center rounded-2xl space-y-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-blue-400 font-mono font-medium animate-pulse">STREAMING 600 ACQUISITION CASES...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="craft-panel p-4 rounded-xl space-y-3 bg-[#0b0f19]">
        {/* District Quick-Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1.5 font-bold">
            <MapPin className="w-3.5 h-3.5 text-blue-400" /> District:
          </span>
          {districts.map((d) => {
            const isSelected = selectedDistrict === d;
            const count = d === 'All' ? dataList.length : dataList.filter(c => c.district === d).length;
            return (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-3 py-1 rounded-lg font-mono text-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-sm border border-blue-400/40'
                    : 'bg-[#06080f] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span>{d}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Stage/Risk Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by Case ID, District, or Infrastructure Name... (Press /)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#06080f] text-slate-100 placeholder-slate-500 text-xs pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-mono transition-colors"
            />
          </div>

          {/* Stage Dropdown */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-[#06080f] text-slate-300 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-medium cursor-pointer max-w-[170px] truncate"
            >
              {stages.map((s) => (
                <option key={s} value={s}>Stage: {s}</option>
              ))}
            </select>

            {/* Risk Dropdown */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[#06080f] text-slate-300 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              {risks.map((r) => (
                <option key={r} value={r}>Risk: {r}</option>
              ))}
            </select>

            {/* Score Sort Toggle */}
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="bg-[#06080f] hover:bg-slate-900 text-slate-200 font-semibold px-3 py-2 rounded-lg border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Score ({sortAsc ? 'Asc' : 'Desc'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main High-Density Cases Table */}
      <div className="craft-panel rounded-xl overflow-hidden shadow-2xl bg-[#0b0f19] border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#06080f] text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Infrastructure Project & District</th>
                <th className="py-3.5 px-4">Statutory Phase</th>
                <th className="py-3.5 px-4">Risk Matrix</th>
                <th className="py-3.5 px-4">Predicted Delay Probability</th>
                <th className="py-3.5 px-4">Compensation Outlay</th>
                <th className="py-3.5 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 text-xs font-mono">
                    NO CASES MATCHING ACTIVE FILTER CRITERIA
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const scorePct = ((p.risk_score || 0) * 100).toFixed(1);
                  const isCritical = p.risk_score >= 0.7;
                  const isElevated = p.risk_score >= 0.35 && p.risk_score < 0.7;

                  return (
                    <tr
                      key={p.case_id || p.project_id}
                      className="hover:bg-blue-600/10 transition-colors duration-100 group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                        {p.case_id || p.project_id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                          {p.project_name || `${p.district} Infrastructure Project`}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{p.district} District &bull; Maharashtra</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        <span className="px-2.5 py-1 rounded-md bg-[#06080f] text-slate-300 border border-white/5 font-mono text-[11px]">
                          {p.current_stage || p.stage}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <RiskBadge level={p.risk_level} />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 w-32">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={`font-bold ${isCritical ? 'text-red-400' : isElevated ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {scorePct}%
                            </span>
                            <span className="text-[10px] text-slate-500">LightGBM</span>
                          </div>
                          <div className="w-full bg-[#06080f] rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-200 ${
                                isCritical ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                                isElevated ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, p.risk_score * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-xs">
                        &#8377;{p.compensation_offered_cr} Cr
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSelect(p)}
                          className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-blue-400/40 group-hover:scale-105"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                          <span>SHAP Audit</span>
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
        <div className="p-3 bg-[#06080f] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono px-4">
          <span>MONITORING {filteredProjects.length} OF {dataList.length} ACQUISITION CASES</span>
          <span>STATUTORY FRAMEWORK: RFCTLARR ACT 2013</span>
        </div>
      </div>
    </div>
  );
}
