import React, { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';
import RiskBadge from './RiskBadge';
import {
  BellRing, ShieldAlert, Sparkles, MapPin, AlertTriangle,
  ArrowRight, Gavel, Scale, Flame, Zap
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
      <div className="art-card p-16 text-center rounded-2xl space-y-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_#f43f5e]"></div>
        <p className="text-xs text-rose-300 font-mono font-medium animate-pulse">RADAR SCANNING CRITICAL THREAT MATRIX...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Threat Radar Banner */}
      <div className="art-card p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-rose-900/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="absolute -inset-1 bg-rose-500 rounded-xl blur-sm opacity-60 animate-pulse"></div>
            <div className="relative bg-rose-950 p-2.5 rounded-xl border border-rose-500 text-rose-400">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-display font-bold text-white">
                Early Warning Threat Radar & Critical Injunction Queue
              </h2>
              <span className="bg-rose-950 text-rose-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                {alerts.length} CRITICAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Acquisition corridors flagged for imminent High Court stays, valuation agitations, or environmental freezes
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((item) => {
          const scorePct = ((item.risk_score || 0) * 100).toFixed(1);
          return (
            <div
              key={item.case_id || item.project_id}
              className="art-card art-card-glow p-5 rounded-2xl border border-white/10 hover:border-rose-500/50 transition-all space-y-4 group"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-cyan-400">{item.case_id || item.project_id}</span>
                  <RiskBadge level={item.risk_level} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-300 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-800 shadow-[0_0_8px_rgba(244,63,94,0.2)]">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span>{scorePct}% Risk Index</span>
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="font-display font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {item.project_name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.district} District &bull; {item.current_stage || item.stage} Phase</span>
                </p>
              </div>

              {/* Risk Factors Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">CAPITAL OUTLAY</span>
                  <span className="font-bold text-emerald-400">&#8377;{item.compensation_offered_cr} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">LITIGATION WRITS</span>
                  <span className="font-bold text-rose-400 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-rose-400" />
                    {item.legal_cases_pending || 2} Writs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">AGITATIONS</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {item.local_protests_count || 3} logged
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCase(item)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Launch Full SHAP Audit Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
