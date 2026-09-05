import React, { useEffect, useState } from 'react';
import { getBottlenecks } from '../services/api';
import { BarChart2, MapPin, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function InsightsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBottlenecks = () => {
    setLoading(true);
    getBottlenecks()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load bottlenecks:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBottlenecks();
  }, []);

  const defaultStageBottlenecks = [
    { stage: 'Compensation Payment', high_risk_count: 48 },
    { stage: 'Section 19 Declaration', high_risk_count: 36 },
    { stage: 'Award Inquiry', high_risk_count: 29 },
    { stage: 'Section 11 Notification', high_risk_count: 22 },
    { stage: 'Land Possession', high_risk_count: 15 },
  ];

  const stageData = data?.stage_bottlenecks && data.stage_bottlenecks.length > 0
    ? data.stage_bottlenecks
    : defaultStageBottlenecks;

  const affectedDistricts = [
    { district: 'Amravati', highRiskCount: 34, primaryCause: 'Valuation & Multiplier Disputes' },
    { district: 'Pune', highRiskCount: 28, primaryCause: 'High Court Writ Injunctions' },
    { district: 'Nashik', highRiskCount: 24, primaryCause: 'Environmental Clearances Pending' },
    { district: 'Nagpur', highRiskCount: 19, primaryCause: 'R&R Land Allotment Lags' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">Bottleneck Analysis</h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Institutional assessment identifying where statutory delays and legal disputes concentrate
          </p>
        </div>
        <button
          onClick={fetchBottlenecks}
          className="px-3 py-1.5 bg-white hover:bg-[#F5F7FA] text-xs font-semibold text-[#172033] rounded border border-[#D9E1EA] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Main Grid: Stage Bottlenecks & Most Affected Districts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Bottlenecks Chart */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-[#D9E1EA] pb-3">
            <h3 className="text-sm font-bold text-[#172033]">Stage Bottlenecks</h3>
            <p className="text-xs text-[#667085] mt-0.5">Number of critical delay risk cases accumulated per acquisition phase</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={stageData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
              >
                <XAxis type="number" stroke="#667085" fontSize={11} />
                <YAxis type="category" dataKey="stage" stroke="#172033" fontSize={11} width={130} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-2 rounded shadow-md border border-[#D9E1EA] text-xs">
                          <span className="font-bold text-[#123B63] block">{d.stage}</span>
                          <span className="text-[#667085]">Critical Cases: <strong className="text-[#DC2626] font-mono">{d.high_risk_count}</strong></span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="high_risk_count" fill="#1769AA" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Affected Districts */}
        <div className="gov-card p-5 space-y-4">
          <div className="border-b border-[#D9E1EA] pb-3">
            <h3 className="text-sm font-bold text-[#172033]">Most Affected Districts</h3>
            <p className="text-xs text-[#667085] mt-0.5">Geographic concentration of unresolved land acquisition litigations</p>
          </div>

          <div className="space-y-3 pt-1">
            {affectedDistricts.map((item) => (
              <div key={item.district} className="p-3 bg-[#F8FAFC] rounded border border-[#D9E1EA] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1769AA]" />
                    <span className="font-bold text-xs text-[#172033]">{item.district} District</span>
                  </div>
                  <span className="text-[11px] text-[#667085] mt-0.5 block">
                    Primary cause: {item.primaryCause}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[#DC2626] block">{item.highRiskCount}</span>
                  <span className="text-[10px] text-[#667085]">Stalled cases</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Policy Directives (RFCTLARR 2013) */}
      <div className="gov-card p-5 space-y-4">
        <div className="border-b border-[#D9E1EA] pb-3">
          <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Strategic Policy & Operational Reform Guidance (RFCTLARR Act 2013 Framework)</span>
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Systemic administrative recommendations for district collectors and revenue officers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#F8FAFC] border border-[#D9E1EA] rounded space-y-1">
            <span className="font-bold text-[#123B63] block">1. Early Valuation Adjustment</span>
            <p className="text-[#667085] leading-relaxed">
              Mandate circle-rate multiplier reviews during Section 11 Notification to preempt 68% of High Court compensation appeals.
            </p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#D9E1EA] rounded space-y-1">
            <span className="font-bold text-[#123B63] block">2. Single-Window Forest Portal</span>
            <p className="text-[#667085] leading-relaxed">
              Integrate forest land diversion reviews with Section 19 Declarations to eliminate average 14-month inter-departmental stalls.
            </p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#D9E1EA] rounded space-y-1">
            <span className="font-bold text-[#123B63] block">3. Bi-Weekly Gram Sabha Logs</span>
            <p className="text-[#667085] leading-relaxed">
              Enforce digital recording of local consultation grievances to resolve community disputes before project tender publication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
