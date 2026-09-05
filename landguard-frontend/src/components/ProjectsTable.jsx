import React, { useState, useMemo, useRef, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import {
  Search, ArrowUpDown, Sparkles, MapPin, Building2,
  Filter, Check, ChevronRight, SlidersHorizontal, Hash
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

  // Global keydown listener for '/' search shortcut
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
      <div className="art-card p-16 text-center rounded-2xl space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_#06b6d4]"></div>
        <p className="text-xs text-cyan-300 font-mono font-medium animate-pulse">STREAMING TELEMETRY FOR 600 ACQUISITION CASES...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control Studio */}
      <div className="art-card p-5 rounded-2xl space-y-4">
        {/* District Quick-Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> District:
          </span>
          {districts.map((d) => {
            const isSelected = selectedDistrict === d;
            const count = d === 'All' ? dataList.length : dataList.filter(c => c.district === d).length;
            return (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all duration-150 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-cyan-400/40'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-white/5'
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

        {/* Search & Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Case ID (e.g. LA-1001), District, or Infrastructure Corridor... (Press /)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono shadow-inner"
            />
          </div>

          {/* Stage Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-950 text-slate-300 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer max-w-[170px] truncate"
            >
              {stages.map((s) => (
                <option key={s} value={s}>Stage: {s}</option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-slate-950 text-slate-300 px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {risks.map((r) => (
                <option key={r} value={r}>Risk: {r}</option>
              ))}
            </select>

            {/* Score Sort Toggle */}
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold px-3.5 py-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer font-mono"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Score ({sortAsc ? 'Asc' : 'Desc'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main High-Precision Data Table */}
      <div className="art-card rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider font-mono">
                <th className="py-4 px-5">Case Identifier</th>
                <th className="py-4 px-5">Infrastructure Project & District</th>
                <th className="py-4 px-5">Statutory Phase</th>
                <th className="py-4 px-5">Risk Matrix</th>
                <th className="py-4 px-5">Predicted Delay Probability</th>
                <th className="py-4 px-5">Budget Outlay</th>
                <th className="py-4 px-5 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 text-xs font-mono">
                    NO ACTIVE CASES CORRESPONDING TO ACTIVE FILTER CRITERIA
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const scorePct = ((p.risk_score || 0) * 100).toFixed(1);
                  const isHigh = p.risk_score >= 0.7;
                  const isMed = p.risk_score >= 0.35 && p.risk_score < 0.7;

                  return (
                    <tr
                      key={p.case_id || p.project_id}
                      className="hover:bg-blue-950/20 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-cyan-600" />
                        <span>{p.case_id || p.project_id}</span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {p.project_name || `${p.district} Infrastructure Project`}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{p.district} District &bull; Maharashtra</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-300 font-medium">
                        <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-white/5 font-mono text-[11px]">
                          {p.current_stage || p.stage}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <RiskBadge level={p.risk_level} />
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1.5 w-32">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={`font-bold ${isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {scorePct}%
                            </span>
                            <span className="text-[10px] text-slate-500">XGB-Tree</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isHigh ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_8px_#f43f5e]' :
                                isMed ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                                'bg-gradient-to-r from-emerald-600 to-emerald-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, p.risk_score * 100))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                        &#8377;{p.compensation_offered_cr} Cr
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleSelect(p)}
                          className="py-1.5 px-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer border border-cyan-400/30 group-hover:scale-105"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
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

        {/* Table Footer Status Bar */}
        <div className="p-3 bg-slate-950 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono px-5">
          <span>SHOWING {filteredProjects.length} OF {dataList.length} MONITORED CASES</span>
          <span>RFCTLARR ACT 2013 STATUTORY BENCHMARK</span>
        </div>
      </div>
    </div>
  );
}
