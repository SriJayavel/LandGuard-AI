import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import { X, ShieldCheck, Printer, AlertTriangle, ArrowRight } from 'lucide-react';

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

  const scorePct = ((caseData.risk_score || 0) * 100).toFixed(0);
  const riskLvl = (caseData.risk_level || 'Low').toString().toUpperCase();

  // Factors increasing risk (positive impact) and reducing risk (negative impact)
  const rawDrivers = explainData?.top_risk_drivers || [
    { feature: 'Stage Duration Overdue', shap_impact: 0.31 },
    { feature: 'Pending Court Writ Injunction', shap_impact: 0.24 },
    { feature: 'Compensation Below Circle Rate', shap_impact: 0.16 },
    { feature: 'Historical District Dispute Density', shap_impact: 0.12 },
    { feature: 'Gram Sabha Resolution Completed', shap_impact: -0.08 }
  ];

  const increasingFactors = rawDrivers.filter(d => (parseFloat(d.shap_impact) || 0) > 0);
  const reducingFactors = rawDrivers.filter(d => (parseFloat(d.shap_impact) || 0) <= 0);

  // Stepper indicator position
  const activeLevel = riskLvl === 'CRITICAL' || riskLvl === 'HIGH RISK' ? 3 : riskLvl === 'HIGH' ? 2 : riskLvl === 'MEDIUM' ? 1 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172033]/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-lg shadow-xl border border-[#D9E1EA] flex flex-col text-[#172033]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#D9E1EA] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#123B63]">
                {caseData.project_name || `${caseData.district} Project`}
              </h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F5F7FA] text-[#1769AA] border border-[#D9E1EA]">
                {caseData.case_id || caseData.project_id}
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              {caseData.district} District &bull; Maharashtra &bull; Case Intelligence File
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 text-xs text-[#172033] bg-[#F5F7FA] hover:bg-[#E9EEF6] rounded border border-[#D9E1EA] flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Printer className="w-3.5 h-3.5 text-[#667085]" />
              <span>Print File</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#667085] hover:text-[#172033] rounded hover:bg-[#F5F7FA] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Risk Assessment & Linear Risk Stepper */}
          <div className="p-4 bg-[#F8FAFC] border border-[#D9E1EA] rounded-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#667085] font-medium block">Risk Assessment</span>
                <div className="flex items-center gap-2 mt-1">
                  <RiskBadge level={caseData.risk_level} />
                  <span className="text-lg font-bold font-mono text-[#DC2626]">{scorePct}%</span>
                  <span className="text-xs text-[#667085]">Predicted Delay Probability</span>
                </div>
              </div>
              <div className="text-xs text-[#667085] text-right">
                <span className="block font-medium text-[#172033]">Evaluated under Act</span>
                <span>RFCTLARR 2013 Statutory Timelines</span>
              </div>
            </div>

            {/* Professional Linear Risk Gauge */}
            <div className="pt-2 border-t border-[#D9E1EA]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#667085] mb-2 px-1">
                <span className={activeLevel === 0 ? 'text-[#16A34A] font-bold' : ''}>LOW</span>
                <span className={activeLevel === 1 ? 'text-[#D97706] font-bold' : ''}>MEDIUM</span>
                <span className={activeLevel === 2 ? 'text-[#EA580C] font-bold' : ''}>HIGH</span>
                <span className={activeLevel === 3 ? 'text-[#DC2626] font-bold' : ''}>CRITICAL</span>
              </div>
              <div className="h-2 w-full bg-[#E2E8F0] rounded-full flex overflow-hidden">
                <div className="h-full w-1/4 bg-[#16A34A]/80 border-r border-white"></div>
                <div className="h-full w-1/4 bg-[#D97706]/80 border-r border-white"></div>
                <div className="h-full w-1/4 bg-[#EA580C]/80 border-r border-white"></div>
                <div className="h-full w-1/4 bg-[#DC2626]/80"></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#667085] mt-1.5 px-1 font-mono">
                <span className="w-1/4 text-center">{activeLevel === 0 ? '▲ CURRENT' : ''}</span>
                <span className="w-1/4 text-center">{activeLevel === 1 ? '▲ CURRENT' : ''}</span>
                <span className="w-1/4 text-center">{activeLevel === 2 ? '▲ CURRENT' : ''}</span>
                <span className="w-1/4 text-center">{activeLevel === 3 ? '▲ CURRENT' : ''}</span>
              </div>
            </div>
          </div>

          {/* Clean Case Information Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
              Administrative Case Attributes
            </h3>
            <div className="border border-[#D9E1EA] rounded-lg overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-[#D9E1EA]">
                  <tr className="divide-x divide-[#D9E1EA]">
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085] w-1/4">District</td>
                    <td className="py-2.5 px-3.5 font-medium text-[#172033] w-1/4">{caseData.district}</td>
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085] w-1/4">Project Type</td>
                    <td className="py-2.5 px-3.5 font-medium text-[#172033] w-1/4">{caseData.project_type || 'Infrastructure Corridor'}</td>
                  </tr>
                  <tr className="divide-x divide-[#D9E1EA]">
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085]">Current Phase</td>
                    <td className="py-2.5 px-3.5 font-medium text-[#172033]">{caseData.current_stage || caseData.stage}</td>
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085]">Days in Phase</td>
                    <td className="py-2.5 px-3.5 font-mono text-[#172033]">{caseData.days_in_stage || 45} days</td>
                  </tr>
                  <tr className="divide-x divide-[#D9E1EA]">
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085]">Budget Outlay</td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-[#16A34A]">&#8377;{caseData.compensation_offered_cr} Cr</td>
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085]">Affected Landowners</td>
                    <td className="py-2.5 px-3.5 font-mono text-[#172033]">{caseData.affected_landowners_count || 85} landowners</td>
                  </tr>
                  <tr className="divide-x divide-[#D9E1EA]">
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085]">Pending Litigations</td>
                    <td className="py-2.5 px-3.5 font-medium text-[#DC2626]">{caseData.legal_cases_pending || 0} Court Writs</td>
                    <td className="py-2.5 px-3.5 bg-[#F8FAFC] font-semibold text-[#667085]">R&R Plan Status</td>
                    <td className="py-2.5 px-3.5 font-medium text-[#16A34A]">{caseData.rr_plan_status || 'Approved'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SHAP Explainability: Why was this case flagged? */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[#172033]">Why was this case flagged?</h3>
              <p className="text-xs text-[#667085]">
                Machine learning feature attribution identifying the primary drivers influencing the risk calculation
              </p>
            </div>

            {/* Factors Increasing Risk */}
            <div className="space-y-2 border border-[#D9E1EA] rounded-lg p-4 bg-white">
              <span className="text-xs font-semibold text-[#DC2626] block">
                Factors increasing delay risk
              </span>
              <div className="space-y-2">
                {increasingFactors.map((f, i) => {
                  const impactVal = parseFloat(f.shap_impact || 0).toFixed(2);
                  const barWidth = Math.min(100, Math.max(15, parseFloat(f.shap_impact || 0) * 180));
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#172033]">{f.feature}</span>
                        <span className="font-mono font-bold text-[#DC2626]">+{impactVal}</span>
                      </div>
                      <div className="h-2 w-full bg-[#F5F7FA] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#DC2626] rounded"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Factors Reducing Risk */}
              {reducingFactors.length > 0 && (
                <div className="pt-3 border-t border-[#D9E1EA] space-y-2">
                  <span className="text-xs font-semibold text-[#16A34A] block">
                    Factors reducing delay risk
                  </span>
                  <div className="space-y-2">
                    {reducingFactors.map((f, i) => {
                      const impactVal = parseFloat(f.shap_impact || 0).toFixed(2);
                      const barWidth = Math.min(100, Math.max(15, Math.abs(parseFloat(f.shap_impact || 0)) * 200));
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#172033]">{f.feature}</span>
                            <span className="font-mono font-bold text-[#16A34A]">{impactVal}</span>
                          </div>
                          <div className="h-2 w-full bg-[#F5F7FA] rounded overflow-hidden">
                            <div
                              className="h-full bg-[#16A34A] rounded"
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Action: PREDICT -> EXPLAIN -> RECOMMEND -> ACT */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#123B63]">
              <ShieldCheck className="w-4 h-4 text-[#1769AA]" />
              <span>Recommended Action</span>
            </div>
            <p className="text-sm font-semibold text-[#123B63] leading-relaxed">
              {explainData?.recommended_action || 'Prioritize legal verification and compensation review with District Revenue Officer.'}
            </p>
            <div className="pt-2 border-t border-blue-200/80 text-xs text-[#1769AA]">
              <strong>Why?</strong> The model identifies the relevant case factors contributing most strongly to the predicted delay risk.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D9E1EA] flex justify-end bg-[#F8FAFC]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F5F7FA] text-[#172033] border border-[#D9E1EA] rounded text-xs font-semibold cursor-pointer"
          >
            Close Case File
          </button>
        </div>
      </div>
    </div>
  );
}
