import React, { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';
import RiskBadge from './RiskBadge';
import { Bell, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

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
        console.warn('Failed to load alerts queue:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="gov-card p-12 text-center rounded space-y-2">
        <p className="text-xs font-semibold text-[#1769AA]">Loading alert center...</p>
        <p className="text-[11px] text-[#667085]">Compiling priority cases requiring administrative intervention</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title & Queue Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">Administrative Alert Center</h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Priority work queue of acquisition projects requiring urgent review, legal clarification, or escalation
          </p>
        </div>
        <div className="text-xs font-semibold text-[#DC2626] bg-red-50 px-3 py-1.5 rounded border border-red-200">
          {alerts.length} Cases Requiring Attention
        </div>
      </div>

      {/* Administrative Work Queue Cards */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="gov-card p-12 text-center text-xs text-[#667085]">
            No active alerts currently pending review.
          </div>
        ) : (
          alerts.map((item) => {
            const probPct = ((item.risk_score || 0.88) * 100).toFixed(0);
            return (
              <div
                key={item.case_id || item.project_id}
                className="gov-card p-4 border-l-4 border-l-[#DC2626] flex flex-wrap items-start justify-between gap-4 bg-white"
              >
                <div className="space-y-2 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1769AA]">
                      {item.case_id || item.project_id}
                    </span>
                    <span className="text-xs font-semibold text-[#172033]">
                      {item.project_name}
                    </span>
                    <RiskBadge level={item.risk_level} />
                  </div>

                  <p className="text-xs text-[#172033]">
                    {item.current_stage || item.stage} stage shows elevated delay risk ({probPct}% predicted probability).
                    {item.legal_cases_pending > 0 && ` Active legal writ filed in High Court.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#667085]" />
                      <span>{item.district} District</span>
                    </span>
                    <span>&bull;</span>
                    <span>Budget: <strong className="text-[#172033] font-mono">&#8377;{item.compensation_offered_cr} Cr</strong></span>
                    <span>&bull;</span>
                    <span>Recommended action: <strong className="text-[#123B63]">Immediate revenue officer review</strong></span>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <button
                    onClick={() => onSelectCase(item)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#1769AA] hover:text-white bg-white hover:bg-[#1769AA] rounded border border-[#1769AA] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>View Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
