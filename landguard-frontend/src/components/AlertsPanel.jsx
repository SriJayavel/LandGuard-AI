import React, { useEffect, useState } from 'react';
import { getAlerts } from '../services/api';
import RiskBadge from './RiskBadge';
import { ShieldAlert, AlertTriangle, Sparkles, Scale, DollarSign, RefreshCw, ArrowRight } from 'lucide-react';

const AlertsPanel = ({ onSelectCase }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlertsData = () => {
    setLoading(true);
    getAlerts()
      .then((res) => {
        setAlerts(res.data.alerts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch alerts:', err);
        setError('Failed to fetch high-risk alerts. Please verify backend API.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const totalCompAtRisk = alerts.reduce((acc, a) => acc + (parseFloat(a.compensation_offered_cr) || 0), 0);
  const totalLitigationCases = alerts.reduce((acc, a) => acc + (parseInt(a.legal_cases_pending) || 0), 0);
  const totalProtestEvents = alerts.reduce((acc, a) => acc + (parseInt(a.local_protests_count) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-rose-900/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            Early Warning & High-Risk Priority Queue
          </h2>
          <p className="text-xs text-slate-400">
            Proactive early intervention queue for projects flagged with severe delay, litigation, or protest risks
          </p>
        </div>
        <button
          onClick={fetchAlertsData}
          disabled={loading}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Risk Feed
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-rose-900/50 bg-rose-950/20">
          <span className="text-xs text-rose-300 font-semibold block">Critical High Risk Cases</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-400">{alerts.length}</span>
            <span className="text-xs text-slate-400">Urgent Attention</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-amber-900/50 bg-amber-950/20">
          <span className="text-xs text-amber-300 font-semibold block">Compensation Capital at Risk</span>
          <div className="flex items-baseline gap-1 mt-1 text-amber-400">
            <span className="text-3xl font-black">&#8377;{totalCompAtRisk.toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400">Cr</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20">
          <span className="text-xs text-cyan-300 font-semibold block">Pending Court Litigations</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-cyan-400">{totalLitigationCases}</span>
            <span className="text-xs text-slate-400">Active Writs</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-purple-900/50 bg-purple-950/20">
          <span className="text-xs text-purple-300 font-semibold block">Protest Flashpoints</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-purple-400">{totalProtestEvents}</span>
            <span className="text-xs text-slate-400">Agitations Logged</span>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-xl space-y-3">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-rose-400 font-medium animate-pulse">Evaluating AI High-Risk Trigger Conditions...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-6 rounded-xl border border-rose-800 text-rose-300 text-xs text-center">
          {error}
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-xl text-slate-400 text-sm">
          No critical alerts found. All land acquisition projects are operating within normal risk parameters.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const riskPct = (alert.risk_score * 100).toFixed(1);
            return (
              <div
                key={alert.case_id}
                className="glass-card p-5 rounded-xl border border-slate-700/60 hover:border-rose-700/60 transition-all duration-300 space-y-4 shadow-lg hover:shadow-rose-950/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-xs border border-rose-800/50 font-bold">
                        CRITICAL ALERT
                      </span>
                      <span className="font-mono text-xs text-slate-400">{alert.case_id}</span>
                      <h3 className="text-base font-bold text-white">{alert.project_name}</h3>
                      <RiskBadge level={alert.risk_level} />
                    </div>
                    <p className="text-xs text-slate-400">
                      District: <strong className="text-slate-200">{alert.district}</strong> &bull; Stage: <strong className="text-slate-200">{alert.current_stage}</strong> &bull; Type: <strong className="text-slate-200">{alert.project_type}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Risk Score</span>
                      <span className="text-xl font-black text-rose-400">{riskPct}%</span>
                    </div>
                    <button
                      onClick={() => onSelectCase(alert)}
                      className="py-2 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-cyan-500/25"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Explain AI Risk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Risk Drivers summary badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Compensation Budget</span>
                    <span className="font-bold text-emerald-400">&#8377;{alert.compensation_offered_cr} Cr</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Pending Litigations</span>
                    <span className={`font-bold ${alert.legal_cases_pending > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {alert.legal_cases_pending} Pending
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Protests Logged</span>
                    <span className={`font-bold ${alert.local_protests_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                      {alert.local_protests_count} Agitations
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Env Clearance</span>
                    <span className={`font-bold ${alert.env_clearance_status === 'Obtained' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {alert.env_clearance_status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
