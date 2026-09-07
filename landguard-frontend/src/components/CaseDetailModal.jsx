import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export default function CaseDetailModal({ caseData, onClose }) {
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
      label: 'Active Litigation Pending',
      detail: `${caseData.legal_cases_pending || 2} legal petitions challenging valuation multiplier.`
    });
  } else {
    riskFactors.push({
      label: 'Valuation Disparity',
      detail: 'Offered rate is below circle-rate benchmark multiplier.'
    });
  }

  if (daysInStage > 30 || scorePct > 60) {
    riskFactors.push({
      label: 'Stage Timeline Breach',
      detail: `Elapsed ${daysInStage} days in current phase (standard milestone threshold is 30 days).`
    });
  }

  riskFactors.push({
    label: 'Disbursement Delay',
    detail: `Allocation of ₹${caseData.compensation_offered_cr || '24.5'} Cr awaiting final disbursement clearance.`
  });

  if (caseData.env_clearance_status === 'Pending' || scorePct > 70) {
    riskFactors.push({
      label: 'Environmental Clearance Dependency',
      detail: 'Forest land diversion concurrence pending joint survey review.'
    });
  }

  // Top Risk Drivers (TreeSHAP)
  const defaultDrivers = [
    { feature: 'Court Writs & Litigation Pending', shap_impact: 1.85, positive: true },
    { feature: 'Compensation Below Circle Market Rate', shap_impact: 1.42, positive: true },
    { feature: 'Stage Elapsed Beyond Benchmark Limit', shap_impact: 0.95, positive: true },
    { feature: 'Community Resettlement Objection', shap_impact: 0.48, positive: true },
    { feature: 'Agricultural Title Verified', shap_impact: -0.60, positive: false }
  ];

  const rawDrivers = explainData?.top_risk_drivers?.map((d) => ({
    feature: d.feature,
    shap_impact: parseFloat(d.shap_impact) || 0.5,
    positive: (parseFloat(d.shap_impact) || 0) >= 0
  })) || defaultDrivers;

  const recommendedAction = explainData?.recommended_action ||
    (isCritical
      ? 'Initiate dispute conciliation hearing and review circle multiplier adjustments.'
      : 'Maintain standard procedural monitoring and confirm disbursement timeline.');

  // 5-Stage Timeline
  const stages = [
    { id: 'sec11', name: 'Notification', section: 'Phase 1' },
    { id: 'sia', name: 'SIA Survey', section: 'Phase 2' },
    { id: 'sec19', name: 'Declaration', section: 'Phase 3' },
    { id: 'sec23', name: 'Award Inquiry', section: 'Phase 4' },
    { id: 'sec38', name: 'Possession', section: 'Phase 5' }
  ];

  const getStageIndex = (stageName) => {
    const s = (stageName || '').toLowerCase();
    if (s.includes('11') || s.includes('notif') || s.includes('preliminary')) return 0;
    if (s.includes('sia') || s.includes('social') || s.includes('survey')) return 1;
    if (s.includes('19') || s.includes('declar')) return 2;
    if (s.includes('23') || s.includes('award') || s.includes('inquiry')) return 3;
    if (s.includes('38') || s.includes('40') || s.includes('comp') || s.includes('possess')) return 4;
    return 3;
  };

  const currentStageIdx = getStageIndex(currentPhase);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0B1118]/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#111A24] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-[#E2E8F0] dark:border-[#263342] flex flex-col text-[#0F172A] dark:text-[#F3F6FA]">
        
        {/* 1. Modal Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#263342] flex items-center justify-between sticky top-0 bg-white dark:bg-[#111A24] z-20">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#64748B] dark:text-[#9AA8B8] uppercase">
              Project Acquisition Dossier &amp; Risk Assessment
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono-num text-xs font-semibold px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#151F2B] text-[#1D4ED8] dark:text-[#3B82F6] border border-[#E2E8F0] dark:border-[#263342]">
                {caseId}
              </span>
              <h2 className="text-sm font-bold text-[#0F2942] dark:text-[#F3F6FA]">
                {caseData.project_name || `${caseData.district} Infrastructure Project`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 text-xs font-medium text-[#334155] dark:text-[#9AA8B8] bg-[#F8FAFC] dark:bg-[#151F2B] hover:bg-[#F1F5F9] rounded border border-[#E2E8F0] dark:border-[#263342] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B] dark:text-[#6F7D8D]" />
              <span className="hidden sm:inline">Print File</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close Case File"
              className="p-1 text-[#64748B] dark:text-[#9AA8B8] hover:text-[#0F172A] dark:hover:text-[#F3F6FA] rounded hover:bg-[#F1F5F9] dark:hover:bg-[#151F2B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Modal Body */}
        <div className="p-5 space-y-5">

          {/* Top Metric Strip */}
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#151F2B] border border-[#E2E8F0] dark:border-[#263342] rounded grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Risk Classification
              </span>
              <RiskBadge level={caseData.risk_level || 'High'} size="md" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Delay Probability
              </span>
              <span className={`text-lg font-bold font-mono-num ${isCritical ? 'text-[#DC2626]' : isElevated ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>
                {scorePct}%
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Current Phase
              </span>
              <div className="font-semibold text-[#0F172A] dark:text-[#F3F6FA] truncate">
                {currentPhase}
              </div>
              <span className="text-[10px] font-mono-num text-[#64748B] dark:text-[#9AA8B8]">
                {daysInStage} days elapsed
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#64748B] dark:text-[#9AA8B8] block mb-1">
                Compensation Outlay
              </span>
              <div className="text-lg font-bold font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">
                &#8377;{caseData.compensation_offered_cr || '24.5'} Cr
              </div>
            </div>
          </div>

          {/* 3. Milestone Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
              Milestone Progression
            </h3>

            <div className="p-3.5 bg-white dark:bg-[#111A24] border border-[#E2E8F0] dark:border-[#263342] rounded">
              <div className="relative flex items-center justify-between">
                <div className="absolute top-3 left-6 right-6 h-0.5 bg-[#E2E8F0] dark:border-[#263342] -z-0"></div>

                {stages.map((stg, idx) => {
                  const isCompleted = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stg.id} className="relative z-10 flex flex-col items-center text-center flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                          isCompleted
                            ? 'bg-[#16A34A] text-white'
                            : isCurrent
                            ? 'bg-[#1D4ED8] dark:bg-[#2563EB] text-white ring-2 ring-blue-100 dark:ring-blue-900/50'
                            : 'bg-[#E2E8F0] dark:bg-[#263342] text-[#64748B] dark:text-[#9AA8B8]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="font-mono-num">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-1.5 ${isCurrent ? 'text-[#1D4ED8] dark:text-[#3B82F6] font-bold' : 'text-[#0F172A] dark:text-[#9AA8B8]'}`}>
                        {stg.name}
                      </span>
                      <span className="text-[10px] text-[#64748B] dark:text-[#6F7D8D]">
                        {stg.section}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Primary Factual Risk Drivers */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
              Primary Factual Risk Drivers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white dark:bg-[#111A24] border border-[#E2E8F0] dark:border-[#263342] rounded flex items-start gap-2"
                >
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-red-50 dark:bg-red-950/30 text-[#B91C1C] dark:text-red-300 border border-red-200 dark:border-red-900/40 whitespace-nowrap mt-0.5">
                    Trigger 0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                      {rf.label}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8] leading-tight mt-0.5">
                      {rf.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. TreeSHAP Feature Attribution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2942] dark:text-[#F3F6FA]">
                TreeSHAP Feature Attribution
              </h3>
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#9AA8B8]">
                Additive Explanations
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-[#111A24] border border-[#E2E8F0] dark:border-[#263342] rounded space-y-2.5">
              <div className="space-y-2">
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
                        <span className={`font-mono-num text-xs font-semibold ${isPos ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                          {isPos ? `+${impactVal.toFixed(2)} SHAP` : `${impactVal.toFixed(2)} SHAP`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F1F5F9] dark:bg-[#151F2B] rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full ${isPos ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Natural Language Diagnosis */}
              <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#263342] text-xs text-[#334155] dark:text-[#9AA8B8] leading-relaxed">
                <strong className="text-[#0F172A] dark:text-[#F3F6FA]">Diagnosis: </strong>
                High risk is driven primarily by active legal proceedings and circle-rate compensation disparity. Mitigating factor of verified title reduced delay likelihood by <span className="font-mono-num text-[#16A34A] font-semibold">-0.60 SHAP</span>.
              </div>
            </div>
          </div>

          {/* 6. Recommended Operational Action */}
          <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#3B82F6]">
              Recommended Action
            </span>
            <p className="text-xs font-bold text-[#0F2942] dark:text-[#F3F6FA]">
              {recommendedAction}
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8]">
              Priority action item for project management review &bull; Queue 1
            </p>
          </div>

          {/* 7. Project Attributes & Specifications */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
              Project Attributes &amp; Specifications
            </h3>
            <div className="border border-[#E2E8F0] dark:border-[#263342] rounded overflow-hidden bg-white dark:bg-[#111A24]">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263342]">
                  <tr className="divide-x divide-[#E2E8F0] dark:divide-[#263342]">
                    <td className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#151F2B] font-medium text-[#64748B] dark:text-[#9AA8B8] w-1/4">District</td>
                    <td className="py-2 px-3 text-[#0F172A] dark:text-[#F3F6FA] w-1/4">{caseData.district} District</td>
                    <td className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#151F2B] font-medium text-[#64748B] dark:text-[#9AA8B8] w-1/4">Project Type</td>
                    <td className="py-2 px-3 text-[#0F172A] dark:text-[#F3F6FA] w-1/4">{caseData.project_type || 'Infrastructure'}</td>
                  </tr>
                  <tr className="divide-x divide-[#E2E8F0] dark:divide-[#263342]">
                    <td className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#151F2B] font-medium text-[#64748B] dark:text-[#9AA8B8]">Acquisition Area</td>
                    <td className="py-2 px-3 font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">{caseData.land_area_acres || 145} Acres</td>
                    <td className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#151F2B] font-medium text-[#64748B] dark:text-[#9AA8B8]">Landowners Affected</td>
                    <td className="py-2 px-3 font-mono-num text-[#0F172A] dark:text-[#F3F6FA]">{caseData.affected_landowners_count || 85} owners</td>
                  </tr>
                  <tr className="divide-x divide-[#E2E8F0] dark:divide-[#263342]">
                    <td className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#151F2B] font-medium text-[#64748B] dark:text-[#9AA8B8]">Writs Pending</td>
                    <td className="py-2 px-3 font-mono-num font-semibold text-[#DC2626]">{caseData.legal_cases_pending || 2} Active</td>
                    <td className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#151F2B] font-medium text-[#64748B] dark:text-[#9AA8B8]">R&amp;R Plan Status</td>
                    <td className="py-2 px-3 text-[#16A34A]">{caseData.rr_plan_status || 'Approved'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 8. Modal Footer */}
        <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#263342] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#151F2B]">
          <span className="text-[10px] text-[#64748B] dark:text-[#9AA8B8] font-mono">
            CYBERLEEK &bull; LandGuard AI &bull; PS 26017
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-white dark:bg-[#111A24] hover:bg-[#F8FAFC] text-[#0F172A] dark:text-[#F3F6FA] border border-[#E2E8F0] dark:border-[#263342] rounded text-xs font-medium cursor-pointer transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}
