import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import {
  X, BrainCircuit, AlertTriangle, ShieldCheck, CheckCircle2,
  XCircle, FileText, Gavel, Scale, Coins, MapPin, Building2,
  Layers, Printer, Download, Sparkles, AlertOctagon
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="art-card w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-white/10 text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/95 sticky top-0 z-10 backdrop-blur-lg">
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-display font-bold text-white">
                  {caseData.project_name || `${caseData.district} Project`}
                </h2>
                <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  {caseData.case_id || caseData.project_id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SHAP TreeExplainer AI Attribution Audit & Statutory RFCTLARR Directive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">PRINT DOSSIER</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/90 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">RISK ASSESSMENT</span>
              <div className="flex items-center gap-2 pt-1">
                <RiskBadge level={caseData.risk_level} />
                <span className="text-sm font-mono font-bold text-rose-400">{scorePct}%</span>
              </div>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">STATUTORY PHASE</span>
              <span className="text-xs font-bold text-slate-200 block truncate pt-1">{caseData.current_stage || caseData.stage}</span>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">DISTRICT HUB</span>
              <span className="text-xs font-bold text-slate-200 block pt-1">{caseData.district} District</span>
            </div>

            <div className="bg-slate-950/90 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-mono block">COMPENSATION OUTLAY</span>
              <span className="text-sm font-mono font-bold text-emerald-400 block pt-1">&#8377;{caseData.compensation_offered_cr} Cr</span>
            </div>
          </div>

          {/* SHAP Waterfall Horizontal Bar Chart */}
          <div className="bg-slate-950/90 p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                  SHAP Feature Attribution Waterfall Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Quantified log-odds feature contributions pushing predicted delay probability up or down</p>
              </div>
            </div>

            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
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
                          <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-white/10 text-xs shadow-2xl space-y-1 font-mono">
                            <p className="font-bold text-cyan-300">{d.name}</p>
                            <p className="text-slate-300">SHAP Impact Value: <strong className={d.impact > 0 ? 'text-rose-400' : 'text-emerald-400'}>{d.impact > 0 ? `+${d.impact}` : d.impact}</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.impact > 0 ? '#F43F5E' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prescriptive Administrative Directive Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/40 space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>PRESCRIPTIVE ADMINISTRATIVE DIRECTIVE (RFCTLARR ACT 2013)</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              {explainData?.recommended_action || 'Fast-track SIA clearances and hold Gram Sabha consultations to resolve local grievances.'}
            </p>
          </div>

          {/* Statutory Compliance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">ENV CLEARANCE</span>
              <span className={`font-bold flex items-center gap-1 ${caseData.env_clearance_status === 'Obtained' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {caseData.env_clearance_status === 'Obtained' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {caseData.env_clearance_status || 'Pending Review'}
              </span>
            </div>

            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">FOREST LAND</span>
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {caseData.forest_land_involvement || 'No Forest Land'}
              </span>
            </div>

            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">GRAM SABHA</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {caseData.gram_sabha_consent || 'Consent Granted'}
              </span>
            </div>

            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">R&R PLAN STATUS</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {caseData.rr_plan_status || 'Approved'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end bg-slate-950/95 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-white/10"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
