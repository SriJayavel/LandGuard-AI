import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell
} from 'recharts';
import {
  ShieldCheck, AlertTriangle, ArrowRight, Layers, ExternalLink,
  FileText, CheckCircle2, ChevronRight, Building2, Scale,
  Compass, Trees, Users, MapPin, IndianRupee, Clock, Sliders,
  Printer, Filter, Search, ArrowUpRight, Check, Sparkles,
  Info, RefreshCw
} from 'lucide-react';

export default function InsightsPanel({ cases = [], onNavigate, onFilterDistrict }) {
  const [selectedAgency, setSelectedAgency] = useState('ALL');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStageFilter, setLedgerStageFilter] = useState('ALL');
  const [ledgerSortBy, setLedgerSortBy] = useState('delay'); // 'delay', 'exposure', 'district'
  const [actionNotice, setActionNotice] = useState(null);

  const [selectedCell, setSelectedCell] = useState({
    district: 'Pune',
    departmentId: 'judiciary',
    departmentName: 'Judiciary',
    level: 'critical',
    delay: '88 days',
    cases: 36,
    exposure: '₹1,180 Cr',
    driver: 'Compensation valuation disputes and Section 64 reference appeals',
    statutoryRoot: 'Contestation over rural market multiplier application (2.0x vs 1.42x) and circle-rate ready reckoner base valuations.',
    remediation: 'Convene District Level Valuation Committee (DLVC) special hearing to formalize negotiated consent awards under Section 23A.',
    estimatedSavings: '₹420 Cr unlocked • 45 days timeline acceleration'
  });

  // 5 Inter-Departmental Agencies
  const departments = [
    {
      id: 'revenue',
      name: 'Revenue',
      fullName: 'Revenue Department / SDO',
      icon: Building2,
      avgDelay: 54,
      slaBenchmark: 30,
      casesBlocked: 38,
      exposureCr: 1240,
      exposure: '₹1,240 Cr',
      status: 'Moderate',
      statusColor: '#D97706',
      mandate: 'Land mutation, 7/12 Satbara reconciliation & partition inquiries',
      statutoryRemedy: 'Issue Tahsil-level Camp Adalat orders for expedited partition hearings under MLR Code Section 85.',
      primaryActions: [
        'Convene Tahsil Camp Adalat',
        'Expedite 7/12 Satbara Mutation',
        'Export Revenue Directive'
      ]
    },
    {
      id: 'survey',
      name: 'Survey',
      fullName: 'Joint Measurement Survey / DLR',
      icon: Compass,
      avgDelay: 42,
      slaBenchmark: 25,
      casesBlocked: 29,
      exposureCr: 890,
      exposure: '₹890 Cr',
      status: 'Elevated',
      statusColor: '#2563EB',
      mandate: 'Cadastral demarcation, drone boundary verification & Gat division',
      statutoryRemedy: 'Deploy empaneled dual-frequency DGPS teams to reconcile satellite boundary vectors against ground pegs.',
      primaryActions: [
        'Mobilize DGPS Drone Teams',
        'Verify Cadastral Overlaps',
        'Issue Joint Demarcation Notice'
      ]
    },
    {
      id: 'forest',
      name: 'Forest',
      fullName: 'Forest & Environment / MoEFCC',
      icon: Trees,
      avgDelay: 74,
      slaBenchmark: 45,
      casesBlocked: 21,
      exposureCr: 1420,
      exposure: '₹1,420 Cr',
      status: 'Critical',
      statusColor: '#EA580C',
      mandate: 'Stage-I/II forest diversion clearances & Gram Sabha FRA consents',
      statutoryRemedy: 'Expedite non-encumbrance verification for compensatory afforestation land and convene special FRA Gram Sabha sessions.',
      primaryActions: [
        'Fast-Track MoEFCC Stage-II',
        'Convene FRA Gram Sabha',
        'Submit Non-Encumbrance Memo'
      ]
    },
    {
      id: 'judiciary',
      name: 'Judiciary',
      fullName: 'High Court Benches / Reference Courts',
      icon: Scale,
      avgDelay: 83,
      slaBenchmark: 30,
      casesBlocked: 44,
      exposureCr: 2840,
      exposure: '₹2,840 Cr',
      status: 'Critical',
      statusColor: '#B91C1C',
      mandate: 'Writ petitions (Art. 226), stay orders & Section 64 valuation references',
      statutoryRemedy: 'Submit comparative land transaction schedules of preceding 3 years and file urgency praecipe through Government Pleader.',
      primaryActions: [
        'Convene DLVC Special Hearing',
        'File Urgency Caveat in High Court',
        'Propose Section 23A Consent Award'
      ]
    },
    {
      id: 'rr',
      name: 'R&R',
      fullName: 'Rehabilitation & Resettlement',
      icon: Users,
      avgDelay: 48,
      slaBenchmark: 30,
      casesBlocked: 19,
      exposureCr: 620,
      exposure: '₹620 Cr',
      status: 'Moderate',
      statusColor: '#7C3AED',
      mandate: 'Second Schedule housing, annuity disbursement & township creation',
      statutoryRemedy: 'Sanction upfront one-time lump-sum rehabilitation grant option under Second Schedule Item 4.',
      primaryActions: [
        'Sanction Lump-Sum Grant Option',
        'Handover Resettlement Plots',
        'Reconcile Annuity Bank Accounts'
      ]
    }
  ];

  // Inter-Departmental Heatmap Dataset (Districts x Departments)
  const heatmapData = [
    {
      district: 'Pune',
      division: 'Pune',
      totalCases: 112,
      ratings: {
        revenue: { level: 'moderate', delay: '34 days', delayNum: 34, cases: 14, exposure: '₹340 Cr', driver: 'Pending Gat sub-division and inheritance succession disputes', statutoryRoot: 'MLR Code partition inquiries pending before Tahsildar.', remediation: 'Organize Revenue Camp Adalat for expedited mutation certifications.' },
        survey: { level: 'critical', delay: '62 days', delayNum: 62, cases: 28, exposure: '₹710 Cr', driver: 'High-density urban peri-fringe boundary overlap contestations', statutoryRoot: 'Cadastral Resurvey discrepancies between satellite and ground records.', remediation: 'Deploy DLR drone verification team with dual-frequency DGPS.' },
        forest: { level: 'stable', delay: '12 days', delayNum: 12, cases: 3, exposure: '₹80 Cr', driver: 'Environmental clearances certified on schedule', statutoryRoot: 'Minor tree transit permits awaiting local sign-off.', remediation: 'Maintain standard single-window forestry portal processing.' },
        judiciary: { level: 'critical', delay: '88 days', delayNum: 88, cases: 36, exposure: '₹1,180 Cr', driver: 'Compensation valuation disputes and Section 64 reference appeals', statutoryRoot: 'Contestation over rural market multiplier application (2.0x vs 1.42x).', remediation: 'Convene DLVC special hearing to formalize negotiated consent awards under Section 23A.' },
        rr: { level: 'moderate', delay: '28 days', delayNum: 28, cases: 11, exposure: '₹220 Cr', driver: 'Industrial corridor compensation disbursement verification', statutoryRoot: 'Transit accommodation plot allocations pending local approval.', remediation: 'Fast-track civic infrastructure handover for PAP resettlement.' }
      }
    },
    {
      district: 'Thane',
      division: 'Konkan',
      totalCases: 98,
      ratings: {
        revenue: { level: 'stable', delay: '16 days', delayNum: 16, cases: 6, exposure: '₹190 Cr', driver: 'Digital mutation synchronization active', statutoryRoot: 'E-MahaBhumi synchronization completed.', remediation: 'Maintain automated digital mutation verification.' },
        survey: { level: 'elevated', delay: '48 days', delayNum: 48, cases: 22, exposure: '₹640 Cr', driver: 'MMR corridor alignment adjustments & coastal zones', statutoryRoot: 'CRZ Notification demarcation boundary revisions pending.', remediation: 'Engage National Centre for Sustainable Coastal Management for boundary maps.' },
        forest: { level: 'critical', delay: '82 days', delayNum: 82, cases: 26, exposure: '₹890 Cr', driver: 'Mangrove conservation clearances & Stage-II MoEFCC permits', statutoryRoot: 'High Court order enjoining mangrove clearance without MCZMA clearance.', remediation: 'File urgent compliance memo with Chief Conservator of Forests.' },
        judiciary: { level: 'moderate', delay: '38 days', delayNum: 38, cases: 18, exposure: '₹420 Cr', driver: 'Title ownership disputes in coastal village extracts', statutoryRoot: 'Succession claims following landholder demise.', remediation: 'Establish special lok adalat bench for coastal land title settlements.' },
        rr: { level: 'critical', delay: '64 days', delayNum: 64, cases: 21, exposure: '₹580 Cr', driver: 'Urban slum rehabilitation package and transit accommodation disputes', statutoryRoot: 'Second Schedule allotment resistance from project-affected residents.', remediation: 'Sanction upfront one-time lump-sum rehabilitation grant option.' }
      }
    },
    {
      district: 'Nagpur',
      division: 'Nagpur',
      totalCases: 104,
      ratings: {
        revenue: { level: 'critical', delay: '68 days', delayNum: 68, cases: 24, exposure: '₹560 Cr', driver: 'Agricultural land tenure regularization bottlenecks', statutoryRoot: 'Occupancy Class-II conversion dues calculation dispute.', remediation: 'Issue government resolution clarifying conversion formula.' },
        survey: { level: 'stable', delay: '14 days', delayNum: 14, cases: 4, exposure: '₹120 Cr', driver: 'Cadastral boundaries verified with automated DGPS', statutoryRoot: 'Survey milestones achieved within statutory timeline.', remediation: 'Maintain current joint measurement survey workflow.' },
        forest: { level: 'critical', delay: '86 days', delayNum: 86, cases: 32, exposure: '₹1,050 Cr', driver: 'Melghat / Umred wildlife corridor diversion review', statutoryRoot: 'Gram Sabha quorum deficit under FRA 2006 for CFR diversion.', remediation: 'Coordinate with ITDP Project Officer to conduct special Gram Sabha sessions.' },
        judiciary: { level: 'elevated', delay: '52 days', delayNum: 52, cases: 19, exposure: '₹480 Cr', driver: 'Section 18 reference court interest disputes', statutoryRoot: 'Claimants seeking 12% additional market value interest adjustment.', remediation: 'Reconcile interest calculations with Treasury voucher protocol.' },
        rr: { level: 'stable', delay: '18 days', delayNum: 18, cases: 7, exposure: '₹180 Cr', driver: 'Resettlement center plots allotted in designated node', statutoryRoot: 'All 7 affected settlements relocated satisfactorily.', remediation: 'Issue final vesting certificates under Section 38.' }
      }
    },
    {
      district: 'Nashik',
      division: 'Nashik',
      totalCases: 86,
      ratings: {
        revenue: { level: 'moderate', delay: '32 days', delayNum: 32, cases: 12, exposure: '₹260 Cr', driver: 'Joint family title record division bottlenecks', statutoryRoot: 'Multiple unregistered heir shares in ancestral agricultural land.', remediation: 'Conduct Tahsil-level legal heir inquiry hearings.' },
        survey: { level: 'critical', delay: '66 days', delayNum: 66, cases: 27, exposure: '₹680 Cr', driver: 'Highway widening alignment peg shifts and orchard cuts', statutoryRoot: 'Dispute between NHAI concessionaire and local horticulture owners.', remediation: 'Joint inspection by DLR and Agriculture Officer to mark revised pegs.' },
        forest: { level: 'elevated', delay: '46 days', delayNum: 46, cases: 14, exposure: '₹340 Cr', driver: 'Social forestry department roadside tree felling permissions', statutoryRoot: 'Tree Authority meeting deferred pending local municipal quorum.', remediation: 'Empower Collector under Section 33 to sign off emergency permits.' },
        judiciary: { level: 'critical', delay: '76 days', delayNum: 76, cases: 23, exposure: '₹790 Cr', driver: 'Vineyard and pomegranate commercial multiplier suits', statutoryRoot: 'Appeals before High Court demanding non-agricultural valuation multiplier.', remediation: 'Present certified horticulture valuation schedules before Court.' },
        rr: { level: 'stable', delay: '15 days', delayNum: 15, cases: 5, exposure: '₹120 Cr', driver: 'Rehabilitation allowance direct benefit transfers executed', statutoryRoot: 'Compensation disbursements fully verified.', remediation: 'Complete administrative closeout of Schedule II records.' }
      }
    },
    {
      district: 'Aurangabad',
      division: 'Chhatrapati Sambhajinagar',
      totalCases: 92,
      ratings: {
        revenue: { level: 'critical', delay: '74 days', delayNum: 74, cases: 29, exposure: '₹720 Cr', driver: 'AURIC Node peri-urban multiplier rate disputes', statutoryRoot: 'Demand for 2.0x rural factor vs 1.42x applied ready reckoner rate.', remediation: 'Convene DLVC hearing under District Collector to review rate differential.' },
        survey: { level: 'moderate', delay: '26 days', delayNum: 26, cases: 9, exposure: '₹210 Cr', driver: 'Industrial freight corridor link boundary pegging', statutoryRoot: 'Minor survey peg discrepancies with railway siding alignment.', remediation: 'Joint measurement with Central Railway survey engineers.' },
        forest: { level: 'stable', delay: '10 days', delayNum: 10, cases: 2, exposure: '₹60 Cr', driver: 'Clearance obtained from State Environment Department', statutoryRoot: 'No protected flora or fauna habitats detected.', remediation: 'Maintain environmental monitoring logs.' },
        judiciary: { level: 'critical', delay: '94 days', delayNum: 94, cases: 31, exposure: '₹1,020 Cr', driver: 'High Court Aurangabad Bench ad-interim stay orders', statutoryRoot: 'Article 226 writ petitions staying possession under Section 38.', remediation: 'File expedited listing praecipe and urgency caveat through Government Pleader.' },
        rr: { level: 'elevated', delay: '42 days', delayNum: 42, cases: 13, exposure: '₹310 Cr', driver: 'Commercial vendor shop relocation and compensation delays', statutoryRoot: 'Demands for shop allotment inside new logistics hub.', remediation: 'Authorize MIDC commercial allotment quota for eligible project-affected persons.' }
      }
    },
    {
      district: 'Solapur',
      division: 'Pune',
      totalCases: 74,
      ratings: {
        revenue: { level: 'critical', delay: '62 days', delayNum: 62, cases: 18, exposure: '₹410 Cr', driver: 'Section 11 notification validity expiry risk', statutoryRoot: 'Lapse of 12-month period between Sec 11 and Sec 19 under Section 25.', remediation: 'Issue emergency extension declaration under Section 19(1) proviso.' },
        survey: { level: 'moderate', delay: '30 days', delayNum: 30, cases: 8, exposure: '₹180 Cr', driver: 'Textile corridor boundary alignment resurvey', statutoryRoot: 'DLR survey team resource constraints during monsoon season.', remediation: 'Mobilize private empaneled drone survey agency.' },
        forest: { level: 'stable', delay: '8 days', delayNum: 8, cases: 1, exposure: '₹30 Cr', driver: 'Clearance verified on schedule', statutoryRoot: 'All statutory forestry conditions complied with.', remediation: 'Proceed to award stage.' },
        judiciary: { level: 'elevated', delay: '58 days', delayNum: 58, cases: 16, exposure: '₹440 Cr', driver: 'Landowners association reference petition on circle rates', statutoryRoot: 'Section 64 reference seeking ready reckoner rate uplift.', remediation: 'Submit comparative land sale statistics of past 3 years to Authority.' },
        rr: { level: 'moderate', delay: '24 days', delayNum: 24, cases: 6, exposure: '₹140 Cr', driver: 'R&R township basic amenity creation verification', statutoryRoot: 'Water supply pipeline connectivity pending.', remediation: 'Direct Municipal Corporation to execute priority utility link.' }
      }
    }
  ];

  // District filter for heatmap
  const filteredHeatmap = useMemo(() => {
    return heatmapData.filter((row) => {
      const matchSearch = !searchDistrict.trim() ||
        row.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
        row.division.toLowerCase().includes(searchDistrict.toLowerCase());

      const matchDivision = selectedDivisionFilter === 'ALL' ||
        row.division.toLowerCase().includes(selectedDivisionFilter.toLowerCase());

      return matchSearch && matchDivision;
    });
  }, [searchDistrict, selectedDivisionFilter]);

  // Chart 1 Data: Agency Delay vs SLA Benchmark
  const agencyDelayChartData = useMemo(() => {
    return departments.map((d) => ({
      agency: d.name,
      fullName: d.fullName,
      actualDelay: d.avgDelay,
      slaBenchmark: d.slaBenchmark,
      delayDelta: d.avgDelay - d.slaBenchmark,
      color: d.statusColor
    }));
  }, []);

  // Chart 2 Data: Capital Exposure by Agency
  const agencyExposureChartData = useMemo(() => {
    return departments.map((d) => ({
      agency: d.name,
      exposureCr: d.exposureCr,
      casesBlocked: d.casesBlocked,
      color: d.statusColor
    }));
  }, []);

  // Comprehensive, realistic Stalled Corridor Registry across all 5 Directorates
  const masterCorridorCases = useMemo(() => {
    return [
      // Judiciary Cases (44 Total State-wide / 7 in Priority Registry)
      { id: 'LA-1059', project: 'Aurangabad Industrial City (AURIC) Multi-Modal Logistics Hub', district: 'Aurangabad', agency: 'Judiciary', agencyId: 'judiciary', stage: 'Compensation', delayDays: 94, exposure: '₹50.3 Cr', exposureNum: 50.3, rootCause: 'Article 226 High Court Stay on 1.42x multiplier challenge' },
      { id: 'LA-1014', project: 'Pune Outer Ring Road Western Alignment Package-2', district: 'Pune', agency: 'Judiciary', agencyId: 'judiciary', stage: 'Award Inquiry', delayDays: 88, exposure: '₹78.5 Cr', exposureNum: 78.5, rootCause: 'Ready Reckoner valuation challenge under Section 64' },
      { id: 'LA-1021', project: 'Nagpur-Goa Shaktipeeth Expressway Corridor Package-4', district: 'Kolhapur', agency: 'Judiciary', agencyId: 'judiciary', stage: 'Section 19 Declaration', delayDays: 84, exposure: '₹62.8 Cr', exposureNum: 62.8, rootCause: 'Writ petition challenging alignment through irrigated sugarcane holdings' },
      { id: 'LA-1037', project: 'Nashik Semi-High-Speed Rail Corridor Link', district: 'Nashik', agency: 'Judiciary', agencyId: 'judiciary', stage: 'Compensation', delayDays: 76, exposure: '₹44.1 Cr', exposureNum: 44.1, rootCause: 'Dispute over non-agricultural multiplier for peri-urban vineyards' },
      { id: 'LA-1064', project: 'Solapur-Bijapur Four-Lane Highway Expansion', district: 'Solapur', agency: 'Judiciary', agencyId: 'judiciary', stage: 'Award Inquiry', delayDays: 58, exposure: '₹31.6 Cr', exposureNum: 31.6, rootCause: 'Joint family title partition suit contesting compensation disbursement' },
      { id: 'LA-1082', project: 'Virar-Alibaug Multi-Modal Corridor Package-1', district: 'Thane', agency: 'Judiciary', agencyId: 'judiciary', stage: 'SIA Clearance', delayDays: 68, exposure: '₹95.4 Cr', exposureNum: 95.4, rootCause: 'Landowners association petition challenging public purpose classification' },
      { id: 'LA-1095', project: 'Dighi Port Industrial Rail Siding Corridor', district: 'Thane', agency: 'Judiciary', agencyId: 'judiciary', stage: 'Section 11 Notification', delayDays: 72, exposure: '₹39.0 Cr', exposureNum: 39.0, rootCause: 'Reference court plea claiming 100% Solatium calculation exclusion' },

      // Revenue Cases (38 Total State-wide / 6 in Priority Registry)
      { id: 'LA-1077', project: 'Solapur Industrial Ring Road Bypass Package-1', district: 'Solapur', agency: 'Revenue', agencyId: 'revenue', stage: 'Award Inquiry', delayDays: 62, exposure: '₹34.2 Cr', exposureNum: 34.2, rootCause: 'Section 25 limitation lapse risk (365-day rule between Sec 11 and Sec 19)' },
      { id: 'LA-1002', project: 'Chhatrapati Sambhajinagar Northern Bypass Corridor', district: 'Aurangabad', agency: 'Revenue', agencyId: 'revenue', stage: 'Section 19 Declaration', delayDays: 74, exposure: '₹48.0 Cr', exposureNum: 48.0, rootCause: 'Occupancy Class-II conversion regularization dues pending before Collector' },
      { id: 'LA-1018', project: 'Pune Eastern Ring Road Infrastructure Link Package-1', district: 'Pune', agency: 'Revenue', agencyId: 'revenue', stage: 'Award Inquiry', delayDays: 56, exposure: '₹41.5 Cr', exposureNum: 41.5, rootCause: 'Unregistered legal heirs in 7/12 Satbara extract holding up award consent' },
      { id: 'LA-1031', project: 'Nagpur Metro Phase-II Hingna Depot Extension', district: 'Nagpur', agency: 'Revenue', agencyId: 'revenue', stage: 'Survey Demarcation', delayDays: 68, exposure: '₹32.8 Cr', exposureNum: 32.8, rootCause: 'Nazul land leasehold tenure conversion reconciliation bottleneck' },
      { id: 'LA-1045', project: 'Malegaon Textile Park Rail Link Corridor', district: 'Nashik', agency: 'Revenue', agencyId: 'revenue', stage: 'Compensation', delayDays: 52, exposure: '₹27.6 Cr', exposureNum: 27.6, rootCause: 'E-MahaBhumi digital mutation mismatch with legacy manual record' },
      { id: 'LA-1068', project: 'Kolhapur IT Park Access Link Corridor', district: 'Kolhapur', agency: 'Revenue', agencyId: 'revenue', stage: 'Section 11 Notification', delayDays: 48, exposure: '₹22.4 Cr', exposureNum: 22.4, rootCause: 'Section 15 objection hearing quorum adjourned pending Tahsildar sign-off' },

      // Survey Cases (29 Total State-wide / 6 in Priority Registry)
      { id: 'LA-1042', project: 'Nashik Agri-Export Freight Bypass Package-3', district: 'Nashik', agency: 'Survey', agencyId: 'survey', stage: 'Survey Demarcation', delayDays: 66, exposure: '₹38.4 Cr', exposureNum: 38.4, rootCause: 'Cadastral Gat boundary overlap with high-value vineyard parcels' },
      { id: 'LA-1033', project: 'Raigad Multi-Product SEZ Rail Link Corridor', district: 'Thane', agency: 'Survey', agencyId: 'survey', stage: 'Survey Demarcation', delayDays: 48, exposure: '₹28.7 Cr', exposureNum: 28.7, rootCause: 'DGPS survey peg coordinates mismatch with Central Railway survey' },
      { id: 'LA-1011', project: 'Baramati Agri-Cluster Freight Spur Line', district: 'Pune', agency: 'Survey', agencyId: 'survey', stage: 'Survey Demarcation', delayDays: 62, exposure: '₹33.5 Cr', exposureNum: 33.5, rootCause: 'Satellite vs ground demarcations divergent by 14.2 meters' },
      { id: 'LA-1027', project: 'Butibori Multi-Modal Logistics Spur Line', district: 'Nagpur', agency: 'Survey', agencyId: 'survey', stage: 'Survey Demarcation', delayDays: 44, exposure: '₹21.0 Cr', exposureNum: 21.0, rootCause: 'Boundary stone pegs uprooted during monsoon channel desilting' },
      { id: 'LA-1053', project: 'Jalna Dry Port Rail Linkage Package-2', district: 'Aurangabad', agency: 'Survey', agencyId: 'survey', stage: 'Section 19 Declaration', delayDays: 54, exposure: '₹36.8 Cr', exposureNum: 36.8, rootCause: 'Private drone survey vendor data format incompatible with Land Records CAD' },
      { id: 'LA-1074', project: 'Pandharpur Pilgrim Ring Road Package-2', district: 'Solapur', agency: 'Survey', agencyId: 'survey', stage: 'Survey Demarcation', delayDays: 50, exposure: '₹25.2 Cr', exposureNum: 25.2, rootCause: 'High-density peri-urban temple boundary alignment contestations' },

      // Forest Cases (21 Total State-wide / 5 in Priority Registry)
      { id: 'LA-1028', project: 'Nagpur Multi-Modal Freight Logistics Terminal', district: 'Nagpur', agency: 'Forest', agencyId: 'forest', stage: 'SIA Clearance', delayDays: 86, exposure: '₹46.1 Cr', exposureNum: 46.1, rootCause: 'Melghat tiger corridor Gram Sabha CFR quorum deficit under FRA 2006' },
      { id: 'LA-1049', project: 'Thane-Borivali Twin Tunnel South Portal RoW', district: 'Thane', agency: 'Forest', agencyId: 'forest', stage: 'Section 19 Declaration', delayDays: 82, exposure: '₹112.0 Cr', exposureNum: 112.0, rootCause: 'Mangrove buffer zone stop-work injunction by NGT pending MCZMA nod' },
      { id: 'LA-1008', project: 'Sinhagad Foothills Water Canal Aqueduct', district: 'Pune', agency: 'Forest', agencyId: 'forest', stage: 'SIA Clearance', delayDays: 74, exposure: '₹29.5 Cr', exposureNum: 29.5, rootCause: 'Stage-I MoEFCC approval pending compensatory afforestation non-encumbrance' },
      { id: 'LA-1039', project: 'Igatpuri Wind Farm Access Road Expansion', district: 'Nashik', agency: 'Forest', agencyId: 'forest', stage: 'Section 11 Notification', delayDays: 46, exposure: '₹18.2 Cr', exposureNum: 18.2, rootCause: 'Social Forestry roadside tree felling permissions pending Tree Authority' },
      { id: 'LA-1061', project: 'Gautala Wildlife Sanctuary Peripheral Bypass', district: 'Aurangabad', agency: 'Forest', agencyId: 'forest', stage: 'Award Inquiry', delayDays: 64, exposure: '₹35.0 Cr', exposureNum: 35.0, rootCause: 'Eco-Sensitive Zone (ESZ) boundary buffer compliance clarification required' },

      // R&R Cases (19 Total State-wide / 5 in Priority Registry)
      { id: 'LA-1005', project: 'Thane Metro Rail Phase-II Extension Corridor', district: 'Thane', agency: 'R&R', agencyId: 'rr', stage: 'Land Possession', delayDays: 64, exposure: '₹65.2 Cr', exposureNum: 65.2, rootCause: 'Second Schedule urban slum transit housing allotment protest' },
      { id: 'LA-1016', project: 'Purandar Airport Access Expressway Corridor', district: 'Pune', agency: 'R&R', agencyId: 'rr', stage: 'Compensation', delayDays: 58, exposure: '₹52.4 Cr', exposureNum: 52.4, rootCause: 'Project-affected families requesting alternate agricultural plots over cash' },
      { id: 'LA-1035', project: 'MIDC Butibori Industrial Township Phase-III', district: 'Nagpur', agency: 'R&R', agencyId: 'rr', stage: 'Land Possession', delayDays: 42, exposure: '₹24.8 Cr', exposureNum: 24.8, rootCause: 'Relocation of traditional artisan colony awaiting civic infrastructure' },
      { id: 'LA-1057', project: 'Shendra Industrial Node Transit Housing Colony', district: 'Aurangabad', agency: 'R&R', agencyId: 'rr', stage: 'Award Inquiry', delayDays: 50, exposure: '₹31.0 Cr', exposureNum: 31.0, rootCause: 'Demand for commercial shop allocation quota inside new industrial hub' },
      { id: 'LA-1079', project: 'Solapur Thermal Power Station Ash Pond Canal', district: 'Solapur', agency: 'R&R', agencyId: 'rr', stage: 'Compensation', delayDays: 46, exposure: '₹19.5 Cr', exposureNum: 19.5, rootCause: 'Annuity disbursement bank account seeding discrepancies for 42 families' }
    ];
  }, []);

  // Filtered and Sorted Stalled Corridor Cases
  const filteredCorridorCases = useMemo(() => {
    let list = [...masterCorridorCases];

    // Filter by Agency
    if (selectedAgency !== 'ALL') {
      const deptName = departments.find(d => d.id === selectedAgency)?.name;
      list = list.filter(c => c.agency === deptName);
    }

    // Filter by Search
    if (ledgerSearch.trim()) {
      const q = ledgerSearch.toLowerCase().trim();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.project.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.rootCause.toLowerCase().includes(q)
      );
    }

    // Filter by Stage
    if (ledgerStageFilter !== 'ALL') {
      list = list.filter(c => c.stage.toLowerCase() === ledgerStageFilter.toLowerCase());
    }

    // Sort
    if (ledgerSortBy === 'delay') {
      list.sort((a, b) => b.delayDays - a.delayDays);
    } else if (ledgerSortBy === 'exposure') {
      list.sort((a, b) => b.exposureNum - a.exposureNum);
    } else if (ledgerSortBy === 'district') {
      list.sort((a, b) => a.district.localeCompare(b.district));
    }

    return list;
  }, [masterCorridorCases, selectedAgency, ledgerSearch, ledgerStageFilter, ledgerSortBy]);

  const activeDepartment = useMemo(() => {
    if (selectedAgency === 'ALL') return null;
    return departments.find(d => d.id === selectedAgency) || null;
  }, [selectedAgency]);

  const handleCellClick = (districtRow, dept) => {
    const rating = districtRow.ratings[dept.id];
    setSelectedCell({
      district: districtRow.district,
      departmentId: dept.id,
      departmentName: dept.name,
      level: rating.level,
      delay: rating.delay,
      cases: rating.cases,
      exposure: rating.exposure,
      driver: rating.driver,
      statutoryRoot: rating.statutoryRoot || 'Statutory review pending under procedural guidelines.',
      remediation: rating.remediation || 'Coordinate inter-departmental joint conciliation taskforce.',
      estimatedSavings: `${rating.exposure} unlocked • ${(parseInt(rating.delay, 10) || 45) - 15} days accelerated`
    });
  };

  const handleTriggerAction = (actionTitle) => {
    setActionNotice(`Dispatched Directive: ${actionTitle} sent to District Collectorate.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Helper for heatmap cell styles
  const getHeatmapCellStyle = (level, isSelected) => {
    if (isSelected) {
      return 'ring-2 ring-[#1D4ED8] ring-offset-2 ring-offset-white dark:ring-offset-[#101623] shadow-sm bg-blue-50/90 dark:bg-blue-950/60 border-[#1D4ED8] dark:border-blue-500 scale-[1.03] z-10';
    }

    switch (level) {
      case 'critical':
        return 'bg-red-500/10 hover:bg-red-500/20 border-red-500/25 dark:bg-red-950/40 dark:hover:bg-red-950/60 dark:border-red-900/40 text-red-800 dark:text-red-300';
      case 'elevated':
        return 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/25 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 dark:border-orange-900/40 text-orange-800 dark:text-orange-300';
      case 'moderate':
        return 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/25 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300';
      case 'stable':
      default:
        return 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300';
    }
  };

  const getHeatmapDot = (level) => {
    switch (level) {
      case 'critical':
        return 'bg-red-600';
      case 'elevated':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-amber-500';
      case 'stable':
      default:
        return 'bg-emerald-600';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-8 select-none">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{actionNotice}</span>
        </div>
      )}

      {/* 1. Page Header & Actions */}
      <div className="gov-surface p-4 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h1 className="gov-page-title">
            Agency Bottleneck &amp; Friction Diagnostics
          </h1>
          <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
            Cross-departmental delay analysis, statutory root-cause tracing, and resolution pathways across directorates
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate && onNavigate('simulator')}
            className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Fast-Track</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('actions')}
            className="px-3 py-1.5 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] text-xs font-semibold text-[#0F172A] dark:text-[#F3F6FA] border border-[#CBD5E1] dark:border-[#212B38] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-ring"
          >
            <FileText className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Issue Directive</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:text-[#9AA8B8] dark:hover:text-white rounded-lg border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] cursor-pointer"
            title="Print diagnostic brief"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Executive Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Active Stalls</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="gov-large-kpi text-red-700 dark:text-red-400 mt-1">151 Corridors</div>
          <p className="gov-metadata-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">Blocked across 5 directorates</p>
        </div>

        <div className="p-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Longest Overrun</span>
            <Clock className="w-4 h-4 text-red-600" />
          </div>
          <div className="gov-large-kpi text-red-700 dark:text-red-400 mt-1">Judiciary (83d)</div>
          <p className="gov-metadata-xs text-red-600 dark:text-red-400 mt-0.5">+53 days beyond 30d SLA</p>
        </div>

        <div className="p-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Capital at Risk</span>
            <IndianRupee className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <div className="gov-large-kpi text-[#1D4ED8] dark:text-[#60A5FA] mt-1">&#8377;7,010 Cr</div>
          <p className="gov-metadata-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">Contested compensation &amp; stays</p>
        </div>

        <div className="p-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="gov-metadata-xs uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">Leading Driver</span>
            <Scale className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <div className="gov-large-kpi text-purple-700 dark:text-purple-400 mt-1">68.4% Rate</div>
          <p className="gov-metadata-xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">Valuation multiplier appeals</p>
        </div>
      </div>

      {/* 3. VISUAL ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Delay vs Statutory SLA Benchmark (7 Cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5">
            <div>
              <h2 className="gov-section-title">
                Agency Delay vs Statutory SLA Benchmark
              </h2>
              <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Actual median processing duration compared to statutory clearance benchmark (days)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-2xs font-semibold">
              <span className="inline-flex items-center gap-1 text-[#1D4ED8] dark:text-[#60A5FA]">
                <span className="w-2.5 h-2.5 rounded bg-[#1D4ED8]"></span> Actual Delay
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500 ml-2">
                <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700"></span> Statutory SLA
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agencyDelayChartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="agency" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="d" />
                <Tooltip
                  formatter={(val, name) => [`${val} days`, name === 'actualDelay' ? 'Actual Delay' : 'Statutory SLA']}
                  labelFormatter={(label) => `${label} Department`}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="actualDelay" name="actualDelay" radius={[4, 4, 0, 0]}>
                  {agencyDelayChartData.map((entry) => (
                    <Cell key={entry.agency} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="slaBenchmark" name="slaBenchmark" fill="#94A3B8" opacity={0.4} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Blocked Capital Exposure by Agency (5 Cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5">
            <div>
              <h2 className="gov-section-title">
                Blocked Capital Exposure
              </h2>
              <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Financial exposure locked per directorate (₹ Cr)
              </p>
            </div>
            <span className="gov-metadata font-mono-num font-bold text-red-700 dark:text-red-400">
              ₹7,010 Cr Total
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agencyExposureChartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} unit=" Cr" />
                <YAxis dataKey="agency" type="category" tick={{ fontSize: 12, fill: '#64748B' }} width={65} />
                <Tooltip
                  formatter={(val) => [`₹${val} Cr`, 'Exposure at Risk']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="exposureCr" name="exposureCr" radius={[0, 4, 4, 0]}>
                  {agencyExposureChartData.map((entry) => (
                    <Cell key={entry.agency} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. INSTITUTIONAL DISTRICT DELAY HEATMAP MATRIX + ACTIONABLE ROOT-CAUSE PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 7 Cols: State-of-the-Art Heatmap Table */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#212B38] pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="gov-card-title text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  District Inter-Departmental Delay Heatmap Matrix
                </h3>
              </div>
              <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                Click any cell to inspect statutory root causes and dispatch directives
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter district..."
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded-lg bg-[#F8FAFC] dark:bg-[#0F141C] border border-[#CBD5E1] dark:border-[#212B38] text-[#0F172A] dark:text-[#F3F6FA] w-36 focus-ring"
                />
              </div>

              {searchDistrict && (
                <button
                  onClick={() => setSearchDistrict('')}
                  className="text-2xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA] cursor-pointer hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Institutional Friction Severity Legend Ribbon */}
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0C111D] border border-[#CBD5E1] dark:border-[#1E293B] flex flex-wrap items-center justify-between gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Latency Thresholds:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5 text-2xs">
              <span className="px-2 py-0.5 rounded-md font-semibold bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Critical (&gt;60d)
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Elevated (40-60d)
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Moderate (20-40d)
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Stable (&lt;20d)
              </span>
            </div>
          </div>

          {/* Matrix Heatmap Table */}
          <div className="overflow-x-auto rounded-lg border border-[#CBD5E1] dark:border-[#1E293B]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#CBD5E1] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#0C111D] text-3xs font-bold uppercase text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-2.5 px-3 w-36">District</th>
                  <th className="py-2.5 px-1.5 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <Building2 className="w-3 h-3 text-[#D97706]" /> Revenue
                      </span>
                      <span className="text-3xs font-normal text-[#64748B] dark:text-[#94A3B8]">SLA: 30d</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-1.5 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <Compass className="w-3 h-3 text-[#2563EB]" /> Survey
                      </span>
                      <span className="text-3xs font-normal text-[#64748B] dark:text-[#94A3B8]">SLA: 25d</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-1.5 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <Trees className="w-3 h-3 text-[#EA580C]" /> Forest
                      </span>
                      <span className="text-3xs font-normal text-[#64748B] dark:text-[#94A3B8]">SLA: 45d</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-1.5 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <Scale className="w-3 h-3 text-[#B91C1C]" /> Judiciary
                      </span>
                      <span className="text-3xs font-normal text-[#64748B] dark:text-[#94A3B8]">SLA: 30d</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-1.5 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <Users className="w-3 h-3 text-[#7C3AED]" /> R&amp;R
                      </span>
                      <span className="text-3xs font-normal text-[#64748B] dark:text-[#94A3B8]">SLA: 30d</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] bg-white dark:bg-[#101623]">
                {filteredHeatmap.map((row) => (
                  <tr key={row.district} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/25 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC] align-middle">
                      <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">{row.district}</div>
                      <div className="text-3xs font-normal text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                        {row.division} &bull; <span className="font-mono-num font-semibold">{row.totalCases}</span> cases
                      </div>
                    </td>

                    {departments.map((dept) => {
                      const rating = row.ratings[dept.id];
                      const isSelected = selectedCell.district === row.district && selectedCell.departmentId === dept.id;
                      const cellStyle = getHeatmapCellStyle(rating.level, isSelected);
                      const dotColor = getHeatmapDot(rating.level);

                      return (
                        <td
                          key={dept.id}
                          onClick={() => handleCellClick(row, dept)}
                          className="py-1.5 px-1 align-middle cursor-pointer"
                        >
                          <div className={`p-2 rounded-lg border transition-all duration-150 flex flex-col items-center justify-center text-center ${cellStyle}`}>
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                              <span className="text-xs font-mono-num font-bold">
                                {rating.delay}
                              </span>
                            </div>

                            <span className="text-3xs font-medium opacity-80 mt-0.5 whitespace-nowrap">
                              {rating.cases} cases
                            </span>

                            {isSelected && (
                              <span className="text-3xs font-extrabold text-[#1D4ED8] dark:text-[#60A5FA] mt-0.5 uppercase tracking-wider">
                                Inspecting
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Matrix Key Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0C111D] border border-[#CBD5E1] dark:border-[#1E293B] text-center">
              <span className="text-3xs text-[#64748B] dark:text-[#94A3B8] block">Peak Overrun</span>
              <span className="text-xs font-mono-num font-bold text-red-700 dark:text-red-400 block mt-0.5">
                Aurangabad Judiciary (94d)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0C111D] border border-[#CBD5E1] dark:border-[#1E293B] text-center">
              <span className="text-3xs text-[#64748B] dark:text-[#94A3B8] block">Highest Exposure</span>
              <span className="text-xs font-mono-num font-bold text-[#1D4ED8] dark:text-[#60A5FA] block mt-0.5">
                Pune Judiciary (₹1,180 Cr)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0C111D] border border-[#CBD5E1] dark:border-[#1E293B] text-center">
              <span className="text-3xs text-[#64748B] dark:text-[#94A3B8] block">Highest Volume</span>
              <span className="text-xs font-mono-num font-bold text-purple-700 dark:text-purple-400 block mt-0.5">
                Pune Survey (28 cases)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0C111D] border border-[#CBD5E1] dark:border-[#1E293B] text-center">
              <span className="text-3xs text-[#64748B] dark:text-[#94A3B8] block">Best Performing</span>
              <span className="text-xs font-mono-num font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                Solapur Forest (8 days)
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Actionable Root-Cause Investigation & Resolution Panel */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900/40 pb-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8] dark:text-[#60A5FA]" />
              <span className="gov-metadata font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                Bottleneck Investigation
              </span>
            </div>
            <span className={`text-3xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
              selectedCell.level === 'critical'
                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900/50'
                : selectedCell.level === 'elevated'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
            }`}>
              {selectedCell.level} friction
            </span>
          </div>

          <div>
            <h3 className="gov-card-title text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {selectedCell.district} &bull; {selectedCell.departmentName} Department
            </h3>
            <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Identified friction holding up active infrastructure corridors in {selectedCell.district}
            </p>
          </div>

          {/* 3 Impact Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-white dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B] space-y-0.5">
              <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">Affected Cases</span>
              <span className="text-sm font-bold font-mono-num text-[#0F172A] dark:text-[#F8FAFC] block">
                {selectedCell.cases}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 space-y-0.5">
              <span className="text-3xs text-red-800 dark:text-red-300 block">Avg Overrun</span>
              <span className="text-sm font-bold font-mono-num text-red-700 dark:text-red-400 block">
                {selectedCell.delay}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 space-y-0.5">
              <span className="text-3xs text-blue-800 dark:text-blue-300 block">Locked Capital</span>
              <span className="text-sm font-bold font-mono-num text-[#1D4ED8] dark:text-[#60A5FA] block">
                {selectedCell.exposure}
              </span>
            </div>
          </div>

          {/* Primary Driver */}
          <div className="p-3 bg-white dark:bg-[#101623] rounded-lg border border-[#CBD5E1] dark:border-[#1E293B] space-y-2 text-xs">
            <div>
              <span className="gov-metadata font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8] block">
                Primary Bottleneck Driver:
              </span>
              <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 leading-snug">
                {selectedCell.driver}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <span className="gov-metadata font-semibold text-[#64748B] dark:text-[#9AA8B8] block mb-0.5">
                Statutory Root Cause:
              </span>
              <p className="gov-body-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {selectedCell.statutoryRoot}
              </p>
            </div>
          </div>

          {/* Recommended Counter-Measure */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/40 space-y-1.5 text-xs">
            <span className="gov-metadata font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Recommended Resolution Pathway:</span>
            </span>
            <p className="gov-body-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
              {selectedCell.remediation}
            </p>
            <div className="pt-1 text-3xs font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
              Estimated Recovery: {selectedCell.estimatedSavings}
            </div>
          </div>

          {/* Direct Workflow Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                if (onFilterDistrict) {
                  onFilterDistrict(selectedCell.district);
                } else if (onNavigate) {
                  onNavigate('portfolio');
                }
              }}
              className="w-full py-2 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View affected cases in {selectedCell.district} ({selectedCell.cases} cases)</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('actions')}
              className="w-full py-2 px-3 bg-white dark:bg-[#101623] hover:bg-slate-50 dark:hover:bg-[#161F32] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-semibold rounded-lg border border-[#CBD5E1] dark:border-[#1E293B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
            >
              <FileText className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Issue Administrative Directive in Action Tracker</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. DEDICATED DIRECTORATE CLEARANCE LEDGER & INTELLIGENCE HUB */}
      <div className="p-4 sm:p-5 rounded-xl border border-[#CBD5E1] dark:border-[#212B38] bg-white dark:bg-[#131923] shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#212B38] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#1D4ED8]" />
              <h2 className="gov-section-title text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Directorate Clearance Ledger &amp; Case Tracking
              </h2>
            </div>
            <p className="gov-metadata text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
              Live statutory case ledger categorized by responsible government directorate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono-num font-semibold bg-[#F1F5F9] dark:bg-[#161F32] border border-[#CBD5E1] dark:border-[#1E293B] text-[#475569] dark:text-[#CBD5E1]">
              Showing {filteredCorridorCases.length} of {masterCorridorCases.length} Corridor Cases
            </span>
          </div>
        </div>

        {/* Directorate Filter Tabs (Directly above the details) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="gov-metadata font-bold uppercase tracking-wider text-[#475569] dark:text-[#CBD5E1]">
              Select Directorate To Inspect:
            </span>
            <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8]">
              Instant filter across 151 statutory corridor bottlenecks
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <button
              onClick={() => setSelectedAgency('ALL')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer focus-ring flex flex-col justify-between ${
                selectedAgency === 'ALL'
                  ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md ring-2 ring-[#1D4ED8]/40'
                  : 'bg-[#F8FAFC] dark:bg-[#101623] hover:bg-slate-100 dark:hover:bg-[#161F32] text-[#0F172A] dark:text-[#F8FAFC] border-[#CBD5E1] dark:border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Layers className={`w-4 h-4 ${selectedAgency === 'ALL' ? 'text-white' : 'text-[#1D4ED8]'}`} />
                <span className={`text-2xs font-mono-num font-bold px-1.5 py-0.5 rounded ${
                  selectedAgency === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1]'
                }`}>
                  151
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold leading-tight">All Directorates</div>
                <div className={`text-3xs mt-0.5 ${selectedAgency === 'ALL' ? 'text-blue-100' : 'text-[#64748B] dark:text-[#9AA8B8]'}`}>
                  State-wide Overview
                </div>
              </div>
            </button>

            {departments.map((dept) => {
              const DeptIcon = dept.icon;
              const isSelected = selectedAgency === dept.id;

              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedAgency(dept.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer focus-ring flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-md ring-2 ring-[#1D4ED8]/40'
                      : 'bg-[#F8FAFC] dark:bg-[#101623] hover:bg-slate-100 dark:hover:bg-[#161F32] text-[#0F172A] dark:text-[#F8FAFC] border-[#CBD5E1] dark:border-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <DeptIcon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} style={{ color: !isSelected ? dept.statusColor : undefined }} />
                    <span className={`text-2xs font-mono-num font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-[#475569] dark:text-[#CBD5E1]'
                    }`}>
                      {dept.casesBlocked}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold leading-tight">{dept.name}</div>
                    <div className={`text-3xs mt-0.5 ${isSelected ? 'text-blue-100' : 'text-[#64748B] dark:text-[#9AA8B8]'}`}>
                      Avg {dept.avgDelay}d ({dept.exposure})
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Directorate Overview & Strategic Directive Banner */}
        {activeDepartment ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-slate-50/80 dark:from-blue-950/30 dark:to-slate-900/30 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <activeDepartment.icon className="w-5 h-5" style={{ color: activeDepartment.statusColor }} />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {activeDepartment.fullName}
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1]">
                    Mandate: {activeDepartment.mandate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                  activeDepartment.status === 'Critical'
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {activeDepartment.status} Delay Status
                </span>
              </div>
            </div>

            {/* Directorate KPI metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B]">
                <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">Blocked Proceedings</span>
                <span className="text-sm font-bold font-mono-num text-[#0F172A] dark:text-[#F8FAFC] block mt-0.5">
                  {activeDepartment.casesBlocked} Corridors
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B]">
                <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">Median Latency</span>
                <span className="text-sm font-bold font-mono-num text-red-700 dark:text-red-400 block mt-0.5">
                  {activeDepartment.avgDelay} days (+{activeDepartment.avgDelay - activeDepartment.slaBenchmark}d SLA Breach)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B]">
                <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">Locked Capital</span>
                <span className="text-sm font-bold font-mono-num text-[#1D4ED8] dark:text-[#60A5FA] block mt-0.5">
                  {activeDepartment.exposure}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B]">
                <span className="text-3xs text-[#64748B] dark:text-[#9AA8B8] block">Statutory Benchmark</span>
                <span className="text-sm font-bold font-mono-num text-emerald-700 dark:text-emerald-400 block mt-0.5">
                  {activeDepartment.slaBenchmark} days SLA
                </span>
              </div>
            </div>

            {/* Statutory Action Pathways for this Department */}
            <div className="p-3 rounded-lg bg-white dark:bg-[#101623] border border-blue-200/80 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider text-[#1D4ED8] dark:text-[#60A5FA] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended Fast-Track Administrative Directives:</span>
                </span>
              </div>
              <p className="text-xs text-[#334155] dark:text-[#CBD5E1]">
                {activeDepartment.statutoryRemedy}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeDepartment.primaryActions.map((actionName) => (
                  <button
                    key={actionName}
                    onClick={() => handleTriggerAction(actionName)}
                    className="px-2.5 py-1 rounded-md text-2xs font-semibold bg-[#1D4ED8] hover:bg-[#1E40AF] text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{actionName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B] flex items-center justify-between">
            <span className="text-xs text-[#475569] dark:text-[#CBD5E1]">
              Viewing all 5 Directorates across Maharashtra. Click any directorate tab above to inspect specific agency bottlenecks and issue administrative directives.
            </span>
            <span className="text-2xs font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
              ₹7,010 Cr Total Exposure
            </span>
          </div>
        )}

        {/* Search, Filter & Sort Controls for the Case Ledger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search case ID, corridor project, district, or root cause..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg bg-[#F8FAFC] dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] focus-ring"
              />
              {ledgerSearch && (
                <button
                  onClick={() => setLedgerSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 text-2xs">
              <span className="font-semibold text-[#64748B] dark:text-[#94A3B8]">Stage:</span>
              <select
                value={ledgerStageFilter}
                onChange={(e) => setLedgerStageFilter(e.target.value)}
                className="py-1 px-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] focus-ring cursor-pointer"
              >
                <option value="ALL">All Statutory Stages</option>
                <option value="Section 11 Notification">Section 11 Notification</option>
                <option value="SIA Clearance">SIA Clearance</option>
                <option value="Survey Demarcation">Survey Demarcation</option>
                <option value="Section 19 Declaration">Section 19 Declaration</option>
                <option value="Award Inquiry">Award Inquiry</option>
                <option value="Compensation">Compensation</option>
                <option value="Land Possession">Land Possession</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 text-2xs">
              <span className="font-semibold text-[#64748B] dark:text-[#94A3B8]">Sort:</span>
              <select
                value={ledgerSortBy}
                onChange={(e) => setLedgerSortBy(e.target.value)}
                className="py-1 px-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-[#101623] border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] focus-ring cursor-pointer"
              >
                <option value="delay">Highest Delay First</option>
                <option value="exposure">Highest Capital Exposure</option>
                <option value="district">District (A to Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Stalled Corridor Ledger Table */}
        <div className="overflow-x-auto rounded-lg border border-[#CBD5E1] dark:border-[#1E293B]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#CBD5E1] dark:border-[#1E293B] text-3xs font-bold uppercase text-[#475569] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#0C111D]">
                <th className="py-2.5 pl-3 w-28">Case ID</th>
                <th className="py-2.5 min-w-[220px]">Corridor Project</th>
                <th className="py-2.5 w-28">District</th>
                <th className="py-2.5 w-28">Stalled Directorate</th>
                <th className="py-2.5 w-36">Current Stage</th>
                <th className="py-2.5 w-24 text-center">Delay</th>
                <th className="py-2.5 w-28 text-center">Exposure</th>
                <th className="py-2.5 min-w-[260px]">Root Cause Driver</th>
                <th className="py-2.5 pr-3 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] bg-white dark:bg-[#101623]">
              {filteredCorridorCases.length > 0 ? (
                filteredCorridorCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 pl-3 font-mono font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                      {c.id}
                    </td>
                    <td className="py-2.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      <div className="font-semibold truncate max-w-[280px]" title={c.project}>
                        {c.project}
                      </div>
                    </td>
                    <td className="py-2.5 gov-metadata font-semibold text-[#475569] dark:text-[#CBD5E1]">
                      {c.district}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/50 inline-block">
                        {c.agency}
                      </span>
                    </td>
                    <td className="py-2.5 gov-metadata text-[#64748B] dark:text-[#94A3B8]">
                      {c.stage}
                    </td>
                    <td className="py-2.5 text-center font-mono-num font-bold text-red-700 dark:text-red-400">
                      +{c.delayDays}d
                    </td>
                    <td className="py-2.5 text-center font-mono-num font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {c.exposure}
                    </td>
                    <td className="py-2.5 gov-metadata text-[#475569] dark:text-[#CBD5E1]">
                      <div className="truncate max-w-[320px]" title={c.rootCause}>
                        {c.rootCause}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate && onNavigate('case-intelligence')}
                          className="px-2.5 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-3xs font-semibold rounded cursor-pointer transition-colors"
                          title="Inspect Case in Intelligence view"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onNavigate && onNavigate('actions')}
                          className="px-2.5 py-1 bg-white dark:bg-[#161F32] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#1E293B] text-3xs font-semibold rounded cursor-pointer transition-colors"
                          title="Issue directive in Action Tracker"
                        >
                          Act
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="w-6 h-6 text-slate-400" />
                      <div className="text-xs font-semibold">No corridor cases match the selected filters</div>
                      <button
                        onClick={() => {
                          setLedgerSearch('');
                          setLedgerStageFilter('ALL');
                          setSelectedAgency('ALL');
                        }}
                        className="text-2xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA] hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
