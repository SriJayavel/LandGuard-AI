import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import {
  AlertTriangle, Clock, Scale, Coins, ShieldAlert, ArrowRight,
  MapPin, X, CheckCircle2, Filter, ChevronRight
} from 'lucide-react';

const DIVISION_DISTRICTS = {
  'All Divisions': null,
  'Pune Division': ['Pune', 'Solapur', 'Satara', 'Sangli', 'Kolhapur'],
  'Kolhapur Division': ['Kolhapur', 'Ratnagiri', 'Sindhudurg', 'Sangli'],
  'Amravati Division': ['Amravati', 'Akola', 'Yavatmal', 'Buldhana', 'Washim'],
  'Nashik Division': ['Nashik', 'Ahmednagar', 'Dhule', 'Jalgaon', 'Nandurbar'],
  'Nagpur Division': ['Nagpur', 'Wardha', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli'],
  'Chhatrapati Sambhajinagar': ['Aurangabad', 'Chhatrapati Sambhajinagar', 'Jalna', 'Beed', 'Nanded', 'Osmanabad', 'Latur', 'Parbhani', 'Hingoli'],
};

const MOCK_ALERT_ITEMS = [
  // CRITICAL (12)
  { id: 'ALT-101', case_id: 'LA-1059', project_name: 'Aurangabad Industrial City Logistics Hub', district: 'Aurangabad', bucket: 'CRITICAL', risk_score: 0.94, risk_level: 'High', days_in_stage: 68, exposure_cr: '50.3', triggerDate: '08 Sep', trigger: 'High Court stay and multiplier contestation escalated risk to critical.' },
  { id: 'ALT-102', case_id: 'LA-1004', project_name: 'Khandala Industrial Corridor Package-4', district: 'Nagpur', bucket: 'CRITICAL', risk_score: 0.91, risk_level: 'High', days_in_stage: 54, exposure_cr: '42.8', triggerDate: '07 Sep', trigger: 'Collective landowner objection filed on 12.4 Ha Right-of-Way.' },
  { id: 'ALT-103', case_id: 'LA-1012', project_name: 'Pune Outer Ring Road Western Section 2', district: 'Pune', bucket: 'CRITICAL', risk_score: 0.89, risk_level: 'High', days_in_stage: 72, exposure_cr: '78.5', triggerDate: '06 Sep', trigger: 'Valuation objection exceeds allocation by ₹18.2 Cr.' },
  { id: 'ALT-104', case_id: 'LA-1028', project_name: 'Solapur-Kurnool Economic Corridor', district: 'Solapur', bucket: 'CRITICAL', risk_score: 0.88, risk_level: 'High', days_in_stage: 62, exposure_cr: '34.2', triggerDate: '05 Sep', trigger: 'Inheritance dispute blocks award distribution across 8 parcels.' },
  { id: 'ALT-105', case_id: 'LA-1035', project_name: 'Nashik Industrial Freight Bypass', district: 'Nashik', bucket: 'CRITICAL', risk_score: 0.87, risk_level: 'High', days_in_stage: 48, exposure_cr: '29.4', triggerDate: '04 Sep', trigger: 'Landowners demanding commercial multiplier conversion.' },
  { id: 'ALT-106', case_id: 'LA-1042', project_name: 'Amravati Textile Park Link Road', district: 'Amravati', bucket: 'CRITICAL', risk_score: 0.86, risk_level: 'High', days_in_stage: 58, exposure_cr: '19.8', triggerDate: '03 Sep', trigger: 'Forest diversion rejected — missing gram sabha quorum.' },
  { id: 'ALT-107', case_id: 'LA-1049', project_name: 'Thane-Borivali Twin Tunnel South Portal', district: 'Thane', bucket: 'CRITICAL', risk_score: 0.92, risk_level: 'High', days_in_stage: 84, exposure_cr: '112.0', triggerDate: '02 Sep', trigger: 'Structure demolition resistance with commercial reallocation demands.' },
  { id: 'ALT-108', case_id: 'LA-1055', project_name: 'Kolhapur Foundry Cluster Corridor', district: 'Kolhapur', bucket: 'CRITICAL', risk_score: 0.85, risk_level: 'High', days_in_stage: 46, exposure_cr: '24.1', triggerDate: '01 Sep', trigger: 'Reference application filed for valuation review.' },
  { id: 'ALT-109', case_id: 'LA-1061', project_name: 'Samruddhi Feeder Node Wardha', district: 'Wardha', bucket: 'CRITICAL', risk_score: 0.88, risk_level: 'High', days_in_stage: 65, exposure_cr: '38.0', triggerDate: '31 Aug', trigger: 'Tenant farmers demanding 100% solatium parity.' },
  { id: 'ALT-110', case_id: 'LA-1068', project_name: 'Jalna Dry Port Rail Siding', district: 'Jalna', bucket: 'CRITICAL', risk_score: 0.86, risk_level: 'High', days_in_stage: 52, exposure_cr: '27.5', triggerDate: '30 Aug', trigger: 'Cadastral boundary mismatch with survey coordinates.' },
  { id: 'ALT-111', case_id: 'LA-1073', project_name: 'Dighi Port Industrial Corridor Raigad', district: 'Raigad', bucket: 'CRITICAL', risk_score: 0.89, risk_level: 'High', days_in_stage: 76, exposure_cr: '64.0', triggerDate: '29 Aug', trigger: 'Coastal regulation clearance delayed pending recommendations.' },
  { id: 'ALT-112', case_id: 'LA-1080', project_name: 'Sambhajinagar Ring Corridor Package-2', district: 'Aurangabad', bucket: 'CRITICAL', risk_score: 0.87, risk_level: 'High', days_in_stage: 59, exposure_cr: '35.6', triggerDate: '28 Aug', trigger: 'Multiple title claims after primary landholder death.' },

  // DELAY (4)
  { id: 'ALT-201', case_id: 'LA-1019', project_name: 'Pune-Shirur Industrial Bypass', district: 'Pune', bucket: 'DELAY', risk_score: 0.93, risk_level: 'High', days_in_stage: 148, exposure_cr: '88.4', triggerDate: '08 Sep', trigger: '148 days elapsed in Award phase — approaching lapse deadline.' },
  { id: 'ALT-202', case_id: 'LA-1031', project_name: 'Nagpur Outer Ring Road Section 4', district: 'Nagpur', bucket: 'DELAY', risk_score: 0.90, risk_level: 'High', days_in_stage: 132, exposure_cr: '52.0', triggerDate: '07 Sep', trigger: '132 days in Compensation — 102 days over milestone SLA.' },
  { id: 'ALT-203', case_id: 'LA-1044', project_name: 'Nashik-Trimbak Highway Widening', district: 'Nashik', bucket: 'DELAY', risk_score: 0.89, risk_level: 'High', days_in_stage: 124, exposure_cr: '41.5', triggerDate: '05 Sep', trigger: '124 days awaiting tree cutting permit signoff.' },
  { id: 'ALT-204', case_id: 'LA-1052', project_name: 'Solapur Textile Park Link', district: 'Solapur', bucket: 'DELAY', risk_score: 0.86, risk_level: 'High', days_in_stage: 118, exposure_cr: '31.2', triggerDate: '03 Sep', trigger: '118 days in Survey — expert committee term expired.' },

  // STAY (3)
  { id: 'ALT-301', case_id: 'LA-1004', project_name: 'Bombay HC Stay — Khandala Corridor', district: 'Nagpur', bucket: 'STAY', risk_score: 0.95, risk_level: 'High', days_in_stage: 72, exposure_cr: '50.3', triggerDate: '07 Sep', trigger: 'High Court granted interim status quo order on dispossession.' },
  { id: 'ALT-302', case_id: 'LA-1025', project_name: 'Civil Court Stay — Pune Gat 142', district: 'Pune', bucket: 'STAY', risk_score: 0.91, risk_level: 'High', days_in_stage: 64, exposure_cr: '39.8', triggerDate: '04 Sep', trigger: 'Interim injunction against summary vesting of Gat No. 142/3A.' },
  { id: 'ALT-303', case_id: 'LA-1064', project_name: 'NGT Stop-Work — Thane Mangrove Zone', district: 'Thane', bucket: 'STAY', risk_score: 0.88, risk_level: 'High', days_in_stage: 56, exposure_cr: '74.0', triggerDate: '01 Sep', trigger: 'Stop-work order pending mangrove buffer zone demarcation.' },

  // COMPENSATION (7)
  { id: 'ALT-401', case_id: 'LA-1059', project_name: 'Wagholi RoW Package-2 Appeal', district: 'Pune', bucket: 'COMPENSATION', risk_score: 0.94, risk_level: 'High', days_in_stage: 68, exposure_cr: '50.3', triggerDate: '08 Sep', trigger: 'Landowners demanding 2.0x multiplier vs 1.42x applied rate.' },
  { id: 'ALT-402', case_id: 'LA-1033', project_name: 'Ahmednagar Bypass Valuation Claim', district: 'Ahmednagar', bucket: 'COMPENSATION', risk_score: 0.89, risk_level: 'High', days_in_stage: 58, exposure_cr: '36.5', triggerDate: '07 Sep', trigger: 'Claim ₹3,200/sqm vs benchmark ₹1,850/sqm.' },
  { id: 'ALT-403', case_id: 'LA-1047', project_name: 'Nashik Agro Hub Compensation Protest', district: 'Nashik', bucket: 'COMPENSATION', risk_score: 0.87, risk_level: 'High', days_in_stage: 50, exposure_cr: '28.0', triggerDate: '06 Sep', trigger: 'Horticultural crop valuation dispute — ₹8.4 Cr additional claimed.' },
  { id: 'ALT-404', case_id: 'LA-1058', project_name: 'Aurangabad East Bypass Collective', district: 'Aurangabad', bucket: 'COMPENSATION', risk_score: 0.88, risk_level: 'High', days_in_stage: 61, exposure_cr: '44.2', triggerDate: '04 Sep', trigger: 'Dispute over solatium and interest computation methodology.' },
  { id: 'ALT-405', case_id: 'LA-1066', project_name: 'Barshi Highway Corridor Package-3', district: 'Solapur', bucket: 'COMPENSATION', risk_score: 0.85, risk_level: 'High', days_in_stage: 44, exposure_cr: '21.5', triggerDate: '03 Sep', trigger: 'Pre-acquisition conversion permit ignored in valuation.' },
  { id: 'ALT-406', case_id: 'LA-1071', project_name: 'Amravati-Badnera Logistics Siding', district: 'Amravati', bucket: 'COMPENSATION', risk_score: 0.86, risk_level: 'High', days_in_stage: 49, exposure_cr: '26.8', triggerDate: '02 Sep', trigger: 'Community grazing land compensation demanded by village.' },
  { id: 'ALT-407', case_id: 'LA-1078', project_name: 'Nagpur Multi-Modal Cargo Hub', district: 'Nagpur', bucket: 'COMPENSATION', risk_score: 0.87, risk_level: 'High', days_in_stage: 55, exposure_cr: '39.0', triggerDate: '01 Sep', trigger: 'Reference petition claiming ₹14.5 Cr valuation increment.' },
];

const BUCKET_CONFIG = {
  CRITICAL:     { label: 'Critical',     color: 'red',    icon: ShieldAlert,    desc: 'Risk score exceeded 0.85 threshold' },
  DELAY:        { label: 'Delay',        color: 'amber',  icon: Clock,          desc: 'Exceeded milestone SLA' },
  STAY:         { label: 'Legal Stay',   color: 'violet', icon: Scale,          desc: 'Court injunction blocking progress' },
  COMPENSATION: { label: 'Compensation', color: 'blue',   icon: Coins,          desc: 'Valuation or multiplier dispute' },
};

const COLOR_MAP = {
  red:    { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-300 dark:border-red-800/40', ring: 'ring-red-400/30', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300', left: 'border-l-red-500' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-300 dark:border-amber-800/40', ring: 'ring-amber-400/30', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300', left: 'border-l-amber-500' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-300 dark:border-violet-800/40', ring: 'ring-violet-400/30', text: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300', left: 'border-l-violet-500' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-300 dark:border-blue-800/40', ring: 'ring-blue-400/30', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300', left: 'border-l-blue-500' },
};

export default function AlertsPanel({
  onSelectCase = () => {},
  onNavigate = () => {},
  selectedDivision = 'All Divisions',
  onResetDivision = () => {},
  initialCategory = 'ALL'
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'ALL');

  // Filter by division
  const divisionAlerts = useMemo(() => {
    if (!selectedDivision || selectedDivision === 'All Divisions') return MOCK_ALERT_ITEMS;
    const allowed = DIVISION_DISTRICTS[selectedDivision];
    if (!allowed) return MOCK_ALERT_ITEMS;
    return MOCK_ALERT_ITEMS.filter(a => {
      const dist = (a.district || '').toLowerCase();
      return allowed.some(d => dist.includes(d.toLowerCase()));
    });
  }, [selectedDivision]);

  // Counts per bucket
  const counts = useMemo(() => ({
    CRITICAL: divisionAlerts.filter(a => a.bucket === 'CRITICAL').length,
    DELAY: divisionAlerts.filter(a => a.bucket === 'DELAY').length,
    STAY: divisionAlerts.filter(a => a.bucket === 'STAY').length,
    COMPENSATION: divisionAlerts.filter(a => a.bucket === 'COMPENSATION').length,
  }), [divisionAlerts]);

  // Total financial exposure
  const totalExposure = useMemo(() => {
    return divisionAlerts.reduce((sum, a) => sum + parseFloat(a.exposure_cr || 0), 0).toFixed(1);
  }, [divisionAlerts]);

  // Filter by category
  const filteredAlerts = useMemo(() => {
    if (activeCategory === 'ALL') return divisionAlerts;
    return divisionAlerts.filter(a => a.bucket === activeCategory);
  }, [divisionAlerts, activeCategory]);

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#EEF2F7] tracking-tight">
              Alert Center
            </h1>
            {selectedDivision !== 'All Divisions' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                {selectedDivision}
                <button onClick={onResetDivision} className="hover:text-red-500 cursor-pointer ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-[#7A8A9A] mt-0.5">
            {divisionAlerts.length} active alerts · ₹{totalExposure} Cr total exposure
          </p>
        </div>
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(BUCKET_CONFIG).map(([key, cfg]) => {
          const colors = COLOR_MAP[cfg.color];
          const Icon = cfg.icon;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? 'ALL' : key)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                isActive
                  ? `${colors.bg} ${colors.border} ring-2 ${colors.ring}`
                  : 'glass-card hover:border-slate-300 dark:hover:border-[rgba(255,255,255,0.12)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#7A8A9A] uppercase tracking-wide">
                  {cfg.label}
                </span>
                <Icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className={`text-2xl font-bold font-mono ${colors.text}`}>
                {counts[key]}
              </div>
              <p className="text-xs text-slate-500 dark:text-[#7A8A9A] mt-1 leading-snug">
                {cfg.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-[#4D5C6E]" />
          {[
            { id: 'ALL', label: `All (${divisionAlerts.length})` },
            { id: 'CRITICAL', label: `Critical (${counts.CRITICAL})` },
            { id: 'DELAY', label: `Delay (${counts.DELAY})` },
            { id: 'STAY', label: `Legal Stay (${counts.STAY})` },
            { id: 'COMPENSATION', label: `Compensation (${counts.COMPENSATION})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeCategory === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-[#12171F] text-slate-600 dark:text-[#B8C4D0] border border-slate-200 dark:border-[rgba(255,255,255,0.07)] hover:bg-slate-200 dark:hover:bg-[#181E28]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">
          Showing {filteredAlerts.length} of {divisionAlerts.length}
        </span>
      </div>

      {/* Alert cards */}
      <div className="space-y-2.5">
        {filteredAlerts.map(alert => {
          const cfg = BUCKET_CONFIG[alert.bucket] || BUCKET_CONFIG.CRITICAL;
          const colors = COLOR_MAP[cfg.color];

          return (
            <div
              key={alert.id}
              className={`glass-card border-l-4 ${colors.left} p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3`}
            >
              {/* Left content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Row 1: ID + Name + Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onSelectCase(alert)}
                    className="text-xs font-mono font-bold text-blue-600 dark:text-[#4D8EF0] hover:underline cursor-pointer shrink-0"
                  >
                    {alert.case_id}
                  </button>
                  <span className="text-xs font-medium text-slate-800 dark:text-[#EEF2F7] truncate">
                    {alert.project_name}
                  </span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Row 2: Trigger */}
                <p className="text-xs text-slate-600 dark:text-[#B8C4D0] leading-relaxed">
                  {alert.trigger}
                </p>

                {/* Row 3: Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-[#7A8A9A]">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-[#B8C4D0]">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    {alert.district}
                  </span>
                  <span className="text-slate-300 dark:text-[#3A4555]">·</span>
                  <span>₹{alert.exposure_cr} Cr</span>
                  <span className="text-slate-300 dark:text-[#3A4555]">·</span>
                  <span className="font-mono text-red-500 dark:text-red-400">{alert.days_in_stage}d elapsed</span>
                  <span className="text-slate-300 dark:text-[#3A4555]">·</span>
                  <span className="font-mono">{alert.triggerDate}</span>
                </div>
              </div>

              {/* Right: Risk badge + action */}
              <div className="flex items-center gap-2.5 shrink-0">
                <RiskBadge level={alert.risk_level} score={alert.risk_score} size="sm" />
                <button
                  onClick={() => onSelectCase(alert)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  Review <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredAlerts.length === 0 && (
          <div className="glass-card p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-[#EEF2F7]">
              No alerts in this category
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#7A8A9A]">
              All cases {selectedDivision !== 'All Divisions' ? `in ${selectedDivision}` : ''} are within normal parameters.
            </p>
            <button
              onClick={() => setActiveCategory('ALL')}
              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              View All Alerts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
