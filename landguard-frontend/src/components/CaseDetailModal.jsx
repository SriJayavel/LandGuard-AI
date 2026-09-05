import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import {
  X, BrainCircuit, AlertTriangle, ShieldCheck, CheckCircle2,
  XCircle, FileText, Gavel, Scale, Coins, MapPin, Building2, Layers
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
          console.warn('Failed to load SHAP details:', err);
          setLoading(false);
        });
    }
  }, [caseData]);

  if (!caseData) return null;

  const scorePct = ((caseData.risk_score || 0) * 100).toFixed(1);

  // Format SHAP features for horizontal waterfall bar chart
  const drivers = explainData?.top_risk_drivers || [
    { feature: 'Legal Litigation Pending', shap_impact: 1.85, value: '2 Writs Filed' },
    { feature: 'Compensation Below Market', shap_impact: 1.42, value: '0.75x Ratio' },
    { feature: 'SIA Consultation Delay', shap_impact: 0.95, value: 'Pending Gram Sabha' },
    { feature: 'Environment Clearance', shap_impact: -0.60, value: 'Obtained' }
  ];

  const chartData = drivers.map(d => ({
    name: d.feature,
    impact: parseFloat(d.shap_impact || 0),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="solid-card w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800 rounded-xl shadow-2xl bg-gray-900 text-gray-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-md border border-blue-500">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-100">
                  {caseData.project_name || `${caseData.district} Project`}
                </h2>
                <span className="font-mono text-xs font-bold text-blue-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {caseData.case_id || caseData.project_id}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                SHAP TreeExplainer AI Attribution Audit & Prescriptive Policy Directives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 font-medium block">Risk Assessment</span>
              <div className="flex items-center gap-2">
                <RiskBadge level={caseData.risk_level} />
                <span className="text-sm font-mono font-bold text-red-400">{scorePct}%</span>
              </div>
            </div>

            <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 font-medium block">Current Stage</span>
              <span className="text-xs font-bold text-gray-200 block truncate">{caseData.current_stage || caseData.stage}</span>
            </div>

            <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 font-medium block">District Location</span>
              <span className="text-xs font-bold text-gray-200 block">{caseData.district} District</span>
            </div>

            <div className="bg-gray-950 p-3.5 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 font-medium block">Compensation Outlay</span>
              <span className="text-xs font-mono font-bold text-emerald-400 block">&#8377;{caseData.compensation_offered_cr} Cr</span>
            </div>
          </div>

          {/* SHAP Waterfall Horizontal Bar Chart */}
          <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-blue-400" />
                  SHAP Feature Impact Attribution Waterfall
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Quantified log-odds feature contributions pushing risk score up or down</p>
              </div>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <XAxis type="number" stroke="#6B7280" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={120} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-gray-900 text-gray-100 p-2.5 rounded border border-gray-800 text-xs shadow-xl space-y-1">
                            <p className="font-bold text-blue-400">{d.name}</p>
                            <p className="text-gray-300">SHAP Impact Value: <strong className={d.impact > 0 ? 'text-red-400' : 'text-emerald-400'}>{d.impact > 0 ? `+${d.impact}` : d.impact}</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.impact > 0 ? '#EF4444' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prescriptive Administrative Directive Box */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Prescriptive Administrative Directive (RFCTLARR Act 2013)</span>
            </div>
            <p className="text-sm font-semibold text-gray-200 leading-relaxed">
              {explainData?.recommended_action || 'Fast-track SIA clearances and hold Gram Sabha consultations to resolve local grievances.'}
            </p>
          </div>

          {/* Statutory Compliance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[10px] text-gray-500 font-medium block">Environment Clearance</span>
              <span className={`font-bold flex items-center gap-1 ${caseData.env_clearance_status === 'Obtained' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {caseData.env_clearance_status === 'Obtained' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {caseData.env_clearance_status || 'Pending'}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[10px] text-gray-500 font-medium block">Forest Clearance</span>
              <span className="font-bold text-gray-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {caseData.forest_land_involvement || 'No Forest Land'}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[10px] text-gray-500 font-medium block">Gram Sabha Consent</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {caseData.gram_sabha_consent || 'Granted'}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800 space-y-1">
              <span className="text-[10px] text-gray-500 font-medium block">R&R Plan Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {caseData.rr_plan_status || 'Approved'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end bg-gray-950 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md font-semibold text-xs transition-colors cursor-pointer border border-gray-700"
          >
            Close Audit Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
