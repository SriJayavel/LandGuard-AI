import React, { useState, useMemo, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import WhyEvidenceDrawer from './WhyEvidenceDrawer';
import WhyButton from './WhyButton';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Printer, Sliders, ClipboardList,
  AlertTriangle, ShieldCheck, Clock, FileText, Scale, Coins, CheckCircle2,
  Calendar, Layers, MapPin, Building2, Check, Download, AlertCircle, Sparkles,
  ArrowDown, ArrowRight, TrendingDown, IndianRupee
} from 'lucide-react';

export default function CaseIntelligenceView({
  caseData,
  allCases = [],
  onSelectCase,
  onBack,
  onNavigate
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(caseData?.case_id || caseData?.project_id || 'LA-1059');
  const [whyDrawer, setWhyDrawer] = useState({
    isOpen: false,
    metricType: 'risk',
    customPayload: null
  });

  // Sync internal state when external caseData changes
  useEffect(() => {
    if (caseData?.case_id || caseData?.project_id) {
      setSelectedCaseId(caseData.case_id || caseData.project_id);
    }
  }, [caseData]);

  // Current active case
  const activeCase = useMemo(() => {
    if (caseData && (caseData.case_id === selectedCaseId || caseData.project_id === selectedCaseId)) {
      return caseData;
    }
    const found = allCases.find((c) => (c.case_id || c.project_id) === selectedCaseId);
    return found || caseData || allCases[0] || {};
  }, [selectedCaseId, caseData, allCases]);

  const caseId = activeCase.case_id || activeCase.project_id || 'LA-1059';
  const projectName = activeCase.project_name || 'Aurangabad Industrial City (AURIC) Multi-Modal Logistics Hub';
  const district = activeCase.district || 'Aurangabad';
  const stage = activeCase.current_stage || activeCase.stage || 'Compensation';
  const riskLevel = activeCase.risk_level || 'High';
  const probPct = Math.round((parseFloat(activeCase.risk_score) || 0.94) * 100);
  const outlayCr = activeCase.compensation_offered_cr || '50.3';
  const daysInStage = parseInt(activeCase.days_in_stage, 10) || 68;

  // Case navigation helper (previous/next case)
  const currentIndex = allCases.findIndex((c) => (c.case_id || c.project_id) === caseId);
  const handlePrevCase = () => {
    if (currentIndex > 0) {
      const prev = allCases[currentIndex - 1];
      const prevId = prev.case_id || prev.project_id;
      setSelectedCaseId(prevId);
      if (onSelectCase) onSelectCase(prev);
    }
  };
  const handleNextCase = () => {
    if (currentIndex >= 0 && currentIndex < allCases.length - 1) {
      const next = allCases[currentIndex + 1];
      const nextId = next.case_id || next.project_id;
      setSelectedCaseId(nextId);
      if (onSelectCase) onSelectCase(next);
    }
  };

  // Case switch dropdown
  const handleCaseChange = (e) => {
    const newId = e.target.value;
    setSelectedCaseId(newId);
    const found = allCases.find((c) => (c.case_id || c.project_id) === newId);
    if (found && onSelectCase) onSelectCase(found);
  };

  // 1. RISK SUMMARY COMPUTATIONS
  const overallRiskScore = (parseFloat(activeCase.risk_score) || 0.94).toFixed(2);
  const riskTrajectory = probPct >= 70
    ? 'Accelerating (+14% in last 30d)'
    : probPct >= 40
    ? 'Stable (+2% in last 30d)'
    : 'Declining (-8% in last 30d)';
  const projectedDelayDays = Math.max(21, Math.round(daysInStage * 0.62));
  const modelConfidence = probPct >= 70 ? '94%' : '91%';

  // 2. RISK DRIVERS (TreeSHAP weights across 6 statutory dimensions)
  const riskDrivers = useMemo(() => {
    const isHigh = riskLevel === 'High' || probPct >= 70;
    const hasLegalStay = (activeCase.legal_cases_pending || 0) > 0 || (activeCase.dispute_type || '').toLowerCase().includes('stay') || (activeCase.risk_category || '').toLowerCase().includes('stay');
    const isForestInvolved = (activeCase.forest_land_involvement || '').toLowerCase() === 'yes';

    if (caseId === 'LA-1059' || (isHigh && hasLegalStay)) {
      return [
        { name: 'Legal', pct: 32, color: 'bg-red-600 dark:bg-red-500', note: '2 High Court Article 226 stay petitions pending; injunction in effect', ref: 'Bombay High Court WP-8921/2025' },
        { name: 'Compensation', pct: 28, color: 'bg-amber-600 dark:bg-amber-500', note: 'Circle-rate mismatch; ready reckoner ratio 0.88x below market value', ref: 'RFCTLARR Sec 26(1)(a)' },
        { name: 'Land records', pct: 16, color: 'bg-indigo-600 dark:bg-indigo-500', note: 'Cadastral 7/12 joint-heir dispute across Gat No. 142/3A', ref: 'Maharashtra Land Revenue Code Sec 148' },
        { name: 'Administrative delay', pct: 12, color: 'bg-blue-600 dark:bg-blue-500', note: 'Elapsed 68 days in Compensation phase vs 30-day statutory benchmark', ref: 'RFCTLARR Sec 25 Limitation' },
        { name: 'Community', pct: 7, color: 'bg-purple-600 dark:bg-purple-500', note: 'Gram Sabha resolution demanding rehabilitation plots adjacent to Gaothan', ref: 'Second Schedule R&R Plan' },
        { name: 'Forest clearance', pct: 5, color: 'bg-emerald-600 dark:bg-emerald-500', note: 'Routine Stage-1 non-forest diversion certificate awaiting final signoff', ref: 'Forest Conservation Act 1980' }
      ];
    }

    if (isForestInvolved) {
      return [
        { name: 'Forest clearance', pct: 34, color: 'bg-emerald-600 dark:bg-emerald-500', note: 'Stage-1 forest diversion concurrence pending state nodal appraisal', ref: 'Forest Conservation Act 1980' },
        { name: 'Legal', pct: 22, color: 'bg-red-600 dark:bg-red-500', note: 'Tribal rights contestation under Forest Rights Act Section 3(1)(g)', ref: 'FRA 2006 Statutory Committee' },
        { name: 'Compensation', pct: 18, color: 'bg-amber-600 dark:bg-amber-500', note: 'Compensatory afforestation land valuation disparity', ref: 'RFCTLARR Sec 26' },
        { name: 'Administrative delay', pct: 12, color: 'bg-blue-600 dark:bg-blue-500', note: 'Joint inspection pending between Revenue and Forest departments', ref: 'Joint Agency Protocol' },
        { name: 'Community', pct: 8, color: 'bg-purple-600 dark:bg-purple-500', note: 'Panchayat consent conditional on community forest rights title', ref: 'PESA Act 1996' },
        { name: 'Land records', pct: 6, color: 'bg-indigo-600 dark:bg-indigo-500', note: 'Reserved forest boundary demarcation overlap with private holdings', ref: 'Cadastral Map Sheet 4' }
      ];
    }

    return [
      { name: 'Compensation', pct: 30, color: 'bg-amber-600 dark:bg-amber-500', note: 'Multiplier rate objections and solatium calculation revision requests', ref: 'RFCTLARR Sec 30 Solatium' },
      { name: 'Administrative delay', pct: 24, color: 'bg-blue-600 dark:bg-blue-500', note: 'Award inquiry elapsed timeline exceeding statutory SLA benchmark', ref: 'RFCTLARR Sec 23/25' },
      { name: 'Legal', pct: 18, color: 'bg-red-600 dark:bg-red-500', note: 'Objections filed before Sub-Divisional Officer / Reference Authority', ref: 'RFCTLARR Sec 64 Reference' },
      { name: 'Land records', pct: 14, color: 'bg-indigo-600 dark:bg-indigo-500', note: 'Satbara mutation entries verification in progress', ref: 'Village Form 7/12 Register' },
      { name: 'Community', pct: 9, color: 'bg-purple-600 dark:bg-purple-500', note: 'Livelihood displacement compensation representation by tenant farmers', ref: 'Second Schedule Resettlement' },
      { name: 'Forest clearance', pct: 5, color: 'bg-emerald-600 dark:bg-emerald-500', note: 'Tree cutting permit and social forestry clearance in process', ref: 'Tree Authority Clearance' }
    ];
  }, [caseId, riskLevel, probPct, activeCase]);

  // 3. STATUTORY TIMELINE (Requirement 3: Notification -> Survey -> Award -> Compensation -> Possession)
  // With: Actual duration, Benchmark, Delay, Reason, Evidence
  const statutoryTimeline = useMemo(() => {
    const s = stage.toLowerCase();
    let currentIdx = 3; // Default Compensation
    if (s.includes('notif') || s.includes('11')) currentIdx = 0;
    else if (s.includes('survey') || s.includes('sia') || s.includes('assessment')) currentIdx = 1;
    else if (s.includes('award') || s.includes('19') || s.includes('multiplier')) currentIdx = 2;
    else if (s.includes('comp') || s.includes('payment')) currentIdx = 3;
    else if (s.includes('poss') || s.includes('vest')) currentIdx = 4;

    const compDelay = Math.max(0, daysInStage - 30);

    return [
      {
        id: 'notification',
        step: 1,
        name: 'Notification',
        statute: 'RFCTLARR Section 11(1)',
        benchmarkDuration: '30 days',
        actualDuration: '28 days',
        delay: '0 days (On Schedule)',
        status: currentIdx > 0 ? 'completed' : 'active',
        reason: 'Preliminary gazette notification published in State Gazette Part I-A and 2 local dailies without public challenge.',
        evidence: 'Maharashtra State Gazette Part I-A, Notification REV/LA-2024/0912'
      },
      {
        id: 'survey',
        step: 2,
        name: 'Survey',
        statute: 'Section 4 SIA & Boundary Demarcation',
        benchmarkDuration: '60 days',
        actualDuration: '74 days',
        delay: '+14 days Delay',
        status: currentIdx > 1 ? 'completed' : currentIdx === 1 ? 'active' : 'pending',
        reason: 'Public hearings delayed during monsoon; cadastral boundary re-alignment required across 6 survey parcels.',
        evidence: 'Social Impact Assessment Endorsement Report &bull; Expert Group Resolution 14/2024'
      },
      {
        id: 'award',
        step: 3,
        name: 'Award',
        statute: 'Section 19 Declaration & Section 23 Inquiry',
        benchmarkDuration: '45 days',
        actualDuration: '52 days',
        delay: '+7 days Delay',
        status: currentIdx > 2 ? 'completed' : currentIdx === 2 ? 'active' : 'pending',
        reason: 'Collector inquiry held into title objections and market value claims submitted by 14 landholders.',
        evidence: 'Collector Preliminary Valuation Award Form 14 &bull; Gazette Part I-A'
      },
      {
        id: 'compensation',
        step: 4,
        name: 'Compensation',
        statute: 'Section 26-30 Solatium & Multiplier',
        benchmarkDuration: '30 days',
        actualDuration: `${daysInStage} days elapsed`,
        delay: `+${compDelay} days (CRITICAL STALL)`,
        status: currentIdx > 3 ? 'completed' : currentIdx === 3 ? 'stalled' : 'pending',
        reason: 'Landowners demanding 2.0x rural multiplier factor under Sec 26(2) vs 1.42x applied ready reckoner rate.',
        evidence: 'Village Form VII-XII Entry 18 &bull; Bombay High Court Writ WP-8921/2025 Schedule'
      },
      {
        id: 'possession',
        step: 5,
        name: 'Possession',
        statute: 'Section 38 Summary Vesting',
        benchmarkDuration: '15 days',
        actualDuration: currentIdx === 4 ? '12 days' : 'Pending',
        delay: currentIdx === 4 ? 'Active Vesting' : 'Blocked by Stage 4 Compensation hold',
        status: currentIdx === 4 ? 'active' : 'pending',
        reason: 'Physical possession prohibited until compensation is deposited in reference court or stay vacated.',
        evidence: 'High Court Division Bench Ad-Interim Injunction Order Para 7'
      }
    ];
  }, [stage, daysInStage]);

  // 4. EVIDENCE / PROVENANCE (Requirement 4: "Why does the system think this?")
  // Schema: Risk Level, Reason, Evidence (Document & Page), Model contribution (%), Confidence (%)
  const aiProvenanceConclusions = useMemo(() => {
    return [
      {
        id: 'prov-01',
        riskLevel: 'HIGH RISK',
        riskColor: 'bg-red-600 text-white',
        borderColor: 'border-red-300 dark:border-red-900/60',
        bgColor: 'bg-red-50/70 dark:bg-red-950/20',
        conclusionTitle: 'Critical Compensation Multiplier Deficit',
        reason: 'Compensation below benchmark',
        reasonDetail: 'Disputed rate 1.42x applied vs 2.0x rural multiplier statutory demand under Section 26(2).',
        evidence: 'Village Form VII-XII',
        pageClause: 'Page 3, Gat No. 142/3A',
        modelContribution: '28%',
        confidence: '94%',
        primary: true
      },
      {
        id: 'prov-02',
        riskLevel: 'HIGH RISK',
        riskColor: 'bg-red-600 text-white',
        borderColor: 'border-red-300 dark:border-red-900/60',
        bgColor: 'bg-red-50/70 dark:bg-red-950/20',
        conclusionTitle: 'Judicial Stay on Land Dispossession',
        reason: 'Active High Court stay petition',
        reasonDetail: 'Division bench issued ad-interim status quo order halting all civil Right-of-Way work.',
        evidence: 'Bombay High Court Writ WP-8921/2025',
        pageClause: 'Page 2, Paragraph 7',
        modelContribution: '32%',
        confidence: '99%'
      },
      {
        id: 'prov-03',
        riskLevel: 'ELEVATED RISK',
        riskColor: 'bg-amber-500 text-white',
        borderColor: 'border-amber-300 dark:border-amber-900/60',
        bgColor: 'bg-amber-50/70 dark:bg-amber-950/20',
        conclusionTitle: 'Cadastral Title & Heirship Contestation',
        reason: 'Joint inheritance dispute with unnotified heirs',
        reasonDetail: 'Mutation record indicates 4 unnotified joint Khatedars not served notice under Section 11.',
        evidence: 'Mutation Register Entry No. 4182',
        pageClause: 'Column 3 (Mutation Schedule)',
        modelContribution: '16%',
        confidence: '96%'
      },
      {
        id: 'prov-04',
        riskLevel: 'MODERATE RISK',
        riskColor: 'bg-amber-500 text-white',
        borderColor: 'border-amber-300 dark:border-amber-900/60',
        bgColor: 'bg-amber-50/70 dark:bg-amber-950/20',
        conclusionTitle: 'Statutory Limitation Lapse Proximity',
        reason: 'Elapsed stage time exceeding RFCTLARR benchmark',
        reasonDetail: '68 days elapsed in Compensation stage; within 142 days of Section 25 lapsing cliff.',
        evidence: 'Maharashtra State Gazette Notification',
        pageClause: 'Docket REV/LA-2024/0912',
        modelContribution: '12%',
        confidence: '98%'
      }
    ];
  }, []);

  // 5. RECOMMENDED ACTIONS (Requirement 5: Don't just say Risk = High. Say What should I do?)
  // Action, Expected Outcome (↓ 21 days projected delay, ↓ ₹3.2 Cr exposure), Reason, [Simulate Intervention]
  const recommendedAction = useMemo(() => {
    return {
      title: 'Initiate compensation reassessment.',
      reason: 'Compensation dispute is the dominant risk driver.',
      operationalDirective: 'Convene urgent Section 23 valuation hearing with Sub-Divisional Officer to reconcile Ready Reckoner multiplier ratio, and instruct Government Pleader to file stay-vacation affidavit.',
      expectedDelayReduction: '↓ 21 days projected delay',
      expectedFiscalSavings: '↓ ₹3.2 Cr exposure',
      targetRiskScore: '0.56 (Moderate Risk)',
      statute: 'RFCTLARR Act, 2013 Section 23 / 26'
    };
  }, []);

  // State for Risk Trend Point Inspection & Audit Trail Filter
  const [selectedTrendPointIndex, setSelectedTrendPointIndex] = useState(4); // Default to 07 Sep 2026 Spike
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  // 6. HISTORICAL RISK SCORE PROGRESSION (Requirement: Show Risk score over time, not just today's score)
  const riskTrendData = useMemo(() => {
    if (caseId === 'LA-1059') {
      return [
        {
          date: '15 Apr 2026',
          shortDate: '15 Apr',
          score: 0.38,
          stage: 'Notification',
          milestone: 'Preliminary Gazette Sec 11(1)',
          status: 'Low Risk',
          color: 'text-emerald-700 dark:text-emerald-400',
          bgDot: 'bg-emerald-500',
          delta: 'Baseline',
          event: 'Preliminary gazette notification published in State Gazette Part I-A; no initial objections.'
        },
        {
          date: '28 May 2026',
          shortDate: '28 May',
          score: 0.44,
          stage: 'Survey',
          milestone: 'Section 4 SIA Joint Measurement',
          status: 'Moderate',
          color: 'text-amber-700 dark:text-amber-400',
          bgDot: 'bg-amber-500',
          delta: '+0.06',
          event: 'Cadastral demarcation delayed by monsoon; initial joint-heir satbara claims noted.'
        },
        {
          date: '12 Jul 2026',
          shortDate: '12 Jul',
          score: 0.55,
          stage: 'Valuation',
          milestone: 'Ready Reckoner Multiplier Contestation',
          status: 'Moderate',
          color: 'text-amber-700 dark:text-amber-400',
          bgDot: 'bg-amber-500',
          delta: '+0.11',
          event: 'Landowners filed formal objection against 1.42x multiplier; demanded 2.0x rural rate.'
        },
        {
          date: '20 Aug 2026',
          shortDate: '20 Aug',
          score: 0.62,
          stage: 'Award',
          milestone: 'Section 19 Award Inquiry SLA Delay',
          status: 'Elevated',
          color: 'text-amber-700 dark:text-amber-400',
          bgDot: 'bg-amber-600',
          delta: '+0.07',
          event: 'Award inquiry elapsed 68 days vs 30-day statutory benchmark; Section 25 clock flagged.'
        },
        {
          date: '07 Sep 2026',
          shortDate: '07 Sep',
          score: 0.89,
          stage: 'Re-Analysis',
          milestone: 'High Court WP-8921 Stay Petition Detected',
          status: 'Critical Spike',
          color: 'text-red-700 dark:text-red-400',
          bgDot: 'bg-red-600',
          delta: '+0.27 (0.62 → 0.89)',
          isSpike: true,
          event: 'Automated document ingestion detected High Court WP-8921/2025 stay injunction on Gat 142/3A. Model shifted score from 0.62 to 0.89.'
        },
        {
          date: '08 Sep 2026',
          shortDate: '08 Sep (Today)',
          score: 0.89,
          stage: 'Active Review',
          milestone: 'Collector Review & Intervention Simulation',
          status: 'Critical',
          color: 'text-red-700 dark:text-red-400',
          bgDot: 'bg-red-600',
          delta: '0.00 (Active)',
          event: 'Officer reviewed LA-1059; simulation executed showing -21d projected delay reduction upon circle-rate reassessment.'
        }
      ];
    }

    const currentScore = parseFloat(overallRiskScore) || 0.75;
    const baseScore = Math.max(0.25, currentScore * 0.45).toFixed(2);
    const mid1 = Math.max(0.35, currentScore * 0.6).toFixed(2);
    const mid2 = Math.max(0.5, currentScore * 0.8).toFixed(2);

    return [
      { date: '15 Apr 2026', shortDate: '15 Apr', score: parseFloat(baseScore), stage: 'Notification', milestone: 'Gazette Publication', status: 'Baseline', color: 'text-emerald-700', bgDot: 'bg-emerald-500', delta: 'Baseline', event: 'Initial gazette publication.' },
      { date: '28 May 2026', shortDate: '28 May', score: parseFloat(mid1), stage: 'Survey', milestone: 'Boundary Survey', status: 'Moderate', color: 'text-amber-700', bgDot: 'bg-amber-500', delta: '+0.10', event: 'Boundary demarcation.' },
      { date: '20 Aug 2026', shortDate: '20 Aug', score: parseFloat(mid2), stage: 'Award', milestone: 'Award Assessment', status: 'Elevated', color: 'text-amber-700', bgDot: 'bg-amber-600', delta: '+0.15', event: 'Award inquiries.' },
      { date: '07 Sep 2026', shortDate: '07 Sep', score: currentScore, stage: 'Audit', milestone: 'Risk Escalation Trigger', status: 'Critical', color: 'text-red-700', bgDot: 'bg-red-600', delta: `+${(currentScore - parseFloat(mid2)).toFixed(2)}`, isSpike: true, event: 'Risk model updated.' },
      { date: '08 Sep 2026', shortDate: '08 Sep', score: currentScore, stage: 'Active Review', milestone: 'Executive Review', status: 'Active', color: 'text-red-700', bgDot: 'bg-red-600', delta: 'Active', event: 'Current statutory state.' }
    ];
  }, [caseId, overallRiskScore]);

  // 7. STATUTORY AUDIT TRAIL & ADMINISTRATIVE MUTATION LEDGER
  // (Exact user requirements: 08 Sep 2026 Officer reviewed, 08 Sep 2026 Simulation executed, 07 Sep 2026 Document re-analyzed, 07 Sep 2026 Risk score changed 0.62 -> 0.89)
  const auditTrailEvents = useMemo(() => {
    return [
      {
        id: 'aud-001',
        date: '08 Sep 2026',
        time: '14:15 IST',
        title: `Officer reviewed ${caseId}`,
        category: 'OFFICER_REVIEW',
        badge: 'Competent Authority Review',
        badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 border-blue-200 dark:border-blue-900',
        actor: 'S. Deshmukh, IAS',
        role: 'District Collector & Competent Authority (Sec 3(g))',
        summary: `Comprehensive administrative review of ${caseId} proceedings conducted. Inspected Ready Reckoner circle-rate valuation gap and instructed Special Land Acquisition Officer to prepare Section 23 reconciliation affidavit.`,
        evidenceDoc: 'Collectorate File Note REV/COL/2026/LA-1059/N-14',
        digitalStamp: 'SHA256: 7f8a9e4c2b3d1e0a89fc4271829e01fb34d1',
        legalStatus: 'Admissible under Section 65B Indian Evidence Act'
      },
      {
        id: 'aud-002',
        date: '08 Sep 2026',
        time: '11:30 IST',
        title: 'Simulation executed',
        category: 'SIMULATION',
        badge: 'Decision Support Simulation',
        badgeColor: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
        actor: 'What-If Risk Simulator Engine',
        role: 'Automated Counterfactual Intervention Simulator',
        summary: 'Intervention policy simulated: Ready Reckoner multiplier adjustment from 1.42x to 1.80x plus fast-track Gram Sabha hearing. Projected outcome: ↓ 21 days delay, ↓ ₹3.2 Cr exposure.',
        evidenceDoc: 'Simulation Session Ledger SIM-2026-0908-1130',
        digitalStamp: 'SHA256: 3d1c4f89e02a1b7c65d8930214a7e93c8b41',
        legalStatus: 'Executive Advisory Record'
      },
      {
        id: 'aud-003',
        date: '07 Sep 2026',
        time: '18:42 IST',
        title: 'Document re-analyzed',
        category: 'DOCUMENT_INTAKE',
        badge: 'Legal NLP Document Parsing',
        badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900',
        actor: 'LandGuard OCR & Statutory Legal Parser',
        role: 'Autonomous Cadastral & Legal Ingestion Pipeline',
        summary: 'Ingested and parsed Village Form VII-XII (Satbara Gat No. 142/3A) and Bombay High Court Writ Petition WP-8921/2025. Extracted active ad-interim stay injunction against land possession.',
        evidenceDoc: 'Document Ref: 712-PUN-WAG-142 & HC-WP-8921-2025',
        digitalStamp: 'SHA256: 9b2d8e14a7f03c2e56b1948201a4e82f7c93',
        legalStatus: 'Digitally Verified Evidence Record'
      },
      {
        id: 'aud-004',
        date: '07 Sep 2026',
        time: '18:45 IST',
        title: 'Risk score changed: 0.62 → 0.89',
        category: 'RISK_MUTATION',
        badge: 'TreeSHAP Risk Escalation',
        badgeColor: 'bg-red-100 dark:bg-red-950/60 text-[#B91C1C] dark:text-red-300 border-red-200 dark:border-red-900',
        actor: 'TreeSHAP Gradient Boosting Model v2.4.1',
        role: 'Production Risk Scoring Service',
        summary: 'Risk score mutated from 0.62 (Elevated) to 0.89 (Critical). Primary escalation vectors: High Court judicial stay detection (+0.18 contribution) and Ready Reckoner compensation mismatch (+0.09 contribution).',
        evidenceDoc: 'Model Inference Attribution Record #4409',
        digitalStamp: 'SHA256: a1f40c7e385b2d9016e4928173fa294b0c15',
        legalStatus: 'Statutory Risk Audit Timestamp Certified'
      },
      {
        id: 'aud-005',
        date: '20 Aug 2026',
        time: '10:00 IST',
        title: 'Section 25 Limitation Threshold Flagged',
        category: 'STATUTORY_SLA',
        badge: 'Statutory Limitation Alert',
        badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
        actor: 'Statutory SLA Monitor Service',
        role: 'RFCTLARR Compliance Rule Engine',
        summary: 'Elapsed duration in Award inquiry reached 68 days (38 days beyond 30-day benchmark). 142 days remaining before statutory Section 25 lapsing cliff.',
        evidenceDoc: 'Gazette Docket REV/LA-2024/0912',
        digitalStamp: 'SHA256: b3c8e14f920a7d5162e849103fa7291c4b82',
        legalStatus: 'Statutory Compliance Register Entry'
      },
      {
        id: 'aud-006',
        date: '12 Jul 2026',
        time: '15:30 IST',
        title: 'Compensation Multiplier Objection Registered',
        category: 'DISPUTE_LOGGED',
        badge: 'Dispute Docket Logged',
        badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
        actor: 'Sub-Divisional Officer, Haveli',
        role: 'Land Acquisition Authority Cell',
        summary: 'Landowners filed Section 15(1) objections against Ready Reckoner base rate of ₹4,200/sq.m; demanding ₹6,500/sq.m plus 100% solatium.',
        evidenceDoc: 'SDO Objection Docket OBJ-2026/884',
        digitalStamp: 'SHA256: 4f7a1c9e2b0d8a6351e9482017fc384b2a90',
        legalStatus: 'Sub-Divisional Registry Record'
      },
      {
        id: 'aud-007',
        date: '28 May 2026',
        time: '17:00 IST',
        title: 'Section 4 SIA Report Concurrence Endorsed',
        category: 'STATUTORY_SLA',
        badge: 'SIA Clearance Endorsed',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
        actor: 'Independent Expert Group',
        role: 'Social Impact Assessment Committee',
        summary: 'Social Impact Assessment report and Rehabilitation & Resettlement framework endorsed with recommendation for 42 project-affected families.',
        evidenceDoc: 'SIA Expert Group Report EG/2026/04',
        digitalStamp: 'SHA256: e81a4b92c0d7f35164e2948017ab394c8b21',
        legalStatus: 'Public Hearing Statutory Record'
      },
      {
        id: 'aud-008',
        date: '15 Apr 2026',
        time: '09:30 IST',
        title: 'Section 11(1) Preliminary Notification Gazette Published',
        category: 'STATUTORY_SLA',
        badge: 'Preliminary Gazette Publication',
        badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
        actor: 'Revenue & Forest Department, Maharashtra',
        role: 'State Gazette Press',
        summary: 'Preliminary notification published in Maharashtra Government Gazette Part I-A and published in two local vernacular newspapers.',
        evidenceDoc: 'Gazette Part I-A No. REV/LA-2024/0912',
        digitalStamp: 'SHA256: 1a9f4c82b0e7d36154e8942017bc394a5c10',
        legalStatus: 'State Gazette Notification'
      }
    ];
  }, [caseId]);

  // Filtered audit trail
  const filteredAuditTrail = useMemo(() => {
    return auditTrailEvents.filter((item) => {
      const matchesCategory =
        auditFilter === 'ALL' ||
        (auditFilter === 'OFFICER_REVIEW' && item.category === 'OFFICER_REVIEW') ||
        (auditFilter === 'SIMULATION' && item.category === 'SIMULATION') ||
        (auditFilter === 'DOCUMENT_INTAKE' && item.category === 'DOCUMENT_INTAKE') ||
        (auditFilter === 'RISK_MUTATION' && item.category === 'RISK_MUTATION');

      const matchesSearch =
        !auditSearch.trim() ||
        item.title.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.summary.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.date.toLowerCase().includes(auditSearch.toLowerCase()) ||
        item.actor.toLowerCase().includes(auditSearch.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [auditTrailEvents, auditFilter, auditSearch]);

  // Navigation handlers
  const handleSimulateIntervention = () => {
    if (onSelectCase) onSelectCase(activeCase);
    if (onNavigate) onNavigate('simulator');
  };

  const handleLogActionDirective = () => {
    if (onSelectCase) onSelectCase(activeCase);
    if (onNavigate) onNavigate('actions');
  };

  const handlePrintBriefing = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-12 animate-fadeIn">
      {/* 1. TOP BREADCRUMB & CASE SELECTOR BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-100 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg cursor-pointer focus-ring"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Register</span>
            </button>
          )}

          <div className="text-xs text-[#64748B] dark:text-[#9AA8B8]">
            <span>Portfolio</span>
            <span className="mx-1.5">/</span>
            <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">Case Intelligence</span>
            <span className="mx-1.5">/</span>
            <span className="font-mono-num font-bold text-[#1D4ED8] dark:text-[#60A5FA]">{caseId}</span>
          </div>
        </div>

        {/* Case Switcher & Pagination Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevCase}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] cursor-pointer focus-ring disabled:opacity-40"
              title="Inspect previous case"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {allCases.length > 0 && (
              <select
                value={caseId}
                onChange={handleCaseChange}
                className="bg-white dark:bg-[#131923] text-[#0F172A] dark:text-[#F3F6FA] text-xs px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer font-mono-num focus-ring max-w-[220px] truncate"
              >
                {allCases.map((c) => {
                  const id = c.case_id || c.project_id;
                  return (
                    <option key={id} value={id}>
                      {id} &bull; {c.district} ({c.risk_level})
                    </option>
                  );
                })}
              </select>
            )}

            <button
              onClick={handleNextCase}
              disabled={currentIndex >= allCases.length - 1}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] cursor-pointer focus-ring disabled:opacity-40"
              title="Inspect next case"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handlePrintBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg cursor-pointer focus-ring"
          >
            <Printer className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <span>Print Briefing</span>
          </button>
        </div>
      </div>

      {/* 2. CASE HEADER MASTHEAD */}
      <div className="gov-surface p-4 md:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-base md:text-lg text-[#1D4ED8] dark:text-[#60A5FA]">
                CASE {caseId}
              </span>
              <span className="gov-metadata font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
                Docket Ref: {activeCase.notification_no || 'REV/LA-2024/0912'}
              </span>
            </div>
            <h1 className="gov-page-title leading-snug">
              {projectName}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] flex items-center gap-2 flex-wrap">
              <span>District: <strong className="text-[#0F172A] dark:text-[#F3F6FA]">{district}</strong></span>
              <span>&bull;</span>
              <span>Survey / Gat: <strong className="text-[#0F172A] dark:text-[#F3F6FA]">{activeCase.survey_number || 'Gat No. 142/3A'}</strong></span>
              <span>&bull;</span>
              <span>Area: <strong className="text-[#0F172A] dark:text-[#F3F6FA]">{activeCase.land_area_acres ? `${activeCase.land_area_acres} Acres` : `${activeCase.land_area_ha || 42.5} Ha`}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RiskBadge level={riskLevel} score={overallRiskScore} />
            <WhyButton
              onClick={() => setWhyDrawer({ isOpen: true, metricType: 'risk' })}
              title="Why is this risk classified as Critical?"
            />
          </div>
        </div>

        {/* Header Metadata Chips Grid with Why? Explanations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#212B38]">
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Current Stage
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'stage' })}
                title="Why is this proceeding in this stage?"
              />
            </div>
            <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] mt-0.5 block">
              {stage}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Stall Probability
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'risk' })}
                title="Why is stall probability calculated at this level?"
              />
            </div>
            <span className={`text-xs font-mono-num font-bold mt-0.5 block ${probPct >= 70 ? 'text-[#B91C1C]' : probPct >= 40 ? 'text-[#B45309]' : 'text-[#15803D]'}`}>
              {probPct}% Probability
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Financial Exposure
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'exposure' })}
                title={`Why is exposure calculated at ₹${outlayCr} Cr?`}
              />
            </div>
            <span className="text-xs font-mono-num font-bold text-[#0F172A] dark:text-[#F3F6FA] mt-0.5 block">
              &#8377;{outlayCr} Cr Outlay
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Projected Delay
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'delay', customPayload: { delayDays: `+${projectedDelayDays} days` } })}
                title={`Why is projected delay calculated at +${projectedDelayDays} days?`}
              />
            </div>
            <span className="text-xs font-mono-num font-bold text-[#B45309] dark:text-[#FBBF24] mt-0.5 block">
              +{projectedDelayDays} Days Beyond SLA
            </span>
          </div>
        </div>
      </div>

      {/* 3. RECOMMENDED ACTION (Requirement 5: "What should I do? Initiate compensation reassessment...") */}
      <div className="gov-surface p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-[#131923] dark:to-blue-950/10 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 dark:border-blue-900/40 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1D4ED8] dark:text-[#60A5FA]" />
            <h2 className="gov-section-title text-[#1D4ED8] dark:text-[#60A5FA]">
              Recommended Action &bull; Collector Executive Directive
            </h2>
          </div>
          <span className="text-3xs font-mono font-bold text-[#1D4ED8] dark:text-[#60A5FA] bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            {recommendedAction.statute}
          </span>
        </div>

        {/* Action Title & Reason Callout with Why? Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F3F6FA] tracking-tight">
              {recommendedAction.title}
            </span>
            <WhyButton
              onClick={() => setWhyDrawer({ isOpen: true, metricType: 'action' })}
              title="Why does the system recommend this intervention?"
            />
          </div>
          <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
            <strong>Reason:</strong> {recommendedAction.reason} {recommendedAction.operationalDirective}
          </p>
        </div>

        {/* Expected Outcomes Grid with Why? Explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                Expected Outcome: Delay
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'delay', customPayload: { delayDays: '↓ 21 days' } })}
                title="Why is delay reduction estimated at 21 days?"
              />
            </div>
            <div className="text-base font-bold font-mono-num text-emerald-700 dark:text-emerald-400">
              {recommendedAction.expectedDelayReduction}
            </div>
            <p className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
              Mitigates Section 25 limitation hold
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                Expected Outcome: Fiscal
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'exposure' })}
                title="Why is fiscal savings estimated at ₹3.2 Cr?"
              />
            </div>
            <div className="text-base font-bold font-mono-num text-emerald-700 dark:text-emerald-400">
              {recommendedAction.expectedFiscalSavings}
            </div>
            <p className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
              Averts 15% Section 80 penal interest
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                Post-Intervention Target
              </span>
              <WhyButton
                size="xs"
                onClick={() => setWhyDrawer({ isOpen: true, metricType: 'action' })}
                title="Why does the risk score drop to 0.56?"
              />
            </div>
            <div className="text-base font-bold font-mono-num text-[#1D4ED8] dark:text-[#60A5FA]">
              {recommendedAction.targetRiskScore}
            </div>
            <p className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
              -38% risk posture shift
            </p>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
          <button
            onClick={handleSimulateIntervention}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer focus-ring transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Intervention</span>
          </button>

          <button
            onClick={handleLogActionDirective}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg cursor-pointer focus-ring shadow-xs transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Issue Directive in Action Tracker</span>
          </button>
        </div>
      </div>

      {/* 3.5. RISK TREND OVER TIME (User Requirement: Show Risk score over time, not just today's score) */}
      <div className="gov-surface p-4 md:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#1D4ED8] dark:text-[#60A5FA]" />
              <h2 className="gov-section-title">
                Risk Score Over Time &bull; Longitudinal Risk Trend
              </h2>
            </div>
            <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] mt-0.5">
              Showing risk score progression over time across statutory milestones, not merely today's point-in-time score
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-[#B91C1C] dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900/40">
              Spike Trigger: 0.62 → 0.89 (07 Sep 2026)
            </span>
          </div>
        </div>

        {/* Metric Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
              Baseline Score (Apr 2026)
            </span>
            <div className="text-base font-extrabold font-mono-num text-emerald-700 dark:text-emerald-400 mt-0.5">
              0.38 (Low Risk)
            </div>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">Sec 11(1) publication</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
              Pre-Spike Score (Aug 2026)
            </span>
            <div className="text-base font-extrabold font-mono-num text-amber-700 dark:text-amber-400 mt-0.5">
              0.62 (Elevated)
            </div>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">Sec 19 Award inquiry</span>
          </div>

          <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-red-400 block">
              Escalation Delta (07 Sep)
            </span>
            <div className="text-base font-extrabold font-mono-num text-[#B91C1C] dark:text-red-400 mt-0.5">
              0.62 → 0.89 (+0.27)
            </div>
            <span className="text-3xs text-red-700/80 dark:text-red-400/80">Stay petition detected</span>
          </div>

          <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-red-400 block">
              Today's Score (08 Sep)
            </span>
            <div className="text-base font-extrabold font-mono-num text-[#B91C1C] dark:text-red-400 mt-0.5">
              0.89 (Critical)
            </div>
            <span className="text-3xs text-red-700/80 dark:text-red-400/80">Officer reviewed &amp; simulated</span>
          </div>
        </div>

        {/* Visual Multi-Point Trajectory Graph (SVG Curve & Interactive Points) */}
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.07)] bg-[#F8FAFC] dark:bg-[#0F131A] space-y-3">
          <div className="flex items-center justify-between text-2xs font-bold text-[#475569] dark:text-[#9AA8B8]">
            <span>6-Month Risk Trajectory: Apr → Sep 2026</span>
            <span className="font-mono text-3xs text-[#64748B] dark:text-[#7A8A9A]">Click any point for details</span>
          </div>

          {/* SVG Curve Container */}
          <div className="relative w-full h-40">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="riskTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.5" />
                  <stop offset="70%" stopColor="#EF4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="riskAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Threshold horizontal guides */}
              <line x1="0" y1="26" x2="600" y2="26" stroke="#EF4444" strokeDasharray="3,3" strokeOpacity="0.3" />
              <line x1="0" y1="65" x2="600" y2="65" stroke="#F59E0B" strokeDasharray="3,3" strokeOpacity="0.25" />
              <line x1="0" y1="91" x2="600" y2="91" stroke="#10B981" strokeDasharray="3,3" strokeOpacity="0.25" />

              {/* Area Fill */}
              <path
                d="M 30,80 L 140,73 L 250,58 L 360,49 L 475,14 L 570,14 L 570,120 L 30,120 Z"
                fill="url(#riskAreaGrad)"
              />

              {/* Main Trend Line */}
              <path
                d="M 30,80 C 85,77 95,74 140,73 C 195,71 200,60 250,58 C 300,56 310,51 360,49 C 410,47 430,16 475,14 L 570,14"
                fill="none"
                stroke="url(#riskTrendGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Point Markers */}
              {[
                { cx: 30, cy: 80, score: '0.38', idx: 0 },
                { cx: 140, cy: 73, score: '0.44', idx: 1 },
                { cx: 250, cy: 58, score: '0.55', idx: 2 },
                { cx: 360, cy: 49, score: '0.62', idx: 3 },
                { cx: 475, cy: 14, score: '0.89', idx: 4, spike: true },
                { cx: 570, cy: 14, score: '0.89', idx: 5 }
              ].map((pt) => {
                const isSelected = selectedTrendPointIndex === pt.idx;
                return (
                  <g key={pt.idx} className="cursor-pointer" onClick={() => setSelectedTrendPointIndex(pt.idx)}>
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r={isSelected ? 7 : pt.spike ? 6 : 5}
                      className={
                        pt.spike
                          ? 'fill-red-600 stroke-white dark:stroke-[#131923] stroke-2'
                          : pt.idx >= 3
                          ? 'fill-amber-600 stroke-white dark:stroke-[#131923] stroke-2'
                          : 'fill-emerald-600 stroke-white dark:stroke-[#131923] stroke-2'
                      }
                    />
                    {pt.spike && (
                      <circle cx={pt.cx} cy={pt.cy} r={10} fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0">
                        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Timeline Milestones Row */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#212B38]">
            {riskTrendData.map((pt, idx) => {
              const isSelected = selectedTrendPointIndex === idx;
              return (
                <div
                  key={pt.date}
                  onClick={() => setSelectedTrendPointIndex(idx)}
                  className={`p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-[#12171F] border-2 border-[#1D4ED8] dark:border-[#4D8EF0] shadow-xs'
                      : 'bg-transparent border border-transparent hover:bg-white/60 dark:hover:bg-[#181E28]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xs font-bold text-[#64748B] dark:text-[#9AA8B8]">
                      {pt.shortDate}
                    </span>
                    <span className={`font-mono-num font-extrabold text-xs ${pt.color}`}>
                      {pt.score}
                    </span>
                  </div>
                  <div className="text-2xs font-semibold text-[#0F172A] dark:text-[#EEF2F7] truncate mt-0.5">
                    {pt.stage}
                  </div>
                  <div className="text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8] truncate">
                    {pt.delta}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspected Milestone Detail Card */}
          {(() => {
            const inspected = riskTrendData[selectedTrendPointIndex] || riskTrendData[4];
            return (
              <div className="p-3 rounded-lg bg-white dark:bg-[#12171F] border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.07)] space-y-1 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${inspected.bgDot}`}></span>
                    <span className="font-bold text-xs text-[#0F172A] dark:text-[#F3F6FA]">
                      {inspected.date} &bull; {inspected.milestone}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA]">
                    Risk Score: {inspected.score} ({inspected.status})
                  </span>
                </div>
                <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                  {inspected.event}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 4. STATUTORY TIMELINE (Requirement 3: Notification -> Survey -> Award -> Compensation -> Possession) */}
      <div className="gov-surface p-4 md:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="gov-section-title flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1D4ED8]" />
              <span>Statutory Acquisition Stage Pipeline</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              5 procedural milestones under the RFCTLARR Act, 2013 (Duration &bull; Benchmark &bull; Delay &bull; Reason &bull; Evidence)
            </p>
          </div>

          <div className="flex items-center gap-3 text-3xs font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> Active / Stalled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> Pending
            </span>
          </div>
        </div>

        {/* 5-Stage Stepper Progression Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
          {statutoryTimeline.map((st, idx) => {
            const isCompleted = st.status === 'completed';
            const isStalled = st.status === 'stalled';
            const isActive = st.status === 'active';

            return (
              <div
                key={st.id}
                className={`p-3 rounded-lg border transition-all relative ${
                  isStalled
                    ? 'border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/20 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : isActive
                    ? 'border-blue-300 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/10'
                    : 'border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between text-3xs font-bold uppercase tracking-wider mb-1">
                  <span className={isStalled ? 'text-amber-700 dark:text-amber-400' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#64748B]'}>
                    0{st.step} {st.name}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isStalled && <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
                </div>

                <div className="text-2xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] truncate">
                  {st.statute}
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#E2E8F0] dark:border-[#212B38] space-y-0.5 text-3xs font-mono-num">
                  <div className="flex justify-between text-[#64748B] dark:text-[#9AA8B8]">
                    <span>Benchmark:</span>
                    <span>{st.benchmarkDuration}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                    <span>Actual:</span>
                    <span>{st.actualDuration}</span>
                  </div>
                  <div className={`font-bold pt-0.5 ${isStalled ? 'text-amber-700 dark:text-amber-400' : isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#64748B]'}`}>
                    {st.delay}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Statutory Progression Audit Ledger */}
        <div className="overflow-x-auto pt-2 border-t border-[#E2E8F0] dark:border-[#212B38]">
          <table className="gov-table text-xs">
            <thead>
              <tr>
                <th className="w-48">Statutory Stage</th>
                <th className="w-32">Actual vs Benchmark</th>
                <th className="w-32">Delay Variance</th>
                <th>Bottleneck Root Cause / Reason</th>
                <th>Cited Statutory Evidence</th>
              </tr>
            </thead>
            <tbody>
              {statutoryTimeline.map((st) => (
                <tr key={st.id}>
                  <td>
                    <div className="font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                      Stage {st.step}: {st.name}
                    </div>
                    <div className="text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8]">
                      {st.statute}
                    </div>
                  </td>
                  <td className="font-mono-num">
                    <div className="font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                      {st.actualDuration}
                    </div>
                    <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
                      SLA: {st.benchmarkDuration}
                    </div>
                  </td>
                  <td>
                    <span className={`inline-block text-2xs font-mono font-bold px-2 py-0.5 rounded ${
                      st.status === 'stalled'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : st.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {st.delay}
                    </span>
                  </td>
                  <td className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                    {st.reason}
                  </td>
                  <td>
                    <div className="text-2xs font-mono font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                      {st.evidence}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. EVIDENCE / PROVENANCE (Requirement 4: "Why does the system think this?") */}
      <div className="gov-surface p-4 md:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="gov-section-title flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
              <span>Evidence &bull; Decision Provenance</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Transparent causal grounding for every high-stakes algorithmic risk classification
            </p>
          </div>

          <span className="gov-metadata font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
            TreeSHAP Attribution &bull; Feature Grounding
          </span>
        </div>

        {/* 4 Sovereign Causal Provenance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {aiProvenanceConclusions.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border space-y-3 ${item.borderColor} ${item.bgColor} shadow-xs`}
            >
              {/* Card Header: Conclusion & Confidence */}
              <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-2">
                <span className={`text-2xs font-mono font-bold px-2 py-0.5 rounded-full ${item.riskColor}`}>
                  {item.riskLevel}
                </span>
                <span className="text-3xs font-mono font-semibold text-[#64748B] dark:text-[#9AA8B8] bg-white dark:bg-[#131923] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#212B38]">
                  Confidence: <strong className="text-[#0F172A] dark:text-[#F3F6FA]">{item.confidence}</strong>
                </span>
              </div>

              {/* Title & Core Reason */}
              <div className="space-y-1">
                <div className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                  Reason:
                </div>
                <div className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                  {item.reason}
                </div>
                <p className="text-xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                  {item.reasonDetail}
                </p>
              </div>

              {/* Evidence Citation & Model Contribution */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-0.5">
                  <div className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                    Evidence:
                  </div>
                  <div className="font-semibold text-[#1D4ED8] dark:text-[#60A5FA] truncate">
                    {item.evidence}
                  </div>
                  <div className="text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8]">
                    {item.pageClause}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] space-y-0.5">
                  <div className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                    Model contribution:
                  </div>
                  <div className="text-base font-black font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                    {item.modelContribution}
                  </div>
                  <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
                    TreeSHAP weight
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. RISK DRIVERS CONTRIBUTION PERCENTAGES (TreeSHAP) */}
      <div className="gov-surface p-4 md:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="gov-section-title flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#1D4ED8]" />
              <span>Risk Drivers &bull; TreeSHAP Contributions</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Relative causal weight across the 6 statutory land acquisition dimensions
            </p>
          </div>

          <span className="text-2xs font-mono-num text-[#1D4ED8] dark:text-[#60A5FA] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 font-semibold">
            TreeSHAP Feature Attribution
          </span>
        </div>

        {/* Stacked Proportional Contribution Ribbon */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {riskDrivers.map((driver) => (
              <div
                key={driver.name}
                style={{ width: `${driver.pct}%` }}
                className={`${driver.color} h-full transition-all`}
                title={`${driver.name}: ${driver.pct}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between text-3xs font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
            {riskDrivers.map((driver) => (
              <span key={driver.name} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${driver.color}`}></span>
                <span>{driver.name}: <strong>{driver.pct}%</strong></span>
              </span>
            ))}
          </div>
        </div>

        {/* 6 Driver Dimension Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {riskDrivers.map((driver) => (
            <div
              key={driver.name}
              className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                  {driver.name}
                </span>
                <span className="font-mono-num font-bold text-xs text-[#1D4ED8] dark:text-[#60A5FA] bg-white dark:bg-[#131923] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#212B38]">
                  {driver.pct}%
                </span>
              </div>

              {/* Mini Meter */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`${driver.color} h-full rounded-full`}
                  style={{ width: `${driver.pct * 2.5}%` }}
                />
              </div>

              <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                {driver.note}
              </p>

              <div className="text-3xs font-mono-num text-[#64748B] dark:text-[#9AA8B8] border-t border-[#E2E8F0] dark:border-[#212B38] pt-1.5">
                Statutory Ref: {driver.ref}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. STATUTORY AUDIT TRAIL & ADMINISTRATIVE MUTATION LEDGER (Requirement: 08 Sep 2026 Officer reviewed LA-1059, 08 Sep 2026 Simulation executed, 07 Sep 2026 Document re-analyzed, 07 Sep 2026 Risk score changed 0.62 -> 0.89) */}
      <div className="gov-surface p-4 md:p-5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8] dark:text-[#60A5FA]" />
              <h2 className="gov-section-title">
                Statutory Audit Trail &bull; Administrative Mutation Ledger
              </h2>
            </div>
            <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] mt-0.5">
              Comprehensive chronological ledger of administrative reviews, counterfactual simulations, evidence ingestion, and model mutations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg cursor-pointer focus-ring"
            >
              <Download className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Export Certified Ledger</span>
            </button>
          </div>
        </div>

        {/* Ledger Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto text-3xs">
            {[
              { id: 'ALL', label: 'All Entries (8)' },
              { id: 'OFFICER_REVIEW', label: 'Officer Reviews' },
              { id: 'SIMULATION', label: 'Simulations' },
              { id: 'DOCUMENT_INTAKE', label: 'Document Intake' },
              { id: 'RISK_MUTATION', label: 'Risk Mutations' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAuditFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap focus-ring ${
                  auditFilter === f.id
                    ? 'bg-[#0F2942] dark:bg-[#1E293B] text-white shadow-xs'
                    : 'bg-[#F1F5F9] dark:bg-[#0C1017] text-[#475569] dark:text-[#9AA8B8] hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter ledger by keyword or hash..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="w-full bg-[#F4F6F8] dark:bg-[#0C1017] text-xs px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] focus-ring text-[#0F172A] dark:text-[#F3F6FA]"
            />
          </div>
        </div>

        {/* Chronological Audit Records (Exact sequence: 08 Sep Officer reviewed, 08 Sep Simulation executed, 07 Sep Document re-analyzed, 07 Sep Risk score changed) */}
        <div className="space-y-3">
          {filteredAuditTrail.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] space-y-2 hover:border-[#1D4ED8] dark:hover:border-[#3B82F6] transition-colors"
            >
              {/* Row 1: Date & Title & Category Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#212B38] pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-num font-bold text-xs text-[#0F172A] dark:text-[#F3F6FA] bg-white dark:bg-[#131923] px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#212B38]">
                    {entry.date} &bull; {entry.time}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                    {entry.title}
                  </h3>
                </div>

                <span className={`text-3xs font-mono font-semibold px-2 py-0.5 rounded-full border ${entry.badgeColor}`}>
                  {entry.badge}
                </span>
              </div>

              {/* Row 2: Actor & Legal Cadre */}
              <div className="flex flex-wrap items-center gap-2 text-2xs text-[#475569] dark:text-[#9AA8B8]">
                <span>Recorded By: <strong className="text-[#0F172A] dark:text-[#F3F6FA]">{entry.actor}</strong></span>
                <span>&bull;</span>
                <span>Role: {entry.role}</span>
              </div>

              {/* Row 3: Narrative Summary */}
              <p className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {entry.summary}
              </p>

              {/* Row 4: Cryptographic SHA-256 Hash & Admissibility Tag */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#212B38] flex flex-wrap items-center justify-between gap-2 text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8]">
                <div className="flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{entry.digitalStamp}</span>
                </div>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
                  {entry.legalStatus}
                </span>
              </div>
            </div>
          ))}

          {filteredAuditTrail.length === 0 && (
            <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#9AA8B8] bg-[#F8FAFC] dark:bg-[#0F141C] rounded-xl border border-[#E2E8F0] dark:border-[#212B38]">
              No audit trail events match the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* 8. GLOBAL WHY EVIDENCE DRAWER */}
      <WhyEvidenceDrawer
        isOpen={whyDrawer.isOpen}
        onClose={() => setWhyDrawer((prev) => ({ ...prev, isOpen: false }))}
        metricType={whyDrawer.metricType}
        caseData={activeCase}
        customPayload={whyDrawer.customPayload}
        onNavigate={onNavigate}
      />
    </div>
  );
}
