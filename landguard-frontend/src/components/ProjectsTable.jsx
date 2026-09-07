import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import {
  Search, ArrowUpDown, Download, ChevronLeft, ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function ProjectsTable({ cases = [], onSelectCase, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortKey, setSortKey] = useState('risk_score');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const districts = ['All', 'Amravati', 'Aurangabad', 'Kolhapur', 'Nagpur', 'Nashik', 'Pune'];
  const stages = [
    'All',
    'Section 11 Notification',
    'SIA Clearance',
    'Section 19 Declaration',
    'Award Inquiry',
    'Compensation Payment',
    'Land Possession'
  ];
  const risks = ['All', 'High', 'Medium', 'Low'];

  // Filtering & Sorting
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
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'risk_score' || sortKey === 'compensation_offered_cr' || sortKey === 'days_in_stage') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [cases, searchTerm, selectedDistrict, selectedStage, selectedRisk, sortKey, sortAsc]);

  const totalItems = filteredProjects.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredProjects.length === 0) return;

    const headers = [
      'Case ID',
      'Project Name',
      'District',
      'Statutory Stage',
      'Risk Score',
      'Risk Level',
      'Outlay Cr',
      'Days in Stage'
    ];

    const rows = filteredProjects.map((p) => [
      p.case_id || p.project_id,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      p.district,
      `"${p.current_stage || p.stage}"`,
      p.risk_score,
      p.risk_level,
      p.compensation_offered_cr,
      p.days_in_stage
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LandGuard_Case_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="gov-card p-12 text-center rounded space-y-2 bg-white dark:bg-[#111A24]">
        <div className="w-6 h-6 border-2 border-[#1D4ED8] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-[#0F2942] dark:text-[#F3F6FA]">
          Loading Acquisition Case Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263342] pb-3">
        <div>
          <h1 className="text-lg font-bold text-[#0F2942] dark:text-[#F3F6FA] tracking-tight">
            Acquisition Project Portfolio
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
            Comprehensive portfolio of monitored land acquisition proceedings
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#111A24] hover:bg-[#F8FAFC] dark:hover:bg-[#151F2B] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#263342] rounded transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
          <span>Export Portfolio CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-2.5 flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-[#111A24]">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#6F7D8D] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, project name, or district..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] placeholder-[#64748B] dark:placeholder-[#6F7D8D] text-xs pl-8 pr-3 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>District: {d}</option>
            ))}
          </select>

          <select
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] cursor-pointer max-w-[180px] truncate"
          >
            {stages.map((s) => (
              <option key={s} value={s}>Stage: {s}</option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] cursor-pointer"
          >
            {risks.map((r) => (
              <option key={r} value={r}>Risk: {r}</option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] cursor-pointer"
          >
            <option value={15}>15 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Official Registry Table */}
      <div className="gov-card overflow-hidden bg-white dark:bg-[#111A24]">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] dark:bg-[#151F2B] border-b border-[#E2E8F0] dark:border-[#263342]">
              <tr className="text-[#64748B] dark:text-[#9AA8B8] text-[11px] uppercase tracking-wider font-semibold">
                <th
                  onClick={() => handleSort('case_id')}
                  className="py-2.5 px-3 font-mono cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Case ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('project_name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Project Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('district')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>District</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('current_stage')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Stage</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('risk_score')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Severity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('risk_score')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Probability</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('compensation_offered_cr')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Outlay (&#8377; Cr)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('days_in_stage')}
                  className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Days</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263342]">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#64748B] dark:text-[#9AA8B8]">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p) => {
                  const probPct = Math.round((p.risk_score || 0.5) * 100);
                  const caseId = p.case_id || p.project_id;

                  return (
                    <tr
                      key={caseId}
                      className="hover:bg-[#F8FAFC] dark:hover:bg-[#151F2B] transition-colors"
                    >
                      <td className="py-2 px-3 font-mono-num font-semibold text-[#1D4ED8] dark:text-[#3B82F6]">
                        {caseId}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#0F172A] dark:text-[#F3F6FA] max-w-[220px] truncate">
                        {p.project_name}
                      </td>
                      <td className="py-2 px-3 text-[#64748B] dark:text-[#9AA8B8]">
                        {p.district}
                      </td>
                      <td className="py-2 px-3 text-[#334155] dark:text-[#CBD5E1]">
                        {p.current_stage || p.stage}
                      </td>
                      <td className="py-2 px-3">
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td className="py-2 px-3 font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                        {probPct}%
                      </td>
                      <td className="py-2 px-3 font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                        &#8377;{p.compensation_offered_cr}
                      </td>
                      <td className="py-2 px-3 font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
                        {p.days_in_stage || 45}d
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => onSelectCase(p)}
                          className="text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Audit</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#151F2B] border-t border-[#E2E8F0] dark:border-[#263342] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#9AA8B8] px-3.5">
          <div className="font-mono-num">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems} cases
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-[#E2E8F0] dark:border-[#263342] bg-white dark:bg-[#111A24] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-num px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-[#E2E8F0] dark:border-[#263342] bg-white dark:bg-[#111A24] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
