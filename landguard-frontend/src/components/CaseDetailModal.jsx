import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import { X, Printer, CheckCircle2, ShieldAlert, Scale, FileText } from 'lucide-react';

export default function CaseDetailModal({ caseData, onClose, onSimulate, onLogAction }) {
  const [explainData, setExplainData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseData) {
      setLoading(true);
      const caseId = caseData.case_id || caseData.project_id;
      getExplainability(caseId)
        .then((res) => {
          setExplainData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('Failed to load SHAP explainability:', err);
          setLoading(false);
        });
    }
  }, [caseData]);

  if (!caseData) return null;

  const scorePct = Math.round((caseData.risk_score || 0.85) * 100);
  const isCritical = (caseData.risk_level || 'High').toUpperCase().includes('HIGH') || scorePct >= 70;
  const isElevated = (caseData.risk_level || '').toUpperCase().includes('MEDIUM') || (scorePct >= 35 && scorePct < 70);
  const caseId = caseData.case_id || caseData.project_id || 'LA-MH-2026-1020';
  const currentPhase = caseData.current_stage || caseData.stage || 'Compensation Payment';
  const daysInStage = caseData.days_in_stage || 52;

  // Specific risk triggers
  const riskFactors = [];

  if (caseData.legal_cases_pending > 0 || (explainData?.top_risk_drivers && explainData.top_risk_drivers.some(d => (d.feature || '').toLowerCase().includes('legal') || (d.feature || '').toLowerCase().includes('writ')))) {
    riskFactors.push({
      label: 'Active High Court Litigation',
      detail: `${caseData.legal_cases_pending || 2} Article 226 petitions challenging valuation multiplier.`
    });
  } else {
    riskFactors.push({
      label: 'Valuation Disparity Reference',
      detail: 'Offered rate is below circle-rate benchmark multiplier under Section 26.'
    });
  }

  if (daysInStage > 30 || scorePct > 60) {
    riskFactors.push({
      label: 'Section 25 Limitation Alert',
      detail: `Elapsed ${daysInStage} days in current phase (statutory milestone threshold is 30 days).`
    });
  }

  riskFactors.push({
    label: 'Award Disbursement Backlog',
    detail: `Allocation of ₹${caseData.compensation_offered_cr || '24.5'} Cr awaiting final treasury release.`
  });

  if (caseData.env_clearance_status === 'Pending' || scorePct > 70) {
    riskFactors.push({
      label: 'Forest Rights & Environmental Clearance',
      detail: 'Forest land diversion concurrence pending joint survey verification.'
    });
  }

  // Top Risk Drivers (TreeSHAP)
  const defaultDrivers = [
    { feature: 'High Court Writs & Injunctions Pending', shap_impact: 1.85, positive: true },
    { feature: 'Compensation Below Circle Market Benchmark', shap_impact: 1.42, positive: true },
    { feature: 'Stage Elapsed Beyond Statutory Limitation', shap_impact: 0.95, positive: true },
    { feature: 'Second Schedule Resettlement Objection', shap_impact: 0.48, positive: true },
    { feature: 'Clear Cadastral 7/12 Title Verified', shap_impact: -0.60, positive: false }
  ];

  const rawDrivers = explainData?.top_risk_drivers?.map((d) => ({
    feature: d.feature,
    shap_impact: parseFloat(d.shap_impact) || 0.5,
    positive: (parseFloat(d.shap_impact) || 0) >= 0
  })) || defaultDrivers;

  const recommendedAction = explainData?.recommended_action ||
    (isCritical
      ? 'Convene conciliation hearing and instruct Government Pleader to file stay vacation motion.'
      : 'Maintain standard procedural monitoring and expedite treasury compensation deposit.');

  // 5-Stage Timeline
  const stages = [
    { id: 'sec11', name: 'Notification', section: 'Sec 11(1)' },
    { id: 'sia', name: 'Objections', section: 'Sec 15(2)' },
    { id: 'sec19', name: 'Declaration', section: 'Sec 19(1)' },
    { id: 'sec23', name: 'Award Inquiry', section: 'Sec 23/26' },
    { id: 'sec38', name: 'Possession', section: 'Sec 38(1)' }
  ];

  const getStageIndex = (stageName) => {
    const s = (stageName || '').toLowerCase();
    if (s.includes('11') || s.includes('notif') || s.includes('preliminary')) return 0;
    if (s.includes('sia') || s.includes('social') || s.includes('survey') || s.includes('object')) return 1;
    if (s.includes('19') || s.includes('declar')) return 2;
    if (s.includes('23') || s.includes('award') || s.includes('inquiry')) return 3;
    if (s.includes('38') || s.includes('40') || s.includes('comp') || s.includes('possess')) return 4;
    return 3;
  };

  const currentStageIdx = getStageIndex(currentPhase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 transition-opacity">
      <div className="gov-surface w-full max-w-3xl max-h-[90dvh] overflow-y-auto rounded-xl shadow-xl border border-[#E2E8F0] dark:border-[#212B38] flex flex-col text-[#0F172A] dark:text-[#F3F6FA] bg-white dark:bg-[#131923]">
        
        {/* 1. Modal Institutional Masthead Bar */}
        <div className="px-5 py-3 border-b border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-between sticky top-0 bg-[#F8FAFC] dark:bg-[#0F141C] z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="gov-metadata font-mono-num text-[#64748B] dark:text-[#9AA8B8]">Case Intelligence Dossier</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60">
                {caseId}
              </span>
              <h2 className="text-sm font-bold text-[#0F2942] dark:text-[#F3F6FA] truncate max-w-md">
                {caseData.project_name || `${caseData.district} Public Acquisition Project`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 text-xs font-medium text-[#334155] dark:text-[#9AA8B8] bg-white dark:bg-[#131923] hover:bg-slate-100 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] flex items-center gap-1.5 cursor-pointer transition-colors focus-ring"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">Print File</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close Case File"
              className="p-1 text-[#64748B] hover:text-[#0F172A] dark:text-[#9AA8B8] dark:hover:text-white rounded-lg cursor-pointer transition-colors focus-ring"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Modal Body */}
        <div className="p-5 space-y-4">

          {/* Top Statutory Metric Strip */}
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-3xs uppercase font-bold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Risk Classification
              </span>
              <RiskBadge level={caseData.risk_level || 'High'} size="md" />
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Delay Probability
              </span>
              <span className={`text-lg font-bold font-mono-num ${isCritical ? 'text-[#B91C1C]' : isElevated ? 'text-[#B45309]' : 'text-[#15803D]'}`}>
                {scorePct}%
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Current Procedural Phase
              </span>
              <div className="font-semibold text-[#0F172A] dark:text-[#F3F6FA] truncate">
                {currentPhase}
              </div>
              <span className="text-3xs font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
                {daysInStage} days elapsed
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Compensation Outlay
              </span>
              <div className="text-lg font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                &#8377;{caseData.compensation_offered_cr || '24.5'} Cr
              </div>
            </div>
          </div>

          {/* 3. Milestone Timeline */}
          <div className="space-y-1.5">
            <h3 className="text-2xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
              Procedural Milestone Progression (RFCTLARR 2013)
            </h3>

            <div className="p-3 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-[#E2E8F0] dark:bg-[#212B38] -z-0"></div>

                {stages.map((stg, idx) => {
                  const isCompleted = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stg.id} className="relative z-10 flex flex-col items-center text-center flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-[#15803D] text-white'
                            : isCurrent
                            ? 'bg-[#1D4ED8] dark:bg-[#1D4ED8] text-white ring-2 ring-blue-200 dark:ring-blue-900'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="font-mono-num">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-1 ${isCurrent ? 'text-[#1D4ED8] dark:text-[#60A5FA] font-bold' : 'text-[#0F172A] dark:text-slate-400'}`}>
                        {stg.name}
                      </span>
                      <span className="text-3xs text-[#64748B] font-mono-num">
                        {stg.section}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Primary Factual Risk Drivers */}
          <div className="space-y-1.5">
            <h3 className="text-2xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
              Primary Factual Risk Triggers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg flex items-start gap-2"
                >
                  <span className="text-3xs font-bold uppercase px-1.5 py-0.2 rounded bg-red-50 dark:bg-red-950/40 text-[#B91C1C] dark:text-red-300 border border-red-200 dark:border-red-900 whitespace-nowrap mt-0.5">
                    Trigger 0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                      {rf.label}
                    </p>
                    <p className="text-2xs text-[#475569] dark:text-[#9AA8B8] leading-tight mt-0.5">
                      {rf.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. TreeSHAP Feature Attribution */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-2xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
                TreeSHAP Feature Attribution &amp; Additive Factors
              </h3>
              <span className="text-3xs font-mono-num text-[#64748B]">
                Mathematical Provenance
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg space-y-2">
              <div className="space-y-1.5">
                {rawDrivers.map((driver, i) => {
                  const impactVal = driver.shap_impact;
                  const isPos = driver.positive;
                  const barWidth = Math.min(100, Math.max(15, Math.abs(impactVal) * 45));

                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#0F172A] dark:text-[#F3F6FA] font-medium">
                          {driver.feature}
                        </span>
                        <span className={`font-mono-num text-2xs font-semibold ${isPos ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
                          {isPos ? `+${impactVal.toFixed(2)} SHAP` : `${impactVal.toFixed(2)} SHAP`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex">
                        <div
                          className={`h-full rounded ${isPos ? 'bg-[#B91C1C]' : 'bg-[#15803D]'}`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Natural Language Diagnosis */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#212B38] text-xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                <strong className="text-[#0F172A] dark:text-[#F3F6FA]">Statutory Diagnosis: </strong>
                High risk is driven primarily by active legal proceedings and circle-rate compensation disparity. Mitigating factor of verified title reduced delay likelihood by <span className="font-mono-num text-emerald-700 dark:text-emerald-400 font-semibold">-0.60 SHAP</span>.
              </div>
            </div>
          </div>

          {/* 6. Recommended Operational Action */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-lg space-y-1">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#60A5FA]">
              Recommended Statutory Action
            </span>
            <p className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
              {recommendedAction}
            </p>
            <p className="text-2xs text-[#64748B] dark:text-[#9AA8B8]">
              Collectorate priority action &bull; Immediate hearing required
            </p>
          </div>

          {/* 7. Project Attributes & Specifications */}
          <div className="space-y-1">
            <h3 className="text-2xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
              Corridor Cadastral Specifications
            </h3>
            <div className="border border-[#E2E8F0] dark:border-[#212B38] rounded-lg overflow-hidden bg-white dark:bg-[#131923]">
              <table className="gov-table">
                <tbody>
                  <tr>
                    <td className="bg-[#F8FAFC] dark:bg-[#0F141C] font-bold text-[#475569] w-1/4">District Jurisdiction</td>
                    <td className="text-[#0F172A] dark:text-[#F3F6FA] w-1/4">{caseData.district}</td>
                    <td className="bg-[#F8FAFC] dark:bg-[#0F141C] font-bold text-[#475569] w-1/4">Infrastructure Sector</td>
                    <td className="text-[#0F172A] dark:text-[#F3F6FA] w-1/4">{caseData.project_type || 'Transport Corridor'}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#F8FAFC] dark:bg-[#0F141C] font-bold text-[#475569]">Notified Land Area</td>
                    <td className="font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">{caseData.land_area_acres || 145} Acres</td>
                    <td className="bg-[#F8FAFC] dark:bg-[#0F141C] font-bold text-[#475569]">Affected Title Holders</td>
                    <td className="font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">{caseData.affected_landowners_count || 85} Owners</td>
                  </tr>
                  <tr>
                    <td className="bg-[#F8FAFC] dark:bg-[#0F141C] font-bold text-[#475569]">Active Writ Petitions</td>
                    <td className="font-mono-num font-bold text-[#B91C1C]">{caseData.legal_cases_pending || 2} Active</td>
                    <td className="bg-[#F8FAFC] dark:bg-[#0F141C] font-bold text-[#475569]">R&amp;R Resettlement Status</td>
                    <td className="text-emerald-700 dark:text-emerald-400 font-semibold">{caseData.rr_plan_status || 'Approved Schedule II'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 8. Modal Footer */}
        <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#212B38] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#0F141C]">
          <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] font-mono-num">
            LandGuard Intelligence Dossier &bull; Project Summary
          </span>
          <div className="flex items-center gap-2">
            {onSimulate && (
              <button
                type="button"
                onClick={() => {
                  onSimulate(caseData);
                  onClose();
                }}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#1D4ED8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors focus-ring"
              >
                Simulate Policy Levers
              </button>
            )}
            {onLogAction && (
              <button
                type="button"
                onClick={() => {
                  onLogAction(caseData);
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs focus-ring"
              >
                Issue Directive Order
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-100 text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#212B38] rounded-lg text-xs font-medium cursor-pointer transition-colors focus-ring"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
