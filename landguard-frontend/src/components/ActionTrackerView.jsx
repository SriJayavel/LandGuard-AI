import React, { useState, useMemo } from 'react';
import {
  ClipboardList, Plus, CheckCircle2, Clock, Search, Check,
  AlertTriangle, ExternalLink, Filter, ShieldAlert, Sparkles, X, ChevronRight
} from 'lucide-react';
import WhyEvidenceDrawer from './WhyEvidenceDrawer';

const STATUS_CONFIG = {
  'Urgent': {
    label: 'Urgent',
    badgeClass: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50',
    dotClass: 'bg-red-600',
  },
  'Scheduled': {
    label: 'Scheduled',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
    dotClass: 'bg-blue-600',
  },
  'In Progress': {
    label: 'In Progress',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    dotClass: 'bg-amber-500',
  },
  'Awaiting Response': {
    label: 'Awaiting Response',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
    dotClass: 'bg-purple-600',
  },
  'Completed': {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    dotClass: 'bg-emerald-600',
  },
};

const INITIAL_ACTIONS = [
  {
    id: 'DIR-2026-0001',
    case_id: 'LA-1059',
    project_name: 'Aurangabad Industrial City (AURIC) Logistics Hub',
    action: 'Valuation review & DLVC special hearing',
    details: 'Section 26 ready-reckoner multiplier reconciliation to resolve landowner compensation protest.',
    priority: 'P1 - Urgent',
    assigned_officer: 'District Collector / DRO',
    department: 'Revenue',
    deadline: 'Due in 2 days',
    deadline_date: '2026-09-10',
    status: 'Urgent',
    expected_impact: '₹50.3 Cr protected',
  },
  {
    id: 'DIR-2026-0002',
    case_id: 'LA-1014',
    project_name: 'Pune Ring Road & Bypass Alignment',
    action: 'Article 226 Stay Vacation Motion',
    details: 'Submit urgency caveat and expedited listing praecipe before the High Court.',
    priority: 'P1 - Urgent',
    assigned_officer: 'Government Pleader, High Court',
    department: 'Judiciary',
    deadline: 'Due in 3 days',
    deadline_date: '2026-09-11',
    status: 'Urgent',
    expected_impact: '₹72.0 Cr protected',
  },
  {
    id: 'DIR-2026-0003',
    case_id: 'LA-1028',
    project_name: 'Nagpur Multi-Modal Freight Terminal',
    action: 'Special Gram Sabha Quorum & Consent Session',
    details: 'Convene joint session with Project Officer to certify CFR community resolution.',
    priority: 'P2 - Scheduled',
    assigned_officer: 'Sub-Divisional Officer',
    department: 'Forest',
    deadline: 'Due in 5 days',
    deadline_date: '2026-09-13',
    status: 'Scheduled',
    expected_impact: '₹46.1 Cr protected',
  },
  {
    id: 'DIR-2026-0004',
    case_id: 'LA-1042',
    project_name: 'Nashik Agri-Export Corridor',
    action: 'Joint Cadastral Resurvey with Drone Demarcation',
    details: 'Deploy survey team with high-precision DGPS and verify Gat boundary pegs with landholders.',
    priority: 'P2 - Scheduled',
    assigned_officer: 'District Land Records Officer',
    department: 'Survey',
    deadline: 'Due in 7 days',
    deadline_date: '2026-09-15',
    status: 'Scheduled',
    expected_impact: '₹38.4 Cr protected',
  },
  {
    id: 'DIR-2026-0005',
    case_id: 'LA-1005',
    project_name: 'Thane Metro Rail Extension Corridor',
    action: 'Second Schedule R&R Plot Allotment',
    details: 'Finalize residential plot allotment list and disburse transitional subsistence allowances.',
    priority: 'P2 - Active',
    assigned_officer: 'Additional Collector (R&R Cell)',
    department: 'R&R',
    deadline: 'Due in 12 days',
    deadline_date: '2026-09-20',
    status: 'In Progress',
    expected_impact: '₹65.2 Cr protected',
  },
  {
    id: 'DIR-2026-0006',
    case_id: 'LA-1033',
    project_name: 'Raigad Multi-Product SEZ Rail Link',
    action: 'Village Form VII-XII Mutation Reconciliation',
    details: 'Reconcile 14 contentious succession entries with Talathi register to establish title.',
    priority: 'P2 - Active',
    assigned_officer: 'Tahsildar & Camp Officer',
    department: 'Revenue',
    deadline: 'Due in 14 days',
    deadline_date: '2026-09-22',
    status: 'In Progress',
    expected_impact: '₹28.7 Cr protected',
  },
  {
    id: 'DIR-2026-0007',
    case_id: 'LA-1064',
    project_name: 'Amravati Irrigation Canal Alignment',
    action: 'Stage-II Forest Diversion Concurrence',
    details: 'Awaiting final working plan approval from Regional Empowered Committee.',
    priority: 'P3 - Pending',
    assigned_officer: 'Divisional Forest Officer',
    department: 'Forest',
    deadline: 'Due in 18 days',
    deadline_date: '2026-09-26',
    status: 'Awaiting Response',
    expected_impact: '₹19.5 Cr protected',
  },
  {
    id: 'DIR-2026-0008',
    case_id: 'LA-1077',
    project_name: 'Solapur Industrial Ring Road Bypass',
    action: 'Solatium Multiplier Concordance Notice',
    details: 'Awaiting response from State Infrastructure Directorate on escrow release.',
    priority: 'P3 - Pending',
    assigned_officer: 'Sub-Divisional Magistrate',
    department: 'Judiciary',
    deadline: 'Due in 21 days',
    deadline_date: '2026-09-29',
    status: 'Awaiting Response',
    expected_impact: '₹15.2 Cr protected',
  },
  {
    id: 'DIR-2026-0009',
    case_id: 'LA-1019',
    project_name: 'Kolhapur Freight Rail Link',
    action: 'Section 23 Award Disbursement Order',
    details: '100% of awarded compensation deposited in direct benefit transfer accounts.',
    priority: 'P1 - Resolved',
    assigned_officer: 'District Land Acquisition Officer',
    department: 'Revenue',
    deadline: 'Completed: 05 Sep',
    deadline_date: '2026-09-05',
    status: 'Completed',
    expected_impact: '₹34.8 Cr disbursed',
  },
  {
    id: 'DIR-2026-0010',
    case_id: 'LA-1011',
    project_name: 'Jalgaon Agro-Logistics Alignment',
    action: 'Tree & Crop Valuation Settlement Order',
    details: 'Horticulture officer survey report accepted by all 48 orchard landholders.',
    priority: 'P2 - Resolved',
    assigned_officer: 'Sub-Divisional Officer',
    department: 'Survey',
    deadline: 'Completed: 03 Sep',
    deadline_date: '2026-09-03',
    status: 'Completed',
    expected_impact: '₹22.0 Cr settled',
  },
];

