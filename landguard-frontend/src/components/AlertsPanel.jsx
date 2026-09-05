import React, { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';
import RiskBadge from './RiskBadge';
import {
  BellRing, Sparkles, MapPin, AlertTriangle, ArrowRight,
  Gavel, Scale, Flame, Zap
} from 'lucide-react';

export default function AlertsPanel({ onSelectCase }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then((res) => {
        setAlerts(res.data.alerts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load alerts:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="cockpit-card p-12 text-center rounded-lg space-y-3">
        <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-red-400 font-mono font-medium">SCANNING HIGH-RISK EARLY WARNING MATRIX...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Alert Queue Banner */}
      <div className="cockpit-card p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 border border-red-900/60 bg-red-950/20">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg text-white shadow-sm border border-red-400/40">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-heading">
                Priority High-Risk Early Warning Queue
              </h2>
              <span className="bg-red-950 text-red-400 text-xs font-mono font-bold px-2 py-0.2 rounded border border-red-800">
                {alerts.length} CRITICAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Acquisition corridors flagged for imminent High Court stays, valuation disputes, or environmental freezes
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((item) => {
          const scorePct = ((item.risk_score || 0) * 100).toFixed(1);
          return (
            <div
              key={item.case_id || item.project_id}
              className="cockpit-card cockpit-card-hover p-4 rounded-lg border border-white/10 hover:border-red-500/50 space-y-3 bg-[#0e1422] group"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-400">{item.case_id || item.project_id}</span>
                  <RiskBadge level={item.risk_level} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  <Zap className="w-3 h-3 text-red-400" />
                  <span>{scorePct}% Risk</span>
                </div>
              </div>

              {/* Title & District */}
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                  {item.project_name}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>{item.district} District &bull; {item.current_stage || item.stage}</span>
                </p>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#090d16] p-2 rounded border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">OUTLAY</span>
                  <span className="font-bold text-emerald-400">&#8377;{item.compensation_offered_cr} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">LITIGATION</span>
                  <span className="font-bold text-red-400 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-red-400" />
                    {item.legal_cases_pending || 2} Writs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">PROTESTS</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {item.local_protests_count || 3} logged
                  </span>
                </div>
              </div>

              {/* Action Trigger */}
              <button
                onClick={() => onSelectCase(item)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-400/40 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Launch Full SHAP Audit Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
