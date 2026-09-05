import React, { useEffect, useState } from 'react';
import { getExplainability } from '../services/api';
import RiskBadge from './RiskBadge';
import {
  X, Sparkles, AlertTriangle, CheckCircle, ShieldAlert,
  TrendingUp, FileText, MapPin, DollarSign, Layers, Users, Leaf
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

const CaseDetailModal = ({ caseData, onClose }) => {
  const [explainData, setExplainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!caseData?.case_id) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getExplainability(caseData.case_id)
      .then((res) => {
        if (isMounted) {
          setExplainData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch SHAP explainability:', err);
          setError('Failed to compute SHAP explainability. Backend may be offline.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [caseData]);

  if (!caseData) return null;

  // Prepare chart data for SHAP values
  const chartData = explainData?.top_risk_drivers?.map((driver) => ({
    feature: driver.feature,
    value: parseFloat(driver.shap_impact),
    rawValue: driver.value,
  })) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-card max-w-4xl w-full rounded-2xl border border-slate-700/70 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900/90 border-b border-slate-700/50 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs border border-cyan-800/50">
                {caseData.case_id}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">{caseData.project_name}</h2>
              <RiskBadge level={caseData.risk_level} />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" />{caseData.district} District</span>
              <span>&bull;</span>
              <span>Stage: <strong className="text-slate-200">{caseData.current_stage}</strong></span>
              <span>&bull;</span>
              <span>Type: <strong className="text-slate-200">{caseData.project_type}</strong></span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Risk Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-3.5 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Predicted Risk Score</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${caseData.risk_score >= 0.7 ? 'text-rose-400' : caseData.risk_score >= 0.35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {(caseData.risk_score * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">TreeExplainer</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${caseData.risk_score >= 0.7 ? 'bg-rose-500' : caseData.risk_score >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${caseData.risk_score * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Compensation Offered</span>
              <div className="flex items-baseline gap-1 text-emerald-400">
                <DollarSign className="w-4 h-4 self-center" />
                <span className="text-2xl font-black">&#8377;{caseData.compensation_offered_cr}</span>
                <span className="text-xs font-semibold text-slate-400">Cr</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Rate: &#8377;{caseData.compensation_per_sqm_inr}/sq.m</span>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Legal Litigations</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${caseData.legal_cases_pending > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {caseData.legal_cases_pending}
                </span>
                <span className="text-xs text-slate-400 font-medium">Pending</span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">Dispute: {caseData.dispute_type || 'None'}</span>
            </div>

            <div className="glass-card p-3.5 rounded-xl border border-slate-700/50 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Local Protests & Discontent</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${caseData.local_protests_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {caseData.local_protests_count}
                </span>
                <span className="text-xs text-slate-400 font-medium">Events</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Affected: {caseData.affected_landowners_count} Farmers</span>
            </div>
          </div>

          {/* Prescriptive AI Action Recommendation Card */}
          {explainData?.recommended_action && (
            <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-700/50 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span>AI Prescriptive Action Plan (Decision Support System)</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans pl-7">
                {explainData.recommended_action}
              </p>
            </div>
          )}

          {/* SHAP TreeExplainer Breakdown Chart */}
          <div className="space-y-3 glass-card p-5 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                SHAP Risk Factor Contribution Analysis
              </h3>
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-1 rounded">
                Base Expectation E[f(x)] = 0.35
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quantifies how each case attribute pushes the predicted delay risk above (+) or below (-) baseline.
            </p>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-cyan-300 font-medium animate-pulse">
                  Computing XGBoost TreeExplainer SHAP Waterfall...
                </span>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs text-center">
                {error}
              </div>
            ) : (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`} />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke="#94A3B8"
                      fontSize={11}
                      width={130}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isPositive = data.value > 0;
                          return (
                            <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg border border-slate-700 shadow-xl text-xs space-y-1">
                              <p className="font-bold text-cyan-300">{data.feature}</p>
                              <p className="text-slate-300">Case Value: <strong className="text-white">{data.rawValue}</strong></p>
                              <p className={`font-semibold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                                SHAP Impact: {isPositive ? '+' : ''}{data.value.toFixed(4)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.value > 0 ? '#EF4444' : '#10B981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Full Case Specifications Grid */}
          <div className="space-y-3 glass-card p-5 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700/50 pb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Full Case Specifications & Compliance Audit
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Acquired Area</span>
                <span className="font-semibold text-slate-200">{caseData.land_area_acres} Acres</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Land Classification</span>
                <span className="font-semibold text-slate-200">{caseData.land_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Environment Clearance</span>
                <span className={`font-semibold ${caseData.env_clearance_status === 'Obtained' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {caseData.env_clearance_status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Forest Land Clearance</span>
                <span className={`font-semibold ${caseData.forest_land_involvement === 'No' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {caseData.forest_land_involvement === 'Yes' ? 'Required (Pending)' : 'Not Applicable'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gram Sabha Consent</span>
                <span className={`font-semibold ${caseData.gram_sabha_consent === 'Granted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {caseData.gram_sabha_consent || 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">SIA Completed</span>
                <span className={`font-semibold ${caseData.sia_completed === 'Yes' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {caseData.sia_completed}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">R&R Plan Status</span>
                <span className={`font-semibold ${caseData.rr_plan_status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {caseData.rr_plan_status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Market vs Offered Ratio</span>
                <span className="font-semibold text-cyan-300">
                  {caseData.market_value_per_sqm_inr > 0 ? (caseData.compensation_per_sqm_inr / caseData.market_value_per_sqm_inr).toFixed(2) : '1.0'}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by LandGuard AI &bull; LightGBM + SHAP Explainability Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailModal;
