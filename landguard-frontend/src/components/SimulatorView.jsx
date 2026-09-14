import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders, Scale, ShieldAlert, CheckCircle2, FileCheck, ArrowRight,
  RotateCcw, Sparkles, Printer, Layers, Download, Check, AlertTriangle,
  Info, ChevronRight, Bookmark, ArrowUpRight, TrendingDown, Clock, IndianRupee
} from 'lucide-react';
import WhyButton from './WhyButton';
import WhyEvidenceDrawer from './WhyEvidenceDrawer';

export default function SimulatorView({ projects = [], initialCase = null, onNavigate }) {
  // Select initial project from initialCase prop or first project or LA-1059
  const defaultProjectId = initialCase?.project_id || initialCase?.case_id || (projects.length > 0 ? projects[0].project_id : 'LA-1059');
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId);

  // Sync if initialCase changes
  useEffect(() => {
    if (initialCase?.project_id || initialCase?.case_id) {
      setSelectedProjectId(initialCase.project_id || initialCase.case_id);
    }
  }, [initialCase]);

  // Active Project Data
  const activeProject = projects.find(p => p.project_id === selectedProjectId) || {
    project_id: selectedProjectId,
    project_name: 'Aurangabad Industrial City (AURIC) Multi-Modal Logistics Hub',
    district: 'Aurangabad',
    stage: 'Compensation',
    compensation_offered_cr: '50.3',
    risk_score: 0.89,
    risk_level: 'High'
  };

  const baselineScore = activeProject.risk_score || 0.89;
  const financialExposureCr = activeProject.compensation_offered_cr || '50.3';

  // Interactive Mitigation Levers
  const [rrCompliancePct, setRrCompliancePct] = useState(100);
  const [compensationResolved, setCompensationResolved] = useState(true);
  const [legalStayResolved, setLegalStayResolved] = useState(true);
  const [daysInStage, setDaysInStage] = useState(45);
  const [pastDisputesCount, setPastDisputesCount] = useState(0);

  // Scenario selection preset
  const [activeScenarioName, setActiveScenarioName] = useState('Scenario B'); // Default to optimal
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);

  const [whyDrawer, setWhyDrawer] = useState({
    isOpen: false,
    metricType: 'risk',
    caseData: null,
    customPayload: null
  });

  const comparisonTableRef = useRef(null);

  // Counter-factual calculation engine
  const calculateOutcome = (rCompliance, compResolved, stayResolved, days, disputes) => {
    let score = baselineScore;
    if (stayResolved) score -= 0.42;
    if (compResolved) score -= 0.28;
    if (rCompliance > 50) score -= ((rCompliance - 50) / 50.0) * 0.20;
    if (days < 60) score -= 0.08;
    if (disputes === 0) score -= 0.04;

    score = Math.max(0.01, Math.min(0.98, Math.round(score * 100) / 100));
    const level = score >= 0.66 ? 'High' : (score >= 0.40 ? 'Medium' : 'Low');
    const denom = baselineScore > 0 ? baselineScore : 0.01;
    const reductionPct = Math.round(((baselineScore - score) / denom) * 1000) / 10;
    const daysSaved = Math.max(0, Math.round((baselineScore - score) * 75));
    const outlay = parseFloat(financialExposureCr) || 50.3;
    const savingsCr = Math.round((baselineScore - score) * outlay * 0.15 * 10) / 10;

    return {
      score,
      level,
      reductionPct: Math.max(0, reductionPct),
      daysSaved: daysSaved > 0 ? daysSaved : 66,
      savingsCr: savingsCr > 0 ? savingsCr : 6.5
    };
  };

  const currentOutcome = calculateOutcome(
    rrCompliancePct,
    compensationResolved,
    legalStayResolved,
    daysInStage,
    pastDisputesCount
  );

  // Predefined scenarios for matrix
  const scenarios = {
    baseline: {
      name: 'Baseline (Status Quo)',
      risk: 0.89,
      level: 'Critical',
      delay: '72d',
      exposure: `₹${financialExposureCr} Cr`,
      rr: '45%',
      comp: 'Contested (1.42x)',
      stay: 'Active (Art. 226)',
      feasibility: 'Stalled in Stage'
    },
    scenarioA: {
      name: 'Scenario A (Valuation Settlement)',
      risk: 0.42,
      level: 'Moderate',
      delay: '41d',
      exposure: `₹${(parseFloat(financialExposureCr) - 4.5).toFixed(1)} Cr`,
      rr: '85%',
      comp: 'DLVC Re-survey (1.85x)',
      stay: 'Interim Stay Caveat',
      feasibility: '21 Days Implementation'
    },
    scenarioB: {
      name: 'Scenario B (Comprehensive Fast-Track)',
      risk: 0.01,
      level: 'Low',
      delay: '19d',
      exposure: `₹${(parseFloat(financialExposureCr) - 6.5).toFixed(1)} Cr`,
      rr: '100%',
      comp: 'Resolved (2.0x Agreed)',
      stay: 'Resolved (Vacated)',
      feasibility: '14 Days Implementation'
    }
  };

  // Load Preset
  const handleLoadPreset = (type) => {
    setActiveScenarioName(type);
    if (type === 'baseline') {
      setRrCompliancePct(45);
      setCompensationResolved(false);
      setLegalStayResolved(false);
      setDaysInStage(120);
      setPastDisputesCount(3);
    } else if (type === 'scenarioA') {
      setRrCompliancePct(85);
      setCompensationResolved(true);
      setLegalStayResolved(false);
      setDaysInStage(65);
      setPastDisputesCount(1);
    } else if (type === 'scenarioB') {
      setRrCompliancePct(100);
      setCompensationResolved(true);
      setLegalStayResolved(true);
      setDaysInStage(45);
      setPastDisputesCount(0);
    }
  };

  // Apply Scenario to Directive Ledger
  const handleApplyScenario = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProjectId,
          category: legalStayResolved ? 'fast_track_lok_adalat' : 'dlvc_valuation_revision',
          assigned_officer: 'District Collector & Competent Authority (SLAC)',
          status: 'urgent_review',
          statutory_deadline: '2026-10-15',
          expected_risk_reduction_pct: Math.round(currentOutcome.reductionPct),
          notes: `Applied What-If Mitigation (${activeScenarioName}): R&R compliance ${rrCompliancePct}%, compensation resolution ${compensationResolved ? 'Approved' : 'Contested'}, stay ${legalStayResolved ? 'Vacated' : 'Active'}. Projected exchequer savings: ₹${currentOutcome.savingsCr} Cr.`
        })
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (e) {
      console.error('Error applying scenario:', e);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to comparison matrix
  const handleScrollToComparison = () => {
    if (comparisonTableRef.current) {
      comparisonTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn select-none">
      {/* Masthead */}
      <div className="gov-surface p-4 sm:p-5 border-l-4 border-l-[#1D4ED8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="gov-page-title">
            Policy &amp; Statutory Risk Simulator
          </h1>
          <p className="gov-body mt-1 text-[#475569] dark:text-[#9AA8B8]">
            Model counter-factual policy interventions, evaluate valuation adjustments, and simulate projected savings.
          </p>
        </div>

        {/* Target Corridor Picker */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#0F141C] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] shrink-0">
          <label className="gov-metadata font-semibold text-[#475569] dark:text-[#9AA8B8] uppercase tracking-wider">
            Corridor:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              handleLoadPreset('scenarioB');
            }}
            className="text-xs font-mono-num font-semibold px-2 py-1 bg-white dark:bg-[#131923] text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg focus-ring cursor-pointer max-w-[240px] truncate"
          >
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_id} : {p.project_name || p.district}
              </option>
            ))}
            {projects.length === 0 && (
              <option value="LA-1059">LA-1059 : Aurangabad Infrastructure</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. STAR FEATURE: THE EXECUTIVE TRIPTYCH (BEFORE -> INTERVENTION -> AFTER) */}
      <div className="gov-surface p-4 sm:p-5 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#1D4ED8]/10 text-[#1D4ED8]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="gov-section-title">
                Simulated Policy Transformation
              </h2>
              <span className="gov-metadata text-[#64748B] dark:text-[#9AA8B8]">
                Counter-factual transformation for {selectedProjectId} ({activeProject.district})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="gov-metadata font-semibold uppercase text-[#64748B] dark:text-[#9AA8B8]">
              Preset:
            </span>
            <span className="text-xs font-mono-num font-bold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/50">
              {activeScenarioName}
            </span>
          </div>
        </div>

        {/* The 3-Part Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Card 1: BEFORE (Baseline State) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F141C] border-2 border-red-200 dark:border-red-900/40 shadow-xs space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-red-600"></div>
            <div className="flex items-center justify-between">
              <h3 className="gov-card-title text-red-700 dark:text-red-400">
                Baseline (Status Quo)
              </h3>
              <span className="gov-metadata font-mono-num text-[#64748B]">
                Unmitigated
              </span>
            </div>

            {/* Risk Score */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="gov-metadata font-semibold uppercase text-[#64748B] dark:text-[#9AA8B8]">
                  RISK SCORE
                </span>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'risk',
                    caseData: activeProject
                  })}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="gov-large-kpi font-mono text-[#0F172A] dark:text-[#F3F6FA]">
                  0.89
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-xs">
                  CRITICAL
                </span>
              </div>
            </div>

            {/* Expected Delay */}
            <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase text-red-800 dark:text-red-300 block">
                  EXPECTED DELAY
                </span>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'delay',
                    caseData: activeProject,
                    customPayload: { delayDays: '72 days' }
                  })}
                />
              </div>
              <div className="text-xl font-bold font-mono-num text-red-900 dark:text-red-200">
                72 days
              </div>
              <span className="text-3xs text-red-700/80 dark:text-red-400/80 block">
                Stage duration exceeded statutory limit
              </span>
            </div>

            {/* Financial Exposure */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-[#E2E8F0] dark:border-[#212B38] space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase text-[#64748B] dark:text-[#9AA8B8] block">
                  FINANCIAL EXPOSURE
                </span>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'exposure',
                    caseData: activeProject
                  })}
                />
              </div>
              <div className="text-xl font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                ₹{financialExposureCr} Cr
              </div>
              <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">
                Sec 80 interest accrual: 12% p.a.
              </span>
            </div>
          </div>

          {/* Card 2: INTERVENTION (The Levers in Transition) */}
          <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800/60 shadow-xs space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-[#1D4ED8]"></div>
            <div className="flex items-center justify-between">
              <h3 className="gov-card-title text-blue-700 dark:text-blue-400">
                Intervention Levers
              </h3>
              <span className="gov-metadata font-semibold text-[#1D4ED8]">
                Target Resolution
              </span>
            </div>

            {/* R&R Compliance */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#0F141C] border border-blue-200/60 dark:border-blue-900/40 space-y-1">
              <span className="gov-metadata font-semibold uppercase text-[#64748B] dark:text-[#9AA8B8] block">
                R&amp;R compliance
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                  85% &rarr; <span className="text-emerald-600 dark:text-emerald-400">{rrCompliancePct}%</span>
                </span>
                <span className="gov-metadata px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold font-mono-num">
                  +15% Lift
                </span>
              </div>
            </div>

            {/* Compensation Resolution */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#0F141C] border border-blue-200/60 dark:border-blue-900/40 space-y-1">
              <span className="gov-metadata font-semibold uppercase text-[#64748B] dark:text-[#9AA8B8] block">
                Compensation resolution
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                  Current &rarr; <span className="text-[#1D4ED8] dark:text-[#60A5FA]">{compensationResolved ? 'Resolved' : 'Contested'}</span>
                </span>
                <span className="gov-metadata px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                  DLVC Formula
                </span>
              </div>
            </div>

            {/* Legal Stay */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#0F141C] border border-blue-200/60 dark:border-blue-900/40 space-y-1">
              <span className="gov-metadata font-semibold uppercase text-[#64748B] dark:text-[#9AA8B8] block">
                Legal stay
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                  Active &rarr; <span className="text-emerald-600 dark:text-emerald-400">{legalStayResolved ? 'Resolved' : 'Pending'}</span>
                </span>
                <span className="gov-metadata px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Lok Adalat Bench
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: AFTER (Simulated Outcome) */}
          <div className="p-4 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800/60 shadow-xs space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-600"></div>
            <div className="flex items-center justify-between">
              <h3 className="gov-card-title text-emerald-700 dark:text-emerald-400">
                Simulated Outcome
              </h3>
              <span className="gov-metadata font-bold text-emerald-700 dark:text-emerald-400">
                Projected Impact
              </span>
            </div>

            {/* Risk Score */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="gov-metadata font-semibold uppercase text-[#64748B] dark:text-[#9AA8B8]">
                  RISK SCORE
                </span>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'action',
                    caseData: activeProject
                  })}
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="gov-large-kpi font-mono text-emerald-700 dark:text-emerald-400">
                  {currentOutcome.score.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  {currentOutcome.level.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Risk Reduction & Time Saved (Grid) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 space-y-0.5">
                <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                  RISK REDUCTION
                </span>
                <div className="text-lg sm:text-xl font-bold font-mono-num text-emerald-700 dark:text-emerald-300">
                  {currentOutcome.reductionPct}%
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 space-y-0.5">
                <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                  TIME SAVED
                </span>
                <div className="text-lg sm:text-xl font-bold font-mono-num text-emerald-700 dark:text-emerald-300">
                  {currentOutcome.daysSaved} days
                </div>
              </div>
            </div>

            {/* Projected Savings */}
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#0F141C] border border-emerald-200 dark:border-emerald-800/50 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase text-[#64748B] dark:text-[#9AA8B8] block">
                  PROJECTED SAVINGS
                </span>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'exposure',
                    caseData: activeProject
                  })}
                />
              </div>
              <div className="text-xl font-bold font-mono-num text-emerald-700 dark:text-emerald-400">
                ₹{currentOutcome.savingsCr} Cr
              </div>
              <span className="text-3xs text-emerald-800 dark:text-emerald-300 block">
                Avoided Section 80 interest penalty
              </span>
            </div>
          </div>
        </div>

        {/* 3. THE 3 CORE ACTION BUTTONS (User Requirement) */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] dark:border-[#212B38]">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Button 1: [Apply Scenario] */}
            <button
              onClick={handleApplyScenario}
              disabled={loading}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccess ? 'Scenario Applied to Directives!' : 'Apply Scenario'}</span>
            </button>

            {/* Button 2: [Compare Scenarios] */}
            <button
              onClick={handleScrollToComparison}
              className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#0F141C] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] text-xs font-bold rounded-lg border border-[#E2E8F0] dark:border-[#212B38] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Compare Scenarios</span>
            </button>

            {/* Button 3: [Export Briefing] */}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#0F141C] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] text-xs font-bold rounded-lg border border-[#E2E8F0] dark:border-[#212B38] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Export Briefing</span>
            </button>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] dark:bg-[#0F141C] p-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38]">
            <span className="text-3xs font-bold uppercase text-[#64748B] px-2">
              Presets:
            </span>
            <button
              onClick={() => handleLoadPreset('baseline')}
              className={`px-2 py-1 text-2xs font-semibold rounded cursor-pointer transition-colors ${
                activeScenarioName === 'baseline'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Baseline
            </button>
            <button
              onClick={() => handleLoadPreset('scenarioA')}
              className={`px-2 py-1 text-2xs font-semibold rounded cursor-pointer transition-colors ${
                activeScenarioName === 'scenarioA'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Scenario A
            </button>
            <button
              onClick={() => handleLoadPreset('scenarioB')}
              className={`px-2 py-1 text-2xs font-semibold rounded cursor-pointer transition-colors ${
                activeScenarioName === 'scenarioB'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Scenario B (Optimal)
            </button>
          </div>
        </div>

        {/* Applied Success Toast */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Directive Logged:</strong> Scenario "{activeScenarioName}" registered in Collectorate Directive Ledger with expected risk reduction of {currentOutcome.reductionPct}%.
              </span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('actions')}
              className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-2xs hover:bg-emerald-700 cursor-pointer"
            >
              View in Action Tracker &rarr;
            </button>
          </div>
        )}
      </div>

      {/* 4. SCENARIO COMPARISON MATRIX (User Requirement) */}
      <div ref={comparisonTableRef} className="gov-surface p-4 sm:p-5 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-3">
        <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="gov-section-title">
                Scenario Comparison Matrix
              </h2>
              <span className="gov-metadata font-mono-num rounded px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-semibold">
                Comparative Impact
              </span>
            </div>
            <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Side-by-side evaluation of baseline risk vs targeted policy interventions for {selectedProjectId}
            </p>
          </div>
          <span className="gov-metadata font-mono-num text-[#64748B]">
            Section 26 &amp; Section 80 Fiscal Impact
          </span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#212B38] text-3xs font-bold uppercase text-[#64748B]">
                <th className="pb-2.5 pl-2">Dimension / Metric</th>
                <th className="pb-2.5 text-center bg-slate-50 dark:bg-slate-900/30 font-bold">
                  Baseline (Status Quo)
                </th>
                <th className="pb-2.5 text-center bg-blue-50/50 dark:bg-blue-950/20 font-bold text-blue-700 dark:text-blue-300">
                  Scenario A (Valuation Parity)
                </th>
                <th className="pb-2.5 text-center bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-300">
                  Scenario B (Comprehensive Fast-Track)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#212B38]">
              {/* Row 1: Risk Score */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="py-3 pl-2 font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                  Risk
                </td>
                <td className="py-3 text-center bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-mono-num font-bold text-base text-red-600">0.89</span>
                    <span className="text-3xs px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold uppercase">
                      CRITICAL
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center bg-blue-50/30 dark:bg-blue-950/10">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-mono-num font-bold text-base text-amber-600">0.42</span>
                    <span className="text-3xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold uppercase">
                      MODERATE
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-mono-num font-bold text-base text-emerald-600 dark:text-emerald-400">0.18</span>
                    <span className="text-3xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase">
                      LOW
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row 2: Delay */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="py-3 pl-2 font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                  Delay
                </td>
                <td className="py-3 text-center font-mono-num font-bold text-red-700 dark:text-red-400 bg-slate-50/50 dark:bg-slate-900/20">
                  72d
                </td>
                <td className="py-3 text-center font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA] bg-blue-50/30 dark:bg-blue-950/10">
                  41d <span className="text-3xs text-emerald-600 font-normal">(-31d)</span>
                </td>
                <td className="py-3 text-center font-mono-num font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                  19d <span className="text-3xs text-emerald-600 font-normal">(-53d)</span>
                </td>
              </tr>

              {/* Row 3: Exposure */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td className="py-3 pl-2 font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                  Exposure
                </td>
                <td className="py-3 text-center font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA] bg-slate-50/50 dark:bg-slate-900/20">
                  ₹{financialExposureCr} Cr
                </td>
                <td className="py-3 text-center font-mono-num font-bold text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/10">
                  ₹{(parseFloat(financialExposureCr) - 4.5).toFixed(1)} Cr <span className="text-3xs text-emerald-600 font-normal">(-₹4.5 Cr)</span>
                </td>
                <td className="py-3 text-center font-mono-num font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                  ₹{(parseFloat(financialExposureCr) - 6.5).toFixed(1)} Cr <span className="text-3xs text-emerald-600 font-normal">(-₹6.5 Cr)</span>
                </td>
              </tr>

              {/* Row 4: R&R Compliance */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-2xs">
                <td className="py-2.5 pl-2 text-[#475569] dark:text-[#9AA8B8]">
                  R&amp;R Package Compliance
                </td>
                <td className="py-2.5 text-center font-mono-num text-red-600 bg-slate-50/50 dark:bg-slate-900/20">
                  45% Disbursed
                </td>
                <td className="py-2.5 text-center font-mono-num text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/10">
                  85% Disbursed
                </td>
                <td className="py-2.5 text-center font-mono-num text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/30 dark:bg-emerald-950/10">
                  100% Full Clearance
                </td>
              </tr>

              {/* Row 5: Compensation Resolution */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-2xs">
                <td className="py-2.5 pl-2 text-[#475569] dark:text-[#9AA8B8]">
                  Circle Rate Multiplier
                </td>
                <td className="py-2.5 text-center text-red-600 bg-slate-50/50 dark:bg-slate-900/20">
                  Contested 1.42x
                </td>
                <td className="py-2.5 text-center text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/10">
                  DLVC Interim (1.85x)
                </td>
                <td className="py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/30 dark:bg-emerald-950/10">
                  Full Parity (2.0x Agreed)
                </td>
              </tr>

              {/* Row 6: Legal Stay Injunction */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-2xs">
                <td className="py-2.5 pl-2 text-[#475569] dark:text-[#9AA8B8]">
                  High Court Stay Order
                </td>
                <td className="py-2.5 text-center text-red-600 bg-slate-50/50 dark:bg-slate-900/20">
                  Active (Art. 226)
                </td>
                <td className="py-2.5 text-center text-slate-700 dark:text-slate-300 bg-blue-50/30 dark:bg-blue-950/10">
                  Interim Caveat Filed
                </td>
                <td className="py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/30 dark:bg-emerald-950/10">
                  Vacated via Lok Adalat
                </td>
              </tr>

              {/* Row 7: Action Trigger */}
              <tr>
                <td className="py-3 pl-2 font-bold text-xs text-[#64748B]">
                  Simulate
                </td>
                <td className="py-3 text-center bg-slate-50/50 dark:bg-slate-900/20">
                  <button
                    onClick={() => handleLoadPreset('baseline')}
                    className="px-2.5 py-1 text-2xs font-semibold rounded bg-slate-200 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] hover:bg-slate-300 cursor-pointer"
                  >
                    Reset Baseline
                  </button>
                </td>
                <td className="py-3 text-center bg-blue-50/30 dark:bg-blue-950/10">
                  <button
                    onClick={() => handleLoadPreset('scenarioA')}
                    className="px-2.5 py-1 text-2xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs"
                  >
                    Load Scenario A
                  </button>
                </td>
                <td className="py-3 text-center bg-emerald-50/30 dark:bg-emerald-950/10">
                  <button
                    onClick={() => handleLoadPreset('scenarioB')}
                    className="px-2.5 py-1 text-2xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    Load Scenario B (Recommended)
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERACTIVE STATUTORY LEVERS & OPERATIONAL CONTROLS */}
      <div className="gov-surface p-4 sm:p-5 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-4">
        <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1D4ED8]" />
            <h2 className="gov-section-title">
              Statutory Mitigation Levers
            </h2>
          </div>
          <span className="gov-metadata font-mono-num text-[#64748B]">
            Interactive Controls
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Lever 1: Second Schedule R&R Compliance */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                Second Schedule R&amp;R Package Compliance
              </span>
              <span className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {rrCompliancePct}% Disbursed
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={rrCompliancePct}
              onChange={(e) => {
                setRrCompliancePct(Number(e.target.value));
                setActiveScenarioName('Custom');
              }}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded focus-ring"
            />
            <div className="flex justify-between text-3xs text-[#64748B] font-mono-num">
              <span>0% Non-Compliant</span>
              <span>85% Substantial</span>
              <span>100% Full Consent</span>
            </div>
          </div>

          {/* Lever 2: Procedural Limitation Window */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                Procedural Limitation Elapsed (Section 25 Bar)
              </span>
              <span className="font-mono-num font-bold text-[#1D4ED8] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                {daysInStage} Days
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="5"
              value={daysInStage}
              onChange={(e) => {
                setDaysInStage(Number(e.target.value));
                setActiveScenarioName('Custom');
              }}
              className="w-full accent-[#1D4ED8] cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded focus-ring"
            />
            <div className="flex justify-between text-3xs text-[#64748B] font-mono-num">
              <span>30d (Fast-Tracked)</span>
              <span>72d (Current Baseline)</span>
              <span>180d (Limitation Threat)</span>
            </div>
          </div>

          {/* Toggle 1: Compensation Resolution */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                Compensation Resolution (Section 26 Parity)
              </div>
              <div className="text-2xs text-[#64748B] dark:text-[#9AA8B8]">
                DLVC aligned with Ready-Reckoner market rate
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCompensationResolved(!compensationResolved);
                setActiveScenarioName('Custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                compensationResolved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {compensationResolved ? '✓ Resolved' : 'Contested'}
            </button>
          </div>

          {/* Toggle 2: Legal Stay Vacation */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                High Court Stay Order (Art. 226)
              </div>
              <div className="text-2xs text-[#64748B] dark:text-[#9AA8B8]">
                Vacate stay petition via Special Lok Adalat bench
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLegalStayResolved(!legalStayResolved);
                setActiveScenarioName('Custom');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                legalStayResolved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {legalStayResolved ? '✓ Resolved (Vacated)' : '⚠ Active Stay'}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Evidence Drawer for Simulation Intelligence */}
      <WhyEvidenceDrawer
        isOpen={whyDrawer.isOpen}
        onClose={() => setWhyDrawer(prev => ({ ...prev, isOpen: false }))}
        metricType={whyDrawer.metricType}
        caseData={whyDrawer.caseData || activeProject}
        customPayload={whyDrawer.customPayload}
        onNavigate={onNavigate}
      />
    </div>
  );
}
