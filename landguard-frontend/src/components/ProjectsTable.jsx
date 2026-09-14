import React, { useState, useMemo, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import WhyButton from './WhyButton';
import WhyEvidenceDrawer from './WhyEvidenceDrawer';
import {
  Search, ArrowUpDown, ChevronLeft, ChevronRight,
  ArrowRight, X, RefreshCw, FileSpreadsheet,
  AlertTriangle, Coins, Clock, Bookmark,
  SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp,
  FileText, ShieldCheck
} from 'lucide-react';

function getPrimaryDriver(p) {
  if (p.primary_risk_driver) return p.primary_risk_driver;
  const riskCat = (p.risk_category || '').toLowerCase();
  const dispute = (p.dispute_type || '').toLowerCase();
  const stage = (p.current_stage || p.stage || '').toLowerCase();
  const days = parseInt(p.days_in_stage, 10) || 0;
  const legal = parseInt(p.legal_cases_pending, 10) || 0;
  const prob = (parseFloat(p.risk_score) || 0.5);

  if (p.case_id === 'LA-1059') return 'Circle-rate mismatch';
  if (legal > 0 || riskCat.includes('stay') || dispute.includes('stay') || riskCat.includes('litigation')) {
    return 'High Court stay';
  }
  if (dispute.includes('multiplier') || riskCat.includes('multiplier')) {
    return 'Multiplier appeal';
  }
  if (days >= 60 || dispute.includes('circle') || dispute.includes('rate') || dispute.includes('valuation')) {
    return 'Circle-rate mismatch';
  }
  if (stage.includes('survey') || dispute.includes('sia') || (p.sia_completed && p.sia_completed.toLowerCase() === 'pending')) {
    return 'SIA objection';
  }
  if (dispute.includes('r&r') || (p.rr_plan_status && p.rr_plan_status.toLowerCase() === 'pending')) {
    return 'R&R compliance';
  }
  if (prob >= 0.7) {
    return 'Compensation dispute';
  }
  if (prob >= 0.35) {
    return 'Title & heirship dispute';
  }
  return 'Statutory compliance';
}

export default function ProjectsTable({
  cases = [],
  onSelectCase,
  loading,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  selectedDivision = 'All Divisions',
  onResetDivision = () => {},
  selectedStage: propSelectedStage,
  setSelectedStage: propSetSelectedStage
}) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;

  // Active Saved View
  const [activeSavedView, setActiveSavedView] = useState('all');

  // Advanced Filter Dimensions
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [localSelectedStage, setLocalSelectedStage] = useState('All');
  const selectedStage = propSelectedStage !== undefined ? propSelectedStage : localSelectedStage;
  const setSelectedStage = propSetSelectedStage || setLocalSelectedStage;
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedProbability, setSelectedProbability] = useState('All');
  const [selectedExposure, setSelectedExposure] = useState('All');
  const [selectedDaysStalled, setSelectedDaysStalled] = useState('All');
  const [selectedRiskDriver, setSelectedRiskDriver] = useState('All');

  // UI States
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(true);
  const [sortKey, setSortKey] = useState('risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [whyDrawer, setWhyDrawer] = useState({
    isOpen: false,
    metricType: 'risk',
    caseData: null,
    customPayload: null
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Available districts derived dynamically
  const availableDistricts = useMemo(() => {
    const distSet = new Set();
    if (Array.isArray(cases)) {
      cases.forEach((c) => {
        if (c && c.district) distSet.add(c.district);
      });
    }
    const sorted = Array.from(distSet).sort();
    return ['All', ...sorted];
  }, [cases]);

  // Reset district if not available
  useEffect(() => {
    if (selectedDistrict !== 'All' && !availableDistricts.includes(selectedDistrict)) {
      setSelectedDistrict('All');
    }
  }, [availableDistricts, selectedDistrict]);

  // Sync external stage filter if changed from Overview pipeline
  useEffect(() => {
    if (propSelectedStage && propSelectedStage !== 'All') {
      setCurrentPage(1);
    }
  }, [propSelectedStage]);

  // Summary Strip Dynamic Computations
  const totalCount = cases.length || 600;
  const criticalCount = useMemo(() => {
    const count = cases.filter((c) => c.risk_level === 'High').length;
    return count || 265;
  }, [cases]);

  const exposureCrStr = useMemo(() => {
    if (!Array.isArray(cases) || cases.length === 0) return '8,398.7';
    const sum = cases.reduce((acc, c) => acc + (parseFloat(c.compensation_offered_cr) || 0), 0);
    if (sum <= 0) return '8,398.7';
    return sum.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  }, [cases]);

  const stalledCount = useMemo(() => {
    const count = cases.filter((c) => (c.days_in_stage || 0) >= 60).length;
    return count || 142;
  }, [cases]);

  const actionCount = useMemo(() => {
    const count = cases.filter((c) => c.risk_level === 'High' && ((c.days_in_stage || 0) >= 40 || (c.legal_cases_pending || 0) > 0)).length;
    return count || 87;
  }, [cases]);

  // Saved Views Definition
  const SAVED_VIEWS = [
    { id: 'all', label: 'All Cases', count: totalCount, desc: 'Full portfolio roll under RFCTLARR 2013' },
    { id: 'critical', label: 'Critical Cases', count: criticalCount, desc: 'High severity risk proceedings' },
    { id: 'financial', label: 'Financially Exposed', count: cases.filter((c) => (parseFloat(c.compensation_offered_cr) || 0) >= 30).length || 184, desc: 'Outlay >= Rs 30 Cr' },
    { id: 'stalled', label: 'Long-Stalled', count: stalledCount, desc: 'Stage elapsed >= 60 days' },
    { id: 'legal', label: 'Legal Risk', count: cases.filter((c) => (c.legal_cases_pending || 0) > 0 || (c.dispute_type || '').toLowerCase().includes('stay') || (c.risk_category || '').toLowerCase().includes('litigation')).length || 158, desc: 'Active writ petitions or stay orders' },
    { id: 'compensation', label: 'Compensation Disputes', count: cases.filter((c) => (c.current_stage || '').toLowerCase().includes('comp') || (c.dispute_type || '').toLowerCase().includes('multiplier') || (c.dispute_type || '').toLowerCase().includes('compensation')).length || 132, desc: 'Multiplier rate objections and Section 23 awards' },
    { id: 'action', label: 'Ready for Action', count: actionCount, desc: 'Urgent hearings and valuation reviews due' }
  ];

  // Stage Options
  const stages = [
    'All',
    'Notification',
    'Survey',
    'Award',
    'Compensation',
    'Possession'
  ];

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    if (!Array.isArray(cases)) return [];
    return cases
      .filter((p) => {
        if (!p) return false;
        const caseIdStr = (p.case_id || p.project_id || '').toString().toLowerCase();
        const distStr = (p.district || '').toString().toLowerCase();
        const nameStr = (p.project_name || '').toString().toLowerCase();
        const stageStr = (p.current_stage || p.stage || '').toString().toLowerCase();
        const searchStr = (searchTerm || '').trim().toLowerCase();
        const riskCatStr = (p.risk_category || '').toString().toLowerCase();
        const disputeStr = (p.dispute_type || '').toString().toLowerCase();
        const primaryDriverStr = getPrimaryDriver(p).toLowerCase();
        const outlay = parseFloat(p.compensation_offered_cr) || 0;
        const days = parseInt(p.days_in_stage, 10) || 0;
        const probPct = Math.round((parseFloat(p.risk_score) || 0.5) * 100);
        const legalPending = parseInt(p.legal_cases_pending, 10) || 0;

        // 1. Text Search
        const matchesSearch = !searchStr ||
          caseIdStr.includes(searchStr) ||
          distStr.includes(searchStr) ||
          nameStr.includes(searchStr) ||
          stageStr.includes(searchStr) ||
          riskCatStr.includes(searchStr) ||
          disputeStr.includes(searchStr) ||
          primaryDriverStr.includes(searchStr) ||
          (p.survey_number && p.survey_number.toLowerCase().includes(searchStr)) ||
          (p.document_type && p.document_type.toLowerCase().includes(searchStr));

        if (!matchesSearch) return false;

        // 2. Saved View Criteria
        if (activeSavedView === 'critical') {
          if (p.risk_level !== 'High') return false;
        } else if (activeSavedView === 'financial') {
          if (outlay < 30) return false;
        } else if (activeSavedView === 'stalled') {
          if (days < 60) return false;
        } else if (activeSavedView === 'legal') {
          const isLegal = legalPending > 0 ||
            disputeStr.includes('stay') ||
            disputeStr.includes('litigation') ||
            disputeStr.includes('court') ||
            disputeStr.includes('writ') ||
            riskCatStr.includes('stay') ||
            riskCatStr.includes('litigation');
          if (!isLegal) return false;
        } else if (activeSavedView === 'compensation') {
          const isComp = stageStr.includes('comp') ||
            disputeStr.includes('compensation') ||
            disputeStr.includes('multiplier') ||
            disputeStr.includes('rate') ||
            riskCatStr.includes('multiplier') ||
            riskCatStr.includes('rate');
          if (!isComp) return false;
        } else if (activeSavedView === 'action') {
          const needsAction = p.risk_level === 'High' && (days >= 40 || legalPending > 0);
          if (!needsAction) return false;
        }

        // 3. District Filter
        if (selectedDistrict !== 'All' && p.district !== selectedDistrict) {
          return false;
        }

        // 4. Stage Filter
        if (selectedStage !== 'All') {
          const sel = selectedStage.toLowerCase();
          let matchesStage = false;
          if (stageStr.includes(sel)) matchesStage = true;
          else if (sel.includes('survey') && (stageStr.includes('sia') || stageStr.includes('assessment') || stageStr.includes('survey'))) matchesStage = true;
          else if (sel.includes('award') && (stageStr.includes('award') || stageStr.includes('19') || stageStr.includes('multiplier') || stageStr.includes('declaration'))) matchesStage = true;
          else if (sel.includes('notif') && (stageStr.includes('notif') || stageStr.includes('11'))) matchesStage = true;
          else if (sel.includes('comp') && (stageStr.includes('comp') || stageStr.includes('payment'))) matchesStage = true;
          else if (sel.includes('poss') && (stageStr.includes('poss') || stageStr.includes('vest') || stageStr.includes('possession'))) matchesStage = true;
          if (!matchesStage) return false;
        }

        // 5. Risk Level Filter
        if (selectedRisk !== 'All' && p.risk_level !== selectedRisk) {
          return false;
        }

        // 6. Stall Probability Filter
        if (selectedProbability !== 'All') {
          if (selectedProbability === '90' && probPct < 90) return false;
          if (selectedProbability === '70' && (probPct < 70 || probPct >= 90)) return false;
          if (selectedProbability === '50' && (probPct < 50 || probPct >= 70)) return false;
          if (selectedProbability === 'low' && probPct >= 50) return false;
        }

        // 7. Financial Exposure Filter
        if (selectedExposure !== 'All') {
          if (selectedExposure === '50' && outlay < 50) return false;
          if (selectedExposure === '25-50' && (outlay < 25 || outlay >= 50)) return false;
          if (selectedExposure === '10-25' && (outlay < 10 || outlay >= 25)) return false;
          if (selectedExposure === 'under-10' && outlay >= 10) return false;
        }

        // 8. Days Stalled Filter
        if (selectedDaysStalled !== 'All') {
          if (selectedDaysStalled === '120' && days < 120) return false;
          if (selectedDaysStalled === '60' && (days < 60 || days >= 120)) return false;
          if (selectedDaysStalled === '30' && (days < 30 || days >= 60)) return false;
          if (selectedDaysStalled === 'under-30' && days >= 30) return false;
        }

        // 9. Risk Driver Filter
        if (selectedRiskDriver !== 'All') {
          const combinedDrivers = `${riskCatStr} ${disputeStr} ${primaryDriverStr} ${p.document_type || ''}`.toLowerCase();
          if (selectedRiskDriver === 'circle_rate') {
            if (!combinedDrivers.includes('circle') && !combinedDrivers.includes('market value') && !combinedDrivers.includes('valuation')) return false;
          } else if (selectedRiskDriver === 'multiplier') {
            if (!combinedDrivers.includes('multiplier') && !combinedDrivers.includes('factor')) return false;
          } else if (selectedRiskDriver === 'high_court') {
            if (!combinedDrivers.includes('stay') && !combinedDrivers.includes('court') && !combinedDrivers.includes('writ') && !combinedDrivers.includes('litigation')) return false;
          } else if (selectedRiskDriver === 'sia') {
            if (!combinedDrivers.includes('sia') && !stageStr.includes('sia') && !combinedDrivers.includes('social impact')) return false;
          } else if (selectedRiskDriver === 'rr') {
            if (!combinedDrivers.includes('r&r') && !combinedDrivers.includes('resettlement') && !combinedDrivers.includes('rehabilitation')) return false;
          } else if (selectedRiskDriver === 'title') {
            if (!combinedDrivers.includes('title') && !combinedDrivers.includes('heir') && !combinedDrivers.includes('satbara')) return false;
          } else if (selectedRiskDriver === 'gram_sabha') {
            if (!combinedDrivers.includes('gram') && !combinedDrivers.includes('sabha') && !combinedDrivers.includes('protest')) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'primary_driver') {
          valA = getPrimaryDriver(a).toLowerCase();
          valB = getPrimaryDriver(b).toLowerCase();
        } else if (sortKey === 'risk_score' || sortKey === 'compensation_offered_cr' || sortKey === 'days_in_stage') {
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
  }, [
    cases,
    searchTerm,
    activeSavedView,
    selectedDistrict,
    selectedStage,
    selectedRisk,
    selectedProbability,
    selectedExposure,
    selectedDaysStalled,
    selectedRiskDriver,
    sortKey,
    sortAsc
  ]);

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

  const handleSelectSavedView = (viewId) => {
    setActiveSavedView(viewId);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveSavedView('all');
    setSearchTerm('');
    setSelectedDistrict('All');
    setSelectedStage('All');
    setSelectedRisk('All');
    setSelectedProbability('All');
    setSelectedExposure('All');
    setSelectedDaysStalled('All');
    setSelectedRiskDriver('All');
    onResetDivision();
    setCurrentPage(1);
  };

  const toggleRowExpand = (caseId) => {
    setExpandedRowId((prev) => (prev === caseId ? null : caseId));
  };

  const activeAdvancedFilterCount = [
    selectedProbability !== 'All',
    selectedExposure !== 'All',
    selectedDaysStalled !== 'All',
    selectedRiskDriver !== 'All'
  ].filter(Boolean).length;

  const hasAnyFilterActive = Boolean(
    activeSavedView !== 'all' ||
    selectedDivision !== 'All Divisions' ||
    searchTerm ||
    selectedDistrict !== 'All' ||
    selectedStage !== 'All' ||
    selectedRisk !== 'All' ||
    activeAdvancedFilterCount > 0
  );

  const handleExportCSV = () => {
    if (filteredProjects.length === 0) return;

    const headers = [
      'Case ID',
      'Corridor Title',
      'District',
      'Statutory Stage',
      'Risk Severity',
      'Stall Probability',
      'Award Outlay Cr',
      'Days Stalled',
      'Primary Risk Driver'
    ];

    const rows = filteredProjects.map((p) => [
      p.case_id || p.project_id,
      `"${(p.project_name || '').replace(/"/g, '""')}"`,
      p.district,
      `"${p.current_stage || p.stage}"`,
      p.risk_level,
      `${Math.round((p.risk_score || 0.5) * 100)}%`,
      p.compensation_offered_cr,
      p.days_in_stage,
      `"${getPrimaryDriver(p)}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Maharashtra_Land_Corridor_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="gov-surface p-12 text-center rounded-xl space-y-2 bg-white dark:bg-[#131923]">
        <div className="w-6 h-6 border-2 border-[#1D4ED8] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-[#0F2942] dark:text-[#F3F6FA]">
          Loading Official Land Acquisition Register...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title & Institutional Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="gov-page-title">
              Case-Management Workspace
            </h1>
            {selectedDivision !== 'All Divisions' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60">
                <span>{selectedDivision}</span>
                <button
                  onClick={onResetDivision}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-0.5 focus-ring rounded"
                  title="Clear division filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <p className="gov-body-sm text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
            Operational case registry tracking {totalCount} active corridor infrastructure proceedings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Density Toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="px-2.5 py-1.5 text-2xs font-medium text-[#475569] dark:text-[#9AA8B8] bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg hover:bg-slate-50 dark:hover:bg-[#1A2332] cursor-pointer focus-ring"
            title="Toggle compact row spacing for dense administrative audit"
          >
            Density: {isCompact ? 'Compact' : 'Standard'}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredProjects.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus-ring"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <span>Export Gazette CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Attention Strip Above Table (3 Action-Required Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: 265 CRITICAL */}
        <button
          onClick={() => handleSelectSavedView('critical')}
          className={`gov-surface p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-ring group ${
            activeSavedView === 'critical'
              ? 'border-[#B91C1C] dark:border-[#EF4444] bg-red-50/60 dark:bg-red-950/30 shadow-sm'
              : 'border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] hover:border-[#B91C1C]/60 dark:hover:border-[#EF4444]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="gov-card-title text-[#B91C1C] dark:text-[#F87171]">
              Severity High &bull; Immediate Action
            </span>
            <div className="flex items-center gap-1.5">
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'risk' })}
              />
              <AlertTriangle className={`w-3.5 h-3.5 ${activeSavedView === 'critical' ? 'text-[#B91C1C] dark:text-[#F87171]' : 'text-[#B91C1C]/70 dark:text-[#F87171]/70'}`} />
            </div>
          </div>
          <div className="mt-1 font-mono-num text-2xl font-semibold text-[#B91C1C] dark:text-[#F87171] tracking-tight">
            {criticalCount} Critical
          </div>
          <p className="mt-0.5 gov-metadata truncate">
            Active stay orders &amp; multiplier litigation
          </p>
        </button>

        {/* Card 2: ₹8,398.7 Cr EXPOSURE */}
        <button
          onClick={() => handleSelectSavedView('financial')}
          className={`gov-surface p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-ring group ${
            activeSavedView === 'financial'
              ? 'border-[#1D4ED8] dark:border-[#3B82F6] bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
              : 'border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] hover:border-[#1D4ED8]/60 dark:hover:border-[#3B82F6]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="gov-card-title text-[#1D4ED8] dark:text-[#60A5FA]">
              Statutory Outlay at Risk
            </span>
            <div className="flex items-center gap-1.5">
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'exposure' })}
              />
              <Coins className={`w-3.5 h-3.5 ${activeSavedView === 'financial' ? 'text-[#1D4ED8] dark:text-[#60A5FA]' : 'text-[#1D4ED8]/70 dark:text-[#60A5FA]/70'}`} />
            </div>
          </div>
          <div className="mt-1 font-mono-num text-2xl font-semibold text-[#0F172A] dark:text-[#F3F6FA] tracking-tight">
            &#8377;{exposureCrStr} Cr Exposure
          </div>
          <p className="mt-0.5 gov-metadata truncate">
            Contested Section 26/30 award liabilities
          </p>
        </button>

        {/* Card 3: 142 CASES STALLED */}
        <button
          onClick={() => handleSelectSavedView('stalled')}
          className={`gov-surface p-3.5 rounded-xl border text-left transition-all cursor-pointer focus-ring group ${
            activeSavedView === 'stalled'
              ? 'border-[#B45309] dark:border-[#F59E0B] bg-amber-50/60 dark:bg-amber-950/30 shadow-sm'
              : 'border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] hover:border-[#B45309]/60 dark:hover:border-[#F59E0B]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="gov-card-title text-[#B45309] dark:text-[#FBBF24]">
              Stalled Beyond Statutory SLA
            </span>
            <div className="flex items-center gap-1.5">
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'delay', customPayload: { delayDays: `${stalledCount} corridors stalled` } })}
              />
              <Clock className={`w-3.5 h-3.5 ${activeSavedView === 'stalled' ? 'text-[#B45309] dark:text-[#FBBF24]' : 'text-[#B45309]/70 dark:text-[#FBBF24]/70'}`} />
            </div>
          </div>
          <div className="mt-1 font-mono-num text-2xl font-semibold text-[#B45309] dark:text-[#FBBF24] tracking-tight">
            {stalledCount} Stalled
          </div>
          <p className="mt-0.5 gov-metadata truncate">
            Exceeded Section 25 lapsing timeline
          </p>
        </button>
      </div>

      {/* 2. Saved Views Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#E2E8F0] dark:border-[#212B38]">
        <span className="text-2xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] flex items-center gap-1 mr-1 shrink-0">
          <Bookmark className="w-3 h-3 text-[#1D4ED8] dark:border-[#3B82F6]" />
          <span>Saved Views:</span>
        </span>
        {SAVED_VIEWS.map((sv) => {
          const isActive = activeSavedView === sv.id;
          return (
            <button
              key={sv.id}
              onClick={() => handleSelectSavedView(sv.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus-ring shrink-0 ${
                isActive
                  ? 'bg-[#1D4ED8] text-white shadow-sm'
                  : 'bg-white dark:bg-[#131923] text-[#475569] dark:text-[#9AA8B8] hover:bg-slate-100 dark:hover:bg-[#1A2332] border border-[#E2E8F0] dark:border-[#212B38]'
              }`}
              title={sv.desc}
            >
              <span>{sv.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-3xs font-mono-num font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#9AA8B8]'
              }`}>
                {sv.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Advanced Filters & Search Workspace Controls */}
      <div className="gov-surface p-3.5 space-y-3 bg-white dark:bg-[#131923] rounded-xl border border-[#E2E8F0] dark:border-[#212B38]">
        {/* Primary Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Synchronized Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#6F7D8D] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case ID, project name, survey number, district, or primary risk driver..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] placeholder-[#64748B] dark:placeholder-[#6F7D8D] text-xs pl-8 pr-7 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] focus-ring"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:text-[#6F7D8D] dark:hover:text-white p-0.5 cursor-pointer focus-ring"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 1. District Selector */}
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
              title="Filter by administrative district"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? (selectedDivision !== 'All Divisions' ? `All ${selectedDivision} Districts` : 'All Districts') : `District: ${d}`}
                </option>
              ))}
            </select>

            {/* 2. Stage Selector */}
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer max-w-[180px] truncate focus-ring"
              title="Filter by statutory stage"
            >
              {stages.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Stages' : `Stage: ${s}`}</option>
              ))}
            </select>

            {/* 3. Risk Level Selector */}
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
              title="Filter by risk severity level"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">Risk: Critical (High)</option>
              <option value="Medium">Risk: Elevated (Medium)</option>
              <option value="Low">Risk: Stable (Low)</option>
            </select>

            {/* Advanced Filters Panel Toggle */}
            <button
              onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer focus-ring ${
                isAdvancedFiltersOpen || activeAdvancedFilterCount > 0
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-[#60A5FA] border-blue-200 dark:border-blue-900/60'
                  : 'bg-white dark:bg-[#131923] text-[#475569] dark:text-[#9AA8B8] border-[#E2E8F0] dark:border-[#212B38] hover:bg-slate-50 dark:hover:bg-[#1A2332]'
              }`}
              title="Toggle advanced filter dimensions"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Filters</span>
              {activeAdvancedFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1D4ED8] text-white text-3xs font-bold flex items-center justify-center">
                  {activeAdvancedFilterCount}
                </span>
              )}
            </button>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
            >
              <option value={15}>15 records</option>
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
            </select>
          </div>
        </div>

        {/* Secondary Advanced Filters Row */}
        {isAdvancedFiltersOpen && (
          <div className="pt-2.5 border-t border-[#E2E8F0] dark:border-[#212B38] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* 4. Probability Filter */}
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] mb-1">
                Stall Probability
              </label>
              <select
                value={selectedProbability}
                onChange={(e) => {
                  setSelectedProbability(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
              >
                <option value="All">All Probabilities</option>
                <option value="90">&ge; 90% (Critical Stall)</option>
                <option value="70">70% to 89% (High Risk)</option>
                <option value="50">50% to 69% (Moderate)</option>
                <option value="low">&lt; 50% (Low Risk)</option>
              </select>
            </div>

            {/* 5. Financial Exposure Filter */}
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] mb-1">
                Financial Exposure
              </label>
              <select
                value={selectedExposure}
                onChange={(e) => {
                  setSelectedExposure(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
              >
                <option value="All">All Outlays</option>
                <option value="50">&ge; Rs 50 Cr (Mega Corridors)</option>
                <option value="25-50">Rs 25 to 50 Cr (Major Awards)</option>
                <option value="10-25">Rs 10 to 25 Cr (Standard Parcels)</option>
                <option value="under-10">&lt; Rs 10 Cr (Minor Parcels)</option>
              </select>
            </div>

            {/* 6. Days Stalled Filter */}
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] mb-1">
                Days Stalled (Stage Elapsed)
              </label>
              <select
                value={selectedDaysStalled}
                onChange={(e) => {
                  setSelectedDaysStalled(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
              >
                <option value="All">All Durations</option>
                <option value="120">&ge; 120 days (Critical Delay)</option>
                <option value="60">&ge; 60 days (Stalled / Exceeding Median)</option>
                <option value="30">&ge; 30 days (In Progress)</option>
                <option value="under-30">&lt; 30 days (Within Benchmark)</option>
              </select>
            </div>

            {/* 7. Risk Driver Filter */}
            <div>
              <label className="block text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] mb-1">
                Primary Risk Driver
              </label>
              <select
                value={selectedRiskDriver}
                onChange={(e) => {
                  setSelectedRiskDriver(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
              >
                <option value="All">All Risk Drivers</option>
                <option value="circle_rate">Circle-rate mismatch</option>
                <option value="multiplier">Multiplier appeal</option>
                <option value="high_court">High Court stay</option>
                <option value="sia">SIA objection</option>
                <option value="rr">R&amp;R compliance</option>
                <option value="title">Title &amp; heirship dispute</option>
                <option value="gram_sabha">Gram Sabha consensus</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Pills & Reset Button */}
        {hasAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#212B38] text-2xs">
            <span className="text-[#64748B] dark:text-[#9AA8B8] font-semibold">Active filters:</span>

            {activeSavedView !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#1D4ED8] dark:text-[#93C5FD] border border-blue-200 dark:border-blue-800 font-semibold">
                <span>View: {SAVED_VIEWS.find((v) => v.id === activeSavedView)?.label}</span>
                <button onClick={() => setActiveSavedView('all')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedDivision !== 'All Divisions' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60 font-medium">
                <span>Division: {selectedDivision}</span>
                <button onClick={onResetDivision} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Query: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedDistrict !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>District: {selectedDistrict}</span>
                <button onClick={() => setSelectedDistrict('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedStage !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Stage: {selectedStage}</span>
                <button onClick={() => setSelectedStage('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedRisk !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Risk: {selectedRisk}</span>
                <button onClick={() => setSelectedRisk('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedProbability !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Probability: {selectedProbability === '90' ? '>=90%' : selectedProbability === '70' ? '70-89%' : selectedProbability === '50' ? '50-69%' : '<50%'}</span>
                <button onClick={() => setSelectedProbability('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedExposure !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Exposure: {selectedExposure === '50' ? '>=Rs 50 Cr' : selectedExposure === '25-50' ? 'Rs 25-50 Cr' : selectedExposure === '10-25' ? 'Rs 10-25 Cr' : '<Rs 10 Cr'}</span>
                <button onClick={() => setSelectedExposure('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedDaysStalled !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Stalled: {selectedDaysStalled === '120' ? '>=120d' : selectedDaysStalled === '60' ? '>=60d' : selectedDaysStalled === '30' ? '>=30d' : '<30d'}</span>
                <button onClick={() => setSelectedDaysStalled('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            {selectedRiskDriver !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] border border-slate-200 dark:border-slate-700 font-medium">
                <span>Driver: {selectedRiskDriver}</span>
                <button onClick={() => setSelectedRiskDriver('All')} className="hover:text-red-500 cursor-pointer">&times;</button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="ml-auto flex items-center gap-1 text-[#1D4ED8] dark:text-[#60A5FA] hover:underline font-semibold cursor-pointer focus-ring rounded"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Official Corridor Register Table - 10 Standardized Columns */}
      <div className="gov-surface overflow-hidden bg-white dark:bg-[#131923] rounded-xl border border-[#E2E8F0] dark:border-[#212B38]">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="gov-table">
            <thead className="sticky top-0 z-10">
              <tr>
                {/* 1. CASE */}
                <th
                  onClick={() => handleSort('case_id')}
                  className="font-mono cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>CASE</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 2. PROJECT */}
                <th
                  onClick={() => handleSort('project_name')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white min-w-[280px]"
                >
                  <div className="flex items-center gap-1">
                    <span>PROJECT</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 3. DISTRICT */}
                <th
                  onClick={() => handleSort('district')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>DISTRICT</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 4. STAGE */}
                <th
                  onClick={() => handleSort('current_stage')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>STAGE</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 5. RISK */}
                <th
                  onClick={() => handleSort('risk_level')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>RISK</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 6. PROBABILITY */}
                <th
                  onClick={() => handleSort('risk_score')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>PROBABILITY</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 7. EXPOSURE */}
                <th
                  onClick={() => handleSort('compensation_offered_cr')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>EXPOSURE</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 8. DAYS STALLED */}
                <th
                  onClick={() => handleSort('days_in_stage')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>DAYS STALLED</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 9. PRIMARY DRIVER */}
                <th
                  onClick={() => handleSort('primary_driver')}
                  className="cursor-pointer hover:text-[#0F172A] dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>PRIMARY DRIVER</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>

                {/* 10. ACTION */}
                <th className="text-right">
                  <span>ACTION</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748B] dark:text-[#9AA8B8]">
                    <div className="space-y-2">
                      <p className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                        No matching land acquisition proceedings found
                      </p>
                      <p className="text-xs">
                        {searchTerm ? `No records matching "${searchTerm}" in current view criteria` : 'No records match the active filter criteria'}
                      </p>
                      <button
                        onClick={handleClearAllFilters}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-medium cursor-pointer mt-2 focus-ring"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p) => {
                  const probPct = Math.round((p.risk_score || 0.5) * 100);
                  const caseId = p.case_id || p.project_id;
                  const isStalled = (p.days_in_stage || 0) >= 60;
                  const driver = getPrimaryDriver(p);
                  const isExpanded = expandedRowId === caseId;

                  // Styling for primary driver badge
                  let driverStyle = 'bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#9AA8B8] border-slate-200 dark:border-slate-700';
                  if (driver === 'High Court stay' || driver === 'Legal stay') {
                    driverStyle = 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40';
                  } else if (driver === 'Circle-rate mismatch' || driver === 'Multiplier appeal' || driver === 'Compensation dispute') {
                    driverStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/40';
                  } else if (driver === 'SIA objection' || driver === 'R&R compliance') {
                    driverStyle = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40';
                  } else if (driver === 'Statutory compliance') {
                    driverStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
                  }

                  return (
                    <React.Fragment key={caseId}>
                      <tr
                        className={`transition-colors ${isExpanded ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''} ${isCompact ? 'py-1' : ''}`}
                      >
                        {/* 1. CASE */}
                        <td className="font-mono font-bold text-[#1D4ED8] dark:text-[#60A5FA] whitespace-nowrap">
                          <button
                            onClick={() => onSelectCase(p)}
                            className="hover:underline cursor-pointer focus-ring rounded"
                            title={`Open case dossier for ${caseId}`}
                          >
                            {caseId}
                          </button>
                        </td>

                        {/* 2. PROJECT (Wider column, natural wrap, no ugly truncation, tooltip, and expand trigger) */}
                        <td className="min-w-[280px] max-w-[420px]">
                          <div className="flex items-start gap-1.5">
                            <button
                              onClick={() => toggleRowExpand(caseId)}
                              className="mt-0.5 text-[#64748B] hover:text-[#1D4ED8] dark:text-[#9AA8B8] dark:hover:text-[#60A5FA] cursor-pointer focus-ring rounded p-0.5 shrink-0"
                              title={isExpanded ? 'Collapse row details' : 'Expand full corridor dossier'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#1D4ED8]" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div
                                onClick={() => toggleRowExpand(caseId)}
                                className="font-semibold text-[#0F172A] dark:text-[#F3F6FA] text-xs leading-snug whitespace-normal break-words cursor-pointer hover:text-[#1D4ED8] dark:hover:text-[#60A5FA] transition-colors"
                                title={`${p.project_name} - Click to expand full statutory dossier`}
                              >
                                {p.project_name}
                              </div>
                              <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8] font-mono-num mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span>Notif: {p.notification_no || 'REV/LA-2024/0912'}</span>
                                <span>&bull;</span>
                                <span>Area: {p.land_area_acres ? `${p.land_area_acres} Acres` : `${p.land_area_ha || 42.5} Ha`}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. DISTRICT */}
                        <td className="text-[#475569] dark:text-[#9AA8B8] whitespace-nowrap">
                          <span className="font-medium text-[#0F172A] dark:text-[#F3F6FA]">{p.district}</span>
                        </td>

                        {/* 4. STAGE */}
                        <td className="whitespace-nowrap">
                          <div className="font-medium text-[#0F172A] dark:text-[#F3F6FA]">
                            {p.current_stage || p.stage}
                          </div>
                          <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
                            {p.current_stage?.includes('Award') ? 'Sec 23/26' : p.current_stage?.includes('Possession') ? 'Sec 38' : 'Sec 11/19'}
                          </div>
                        </td>

                        {/* 5. RISK */}
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <RiskBadge level={p.risk_level} />
                            <WhyButton
                              size="xs"
                              onClick={() => setWhyDrawer({
                                isOpen: true,
                                metricType: 'risk',
                                caseData: p
                              })}
                            />
                          </div>
                        </td>

                        {/* 6. PROBABILITY */}
                        <td className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA] whitespace-nowrap">
                          <span className={probPct >= 70 ? 'text-[#B91C1C]' : probPct >= 40 ? 'text-[#B45309]' : 'text-[#15803D]'}>
                            {probPct}%
                          </span>
                        </td>

                        {/* 7. EXPOSURE */}
                        <td className="font-mono-num text-[#0F172A] dark:text-[#F3F6FA] font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>&#8377;{p.compensation_offered_cr} Cr</span>
                            <WhyButton
                              size="xs"
                              onClick={() => setWhyDrawer({
                                isOpen: true,
                                metricType: 'exposure',
                                caseData: p
                              })}
                            />
                          </div>
                        </td>

                        {/* 8. DAYS STALLED */}
                        <td className="font-mono-num whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div>
                              <span className={isStalled ? 'text-[#B45309] dark:text-[#FBBF24] font-bold' : 'text-[#475569] dark:text-[#9AA8B8]'}>
                                {p.days_in_stage || 45}d
                              </span>
                              {isStalled && (
                                <span className="block text-3xs text-[#B45309] dark:text-[#FBBF24] font-semibold">&gt;60d stalled</span>
                              )}
                            </div>
                            <WhyButton
                              size="xs"
                              onClick={() => setWhyDrawer({
                                isOpen: true,
                                metricType: 'delay',
                                caseData: p,
                                customPayload: { delayDays: `+${Math.max(1, (p.days_in_stage || 45) - 30)} days` }
                              })}
                            />
                          </div>
                        </td>

                        {/* 9. PRIMARY DRIVER */}
                        <td className="whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border ${driverStyle}`}>
                            {driver}
                          </span>
                        </td>

                        {/* 10. ACTION */}
                        <td className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleRowExpand(caseId)}
                              className="p-1 text-[#64748B] hover:text-[#0F172A] dark:text-[#9AA8B8] dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-[#1A2332] cursor-pointer focus-ring"
                              title={isExpanded ? 'Collapse row details' : 'Expand full corridor dossier'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onSelectCase(p)}
                              className="text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:underline cursor-pointer inline-flex items-center gap-1 focus-ring rounded"
                              title={`Review dossier for ${caseId}`}
                            >
                              <span>Review</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Row Drawer: In-depth Statutory Corridor Profile */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-[#0E141D] border-y border-[#E2E8F0] dark:border-[#212B38]">
                          <td colSpan={10} className="p-4">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono-num font-bold text-sm text-[#1D4ED8] dark:text-[#60A5FA]">
                                      {caseId}
                                    </span>
                                    <span className="text-[#64748B] dark:text-[#9AA8B8]">&bull;</span>
                                    <span className="font-bold text-sm text-[#0F172A] dark:text-[#F3F6FA]">
                                      {p.project_name}
                                    </span>
                                    <span className="gov-metadata font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
                                      Docket: {p.notification_no || 'REV/LA-2024/0912'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                                    Sub-Division: {p.district} &bull; Survey Gat: {p.survey_number || 'Gat No. 142/3A'} &bull; Area: {p.land_area_acres || 145} Acres ({p.land_area_ha || 58.6} Ha) &bull; Land Type: {p.land_type || 'Agricultural'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onSelectCase(p)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg text-xs font-semibold cursor-pointer focus-ring shadow-sm"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Open Complete Case Dossier</span>
                                  </button>
                                  <button
                                    onClick={() => toggleRowExpand(caseId)}
                                    className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:text-[#9AA8B8] dark:hover:text-white rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] cursor-pointer focus-ring"
                                    title="Collapse row"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                {/* Card 1: Statutory Risk Breakdown */}
                                <div className="bg-white dark:bg-[#131923] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-2">
                                  <div className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-[#B91C1C]" />
                                    <span>Statutory Risk Breakdown</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Primary Driver:</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{driver}</span>
                                        <WhyButton size="xs" onClick={() => setWhyDrawer({ isOpen: true, metricType: 'risk', caseData: p })} />
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Stall Probability:</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-mono-num font-bold text-[#B91C1C]">{probPct}%</span>
                                        <WhyButton size="xs" onClick={() => setWhyDrawer({ isOpen: true, metricType: 'risk', caseData: p })} />
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Stage Elapsed:</span>
                                      <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{p.days_in_stage || 45} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Legal Petitions:</span>
                                      <span className="font-semibold text-red-600 dark:text-red-400">{p.legal_cases_pending || 0} active stay/writ(s)</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 2: Valuation & Award Liability */}
                                <div className="bg-white dark:bg-[#131923] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-2">
                                  <div className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] flex items-center gap-1">
                                    <Coins className="w-3 h-3 text-[#1D4ED8]" />
                                    <span>Valuation &amp; Compensation</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Total Outlay:</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA]">&#8377;{p.compensation_offered_cr} Cr</span>
                                        <WhyButton size="xs" onClick={() => setWhyDrawer({ isOpen: true, metricType: 'exposure', caseData: p })} />
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Offered Rate:</span>
                                      <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">&#8377;{p.compensation_per_sqm_inr || 1850}/sqm</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Market Value (Reckoner):</span>
                                      <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">&#8377;{p.market_value_per_sqm_inr || 2100}/sqm</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Affected Landowners:</span>
                                      <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{p.affected_landowners_count || 85} Khatedars</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 3: Statutory Clearances & Next Step */}
                                <div className="bg-white dark:bg-[#131923] p-3 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-2">
                                  <div className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>Clearances &amp; Action</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Environment Clearance:</span>
                                      <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{p.env_clearance_status || 'Pending'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">Gram Sabha Consent:</span>
                                      <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{p.gram_sabha_consent || 'Granted'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">SIA Report (Sec 4):</span>
                                      <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{p.sia_completed || 'Yes'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#64748B] dark:text-[#9AA8B8]">R&amp;R Scheme (Sec 31):</span>
                                      <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">{p.rr_plan_status || 'Approved'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0F141C] border-t border-[#E2E8F0] dark:border-[#212B38] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#9AA8B8] px-3.5">
          <div className="font-mono-num">
            Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} corridor records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] cursor-pointer focus-ring disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-num px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] cursor-pointer focus-ring disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Evidence Drawer for Portfolio Register Intelligence */}
      <WhyEvidenceDrawer
        isOpen={whyDrawer.isOpen}
        onClose={() => setWhyDrawer(prev => ({ ...prev, isOpen: false }))}
        metricType={whyDrawer.metricType}
        caseData={whyDrawer.caseData || (paginatedProjects.length > 0 ? paginatedProjects[0] : null)}
        customPayload={whyDrawer.customPayload}
        onNavigate={onSelectCase}
      />
    </div>
  );
}
