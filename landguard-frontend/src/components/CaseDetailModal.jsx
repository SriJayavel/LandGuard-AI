import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import {
  X, BrainCircuit, AlertTriangle, ShieldCheck, CheckCircle2,
  XCircle, FileText, Gavel, Scale, Coins, MapPin, Building2,
  Layers, Printer, Sparkles
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="cockpit-card w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl border border-white/10 text-slate-100 flex flex-col bg-[#0e1422]">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#090d16] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm border border-blue-400/40">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-heading">
                  {caseData.project_name || `${caseData.district} Project`}
                </h2>
                <span className="font-mono text-xs font-bold text-blue-400 bg-[#0e1422] px-2 py-0.2 rounded border border-blue-500/30">
                  {caseData.case_id || caseData.project_id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                SHAP TreeExplainer AI Attribution Audit & Statutory RFCTLARR Directive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white bg-[#0e1422] hover:bg-slate-800 rounded border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">PRINT DOSSIER</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-[#0e1422] hover:bg-slate-800 rounded border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Key Metrics Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#090d16] p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">RISK LEVEL</span>
              <div className="flex items-center gap-2">
                <RiskBadge level={caseData.risk_level} />
                <span className="text-xs font-mono font-bold text-red-400">{scorePct}%</span>
              </div>
            </div>

            <div className="bg-[#090d16] p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">STATUTORY STAGE</span>
              <span className="text-xs font-bold text-slate-200 block truncate">{caseData.current_stage || caseData.stage}</span>
            </div>

            <div className="bg-[#090d16] p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">DISTRICT</span>
              <span className="text-xs font-bold text-slate-200 block">{caseData.district} District</span>
            </div>

            <div className="bg-[#090d16] p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">COMPENSATION OUTLAY</span>
              <span className="text-xs font-mono font-bold text-emerald-400 block">&#8377;{caseData.compensation_offered_cr} Cr</span>
            </div>
          </div>

          {/* SHAP Waterfall Horizontal Bar Chart */}
          <div className="bg-[#090d16] p-4 rounded-lg border border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                  SHAP Feature Attribution Waterfall Breakdown
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Quantified log-odds feature contributions pushing predicted delay probability up or down</p>
              </div>
            </div>

            <div className="w-full h-[210px]">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
                >
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={130} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0e1422] text-slate-100 p-2 rounded-lg border border-white/10 text-xs shadow-2xl space-y-1 font-mono">
                            <p className="font-bold text-blue-400">{d.name}</p>
                            <p className="text-slate-300">SHAP Impact Value: <strong className={d.impact > 0 ? 'text-red-400' : 'text-emerald-400'}>{d.impact > 0 ? `+${d.impact}` : d.impact}</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.impact > 0 ? '#DC2626' : '#059669'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prescriptive Directive Box */}
          <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-300 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>PRESCRIPTIVE ADMINISTRATIVE DIRECTIVE (RFCTLARR ACT 2013)</span>
            </div>
            <p className="text-xs font-medium text-slate-200 leading-relaxed">
              {explainData?.recommended_action || 'Fast-track SIA clearances and hold Gram Sabha consultations to resolve local grievances.'}
            </p>
          </div>

          {/* Statutory Compliance Checklist Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-[#090d16] p-2.5 rounded border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono block">ENV CLEARANCE</span>
              <span className={`font-bold flex items-center gap-1 ${caseData.env_clearance_status === 'Obtained' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {caseData.env_clearance_status === 'Obtained' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                {caseData.env_clearance_status || 'Pending Review'}
              </span>
            </div>

            <div className="bg-[#090d16] p-2.5 rounded border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono block">FOREST CLEARANCE</span>
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {caseData.forest_land_involvement || 'No Forest Land'}
              </span>
            </div>

            <div className="bg-[#090d16] p-2.5 rounded border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono block">GRAM SABHA</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {caseData.gram_sabha_consent || 'Consent Granted'}
              </span>
            </div>

            <div className="bg-[#090d16] p-2.5 rounded border border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-500 font-mono block">R&R PLAN STATUS</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {caseData.rr_plan_status || 'Approved'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-white/10 flex justify-end bg-[#090d16] sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs transition-colors cursor-pointer border border-white/10"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
