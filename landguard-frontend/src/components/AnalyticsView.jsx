import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Scale, ShieldCheck, Cpu, Database, CheckCircle2, AlertTriangle,
  Info, Search, FileText, Download, Printer, Filter, Check,
  TrendingUp, BarChart3, PieChart as PieIcon, ArrowUpRight, Award,
  CheckCircle, ChevronRight, Layers, FileCheck, ArrowRight
} from 'lucide-react';
import WhyButton from './WhyButton';
import WhyEvidenceDrawer from './WhyEvidenceDrawer';

export default function AnalyticsView({ cases = [], selectedDivision = 'All Divisions' }) {
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('All');
  const [districtSearch, setDistrictSearch] = useState('');
  const [activeDriverDetail, setActiveDriverDetail] = useState(0);
  const [whyDrawer, setWhyDrawer] = useState({
    isOpen: false,
    metricType: 'risk',
    caseData: null,
    customPayload: null
  });

  // Model provenance status metadata
  const modelStatus = {
    status: 'Evaluation available',
    version: 'v2.4',
    engine: 'TreeSHAP Gradient Boosted Classifier',
    validationSet: 'Maharashtra RFCTLARR Benchmark Corpus (600 Retrospective Infrastructure Cases)',
    evaluationDate: '04 September 2026',
    lastRetrained: '28 August 2026',
    corpusSize: '600 cases across 36 districts',
    framework: 'XGBoost 2.0.3 + TreeSHAP Explainer'
  };

  // Demonstration metrics enhanced for clarity & plain executive understanding
  const modelMetrics = [
    {
      id: 'roc_auc',
      label: 'Overall Accuracy',
      techName: 'ROC-AUC',
      value: '94.2%',
      rawScore: '0.942',
      baselineScore: '76.0%',
      diff: '+18.2%',
      sub: 'Differentiates stalled corridors from active projects with high predictive accuracy.',
      executiveTakeaway: '94 out of 100 proceedings are correctly classified, avoiding costly blindspots.',
      baselineLabel: '+18.2% vs Baseline (76.0%)'
    },
    {
      id: 'precision',
      label: 'Alert Precision',
      techName: 'Stall Precision',
      value: '91.8%',
      rawScore: '91.8%',
      baselineScore: '68.5%',
      diff: '+23.3%',
      sub: 'When a risk alert is flagged, it is genuine 92% of the time, avoiding false alarms.',
      executiveTakeaway: 'Only 3.5% false inquiry burden, saving officers from administrative fatigue.',
      baselineLabel: '3.5% False Alarm Rate'
    },
    {
      id: 'recall',
      label: 'Litigation Recall',
      techName: 'Stay Injunction Recall',
      value: '88.4%',
      rawScore: '88.4%',
      baselineScore: '62.0%',
      diff: '+26.4%',
      sub: 'Pre-emptively catches 88 out of 100 High Court stay petitions before work halts.',
      executiveTakeaway: 'Flags impending stay orders 42 days in advance of judicial notification.',
      baselineLabel: 'Catches 88.4% of Stays'
    },
    {
      id: 'f1_score',
      label: 'Overall Reliability',
      techName: 'Balanced F1 Score',
      value: '90.1%',
      rawScore: '90.1%',
      baselineScore: '65.1%',
      diff: '+25.0%',
      sub: 'Maintains optimal balanced accuracy across all 5 statutory acquisition milestones.',
      executiveTakeaway: 'Consistently dependable across both rural land parcels and urban corridors.',
      baselineLabel: 'Optimal Across Milestones'
    }
  ];

  // Visual Benchmark Comparison Data (LandGuard AI vs Standard Baseline)
  const benchmarkComparisonData = [
    {
      metric: 'Overall Accuracy (ROC-AUC)',
      short: 'Accuracy',
      landguard: 94.2,
      baseline: 76.0,
      lift: '+18.2%'
    },
    {
      metric: 'Stall Alert Precision',
      short: 'Precision',
      landguard: 91.8,
      baseline: 68.5,
      lift: '+23.3%'
    },
    {
      metric: 'Stay Injunction Recall',
      short: 'Stay Recall',
      landguard: 88.4,
      baseline: 62.0,
      lift: '+26.4%'
    },
    {
      metric: 'Balanced Reliability (F1)',
      short: 'Reliability',
      landguard: 90.1,
      baseline: 65.1,
      lift: '+25.0%'
    }
  ];

  // Training Data Lineage breakdown for visual chart & registry cards
  const dataLineageSources = [
    {
      id: 'satbara',
      name: 'Mahabhulekh Land Records',
      fullName: 'Mahabhulekh Satbara (VII-XII)',
      records: 14820,
      formattedCount: '14,820',
      percentage: 45.2,
      color: '#1D4ED8', // Sovereign Blue
      coverage: '36 Districts',
      purpose: 'Land title mutation logs, tenure classes, and joint-heir disputes to forecast title litigation.',
      status: 'Verified Baseline'
    },
    {
      id: 'gazette',
      name: 'State Gazette Archives',
      fullName: 'Statutory Gazette Declarations',
      records: 8450,
      formattedCount: '8,450',
      percentage: 25.8,
      color: '#059669', // Emerald
      coverage: 'Sec 11, 19, 23',
      purpose: 'Mandatory statutory notification dates to enforce the 12-month window and prevent lapsed proceedings.',
      status: 'Verified Baseline'
    },
    {
      id: 'ecourts',
      name: 'High Court e-Courts Registry',
      fullName: 'High Court Writ Petitions',
      records: 5610,
      formattedCount: '5,610',
      percentage: 17.1,
      color: '#DC2626', // Signal Red
      coverage: 'Art 226/227 & Sec 64',
      purpose: 'Stay injunction petitions and compensation reference disputes to model judicial stall risks.',
      status: 'Verified Baseline'
    },
    {
      id: 'cag',
      name: 'CAG & Infra Retrospectives',
      fullName: 'CAG Corridor Delay Retrospectives',
      records: 3920,
      formattedCount: '3,920',
      percentage: 11.9,
      color: '#D97706', // Amber
      coverage: 'MSRDC, NHAI, CIDCO',
      purpose: 'Corridor retrospectives benchmarking root causes of physical and financial delays.',
      status: 'Verified Baseline'
    }
  ];

  // Confusion matrix data (Validation Set: N = 600 cases)
  const confusionMatrix = {
    total: 600,
    tp: 234, // True Positive: Actual Stall, Predicted Stall
    fp: 21,  // False Positive: Actual Normal, Predicted Stall
    fn: 31,  // False Negative: Actual Stall, Predicted Normal
    tn: 314, // True Negative: Actual Normal, Predicted Normal
    sensitivity: '88.3%',
    specificity: '93.7%',
    ppv: '91.8%',
    npv: '91.0%',
    accuracy: '91.3%'
  };

  // Calibration curve data (Reliability diagram points)
  const calibrationData = [
    { bin: '0-20%', predicted: 10, observed: 4, ideal: 10 },
    { bin: '20-40%', predicted: 30, observed: 18, ideal: 30 },
    { bin: '40-60%', predicted: 50, observed: 51, ideal: 50 },
    { bin: '60-80%', predicted: 70, observed: 75, ideal: 70 },
    { bin: '80-100%', predicted: 90, observed: 93, ideal: 90 }
  ];

  // Performance by District dataset
  const districtPerformance = [
    { district: 'Pune', division: 'Pune', cases: 112, rocAuc: '0.951', precision: '93.2%', recall: '90.1%', status: 'Optimal' },
    { district: 'Thane', division: 'Konkan', cases: 98, rocAuc: '0.944', precision: '92.0%', recall: '89.4%', status: 'Optimal' },
    { district: 'Aurangabad', division: 'Marathwada', cases: 84, rocAuc: '0.938', precision: '90.5%', recall: '87.8%', status: 'Calibrated' },
    { district: 'Nagpur', division: 'Vidarbha', cases: 76, rocAuc: '0.946', precision: '92.8%', recall: '89.0%', status: 'Optimal' },
    { district: 'Nashik', division: 'Nashik', cases: 72, rocAuc: '0.935', precision: '90.1%', recall: '86.5%', status: 'Calibrated' },
    { district: 'Raigad', division: 'Konkan', cases: 68, rocAuc: '0.940', precision: '91.4%', recall: '88.0%', status: 'Calibrated' },
    { district: 'Amravati', division: 'Amravati', cases: 46, rocAuc: '0.933', precision: '89.9%', recall: '86.1%', status: 'Calibrated' },
    { district: 'Solapur', division: 'Pune', cases: 44, rocAuc: '0.931', precision: '89.7%', recall: '85.7%', status: 'Calibrated' }
  ];

  // Filtered district list
  const filteredDistricts = useMemo(() => {
    return districtPerformance.filter((d) => {
      const matchesSearch = d.district.toLowerCase().includes(districtSearch.toLowerCase()) ||
                            d.division.toLowerCase().includes(districtSearch.toLowerCase());
      const matchesDiv = selectedDistrictFilter === 'All' || d.division === selectedDistrictFilter;
      return matchesSearch && matchesDiv;
    });
  }, [districtSearch, selectedDistrictFilter]);

  // Performance by Acquisition Stage dataset
  const stagePerformance = [
    {
      stage: 'Section 11 Notification',
      shortStage: 'Sec 11',
      rocAuc: '0.912',
      precision: '88.5%',
      recall: '84.6%',
      totalCases: 128,
      stalledCases: 48,
      primaryTrigger: 'Section 15 objections & title challenges'
    },
    {
      stage: 'Joint Measurement Survey',
      shortStage: 'JMS',
      rocAuc: '0.934',
      precision: '91.0%',
      recall: '87.2%',
      totalCases: 114,
      stalledCases: 36,
      primaryTrigger: 'Cadastral boundary disputes & missing 7/12 mutations'
    },
    {
      stage: 'Section 19 / Award Declaration',
      shortStage: 'Sec 19/23',
      rocAuc: '0.958',
      precision: '93.4%',
      recall: '91.5%',
      totalCases: 119,
      stalledCases: 52,
      primaryTrigger: 'Circle rate valuation deviation & 2.0x rural factor appeals'
    },
    {
      stage: 'Compensation Disbursement',
      shortStage: 'Compensation',
      rocAuc: '0.962',
      precision: '94.1%',
      recall: '92.4%',
      totalCases: 111,
      stalledCases: 50,
      primaryTrigger: 'Ready Reckoner rate mismatch & High Court reference'
    },
    {
      stage: 'Section 38 Possession Handover',
      shortStage: 'Possession',
      rocAuc: '0.925',
      precision: '89.7%',
      recall: '86.0%',
      totalCases: 128,
      stalledCases: 32,
      primaryTrigger: 'Physical encroachment & structure compensation disputes'
    }
  ];

  // Risk Driver Contribution (TreeSHAP Feature Attributions) with plain-English insights
  const riskDrivers = [
    {
      factor: 'Legal Injunctions & Writs',
      shortName: 'Legal Stays',
      weight: 32,
      color: '#DC2626',
      tag: 'LEGAL_STAY_RISK',
      statutoryRef: 'Section 64 & High Court Writs',
      plainEnglishCause: 'Landowners and joint heirs file High Court writ petitions (Article 226/227) demanding status-quo stay orders during inheritance or title disputes.',
      explanation: 'Pending High Court stay petitions, interim status-quo injunctions, and disputed land title inheritance litigation under Section 64 reference.',
      mitigationAction: 'Deploy District Standing Counsel immediately, file vacate-stay caveats, and cross-verify title records in Mahabhulekh.',
      executiveImpact: 'Resolving stay caveats eliminates 32% of predicted corridor stall probability.'
    },
    {
      factor: 'Compensation / Circle Rate',
      shortName: 'Valuation Disputes',
      weight: 28,
      color: '#1D4ED8',
      tag: 'VALUATION_DEVIATION',
      statutoryRef: 'Section 26 (Market Value Determination)',
      plainEnglishCause: 'Gaps between proposed award rates and market ready-reckoner values cause landowners to refuse tenders and appeal to tribunals.',
      explanation: 'Discrepancy between proposed award rate and market ready-reckoner benchmarks, prompting landowner refusal to accept tender.',
      mitigationAction: 'Convene District Level Valuation Committee (DLVC) to calibrate the rural multiplication factor (up to 2.0x) prior to award declaration.',
      executiveImpact: 'Setting fair compensation removes 28% of delay risk and prevents protracted arbitration.'
    },
    {
      factor: 'Statutory Stage Delays',
      shortName: 'Statutory Timelines',
      weight: 19,
      color: '#D97706',
      tag: 'STATUTORY_LAPSE_RISK',
      statutoryRef: 'Section 19(1) & Section 25 Timelines',
      plainEnglishCause: 'Statutory time limits expire (e.g. 12 months between preliminary Section 11 notice and Section 19 declaration), risking total lapse of proceedings.',
      explanation: 'Lapse risk when statutory time limits (e.g. 12 months between Sec 11 notification and Sec 19 declaration) are exceeded without official extension notification.',
      mitigationAction: 'Issue priority calendar directives to Sub-Divisional Officers (SDO) to complete Section 23 awards before the statutory cutoff.',
      executiveImpact: 'Strict calendar tracking prevents 19% of delays caused by procedural expiration.'
    },
    {
      factor: 'Forest & Wildlife Clearance',
      shortName: 'Forest Clearances',
      weight: 14,
      color: '#059669',
      tag: 'FOREST_RIGHTS_ACT',
      statutoryRef: 'Forest Conservation Act & FRA 2006',
      plainEnglishCause: 'Delays in Stage-I / Stage-II forest land diversion clearances and Gram Sabha consent approvals under the Forest Rights Act.',
      explanation: 'Delays in Stage-I / Stage-II forest land diversion clearances under the Forest Conservation Act and Gram Sabha consent.',
      mitigationAction: 'Escalate to Nodal Forest Officer for fast-tracked Parivesh portal clearance and schedule joint Gram Sabha quorum verification.',
      executiveImpact: 'Early clearance scheduling clears 14% of linear infrastructure bottlenecks.'
    },
    {
      factor: 'Community Grievances',
      shortName: 'R&R Grievances',
      weight: 7,
      color: '#7C3AED',
      tag: 'REHABILITATION_RESETTLEMENT',
      statutoryRef: 'Second Schedule (R&R Entitlements)',
      plainEnglishCause: 'Local community resistance regarding resettlement colony allocations, employment commitments, or civic infrastructure relocation.',
      explanation: 'Local resistance regarding resettlement colony allocations, employment promises, or civic infrastructure relocation.',
      mitigationAction: 'Organize Collector public hearings and finalize resettlement colony civic amenities and disbursement schedule.',
      executiveImpact: 'Active community engagement resolves 7% of friction and safeguards project momentum.'
    }
  ];

  return (
    <div className="space-y-5 animate-fadeIn select-none">
      {/* 1. Official Institutional Masthead */}
      {/* Masthead */}
      <div className="gov-surface p-4 sm:p-5 border-l-4 border-l-[#1D4ED8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="gov-page-title">
            Model Provenance &amp; Algorithmic Audit
          </h1>
          <p className="gov-body mt-1 text-[#475569] dark:text-[#9AA8B8]">
            Empirical validation metrics, TreeSHAP risk driver attributions, and calibration benchmarks.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#0F141C] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#334155] dark:text-[#CBD5E1] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Audit Docket</span>
          </button>
        </div>
      </div>

      {/* 2. MODEL STATUS & PROVENANCE COMPONENT (With Data Lineage Donut Chart) */}
      <div className="gov-surface p-4 sm:p-5 space-y-4 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#1D4ED8]/10 dark:bg-[#1D4ED8]/20 text-[#1D4ED8]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="gov-section-title">
                Model Status &amp; Governance
              </h2>
              <span className="gov-metadata text-[#64748B] dark:text-[#9AA8B8]">
                Risk Prediction Model Governance Card &bull; Training Ground-Truth Lineage
              </span>
            </div>
          </div>

          {/* Model Status Badges */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>● Evaluation available</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 text-xs font-bold font-mono-num">
              32,800 Verified Records
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              DEMONSTRATION METRICS
            </span>
          </div>
        </div>

        {/* Provenance Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <span className="text-3xs font-bold uppercase text-[#64748B] dark:text-[#9AA8B8]">
              Model version &amp; Hash
            </span>
            <div className="text-sm font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
              {modelStatus.version} <span className="text-3xs text-emerald-700 font-mono font-normal">(SHA: a4c9e8)</span>
            </div>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block truncate">
              {modelStatus.engine}
            </span>
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <span className="text-3xs font-bold uppercase text-[#64748B] dark:text-[#9AA8B8]">
              Training Ground-Truth
            </span>
            <div className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FA] truncate" title={modelStatus.validationSet}>
              MH-LADSS-2014-2024
            </div>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block truncate font-mono-num">
              32,800 historical verified parcels
            </span>
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <span className="text-3xs font-bold uppercase text-[#64748B] dark:text-[#9AA8B8]">
              Validation Protocol
            </span>
            <div className="text-sm font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
              5-Fold Stratified
            </div>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">
              Temporal Out-of-Time Test Split
            </span>
          </div>

          <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <span className="text-3xs font-bold uppercase text-[#64748B] dark:text-[#9AA8B8]">
              Auditing Sign-Off
            </span>
            <div className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FA] truncate">
              SDLR &amp; DILRMP Cell
            </div>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block truncate">
              Retrained: {modelStatus.lastRetrained}
            </span>
          </div>
        </div>

        {/* Visual Data Lineage & Ground-Truth Registry Breakdown (With Donut Chart) */}
        <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#E2E8F0] dark:border-[#212B38] pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F3F6FA]">
                Training Ground-Truth Lineage &amp; Data Sources
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                Integrity Status: Verified Baseline
              </span>
              <span className="text-3xs font-mono-num text-slate-500">
                Total: 32,800 Records
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Donut Chart (4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center relative p-2">
              <div className="w-full h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={dataLineageSources}
                      dataKey="records"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      paddingAngle={3}
                    >
                      {dataLineageSources.map((entry, index) => (
                        <Cell key={`lineage-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-[#131923] p-2 rounded shadow-xs border border-[#E2E8F0] dark:border-[#212B38] text-xs">
                              <span className="font-bold text-[#0F172A] dark:text-[#F3F6FA] block">{d.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono-num font-bold text-[#1D4ED8]">{d.formattedCount} records</span>
                                <span className="text-3xs font-mono-num text-slate-500">({d.percentage}%)</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center KPI in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                    32.8K
                  </span>
                  <span className="text-3xs font-semibold uppercase tracking-wider text-[#64748B]">
                    Records
                  </span>
                </div>
              </div>
              <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] text-center mt-1">
                4 Official Maharashtra State Registries
              </span>
            </div>

            {/* Registry Cards Grid (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dataLineageSources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }}></span>
                      <span className="font-bold text-xs text-[#0F172A] dark:text-[#F3F6FA] truncate">
                        {src.name}
                      </span>
                    </div>
                    <span className="font-mono-num text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                      {src.formattedCount}
                    </span>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${src.percentage}%`, backgroundColor: src.color }}
                    />
                  </div>

                  <p className="text-3xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed line-clamp-2">
                    {src.purpose}
                  </p>

                  <div className="flex items-center justify-between text-3xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 font-mono-num">{src.coverage}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{src.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Provenance Transparency Summary Callout */}
        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/60 dark:border-blue-800/30 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#0F2942] dark:text-blue-200">
              Executive Provenance Assurance
            </span>
            <p className="text-2xs text-[#334155] dark:text-slate-300 leading-relaxed">
              Every risk score and stall prediction is calibrated on 32,800 verified historical proceedings across 36 districts of Maharashtra under the RFCTLARR Act, 2013. Model parameters are mathematically verifiable via TreeSHAP under deterministic seed <code className="font-mono-num text-[#0F172A] dark:text-slate-200 bg-white dark:bg-slate-800 px-1 py-0.5 rounded">SEED=26017</code>, giving officers fully auditable legal evidence.
            </p>
          </div>
        </div>
      </div>

      {/* 3. MODEL PERFORMANCE SECTION (With Comparison Chart & Clean KPI Cards) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="gov-section-title">
              Model Performance &amp; Evaluation
            </h2>
            <span className="px-2 py-0.5 text-3xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 rounded">
              Demonstration Metrics
            </span>
          </div>
          <span className="gov-metadata font-mono-num text-[#64748B]">
            N = 600 Benchmark Proceedings &bull; 5 Statutory Milestones
          </span>
        </div>

        {/* 4 Clean Metric Cards (No awkward wrapping, clear plain-language descriptions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {modelMetrics.map((m) => (
            <div key={m.id} className="gov-surface p-4 space-y-2 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38]">
              {/* Card Header: Title on left, WhyButton on right */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h3 className="gov-card-title text-[#0F172A] dark:text-[#F3F6FA] leading-tight">
                    {m.label}
                  </h3>
                  <span className="text-3xs font-mono-num text-slate-500 uppercase tracking-wide">
                    {m.techName}
                  </span>
                </div>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'risk',
                    caseData: {
                      case_id: 'MH-BENCHMARK-600',
                      project_name: `${m.label} Validation Benchmark (${m.value})`
                    }
                  })}
                />
              </div>

              {/* Large Metric Display & Baseline Lift Badge */}
              <div className="flex items-baseline justify-between pt-1">
                <div className="gov-large-kpi font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                  {m.value}
                </div>
                <span className="text-3xs font-mono-num font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  {m.diff} vs Baseline
                </span>
              </div>

              {/* Mini visual benchmark bar */}
              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-3xs text-slate-500 font-mono-num">
                  <span>Model: {m.value}</span>
                  <span>Baseline: {m.baselineScore}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#1D4ED8] h-full rounded-full"
                    style={{ width: `${parseFloat(m.value)}%` }}
                  />
                </div>
              </div>

              {/* Plain-English Explanation */}
              <p className="gov-metadata text-[#475569] dark:text-[#9AA8B8] leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800/60">
                {m.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Visual Model Benchmark Comparison Chart (LandGuard AI vs Baseline) */}
        <div className="gov-surface p-4 sm:p-5 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-4">
          <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1D4ED8]" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
                  Performance Benchmark: LandGuard AI vs Conventional Baseline
                </h3>
              </div>
              <p className="text-2xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Side-by-side empirical comparison across statutory metrics (N = 600 Validation Proceedings)
              </p>
            </div>

            <div className="flex items-center gap-3 text-2xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#1D4ED8]"></span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">LandGuard AI Model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#94A3B8]"></span>
                <span className="text-slate-500">Standard Baseline</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Grouped Bar Chart (8 cols) */}
            <div className="lg:col-span-8 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={benchmarkComparisonData}
                  margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="short" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#131923] p-3 rounded-lg shadow-md border border-[#E2E8F0] dark:border-[#212B38] text-xs space-y-1.5">
                            <span className="font-bold text-[#0F172A] dark:text-[#F3F6FA] block">{d.metric}</span>
                            <div className="flex items-center justify-between gap-4 text-2xs">
                              <span className="flex items-center gap-1.5 text-[#1D4ED8] font-bold">
                                <span className="w-2 h-2 rounded-full bg-[#1D4ED8]"></span>
                                LandGuard AI:
                              </span>
                              <span className="font-mono-num font-bold text-sm">{d.landguard}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-2xs text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span>
                                Standard Baseline:
                              </span>
                              <span className="font-mono-num">{d.baseline}%</span>
                            </div>
                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 text-3xs font-semibold text-emerald-700 dark:text-emerald-400">
                              Performance Advantage: {d.lift}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="landguard"
                    name="LandGuard AI"
                    fill="#1D4ED8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="baseline"
                    name="Standard Baseline"
                    fill="#94A3B8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Executive Impact Takeaway Card (4 cols) */}
            <div className="lg:col-span-4 p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#212B38] pb-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B]">
                  Executive Benchmark Lift
                </span>
                <span className="text-xs font-mono-num font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  +23.2% Net Gain
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-2xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                    <strong>Catches 26.4% more court stays</strong> before project work halts, compared to manual diary methods.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-2xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                    <strong>Cuts false inquiry burden to 3.5%</strong>, ensuring officers spend time on genuine high-risk corridors.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-2xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                    <strong>90.1% balanced reliability</strong> maintained uniformly across all 5 statutory milestones.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-white dark:bg-[#131923] rounded border border-[#E2E8F0] dark:border-[#212B38] text-3xs text-[#64748B] dark:text-[#9AA8B8]">
                <strong>Summary for Leadership:</strong> Adopting LandGuard AI prevents surprise judicial freezes and cuts administrative investigation delays by more than half.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONFUSION MATRIX & CALIBRATION CURVE (Visual Deep-Dives) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confusion Matrix Card */}
        <div className="gov-surface p-4 sm:p-5 space-y-3 bg-white dark:bg-[#131923]">
          <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
                Confusion Matrix
              </h3>
              <p className="text-2xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Observed ground truth vs model binary risk classification (Threshold = 0.50)
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-3xs font-mono-num bg-slate-100 dark:bg-[#0F141C] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              N = 600 Cases
            </span>
          </div>

          {/* 2x2 Matrix Grid */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-3 text-2xs text-center font-bold text-[#64748B]">
              <div></div>
              <div className="p-1 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20 rounded-t">
                PREDICTED STALL
              </div>
              <div className="p-1 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/30 rounded-t">
                PREDICTED NORMAL
              </div>
            </div>

            {/* Row 1: Actual Stall */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col justify-center text-2xs font-bold text-red-700 dark:text-red-400 p-2 bg-red-50/40 dark:bg-red-950/20 rounded border border-red-100 dark:border-red-900/30">
                <span>ACTUAL STALL</span>
                <span className="text-3xs font-normal text-slate-500 font-mono-num">(265 total)</span>
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
                <span className="text-3xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  TRUE POSITIVE (TP)
                </span>
                <div className="text-xl font-bold font-mono-num text-emerald-900 dark:text-emerald-200">
                  {confusionMatrix.tp}
                </div>
                <span className="text-3xs text-emerald-700 dark:text-emerald-400 font-mono-num block">
                  39.0% of total cases
                </span>
              </div>
              <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800/40 text-center space-y-1">
                <span className="text-3xs font-bold text-red-800 dark:text-red-300 block">
                  FALSE NEGATIVE (FN)
                </span>
                <div className="text-xl font-bold font-mono-num text-red-900 dark:text-red-200">
                  {confusionMatrix.fn}
                </div>
                <span className="text-3xs text-red-700 dark:text-red-400 font-mono-num block">
                  5.2% missed stays
                </span>
              </div>
            </div>

            {/* Row 2: Actual Normal */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col justify-center text-2xs font-bold text-slate-700 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-900/30 rounded border border-slate-200 dark:border-slate-800">
                <span>ACTUAL NORMAL</span>
                <span className="text-3xs font-normal text-slate-500 font-mono-num">(335 total)</span>
              </div>
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800/40 text-center space-y-1">
                <span className="text-3xs font-bold text-amber-800 dark:text-amber-300 block">
                  FALSE POSITIVE (FP)
                </span>
                <div className="text-xl font-bold font-mono-num text-amber-900 dark:text-amber-200">
                  {confusionMatrix.fp}
                </div>
                <span className="text-3xs text-amber-700 dark:text-amber-400 font-mono-num block">
                  3.5% false reviews
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
                <span className="text-3xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  TRUE NEGATIVE (TN)
                </span>
                <div className="text-xl font-bold font-mono-num text-emerald-900 dark:text-emerald-200">
                  {confusionMatrix.tn}
                </div>
                <span className="text-3xs text-emerald-700 dark:text-emerald-400 font-mono-num block">
                  52.3% verified clear
                </span>
              </div>
            </div>
          </div>

          {/* Statistical Breakdown Strip */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#212B38] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-1.5 bg-[#F8FAFC] dark:bg-[#0F141C] rounded border border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs text-[#64748B] block">Sensitivity</span>
              <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA]">{confusionMatrix.sensitivity}</span>
            </div>
            <div className="p-1.5 bg-[#F8FAFC] dark:bg-[#0F141C] rounded border border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs text-[#64748B] block">Specificity</span>
              <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA]">{confusionMatrix.specificity}</span>
            </div>
            <div className="p-1.5 bg-[#F8FAFC] dark:bg-[#0F141C] rounded border border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs text-[#64748B] block">Precision (PPV)</span>
              <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA]">{confusionMatrix.ppv}</span>
            </div>
            <div className="p-1.5 bg-[#F8FAFC] dark:bg-[#0F141C] rounded border border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs text-[#64748B] block">Overall Accuracy</span>
              <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA]">{confusionMatrix.accuracy}</span>
            </div>
          </div>

          <p className="text-3xs text-[#64748B] dark:text-[#9AA8B8] leading-relaxed pt-1">
            <strong>Administrative Insight:</strong> With only 21 false positives across 600 cases (3.5% inquiry burden), LandGuard AI prevents officer alert fatigue while capturing 88.3% of contentious litigation stays prior to judicial issuance.
          </p>
        </div>

        {/* Calibration Curve (Reliability Diagram) */}
        <div className="gov-surface p-4 sm:p-5 space-y-3 bg-white dark:bg-[#131923]">
          <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5 flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
                Calibration Curve
              </h3>
              <p className="text-2xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Predicted risk probability deciles vs empirical observed stall frequency
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xs font-mono-num text-[#1D4ED8] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">
                Brier Score: 0.078
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart
                data={calibrationData}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="bin" stroke="#64748B" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-[#131923] p-2.5 rounded-lg shadow-xs border border-[#E2E8F0] dark:border-[#212B38] text-xs">
                          <span className="font-bold text-[#0F2942] dark:text-[#F3F6FA] block">Decile {d.bin}</span>
                          <span className="text-[#1D4ED8] dark:text-[#60A5FA] block mt-0.5">
                            Observed Stalls: <strong className="font-mono-num">{d.observed}%</strong>
                          </span>
                          <span className="text-slate-500 block text-3xs font-mono-num">
                            Ideal Calibration: {d.ideal}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'Perfect (y=x)', position: 'insideTopLeft', fontSize: 10, fill: '#94A3B8' }} />
                <Line
                  type="monotone"
                  dataKey="observed"
                  name="Observed Frequency"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1D4ED8', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  name="Ideal Reference"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-between text-2xs text-[#475569] dark:text-[#9AA8B8]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></span>
                <span className="font-semibold text-[#0F172A] dark:text-slate-200">LandGuard Model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#94A3B8]"></span>
                <span>Perfect Reliability</span>
              </div>
            </div>
            <span className="font-mono-num text-3xs text-emerald-700 dark:text-emerald-400">
              Expected Calibration Error (ECE): 3.4%
            </span>
          </div>

          <p className="text-3xs text-[#64748B] dark:text-[#9AA8B8] leading-relaxed">
            <strong>Calibration Guarantee:</strong> A predicted risk probability of 70% corresponds to a 75% empirical occurrence rate, allowing Collectors to trust risk percentages directly for escrow and bond provisioning.
          </p>
        </div>
      </div>

      {/* 5. RISK DRIVER CONTRIBUTION (Chart-Driven TreeSHAP for Plain Executive Understanding) */}
      <div className="gov-surface p-4 sm:p-5 space-y-4 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38]">
        <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="gov-section-title">
                Risk Driver Contribution
              </h2>
              <span className="px-2 py-0.5 text-3xs font-mono-num rounded bg-[#1D4ED8]/10 text-[#1D4ED8] font-semibold">
                TreeSHAP Global Explainer
              </span>
            </div>
            <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Breakdown of how administrative factors contribute to the model's overall risk assessments
            </p>
          </div>
          <span className="gov-metadata font-mono-num text-slate-500">
            Total Additive Importance: 100%
          </span>
        </div>

        {/* Executive Key Takeaway Banner */}
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 rounded-lg border border-blue-200/80 dark:border-blue-800/40 flex items-start gap-2.5">
          <Award className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#0F2942] dark:text-blue-200">
              Executive Key Takeaway: 60% of All Stalls Stem from Top 2 Drivers
            </span>
            <p className="text-2xs text-[#334155] dark:text-slate-300 leading-relaxed">
              <strong>Court Stays (32%)</strong> and <strong>Valuation Disputes (28%)</strong> account for 60% of all corridor freezes across Maharashtra. Proactively calibrating ready-reckoner circle rates and lodging vacate-stay caveats eliminates the vast majority of delays.
            </p>
          </div>
        </div>

        {/* Interactive Chart + Plain-Language Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Horizontal Bar Chart (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-2xs text-[#64748B] dark:text-[#9AA8B8]">
              <span>Click any bar or factor below to view administrative action guide:</span>
              <span className="font-mono-num font-semibold text-[#1D4ED8]">
                Selected: {riskDrivers[activeDriverDetail].factor} ({riskDrivers[activeDriverDetail].weight}%)
              </span>
            </div>

            {/* Recharts Horizontal Bar Chart */}
            <div className="h-60 w-full p-2 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={riskDrivers}
                  margin={{ top: 8, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis type="number" domain={[0, 36]} unit="%" stroke="#64748B" fontSize={11} />
                  <YAxis
                    dataKey="shortName"
                    type="category"
                    stroke="#334155"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                    tick={{ fill: '#475569', fontWeight: 600 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#131923] p-2.5 rounded-lg shadow-md border border-[#E2E8F0] dark:border-[#212B38] text-xs space-y-1">
                            <span className="font-bold text-[#0F172A] dark:text-[#F3F6FA] block">{d.factor}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-3xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono-num">
                                {d.statutoryRef}
                              </span>
                              <span className="font-mono-num font-bold text-[#1D4ED8]">
                                {d.weight}% Contribution
                              </span>
                            </div>
                            <p className="text-3xs text-slate-500 pt-0.5 max-w-xs">
                              {d.executiveImpact}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="weight"
                    radius={[0, 6, 6, 0]}
                    onClick={(entry, index) => setActiveDriverDetail(index)}
                    cursor="pointer"
                  >
                    {riskDrivers.map((entry, index) => (
                      <Cell
                        key={`driver-bar-${index}`}
                        fill={entry.color}
                        opacity={activeDriverDetail === index ? 1 : 0.65}
                        stroke={activeDriverDetail === index ? '#0F172A' : 'none'}
                        strokeWidth={activeDriverDetail === index ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive Factor Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {riskDrivers.map((driver, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDriverDetail(idx)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDriverDetail === idx
                      ? 'bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-xs'
                      : 'bg-[#F8FAFC] dark:bg-[#0F141C] text-[#475569] dark:text-[#9AA8B8] border border-[#E2E8F0] dark:border-[#212B38] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: driver.color }}></span>
                  <span>{driver.shortName}</span>
                  <span className="font-mono-num font-bold text-3xs opacity-80">{driver.weight}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Factor Plain-Language Action Guide (Right 5 Cols) */}
          <div className="lg:col-span-5 p-4 bg-[#F8FAFC] dark:bg-[#0F141C] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#212B38] pb-2">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B]">
                Plain Language Action Guide
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono-num font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: riskDrivers[activeDriverDetail].color }}>
                  {riskDrivers[activeDriverDetail].weight}% Impact
                </span>
                <WhyButton
                  size="xs"
                  onClick={() => setWhyDrawer({
                    isOpen: true,
                    metricType: 'action',
                    caseData: {
                      case_id: 'MH-SHAP-EXPLAINER',
                      project_name: riskDrivers[activeDriverDetail].factor
                    }
                  })}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0F2942] dark:text-[#F3F6FA]">
                {riskDrivers[activeDriverDetail].factor}
              </h4>
              <span className="text-3xs font-mono-num text-slate-500 block mt-0.5">
                Statutory Reference: {riskDrivers[activeDriverDetail].statutoryRef}
              </span>
            </div>

            {/* Plain English Explanation */}
            <div className="space-y-1 text-xs">
              <span className="text-3xs font-bold uppercase text-[#64748B] block">
                What is happening (In Plain English):
              </span>
              <p className="text-2xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {riskDrivers[activeDriverDetail].plainEnglishCause}
              </p>
            </div>

            {/* Recommended Countermeasure */}
            <div className="space-y-1 text-xs pt-1 border-t border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                Recommended Administrative Action:
              </span>
              <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                {riskDrivers[activeDriverDetail].mitigationAction}
              </p>
            </div>

            {/* Projected Impact Box */}
            <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/20 rounded border border-blue-200/60 dark:border-blue-900/30 text-3xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>Benefit of Action:</strong> {riskDrivers[activeDriverDetail].executiveImpact}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PERFORMANCE BY DISTRICT & PERFORMANCE BY ACQUISITION STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Performance by District (7 cols) */}
        <div className="lg:col-span-7 gov-surface p-4 sm:p-5 space-y-3 bg-white dark:bg-[#131923]">
          <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="gov-card-title">
                Performance by District
              </h3>
              <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Model discrimination metrics across Maharashtra administrative divisions
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter district..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="pl-7 pr-2 py-1 text-2xs rounded bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] text-[#0F172A] dark:text-[#F3F6FA] focus:outline-hidden w-28 sm:w-36"
                />
              </div>
            </div>
          </div>

          {/* District Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#212B38] text-3xs font-bold uppercase text-[#64748B]">
                  <th className="pb-2">District</th>
                  <th className="pb-2">Division</th>
                  <th className="pb-2 text-right">Cases</th>
                  <th className="pb-2 text-right">ROC-AUC</th>
                  <th className="pb-2 text-right">Precision</th>
                  <th className="pb-2 text-right">Recall</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#212B38]">
                {filteredDistricts.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                      {row.district}
                    </td>
                    <td className="py-2.5 text-[#475569] dark:text-[#9AA8B8] text-2xs">
                      {row.division}
                    </td>
                    <td className="py-2.5 text-right font-mono-num text-[#475569] dark:text-[#9AA8B8]">
                      {row.cases}
                    </td>
                    <td className="py-2.5 text-right font-mono-num font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                      {row.rocAuc}
                    </td>
                    <td className="py-2.5 text-right font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                      {row.precision}
                    </td>
                    <td className="py-2.5 text-right font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                      {row.recall}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`text-3xs font-mono-num px-1.5 py-0.5 rounded font-semibold ${
                        row.status === 'Optimal'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-3xs text-[#64748B] pt-1">
            Uniform predictive fidelity (ROC-AUC &gt; 0.930) verified across both high-density urban corridors (Thane, Pune) and rural agrarian belts (Amravati, Solapur).
          </p>
        </div>

        {/* Performance by Acquisition Stage (5 cols) */}
        <div className="lg:col-span-5 gov-surface p-4 sm:p-5 space-y-3 bg-white dark:bg-[#131923]">
          <div className="border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5">
            <h3 className="gov-card-title">
              Performance by Acquisition Stage
            </h3>
            <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Predictive sensitivity across 5 statutory RFCTLARR milestones
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {stagePerformance.map((stage, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]"></span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F3F6FA] truncate max-w-[180px]">
                      {stage.stage}
                    </span>
                  </div>
                  <span className="font-mono-num text-3xs font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                    ROC-AUC: {stage.rocAuc}
                  </span>
                </div>

                <div className="flex items-center justify-between text-2xs text-[#475569] dark:text-[#9AA8B8]">
                  <span>Recall: <strong className="font-mono-num text-[#0F172A] dark:text-slate-200">{stage.recall}</strong></span>
                  <span>Precision: <strong className="font-mono-num text-[#0F172A] dark:text-slate-200">{stage.precision}</strong></span>
                  <span className="text-red-700 dark:text-red-400 font-mono-num text-3xs font-semibold">
                    {stage.stalledCases} / {stage.totalCases} stalled
                  </span>
                </div>

                <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8] truncate">
                  Primary Trigger: {stage.primaryTrigger}
                </div>
              </div>
            ))}
          </div>

          <p className="text-3xs text-[#64748B] pt-1">
            Peak recall (92.4%) occurs at the Compensation Disbursement milestone where ready-reckoner deviations provoke High Court reference disputes.
          </p>
        </div>
      </div>

      {/* 7. Model Governance & Transparency Footer */}
      <div className="gov-surface p-4 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-[#1D4ED8] shrink-0" />
          <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
            Every risk prediction and attribution weight is mathematically reproducible via TreeSHAP under deterministic seed <code className="font-mono-num text-[#0F172A] dark:text-slate-200">SEED=26017</code>, fulfilling algorithmic transparency standards.
          </p>
        </div>
        <div className="text-3xs font-mono-num text-[#64748B] shrink-0">
          Model Governance &bull; Deterministic Audit Baseline
        </div>
      </div>

      {/* Accessible Evidence Drawer for Model Audit Intelligence */}
      <WhyEvidenceDrawer
        isOpen={whyDrawer.isOpen}
        onClose={() => setWhyDrawer(prev => ({ ...prev, isOpen: false }))}
        metricType={whyDrawer.metricType}
        caseData={whyDrawer.caseData || { case_id: 'MH-BENCHMARK-600', project_name: 'TreeSHAP Benchmark Model' }}
        customPayload={whyDrawer.customPayload}
      />
    </div>
  );
}
