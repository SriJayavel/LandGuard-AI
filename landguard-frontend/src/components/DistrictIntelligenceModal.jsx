import React, { useState } from 'react';
import {
  X, MapPin, AlertTriangle, Clock, TrendingUp,
  Scale, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight,
  Layers, Sliders, ExternalLink
} from 'lucide-react';

export const MAHARASHTRA_DISTRICT_DATA = {
  Pune: {
    name: 'Pune',
    division: 'Pune Division',
    headquarters: 'Pune Collectorate',
    totalCases: 102,
    criticalCases: 41,
    elevatedCases: 48,
    stableCases: 13,
    exposureCr: '1,820',
    avgDelay: '73d',
    topRisk: 'Compensation',
    topRiskDescription: 'Section 26 ready-reckoner circle rate multiplier disputes dominate 44% of delayed cases across Haveli and Khed talukas.',
    topBottleneck: 'Survey → Award',
    bottleneckDescription: 'Conversion between Section 4 SIA / joint cadastral boundary demarcation and Section 23/26 final award inquiry accounts for 58% of cumulative delay.',
    statutoryCliffCases: 7,
    activeStays: 2,
    subDivisions: [
      { taluka: 'Haveli', cases: 42, critical: 18, exposure: '780 Cr', primaryDispute: 'Ready Reckoner Multiplier 2.0x' },
      { taluka: 'Khed', cases: 28, critical: 12, exposure: '520 Cr', primaryDispute: 'Industrial Expressway Corridor RoW' },
      { taluka: 'Shirur', cases: 18, critical: 6, exposure: '310 Cr', primaryDispute: 'Agricultural Valuation Disparity' },
      { taluka: 'Maval', cases: 14, critical: 5, exposure: '210 Cr', primaryDispute: 'Eco-Sensitive Buffer Zone Overlap' }
    ],
    priorityCorridors: [
      { name: 'Pune Outer Ring Road (Eastern & Western Alignment)', parcels: 42, status: 'High Court WP-8921 Stay Active', delay: '+78d' },
      { name: 'Pune-Shirur Industrial Bypass RoW Package-1', parcels: 18, status: 'Sec 25 SLA Elapsed (148d)', delay: '+58d' },
      { name: 'Wagholi Industrial RoW Package-2 Multiplier Appeal', parcels: 12, status: 'Sec 26 Valuation Dispute', delay: '+68d' }
    ]
  },
  Nagpur: {
    name: 'Nagpur',
    division: 'Nagpur Division',
    headquarters: 'Nagpur Collectorate',
    totalCases: 84,
    criticalCases: 28,
    elevatedCases: 42,
    stableCases: 14,
    exposureCr: '1,340',
    avgDelay: '54d',
    topRisk: 'Forest clearance',
    topRiskDescription: 'Stage-1 non-forest diversion under Forest Conservation Act 1980 awaiting MoEFCC regional concurrence.',
    topBottleneck: 'Section 4 SIA → Sec 11',
    bottleneckDescription: 'Tribal gram sabha consultation hearings under PESA Act 1996 in Ramtek and Umred circles.',
    statutoryCliffCases: 4,
    activeStays: 1,
    subDivisions: [
      { taluka: 'Nagpur Rural', cases: 34, critical: 12, exposure: '580 Cr', primaryDispute: 'MIHAN SEZ Multiplier Claim' },
      { taluka: 'Hingna', cases: 26, critical: 9, exposure: '410 Cr', primaryDispute: 'MIDC Industrial Land Valuation' },
      { taluka: 'Ramtek', cases: 14, critical: 4, exposure: '210 Cr', primaryDispute: 'Forest Boundary Buffer Overlap' },
      { taluka: 'Umred', cases: 10, critical: 3, exposure: '140 Cr', primaryDispute: 'Mining Resettlement Rehabilitation' }
    ],
    priorityCorridors: [
      { name: 'Samruddhi Mahamarg Package-1 Feeder Spur', parcels: 34, status: 'Stage-1 Forest NOC Pending', delay: '+48d' },
      { name: 'Nagpur-Bhandara Expressway RoW Package-3', parcels: 26, status: 'Joint Inspection Awaiting Report', delay: '+38d' }
    ]
  },
  Nashik: {
    name: 'Nashik',
    division: 'Nashik Division',
    headquarters: 'Nashik Collectorate',
    totalCases: 68,
    criticalCases: 22,
    elevatedCases: 34,
    stableCases: 12,
    exposureCr: '960',
    avgDelay: '48d',
    topRisk: 'Legal stay',
    topRiskDescription: 'High Court Article 226 writ petitions contested by grape orchard farmers contesting land categorization.',
    topBottleneck: 'Award → Compensation',
    bottleneckDescription: 'Disbursement of enhanced solatium and 12% interest calculation disputes before SDO Niphad.',
    statutoryCliffCases: 3,
    activeStays: 2,
    subDivisions: [
      { taluka: 'Nashik Rural', cases: 28, critical: 10, exposure: '420 Cr', primaryDispute: 'Horticultural Crop Multiplier' },
      { taluka: 'Niphad', cases: 20, critical: 7, exposure: '290 Cr', primaryDispute: 'High Court Injunction on Canal RoW' },
      { taluka: 'Sinnar', cases: 12, critical: 3, exposure: '150 Cr', primaryDispute: 'Industrial Park Access Dispute' },
      { taluka: 'Igatpuri', cases: 8, critical: 2, exposure: '100 Cr', primaryDispute: 'Ghat Section Tribal Resettlement' }
    ],
    priorityCorridors: [
      { name: 'Nashik-Solapur Green Field Corridor Package-2', parcels: 28, status: 'Horticultural Valuation Claim', delay: '+52d' },
      { name: 'Niphad Agro-Expressway Feeder', parcels: 20, status: 'High Court Writ Listing', delay: '+44d' }
    ]
  },
  Thane: {
    name: 'Thane',
    division: 'Konkan Division',
    headquarters: 'Thane Collectorate',
    totalCases: 76,
    criticalCases: 35,
    elevatedCases: 29,
    stableCases: 12,
    exposureCr: '2,150',
    avgDelay: '82d',
    topRisk: 'Title dispute',
    topRiskDescription: 'Multiple Satbara (7/12) mutation entries, legal heir contests, and ancestral partition suits.',
    topBottleneck: 'Notification → Survey',
    bottleneckDescription: 'Dense urban boundary demarcation objections and coastal CRZ clearance delays.',
    statutoryCliffCases: 6,
    activeStays: 3,
    subDivisions: [
      { taluka: 'Kalyan', cases: 30, critical: 15, exposure: '920 Cr', primaryDispute: 'Urban GAOTHAN Boundary Overlap' },
      { taluka: 'Bhiwandi', cases: 24, critical: 11, exposure: '680 Cr', primaryDispute: 'Logistics Corridor Land Title Claims' },
      { taluka: 'Murbad', cases: 14, critical: 6, exposure: '370 Cr', primaryDispute: 'Joint Family Satbara Mutation Objections' },
      { taluka: 'Shahapur', cases: 8, critical: 3, exposure: '180 Cr', primaryDispute: 'Catchment Dam Displacement R&R' }
    ],
    priorityCorridors: [
      { name: 'Virar-Alibaug Multi-Modal Corridor (Thane Section)', parcels: 30, status: 'CRZ / Mangrove Buffer Demarcation', delay: '+88d' },
      { name: 'Bhiwandi Bypass Freight Expressway', parcels: 24, status: 'Civil Court Title Dispute', delay: '+76d' }
    ]
  },
  Aurangabad: {
    name: 'Aurangabad',
    division: 'Chhatrapati Sambhajinagar',
    headquarters: 'Sambhajinagar Collectorate',
    totalCases: 58,
    criticalCases: 19,
    elevatedCases: 27,
    stableCases: 12,
    exposureCr: '820',
    avgDelay: '42d',
    topRisk: 'Compensation',
    topRiskDescription: 'Semi-arid agricultural land valuation disparity vs AURIC Smart City industrial circle rates.',
    topBottleneck: 'Survey → Award',
    bottleneckDescription: 'Delayed joint measurement survey in drought-prone talukas.',
    statutoryCliffCases: 2,
    activeStays: 1,
    subDivisions: [
      { taluka: 'Aurangabad Rural', cases: 26, critical: 9, exposure: '380 Cr', primaryDispute: 'AURIC Node Multiplier Revision' },
      { taluka: 'Paithan', cases: 16, critical: 5, exposure: '220 Cr', primaryDispute: 'Canal Network Demarcation' },
      { taluka: 'Gangapur', cases: 10, critical: 3, exposure: '130 Cr', primaryDispute: 'Irrigated Land Classification' },
      { taluka: 'Vaijapur', cases: 6, critical: 2, exposure: '90 Cr', primaryDispute: 'Village Gaothan Relocation' }
    ],
    priorityCorridors: [
      { name: 'Samruddhi Connector to Jalna-Nanded Corridor', parcels: 26, status: 'Sec 26 Valuation Review', delay: '+46d' }
    ]
  },
  Amravati: {
    name: 'Amravati',
    division: 'Amravati Division',
    headquarters: 'Amravati Collectorate',
    totalCases: 46,
    criticalCases: 14,
    elevatedCases: 22,
    stableCases: 10,
    exposureCr: '540',
    avgDelay: '38d',
    topRisk: 'Livelihood R&R',
    topRiskDescription: 'Second Schedule Resettlement and Rehabilitation entitlement demands by non-landholding tenant farmers.',
    topBottleneck: 'Compensation → Possession',
    bottleneckDescription: 'Disbursement of livelihood grants before taking actual physical possession.',
    statutoryCliffCases: 2,
    activeStays: 0,
    subDivisions: [
      { taluka: 'Amravati Rural', cases: 20, critical: 7, exposure: '250 Cr', primaryDispute: 'R&R Housing Plot Allocation' },
      { taluka: 'Achalpur', cases: 14, critical: 4, exposure: '160 Cr', primaryDispute: 'Orange Orchard Tree Compensation' },
      { taluka: 'Morshi', cases: 12, critical: 3, exposure: '130 Cr', primaryDispute: 'Irrigation Canal Feeder Alignment' }
    ],
    priorityCorridors: [
      { name: 'Amravati Agro-Industrial Node Stage-II', parcels: 20, status: 'FRA Clearance Uploaded', delay: '+36d' }
    ]
  },
  Kolhapur: {
    name: 'Kolhapur',
    division: 'Kolhapur Division',
    headquarters: 'Kolhapur Collectorate',
    totalCases: 39,
    criticalCases: 11,
    elevatedCases: 19,
    stableCases: 9,
    exposureCr: '460',
    avgDelay: '35d',
    topRisk: 'Boundary overlap',
    topRiskDescription: 'High-value sugarcane riparian land demarcation disputes along Panchganga river basin.',
    topBottleneck: 'Survey → Award',
    bottleneckDescription: 'Cadastral map reconciliation with British-era GTS benchmark stones.',
    statutoryCliffCases: 1,
    activeStays: 0,
    subDivisions: [
      { taluka: 'Karveer', cases: 18, critical: 6, exposure: '220 Cr', primaryDispute: 'Riverfront Boundary Demarcation' },
      { taluka: 'Hatkanangle', cases: 12, critical: 3, exposure: '140 Cr', primaryDispute: 'Textile Hub Expressway RoW' },
      { taluka: 'Shirol', cases: 9, critical: 2, exposure: '100 Cr', primaryDispute: 'Sugarcane Multiplier Claim' }
    ],
    priorityCorridors: [
      { name: 'Kolhapur-Sangli Expressway Widening RoW', parcels: 18, status: 'Joint Survey Verification', delay: '+34d' }
    ]
  }
};

