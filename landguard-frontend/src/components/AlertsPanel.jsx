import React, { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';
import RiskBadge from './RiskBadge';
import { BellRing, ShieldAlert, Sparkles, MapPin, AlertTriangle, ArrowRight, Gavel, Scale } from 'lucide-react';

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
      <div className="solid-card p-12 text-center rounded-xl space-y-3">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-red-400 font-medium">Scanning High-Risk Priority Alerts Queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="solid-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-red-900/50 bg-red-950/20">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2.5 rounded-lg text-white shadow-md border border-red-500">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-100">
                Priority High-Risk Early Warning Queue
              </h2>
              <span className="bg-red-950 text-red-400 text-xs font-mono font-bold px-2 py-0.5 rounded border border-red-800">
                {alerts.length} Critical Alerts
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Acquisition cases flagged for imminent litigation injunctions, compensation disputes, or agitations
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
              className="solid-card p-5 rounded-xl border border-gray-800 hover:border-red-900/80 transition-all space-y-4 bg-gray-900"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-blue-400">{item.case_id || item.project_id}</span>
                  <RiskBadge level={item.risk_level} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2 py-1 rounded border border-red-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{scorePct}% Risk</span>
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="font-bold text-gray-100 text-base">{item.project_name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{item.district} District &bull; {item.current_stage || item.stage} Stage</span>
                </p>
              </div>

              {/* Risk Factors Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-950 p-3 rounded-lg border border-gray-800 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-medium block">Outlay</span>
                  <span className="font-mono font-bold text-emerald-400">&#8377;{item.compensation_offered_cr} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-medium block">Litigations</span>
                  <span className="font-bold text-red-400 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-red-400" />
                    {item.legal_cases_pending || 2} Writs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-medium block">Agitations</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    {item.local_protests_count || 3} logged
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCase(item)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-500 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Launch SHAP Audit Briefing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
