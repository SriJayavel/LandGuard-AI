import React, { useEffect, useState, useMemo } from 'react';
import { getAlerts } from '../services/api';
import RiskBadge from './RiskBadge';
import { ArrowRight, MapPin } from 'lucide-react';

export default function AlertsPanel({ onSelectCase }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

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

  const categories = [
    { id: 'ALL', label: 'All Critical Alerts' },
    { id: 'LEGAL', label: 'Litigation & Writs' },
    { id: 'VALUATION', label: 'Valuation & Multiplier Appeals' },
    { id: 'CLEARANCE', label: 'Environmental & Clearances' }
  ];

  const filteredAlerts = useMemo(() => {
    if (activeCategory === 'ALL') return alerts;
    if (activeCategory === 'LEGAL') {
      return alerts.filter((a) => (a.legal_cases_pending && a.legal_cases_pending > 0) || (a.dispute_type && a.dispute_type.includes('Court')));
    }
    if (activeCategory === 'VALUATION') {
      return alerts.filter((a) => (a.dispute_type && a.dispute_type.includes('Multiplier')) || (a.current_stage && a.current_stage.includes('Compensation')));
    }
    if (activeCategory === 'CLEARANCE') {
      return alerts.filter((a) => (a.env_clearance_status && a.env_clearance_status.includes('Pending')) || (a.current_stage && a.current_stage.includes('SIA')));
    }
    return alerts;
  }, [alerts, activeCategory]);

  if (loading) {
    return (
      <div className="gov-card p-12 text-center rounded space-y-2 bg-white dark:bg-[#111A24]">
        <div className="w-6 h-6 border-2 border-[#1D4ED8] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-[#0F2942] dark:text-[#F3F6FA]">
          Loading Risk Alert Work Queue...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title & Queue Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] dark:border-[#263342] pb-3">
        <div>
          <h1 className="text-lg font-bold text-[#0F2942] dark:text-[#F3F6FA] tracking-tight">
            Risk Alert Center
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
            Operational work queue of milestone delay breaches, writ petitions, and valuation appeals
          </p>
        </div>

        <div className="text-xs font-mono-num font-semibold text-[#B91C1C] dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded border border-red-200 dark:border-red-900/40">
          {alerts.length} Cases Requiring Intervention
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#1D4ED8] dark:bg-[#2563EB] text-white font-semibold'
                : 'bg-white dark:bg-[#111A24] text-[#475569] dark:text-[#9AA8B8] border border-[#E2E8F0] dark:border-[#263342] hover:bg-[#F8FAFC] dark:hover:bg-[#151F2B]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="gov-card p-12 text-center text-xs text-[#64748B] dark:text-[#9AA8B8] bg-white dark:bg-[#111A24]">
            No active alerts under this category.
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const caseId = item.case_id || item.project_id;
            const probPct = Math.round((item.risk_score || 0.88) * 100);
            const hasLitigation = item.legal_cases_pending > 0;

            return (
              <div
                key={caseId}
                className="gov-card p-3.5 border-l-4 border-l-[#DC2626] bg-white dark:bg-[#111A24] flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Row 1: Case ID, Project, Severity */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num text-xs font-semibold px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#151F2B] text-[#1D4ED8] dark:text-[#3B82F6] border border-[#E2E8F0] dark:border-[#263342]">
                      {caseId}
                    </span>
                    <h2 className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA] truncate">
                      {item.project_name}
                    </h2>
                    <RiskBadge level={item.risk_level || 'High'} />
                  </div>

                  {/* Row 2: Procedural Reason for Alert */}
                  <p className="text-xs text-[#334155] dark:text-[#9AA8B8] leading-snug">
                    <strong className="text-[#0F172A] dark:text-[#F3F6FA]">Reason: </strong>
                    {item.current_stage || item.stage} phase elapsed statutory timeline with {probPct}% predicted delay probability.
                    {hasLitigation && ' Active legal petition pending in court.'}
                  </p>

                  {/* Row 3: Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#9AA8B8] pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#64748B] dark:text-[#6F7D8D]" />
                      <span>{item.district} District</span>
                    </span>

                    <span>&bull;</span>

                    <span className="font-mono-num">
                      Exposure: <strong className="text-[#0F172A] dark:text-[#F3F6FA] font-semibold">&#8377;{item.compensation_offered_cr} Cr</strong>
                    </span>

                    <span>&bull;</span>

                    <span className="text-xs text-[#1D4ED8] dark:text-[#3B82F6] font-medium">
                      Action: Initiate dispute resolution review
                    </span>
                  </div>
                </div>

                {/* Restrained CTA */}
                <div className="shrink-0">
                  <button
                    onClick={() => onSelectCase(item)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:text-white bg-blue-50 dark:bg-blue-950/30 hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] rounded border border-blue-200 dark:border-blue-900/50 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Audit Dossier</span>
                    <ArrowRight className="w-3 h-3" />
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