export default function DistrictIntelligenceModal({
  districtName = 'Pune',
  onClose = () => {},
  onFilterDistrict = () => {},
  onSimulateDistrict = () => {}
}) {
  const [activeDistrict, setActiveDistrict] = useState(districtName || 'Pune');
  const d = MAHARASHTRA_DISTRICT_DATA[activeDistrict] || MAHARASHTRA_DISTRICT_DATA.Pune;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150 select-none">
      <div className="bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-2xl shadow-xl w-full max-w-4xl max-h-[92dvh] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#0F141C]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="gov-metadata font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                District Profile
              </span>
              <span className="text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8]">
                &bull; {d.division} &bull; {d.headquarters}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#1D4ED8] dark:text-[#60A5FA]" />
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-[#F3F6FA] tracking-tight">
                {d.name} District Intelligence
              </h1>
            </div>
          </div>

          {/* Quick District Selector & Close */}
          <div className="flex items-center gap-2">
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="bg-white dark:bg-[#131923] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
            >
              {Object.keys(MAHARASHTRA_DISTRICT_DATA).map((dist) => (
                <option key={dist} value={dist}>
                  {dist} ({MAHARASHTRA_DISTRICT_DATA[dist].totalCases} cases)
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] dark:text-[#9AA8B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-ring"
              aria-label="Close District Intelligence"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* EXACT USER SPECIFICATION KPI ROW:
              Pune | 102 cases | 41 critical | ₹1,820 Cr exposure | Average delay: 73d */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Total Proceedings
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono-num text-[#0F172A] dark:text-[#F3F6FA] mt-0.5">
                {d.totalCases} cases
              </div>
              <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block mt-0.5">
                Active gazette notifications
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-red-400 block">
                Critical Severity
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono-num text-[#B91C1C] dark:text-red-400 mt-0.5">
                {d.criticalCases} critical
              </div>
              <span className="text-3xs text-red-700/80 dark:text-red-400/80 block mt-0.5">
                Probability &gt; 70% of delay
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#E2E8F0] dark:border-[#212B38]">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Financial Exposure
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono-num text-[#0F172A] dark:text-[#F3F6FA] mt-0.5">
                &#8377;{d.exposureCr} Cr exposure
              </div>
              <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block mt-0.5">
                Statutory compensation outlay
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <span className="text-3xs font-bold uppercase tracking-wider text-[#B45309] dark:text-amber-400 block">
                Average Stage Slippage
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono-num text-[#B45309] dark:text-amber-400 mt-0.5">
                Average delay: {d.avgDelay}
              </div>
              <span className="text-3xs text-amber-700/80 dark:text-amber-400/80 block mt-0.5">
                Elapsed beyond statutory SLA
              </span>
            </div>
          </div>

          {/* EXACT USER SPECIFICATION: TOP RISK & TOP BOTTLENECK CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Risk Card */}
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Top Risk Driver</span>
                </span>
                <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-[#B91C1C] dark:text-red-300">
                  Primary Causal Vector
                </span>
              </div>
              <div className="text-base font-extrabold text-[#0F172A] dark:text-[#F3F6FA]">
                Top risk: {d.topRisk}
              </div>
              <p className="text-xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                {d.topRiskDescription}
              </p>
              <div className="pt-2 border-t border-red-200/60 dark:border-red-900/40 flex items-center justify-between text-2xs text-[#B91C1C] dark:text-red-400 font-medium">
                <span>Active High Court Injunctions: <strong>{d.activeStays} cases</strong></span>
                <span>Section 25 Clifflines: <strong>{d.statutoryCliffCases} cases</strong></span>
              </div>
            </div>

            {/* Top Bottleneck Card */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase tracking-wider text-[#B45309] dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Top Process Bottleneck</span>
                </span>
                <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[#B45309] dark:text-amber-300">
                  Critical SLA Friction
                </span>
              </div>
              <div className="text-base font-extrabold text-[#0F172A] dark:text-[#F3F6FA]">
                Top bottleneck: {d.topBottleneck}
              </div>
              <p className="text-xs text-[#475569] dark:text-[#9AA8B8] leading-relaxed">
                {d.bottleneckDescription}
              </p>
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-2xs text-[#B45309] dark:text-amber-400 font-medium">
                <span>Benchmark: <strong>90 days</strong></span>
                <span>District Median: <strong>163 days (1.81x)</strong></span>
              </div>
            </div>
          </div>

          {/* TALUKA / SUB-DIVISIONAL REGISTER */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#9AA8B8] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Taluka Sub-Divisional Breakdown &bull; {d.name} District</span>
              </h2>
              <span className="text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8]">
                Revenue Circle Roll-up
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#212B38]">
              {d.subDivisions.map((sub) => (
                <div key={sub.taluka} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#0F172A] dark:text-[#F3F6FA] flex items-center gap-2">
                      <span>{sub.taluka} Taluka</span>
                      <span className="text-3xs font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#475569] dark:text-[#9AA8B8]">
                        {sub.primaryDispute}
                      </span>
                    </div>
                    <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
                      Exposure: &#8377;{sub.exposure} &bull; {sub.cases} cases registered
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono-num text-2xs shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      {sub.critical} Critical
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="text-[#0F172A] dark:text-[#F3F6FA] font-semibold">
                      {sub.cases} Total Cases
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRIORITY HIGH-EXPOSURE CORRIDORS */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#9AA8B8] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Priority Infrastructure Corridors in {d.name}</span>
            </h2>

            <div className="space-y-2">
              {d.priorityCorridors.map((c) => (
                <div key={c.name} className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-xs text-[#0F172A] dark:text-[#F3F6FA] truncate">
                      {c.name}
                    </div>
                    <div className="text-3xs text-[#64748B] dark:text-[#9AA8B8] flex items-center gap-2">
                      <span>{c.parcels} Monitored Parcels</span>
                      <span>&bull;</span>
                      <span className="text-[#B91C1C] dark:text-red-400 font-medium">{c.status}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono-num font-bold text-[#B45309] dark:text-amber-400 shrink-0">
                    {c.delay} Delay
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] flex flex-wrap items-center justify-between gap-3">
          <div className="text-2xs text-[#64748B] dark:text-[#9AA8B8]">
            State of Maharashtra Land Records &bull; Section 3(g) Competent Authority Register
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onFilterDistrict(d.name);
              }}
              className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-ring"
            >
              <span>Filter Portfolio to {d.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onClose();
                onSimulateDistrict(d.name);
              }}
              className="px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-[#F3F6FA] text-xs font-semibold rounded-lg border border-[#E2E8F0] dark:border-[#212B38] transition-colors flex items-center gap-1.5 cursor-pointer focus-ring"
            >
              <Sliders className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Simulate District Levers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