export default function ActionTrackerView({ projects = [], onNavigate, onSelectCase }) {
  const [actions, setActions] = useState(INITIAL_ACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [whyDrawer, setWhyDrawer] = useState({
    isOpen: false,
    metricType: 'action',
    caseData: null,
  });

  const [newAction, setNewAction] = useState({
    case_id: 'LA-1059',
    action: '',
    details: '',
    priority: 'P1 - Urgent',
    assigned_officer: '',
    department: 'Revenue',
    deadline: 'Due in 7 days',
    deadline_date: '2026-09-15',
    status: 'Urgent',
    expected_impact: '₹25.0 Cr protected',
  });

  // KPI counts
  const totalCount = actions.length;
  const urgentCount = actions.filter((a) => a.status === 'Urgent').length;
  const inProgressCount = actions.filter((a) => a.status === 'In Progress' || a.status === 'Scheduled').length;
  const completedCount = actions.filter((a) => a.status === 'Completed').length;

  // Filtered list
  const filteredActions = useMemo(() => {
    return actions.filter((act) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        act.case_id.toLowerCase().includes(q) ||
        act.action.toLowerCase().includes(q) ||
        act.assigned_officer.toLowerCase().includes(q) ||
        (act.project_name && act.project_name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
      const matchesDept = selectedDeptFilter === 'All' || act.department === selectedDeptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [actions, searchQuery, statusFilter, selectedDeptFilter]);

  // Toggle Complete status
  const handleToggleComplete = (id) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const isDone = a.status === 'Completed';
          return {
            ...a,
            status: isDone ? 'Urgent' : 'Completed',
            deadline: isDone ? 'Due in 3 days' : 'Completed: Just now',
          };
        }
        return a;
      })
    );
  };

  // Open case dossier
  const handleOpenCase = (caseId) => {
    const target =
      projects.find((p) => p.project_id === caseId || p.case_id === caseId) || {
        project_id: caseId,
        case_id: caseId,
        project_name: 'Corridor Infrastructure Project',
        district: 'District Cell',
        stage: 'Compensation',
        risk_score: 0.89,
        risk_level: 'High',
      };
    if (onSelectCase) onSelectCase(target);
    if (onNavigate) onNavigate('case-intelligence');
  };

  // Create new action
  const handleCreateAction = (e) => {
    e.preventDefault();
    if (!newAction.action.trim()) return;
    const createdId = `DIR-2026-${String(actions.length + 1).padStart(4, '0')}`;
    setActions([{ ...newAction, id: createdId }, ...actions]);
    setShowAddModal(false);
    setNewAction({
      case_id: 'LA-1059',
      action: '',
      details: '',
      priority: 'P1 - Urgent',
      assigned_officer: '',
      department: 'Revenue',
      deadline: 'Due in 7 days',
      deadline_date: '2026-09-15',
      status: 'Urgent',
      expected_impact: '₹25.0 Cr protected',
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-8 select-none">
      {/* 1. Header Toolbar */}
      <div className="gov-surface p-4 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="gov-page-title">
            Action Tracker
          </h1>
          <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
            Executive resolution ledger for corridor clearances, stays, and valuation directives
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-ring"
        >
          <Plus className="w-4 h-4" />
          <span>New Directive</span>
        </button>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#1D4ED8] dark:border-[#3B82F6] ring-2 ring-blue-300/40'
              : 'bg-white dark:bg-[#131923] border-[#CBD5E1] dark:border-[#212B38] hover:border-slate-400'
          }`}
        >
          <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Total Directives</span>
          <div className="gov-large-kpi text-[#0F172A] dark:text-[#F3F6FA] mt-0.5">{totalCount}</div>
          <p className="gov-metadata-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">Across all departments</p>
        </div>

        <div
          onClick={() => setStatusFilter('Urgent')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Urgent'
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-500 ring-2 ring-red-300/40'
              : 'bg-white dark:bg-[#131923] border-[#CBD5E1] dark:border-[#212B38] hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Urgent Attention</span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          </div>
          <div className="gov-large-kpi text-red-700 dark:text-red-400 mt-0.5">{urgentCount}</div>
          <p className="gov-metadata-xs text-red-600 dark:text-red-400 mt-0.5">Requires immediate motion</p>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'In Progress'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-300/40'
              : 'bg-white dark:bg-[#131923] border-[#CBD5E1] dark:border-[#212B38] hover:border-amber-400'
          }`}
        >
          <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">In Progress</span>
          <div className="gov-large-kpi text-amber-700 dark:text-amber-400 mt-0.5">{inProgressCount}</div>
          <p className="gov-metadata-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">Scheduled or active</p>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-300/40'
              : 'bg-white dark:bg-[#131923] border-[#CBD5E1] dark:border-[#212B38] hover:border-emerald-400'
          }`}
        >
          <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Resolved</span>
          <div className="gov-large-kpi text-emerald-700 dark:text-emerald-400 mt-0.5">{completedCount}</div>
          <p className="gov-metadata-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Directives executed</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#131923] rounded-xl border border-[#CBD5E1] dark:border-[#212B38] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by case ID, title, officer, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#CBD5E1] dark:border-[#212B38] text-[#0F172A] dark:text-[#F3F6FA] focus-ring"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F141C] p-1 rounded-lg border border-[#CBD5E1] dark:border-[#212B38] text-2xs">
            {['ALL', 'Urgent', 'In Progress', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-colors ${
                  statusFilter === tab
                    ? 'bg-[#1D4ED8] text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#9AA8B8] hover:text-[#0F172A]'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#CBD5E1] dark:border-[#212B38] text-[#0F172A] dark:text-[#F3F6FA] cursor-pointer focus-ring"
          >
            <option value="All">All Departments</option>
            <option value="Revenue">Revenue</option>
            <option value="Judiciary">Judiciary</option>
            <option value="Survey">Survey</option>
            <option value="Forest">Forest</option>
            <option value="R&R">R&amp;R</option>
          </select>
        </div>
      </div>

      {/* 4. Streamlined Directive Rows */}
      <div className="space-y-2.5">
        {filteredActions.map((item) => {
          const isDone = item.status === 'Completed';
          const isUrgent = item.status === 'Urgent';
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['Urgent'];

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border bg-white dark:bg-[#131923] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
                isDone
                  ? 'opacity-70 border-[#E2E8F0] dark:border-[#212B38]'
                  : isUrgent
                  ? 'border-l-4 border-l-red-600 border-[#CBD5E1] dark:border-[#212B38]'
                  : 'border-[#CBD5E1] dark:border-[#212B38] hover:border-blue-400'
              }`}
            >
              {/* Left Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border cursor-pointer transition-colors shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-[#CBD5E1] dark:border-[#475569] hover:border-emerald-500'
                    }`}
                    title={isDone ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1A2332] text-[#1D4ED8] dark:text-[#60A5FA] border border-[#CBD5E1] dark:border-[#212B38]">
                    {item.case_id}
                  </span>

                  <h3 className={`gov-card-title truncate ${isDone ? 'line-through text-[#64748B]' : 'text-[#0F172A] dark:text-[#F3F6FA]'}`}>
                    {item.action}
                  </h3>

                  <span className={`gov-metadata font-semibold px-2 py-0.5 rounded ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                </div>

                <p className="gov-body text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                  {item.details}
                </p>

                <div className="flex flex-wrap items-center gap-3 gov-metadata text-[#64748B] dark:text-[#9AA8B8] pt-0.5">
                  <span>Project: <strong className="text-[#0F172A] dark:text-slate-200">{item.project_name}</strong></span>
                  <span>&bull;</span>
                  <span>Dept: <strong className="text-[#0F172A] dark:text-slate-200">{item.department}</strong></span>
                  <span>&bull;</span>
                  <span>Assignee: <strong className="text-[#0F172A] dark:text-slate-200">{item.assigned_officer}</strong></span>
                  <span>&bull;</span>
                  <span>Timeline: <strong className={`font-mono-num ${isUrgent ? 'text-red-700 dark:text-red-400' : 'text-[#0F172A] dark:text-slate-200'}`}>{item.deadline}</strong></span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono-num font-semibold">{item.expected_impact}</span>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E8F0] dark:border-[#212B38]">
                <button
                  onClick={() => handleOpenCase(item.case_id)}
                  className="px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg shadow-xs cursor-pointer focus-ring transition-colors flex items-center gap-1"
                >
                  <span>Open Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleToggleComplete(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs cursor-pointer focus-ring transition-colors flex items-center gap-1 ${
                    isDone
                      ? 'bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#9AA8B8] hover:bg-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Reopen' : 'Complete'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredActions.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#131923] rounded-xl border border-[#CBD5E1] dark:border-[#212B38] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="gov-card-title text-[#0F172A] dark:text-[#F3F6FA]">No directives matching current filters</h3>
            <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8]">
              All actions under this selection are up to date or completed.
            </p>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setSelectedDeptFilter('All');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Clean Modal for Issuing Directives */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <div className="gov-surface max-w-lg w-full p-5 space-y-4 shadow-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] rounded-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5">
              <h3 className="gov-card-title text-[#0F172A] dark:text-[#F3F6FA]">
                Issue Action Directive
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F3F6FA] mb-1">
                  Target Case ID
                </label>
                <select
                  value={newAction.case_id}
                  onChange={(e) => setNewAction({ ...newAction, case_id: e.target.value })}
                  className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F3F6FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg font-mono-num focus-ring"
                >
                  {projects.map((p) => (
                    <option key={p.project_id || p.case_id} value={p.project_id || p.case_id}>
                      {p.project_id || p.case_id} &bull; {p.project_name || p.district}
                    </option>
                  ))}
                  {projects.length === 0 && <option value="LA-1059">LA-1059 &bull; Aurangabad Logistics Hub</option>}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F3F6FA] mb-1">
                  Directive Title
                </label>
                <input
                  type="text"
                  value={newAction.action}
                  onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                  className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F3F6FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg focus-ring"
                  placeholder="e.g. Valuation review and stakeholder hearing"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F3F6FA] mb-1">
                    Department
                  </label>
                  <select
                    value={newAction.department}
                    onChange={(e) => setNewAction({ ...newAction, department: e.target.value })}
                    className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F3F6FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg focus-ring"
                  >
                    <option value="Revenue">Revenue</option>
                    <option value="Judiciary">Judiciary</option>
                    <option value="Survey">Survey</option>
                    <option value="Forest">Forest</option>
                    <option value="R&R">R&amp;R</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F3F6FA] mb-1">
                    Assigned Officer
                  </label>
                  <input
                    type="text"
                    value={newAction.assigned_officer}
                    onChange={(e) => setNewAction({ ...newAction, assigned_officer: e.target.value })}
                    className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F3F6FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg focus-ring"
                    placeholder="e.g. Sub-Divisional Officer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F3F6FA] mb-1">
                  Directive Summary
                </label>
                <textarea
                  rows="2"
                  value={newAction.details}
                  onChange={(e) => setNewAction({ ...newAction, details: e.target.value })}
                  className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F3F6FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg focus-ring"
                  placeholder="Key resolution mandate or milestone..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#212B38]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 font-semibold rounded-lg cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Dispatch Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accessible Evidence Drawer */}
      <WhyEvidenceDrawer
        isOpen={whyDrawer.isOpen}
        onClose={() => setWhyDrawer((prev) => ({ ...prev, isOpen: false }))}
        metricType={whyDrawer.metricType}
        caseData={whyDrawer.caseData || { case_id: 'LA-1059', project_name: 'Aurangabad Logistics Hub' }}
        onNavigate={onNavigate}
      />
    </div>
  );
}
