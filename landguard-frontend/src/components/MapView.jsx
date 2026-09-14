import React, { useState, useMemo, useEffect } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Marker, Tooltip,
  Polyline, Polygon, Circle, useMap, useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import DistrictIntelligenceModal from './DistrictIntelligenceModal';
import WhyButton from './WhyButton';
import WhyEvidenceDrawer from './WhyEvidenceDrawer';
import {
  Compass, X, AlertTriangle, ShieldAlert, FileText, ArrowRight,
  Sliders, ClipboardList, Layers, ChevronRight, CheckCircle2,
  TrendingUp, MapPin, ExternalLink, Route, Trees, AlertCircle, Eye
} from 'lucide-react';

// Controller to programmatic recenter or fly to coordinates
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.9 });
  }, [center, zoom, map]);
  return null;
}

// Controller to track map zoom level and expose map instance
function MapZoomTracker({ onZoomChange, onMapInstance }) {
  const map = useMap();

  useEffect(() => {
    if (onMapInstance) {
      onMapInstance(map);
    }
  }, [map, onMapInstance]);

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });

  return null;
}

// Factory function to create custom institutional cluster divIcon
function createClusterDivIcon(cluster, isDark) {
  const isCritical = cluster.criticalCases > 0;
  const dotColor = isCritical ? '#B91C1C' : cluster.elevatedCases > 0 ? '#B45309' : '#15803D';
  const bgColor = isDark ? '#131923' : '#FFFFFF';
  const borderColor = isCritical ? '#B91C1C' : isDark ? '#212B38' : '#CBD5E1';
  const textColor = isDark ? '#F3F6FA' : '#0F172A';
  const criticalTextColor = isCritical ? '#DC2626' : (isDark ? '#94A3B8' : '#64748B');

  const html = `
    <div style="
      background: ${bgColor};
      border: 1.5px solid ${borderColor};
      border-radius: 12px;
      padding: 7px 12px;
      box-shadow: 0 4px 14px rgba(15,23,42,0.16);
      cursor: pointer;
      font-family: ui-sans-serif, system-ui, sans-serif;
      min-width: 115px;
      text-align: left;
      line-height: 1.25;
      user-select: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    ">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; display: inline-block; flex-shrink: 0;"></span>
        <span style="font-weight: 800; font-size: 11px; color: ${textColor}; font-variant-numeric: tabular-nums; letter-spacing: 0.02em;">
          ${cluster.totalCases} CASES
        </span>
      </div>
      <div style="font-weight: 800; font-size: 13px; color: ${textColor}; font-variant-numeric: tabular-nums; margin-bottom: 1px;">
        &#8377;${cluster.financialExposure} Cr
      </div>
      <div style="font-weight: 700; font-size: 10px; color: ${criticalTextColor};">
        ${cluster.criticalCases} Critical
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-cluster-marker',
    iconSize: [120, 68],
    iconAnchor: [60, 34]
  });
}

// Linear Infrastructure Corridor Alignments (State of Maharashtra Major Corridors)
const CORRIDOR_ALIGNMENTS = [
  {
    id: 'samruddhi',
    name: 'Samruddhi Mahamarg (Nagpur-Mumbai Expressway)',
    shortName: 'Samruddhi Expressway',
    totalKm: 701,
    monitoredParcels: 38,
    status: 'Stalled Section (Jalna-Aurangabad)',
    riskLevel: 'High',
    color: '#DC2626',
    weight: 4.5,
    chainage: 'Km 342.0 to Km 388.5',
    dispute: 'Section 26 ready-reckoner multiplier dispute on Gat 142/2A',
    coordinates: [
      [21.1458, 79.0882], // Nagpur
      [20.7453, 78.6022], // Wardha
      [20.9374, 77.7796], // Amravati
      [20.4500, 76.8000], // Washim
      [19.8400, 75.8800], // Jalna
      [19.8762, 75.3433], // Aurangabad
      [19.9975, 73.7898], // Nashik
      [19.6500, 73.3000], // Igatpuri
      [19.2183, 72.9781]  // Thane / Mumbai
    ]
  },
  {
    id: 'pune_ring_road',
    name: 'Pune Outer Ring Road (Eastern & Western Alignment)',
    shortName: 'Pune Ring Road',
    totalKm: 173,
    monitoredParcels: 42,
    status: 'High Court Article 226 Stay Active',
    riskLevel: 'High',
    color: '#B91C1C',
    weight: 4.5,
    chainage: 'Km 44.2 to Km 68.0 (Khed & Haveli)',
    dispute: 'High Court writ WP-8921 stay on agricultural parcel possession',
    coordinates: [
      [18.7800, 73.7500], // Dehu / Chakan
      [18.6800, 73.9800], // Wagholi
      [18.5200, 74.0500], // Hadapsar
      [18.3800, 73.9500], // Saswad
      [18.3400, 73.7800], // Khed Shivapur
      [18.4400, 73.6800], // Sinhagad / Pirangut
      [18.6200, 73.6600], // Urse
      [18.7800, 73.7500]  // Loop back
    ]
  },
  {
    id: 'dmic_dighi',
    name: 'Delhi-Mumbai Industrial Corridor (DMIC) & Dighi Port Node',
    shortName: 'DMIC Freight Corridor',
    totalKm: 245,
    monitoredParcels: 24,
    status: 'Stage-II Forest Clearance Pending',
    riskLevel: 'Medium',
    color: '#B45309',
    weight: 3.5,
    chainage: 'Km 88.0 to Km 124.0 (Raigad-Roha)',
    dispute: 'Forest Rights Act (FRA 2006) gram sabha quorum shortfall',
    coordinates: [
      [18.2500, 73.0500], // Dighi Port
      [18.4500, 73.1500], // Mangaon
      [18.7500, 73.2500], // Roha
      [19.0000, 73.1000], // Panvel
      [19.2500, 73.1500], // Kalyan
      [19.9975, 73.7898]  // Nashik link
    ]
  },
  {
    id: 'solapur_kurnool',
    name: 'Surat-Nashik-Solapur-Kurnool Economic Corridor',
    shortName: 'Solapur-Kurnool Corridor',
    totalKm: 312,
    monitoredParcels: 16,
    status: 'Compensation Disbursement on Schedule',
    riskLevel: 'Low',
    color: '#15803D',
    weight: 3,
    chainage: 'Km 12.0 to Km 48.0',
    dispute: 'Title reconciliation pending on 2 survey numbers',
    coordinates: [
      [19.9975, 73.7898], // Nashik
      [19.0900, 74.7400], // Ahmednagar
      [17.6599, 75.9064], // Solapur
      [16.8500, 76.5000]  // State boundary
    ]
  }
];

// Eco-Sensitive & Forest Intersections
const FOREST_BUFFER_ZONES = [
  {
    id: 'melghat_buffer',
    name: 'Melghat Tiger Reserve Peripheral Eco-Sensitive Zone',
    statute: 'FRA 2006 & Forest Conservation Act 1980',
    center: [21.40, 77.25],
    radiusMeters: 22000,
    intersectingCorridor: 'Melghat Peripheral Corridor (Km 42-60)',
    status: 'Stage-II Diversion Awaiting SLEC Quorum (44% attendance)',
    color: '#059669'
  },
  {
    id: 'sahyadri_buffer',
    name: 'Western Ghats Eco-Sensitive Corridor Buffer',
    statute: 'MoEFCC Western Ghats Notification',
    center: [17.85, 73.65],
    radiusMeters: 18000,
    intersectingCorridor: 'Dighi Port Industrial Corridor (Km 78-95)',
    status: 'Wildlife Management Plan Under Scrutiny',
    color: '#059669'
  }
];

export default function MapView({
  cases = [],
  onSelectCase = () => {},
  onNavigate = () => {},
  theme = 'light',
  selectedDivision = 'All Divisions',
  onResetDivision = () => {}
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [currentZoom, setCurrentZoom] = useState(7);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'clusters' | 'cases'
  const [selectedDrawerCase, setSelectedDrawerCase] = useState(() => {
    return {
      case_id: 'LA-1059',
      project_id: 'LA-1059',
      project_name: 'Aurangabad Infrastructure',
      district: 'Aurangabad',
      current_stage: 'Compensation',
      stage: 'Compensation',
      compensation_offered_cr: '50.3',
      risk_level: 'High',
      risk_score: 1.0,
      latitude: 20.005402,
      longitude: 75.269699,
      primary_drivers: ['Circle-rate mismatch', 'Compensation dispute', 'Legal stay'],
      projected_delay: '+42 days',
      recommended_action: 'Initiate valuation review',
      survey_number: 'Gat No. 142/2A'
    };
  });

  const [showCorridors, setShowCorridors] = useState(true);
  const [showForestBuffers, setShowForestBuffers] = useState(true);
  const [selectedCorridor, setSelectedCorridor] = useState(null);
  const [selectedDistrictModal, setSelectedDistrictModal] = useState(null);
  const [whyDrawer, setWhyDrawer] = useState({
    isOpen: false,
    metricType: 'risk',
    caseData: null,
  });

  const districtCoords = {
    All: { center: [19.75, 75.71], zoom: 7 },
    Pune: { center: [18.5204, 73.8567], zoom: 10 },
    Nagpur: { center: [21.1458, 79.0882], zoom: 10 },
    Nashik: { center: [19.9975, 73.7898], zoom: 10 },
    Amravati: { center: [20.9374, 77.7796], zoom: 10 },
    Aurangabad: { center: [19.8762, 75.3433], zoom: 10 },
    Kolhapur: { center: [16.7050, 74.2433], zoom: 10 },
  };

  const divisionCoords = {
    'All Divisions': { center: [19.75, 75.71], zoom: 7 },
    'Pune Division': { center: [18.5204, 73.8567], zoom: 9 },
    'Kolhapur Division': { center: [16.7050, 74.2433], zoom: 9 },
    'Nagpur Division': { center: [21.1458, 79.0882], zoom: 9 },
    'Nashik Division': { center: [19.9975, 73.7898], zoom: 9 },
    'Amravati Division': { center: [20.9374, 77.7796], zoom: 9 },
    'Chhatrapati Sambhajinagar': { center: [19.8762, 75.3433], zoom: 9 },
  };

  // Derive districts from active cases
  const availableDistricts = useMemo(() => {
    const set = new Set();
    cases.forEach((c) => {
      if (c && c.district) set.add(c.district);
    });
    return ['All', ...Array.from(set).sort()];
  }, [cases]);

  // Reset district if not in current division
  useEffect(() => {
    if (selectedDistrict !== 'All' && !availableDistricts.includes(selectedDistrict)) {
      setSelectedDistrict('All');
    }
  }, [availableDistricts, selectedDistrict]);

  // Filter cases by district and risk tier
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (!c) return false;
      const matchesDistrict = selectedDistrict === 'All' || c.district === selectedDistrict;
      const matchesRisk = selectedRisk === 'All' || c.risk_level === selectedRisk;
      return matchesDistrict && matchesRisk;
    });
  }, [cases, selectedDistrict, selectedRisk]);

  const activeView = useMemo(() => {
    if (selectedDistrict !== 'All' && districtCoords[selectedDistrict]) {
      return districtCoords[selectedDistrict];
    }
    if (selectedDivision !== 'All Divisions' && divisionCoords[selectedDivision]) {
      return divisionCoords[selectedDivision];
    }
    return districtCoords.All;
  }, [selectedDistrict, selectedDivision]);

  const isDark = theme === 'dark';

  // Spatial Clustering Engine: Groups cases by administrative district centroids
  const clusters = useMemo(() => {
    const groups = {};

    filteredCases.forEach((c) => {
      const dist = c.district || 'Maharashtra';
      if (!groups[dist]) {
        groups[dist] = {
          id: dist,
          name: dist,
          cases: [],
          latSum: 0,
          lngSum: 0,
          totalExposure: 0,
          criticalCount: 0,
          elevatedCount: 0,
          stableCount: 0,
        };
      }
      const lat = parseFloat(c.latitude) || (districtCoords[dist]?.center[0] || 19.75);
      const lng = parseFloat(c.longitude) || (districtCoords[dist]?.center[1] || 75.71);
      const exposure = parseFloat(c.compensation_offered_cr) || 18.5;

      groups[dist].cases.push(c);
      groups[dist].latSum += lat;
      groups[dist].lngSum += lng;
      groups[dist].totalExposure += exposure;

      if (c.risk_level === 'High') {
        groups[dist].criticalCount += 1;
      } else if (c.risk_level === 'Medium') {
        groups[dist].elevatedCount += 1;
      } else {
        groups[dist].stableCount += 1;
      }
    });

    return Object.values(groups).map((g) => {
      const count = g.cases.length;
      return {
        id: g.id,
        name: g.name,
        center: [g.latSum / count, g.lngSum / count],
        totalCases: count,
        criticalCases: g.criticalCount,
        elevatedCases: g.elevatedCount,
        stableCases: g.stableCount,
        financialExposure: (g.totalExposure >= 1000)
          ? g.totalExposure.toLocaleString('en-IN', { maximumFractionDigits: 0 })
          : g.totalExposure.toFixed(1),
        cases: g.cases,
      };
    });
  }, [filteredCases]);

  // Determine whether to show clusters or individual cases based on zoom level and viewMode
  const isClusterView = useMemo(() => {
    if (viewMode === 'clusters') return true;
    if (viewMode === 'cases') return false;
    // Auto transition threshold: zoom < 9 shows clusters, zoom >= 9 shows individual cases
    return currentZoom < 9;
  }, [viewMode, currentZoom]);

  const getMarkerColor = (level) => {
    const norm = (level || 'Low').toString().toUpperCase();
    if (norm.includes('CRITICAL') || norm.includes('HIGH')) {
      return '#B91C1C';
    }
    if (norm.includes('ELEVATED') || norm.includes('MEDIUM')) {
      return '#B45309';
    }
    return '#15803D';
  };

  const handleClusterClick = (cluster) => {
    if (mapInstance) {
      mapInstance.flyTo(cluster.center, 10, { duration: 0.9 });
    }
    if (cluster.name && cluster.name !== 'Maharashtra') {
      setSelectedDistrictModal(cluster.name);
    }
  };

  const handleCaseClick = (caseItem) => {
    setSelectedDrawerCase(caseItem);
  };

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  return (
    <div className="space-y-3.5 select-none">
      {/* 1. Operational GIS Control Bar */}
      <div className="gov-card p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#131923]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="gov-page-title flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#1D4ED8] dark:text-[#3B82F6]" />
              <span>GIS Operational Risk Map</span>
            </h1>
            {selectedDivision !== 'All Divisions' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/40">
                <span>{selectedDivision}</span>
                <button
                  onClick={onResetDivision}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer p-0.5 focus-ring rounded"
                  title="Clear division filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <p className="gov-body mt-0.5 text-[#64748B] dark:text-[#9AA8B8]">
            {isClusterView
              ? `Zoom level ${currentZoom} &bull; Aggregated cluster view displaying cases, financial exposure, and critical count`
              : `Zoom level ${currentZoom} &bull; Individual corridor view displaying case risk severity`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Mode Toggle */}
          <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0C1017] p-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] text-2xs font-semibold">
            <button
              onClick={() => setViewMode('auto')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'auto'
                  ? 'bg-white dark:bg-[#1A2332] text-[#1D4ED8] dark:text-[#60A5FA] shadow-xs'
                  : 'text-[#64748B] dark:text-[#9AA8B8] hover:text-[#0F172A]'
              }`}
              title="Auto switch: Zoom < 9 shows clusters, Zoom >= 9 shows individual cases"
            >
              Auto ({isClusterView ? 'Clusters' : 'Cases'})
            </button>
            <button
              onClick={() => setViewMode('clusters')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'clusters'
                  ? 'bg-white dark:bg-[#1A2332] text-[#1D4ED8] dark:text-[#60A5FA] shadow-xs'
                  : 'text-[#64748B] dark:text-[#9AA8B8] hover:text-[#0F172A]'
              }`}
            >
              Clusters
            </button>
            <button
              onClick={() => setViewMode('cases')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cases'
                  ? 'bg-white dark:bg-[#1A2332] text-[#1D4ED8] dark:text-[#60A5FA] shadow-xs'
                  : 'text-[#64748B] dark:text-[#9AA8B8] hover:text-[#0F172A]'
              }`}
            >
              Cases
            </button>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] dark:text-[#9AA8B8]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] text-xs cursor-pointer focus-ring"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? (selectedDivision !== 'All Divisions' ? `All ${selectedDivision}` : 'All Districts') : d}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedDistrictModal(selectedDistrict !== 'All' ? selectedDistrict : 'Pune')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/60 rounded-lg text-xs font-bold transition-colors cursor-pointer focus-ring ml-1"
              title="Inspect Maharashtra District Intelligence"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
              <span>District Intelligence</span>
            </button>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] dark:text-[#9AA8B8]">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] px-2 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] text-xs cursor-pointer focus-ring"
            >
              <option value="All">All Tiers</option>
              <option value="High">Critical</option>
              <option value="Medium">Elevated</option>
              <option value="Low">Stable</option>
            </select>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2.5 bg-[#F8FAFC] dark:bg-[#0F141C] px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] text-2xs text-[#0F172A] dark:text-[#F3F6FA]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              <span>Stable</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#B45309]"></span>
              <span>Elevated</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
              <span>Critical</span>
            </span>
            <span className="font-mono-num text-[#64748B] dark:text-[#9AA8B8] border-l border-[#E2E8F0] dark:border-[#212B38] pl-2">
              {filteredCases.length} corridors
            </span>
          </div>
        </div>
      </div>

      {/* 2. Geospatial Intelligence Surveillance Cockpit Strip */}
      <div className="px-3.5 py-2 bg-white dark:bg-[#131923] rounded-xl border border-[#E2E8F0] dark:border-[#212B38] flex flex-wrap items-center justify-between gap-3 text-2xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-[#0F172A] dark:text-[#F3F6FA]">
            <Route className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" />
            <span>Linear RoW Monitored: <strong className="font-mono-num text-[#1D4ED8] dark:text-[#60A5FA]">1,431 km</strong></span>
          </span>
          <span className="text-[#94A3B8]">&bull;</span>
          <span className="text-[#475569] dark:text-[#9AA8B8]">
            Eco-Sensitive Forest Overlap: <strong className="font-mono-num text-emerald-700 dark:text-emerald-400">42.8 km (2 Reserves)</strong>
          </span>
          <span className="text-[#94A3B8]">&bull;</span>
          <span className="text-[#475569] dark:text-[#9AA8B8]">
            Contested RoW Parcels: <strong className="font-mono-num text-[#B91C1C] dark:text-red-400">120 Gat Nos.</strong>
          </span>
          <span className="text-[#94A3B8]">&bull;</span>
          <span className="text-[#475569] dark:text-[#9AA8B8]">
            Critical Chokepoint: <strong className="text-[#0F172A] dark:text-[#F3F6FA]">Pune Ring Road (Km 44.2 - 68.0)</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-3xs font-mono text-[#64748B] dark:text-[#9AA8B8]">
          <span className="font-semibold text-[#0F172A] dark:text-[#F3F6FA]">GIS Layers:</span>
          <label className="inline-flex items-center gap-1 cursor-pointer font-sans font-semibold">
            <input
              type="checkbox"
              checked={showCorridors}
              onChange={(e) => setShowCorridors(e.target.checked)}
              className="rounded text-[#1D4ED8] focus:ring-0 cursor-pointer w-3 h-3"
            />
            <span>Corridors ({CORRIDOR_ALIGNMENTS.length})</span>
          </label>
          <label className="inline-flex items-center gap-1 cursor-pointer font-sans font-semibold">
            <input
              type="checkbox"
              checked={showForestBuffers}
              onChange={(e) => setShowForestBuffers(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0 cursor-pointer w-3 h-3"
            />
            <span>Forest Buffers ({FOREST_BUFFER_ZONES.length})</span>
          </label>
        </div>
      </div>

      {/* 3. Main GIS Viewport with Right-Side Intelligence Drawer */}
      <div className="gov-card overflow-hidden h-[640px] bg-white dark:bg-[#131923] relative">
        <MapContainer
          key={isDark ? 'dark-map-gov' : 'light-map-gov'}
          center={activeView.center}
          zoom={activeView.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapRecenter center={activeView.center} zoom={activeView.zoom} />
          <MapZoomTracker onZoomChange={setCurrentZoom} onMapInstance={setMapInstance} />

          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &bull; LandGuard GIS'
            url={tileUrl}
          />

          {/* GEOSPATIAL INTELLIGENCE: Forest & Eco-Sensitive Buffer Circles */}
          {showForestBuffers &&
            FOREST_BUFFER_ZONES.map((b) => (
              <Circle
                key={`forest-${b.id}`}
                center={b.center}
                radius={b.radiusMeters}
                pathOptions={{
                  color: b.color,
                  fillColor: b.color,
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '5, 5'
                }}
              >
                <Tooltip direction="top" opacity={0.95}>
                  <div className="p-1.5 text-xs text-[#0F172A] leading-tight">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-2xs">
                      <Trees className="w-3 h-3" />
                      <span>{b.name}</span>
                    </div>
                    <div className="text-3xs text-[#64748B] mt-0.5">{b.statute}</div>
                    <div className="text-2xs font-semibold mt-1 text-[#0F172A]">{b.intersectingCorridor}</div>
                    <div className="text-3xs text-amber-700 font-medium mt-0.5">{b.status}</div>
                  </div>
                </Tooltip>
              </Circle>
            ))}

          {/* GEOSPATIAL INTELLIGENCE: Linear Infrastructure Alignment Vectors */}
          {showCorridors &&
            CORRIDOR_ALIGNMENTS.map((corridor) => (
              <Polyline
                key={`corridor-${corridor.id}`}
                positions={corridor.coordinates}
                pathOptions={{
                  color: corridor.color,
                  weight: corridor.weight,
                  opacity: 0.88,
                  dashArray: corridor.riskLevel === 'High' ? '6, 6' : undefined
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedCorridor(corridor);
                    setSelectedDrawerCase(null);
                  }
                }}
              >
                <Tooltip direction="top" opacity={0.95}>
                  <div className="p-1.5 text-xs text-[#0F172A] leading-tight">
                    <span className="font-bold text-xs block text-[#0F172A]">{corridor.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-2xs text-[#475569]">
                      <span>{corridor.totalKm} km</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-red-700">{corridor.monitoredParcels} Parcels Contested</span>
                    </div>
                    <div className="text-3xs text-red-600 font-medium mt-0.5">{corridor.status}</div>
                    <span className="text-3xs text-[#1D4ED8] font-semibold block mt-1">
                      Click to inspect linear alignment &rarr;
                    </span>
                  </div>
                </Tooltip>
              </Polyline>
            ))}

          {/* ZOOMED OUT: Render Multi-Metric Cluster Markers */}
          {isClusterView &&
            clusters.map((cluster) => {
              const icon = createClusterDivIcon(cluster, isDark);
              return (
                <Marker
                  key={`cluster-${cluster.id}`}
                  position={cluster.center}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleClusterClick(cluster),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                    <div className="p-1 text-xs text-[#0F172A] leading-tight">
                      <strong className="block text-xs">{cluster.name} Region</strong>
                      <span>Click to zoom in and inspect {cluster.totalCases} individual corridors</span>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

          {/* ZOOMED IN: Render Individual Cases with Risk Severity */}
          {!isClusterView &&
            filteredCases.map((c) => {
              const lat = parseFloat(c.latitude) || 19.7;
              const lng = parseFloat(c.longitude) || 76.0;
              const color = getMarkerColor(c.risk_level);
              const isSelected = selectedDrawerCase && (selectedDrawerCase.case_id === c.case_id || selectedDrawerCase.project_id === c.project_id);

              return (
                <CircleMarker
                  key={`case-${c.case_id || c.project_id}`}
                  center={[lat, lng]}
                  radius={isSelected ? 10 : c.risk_level === 'High' ? 7.5 : 5.5}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.9,
                    color: isSelected ? '#1D4ED8' : isDark ? '#131923' : '#FFFFFF',
                    weight: isSelected ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => {
                      handleCaseClick(c);
                      setSelectedCorridor(null);
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <div className="p-1.5 text-xs text-[#0F172A] dark:text-[#F3F6FA] leading-tight">
                      <span className="font-mono-num font-bold text-2xs text-[#1D4ED8] block">
                        {c.case_id || c.project_id}
                      </span>
                      <strong className="block text-xs text-[#0F172A]">{c.project_name}</strong>
                      <div className="flex items-center gap-1.5 mt-0.5 text-2xs text-[#475569]">
                        <span>Risk: <strong>{c.risk_level}</strong></span>
                        <span>&bull;</span>
                        <span>₹{c.compensation_offered_cr || '18.5'} Cr</span>
                      </div>
                      <span className="text-3xs text-[#1D4ED8] font-semibold block mt-1">
                        Click to open Case Intelligence Drawer &rarr;
                      </span>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MapContainer>

        {/* 3. Right-Side Case Intelligence Drawer */}
        {selectedDrawerCase && (() => {
          const drawerCase = selectedDrawerCase;
          const isCase1059 = drawerCase.case_id === 'LA-1059' || drawerCase.project_id === 'LA-1059';

          const riskTier = isCase1059
            ? 'Critical'
            : (drawerCase.risk_level === 'High' ? 'Critical' : drawerCase.risk_level === 'Medium' ? 'Elevated' : 'Stable');

          const riskProbability = isCase1059
            ? 'Probability: 100%'
            : `Probability: ${Math.round((drawerCase.risk_score || 0.85) * 100)}%`;

          const currentStage = isCase1059
            ? 'Compensation'
            : (drawerCase.current_stage || drawerCase.stage || 'Compensation');

          const financialExposure = isCase1059
            ? '50.3'
            : (drawerCase.compensation_offered_cr || '18.5');

          const primaryDrivers = isCase1059
            ? ['Circle-rate mismatch', 'Compensation dispute', 'Legal stay']
            : (drawerCase.primary_drivers || [
                drawerCase.dispute_type || 'Circle-rate mismatch',
                'Compensation dispute',
                'Statutory Section 25 limitation risk'
              ]);

          const projectedDelay = isCase1059
            ? '+42 days'
            : (drawerCase.projected_delay || (drawerCase.risk_level === 'High' ? '+42 days' : '+14 days'));

          const recommendedAction = isCase1059
            ? 'Initiate valuation review'
            : (drawerCase.recommended_action || (drawerCase.risk_level === 'High' ? 'Initiate valuation review' : 'Maintain standard procedural monitoring'));

          return (
            <div className="gov-case-drawer absolute top-0 right-0 bottom-0 w-full sm:w-[380px] bg-white dark:bg-[#131923] border-l border-[#E2E8F0] dark:border-[#212B38] shadow-2xl flex flex-col transition-all duration-200 ease-out select-none">
              {/* Drawer Masthead */}
              <div className="p-4 border-b border-[#E2E8F0] dark:border-[#212B38] flex items-start justify-between gap-2 bg-[#F8FAFC]/80 dark:bg-[#0F141C]/80">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-mono-num text-xs font-extrabold text-[#1D4ED8] dark:text-[#60A5FA]">
                    CASE {drawerCase.case_id || drawerCase.project_id}
                  </div>
                  <h2 className="text-base font-extrabold text-[#0F172A] dark:text-[#F3F6FA] truncate leading-tight">
                    {drawerCase.project_name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedDrawerCase(null)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-[#9AA8B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2332] cursor-pointer focus-ring"
                  title="Close intelligence drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content Sections */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
                {/* 1. RISK */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                      RISK
                    </div>
                    <WhyButton
                      size="xs"
                      onClick={() => setWhyDrawer({ isOpen: true, metricType: 'risk', caseData: drawerCase })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#B91C1C] dark:text-red-400 uppercase tracking-wide">
                      {riskTier}
                    </span>
                    <span className="font-mono-num font-bold text-xs text-[#B91C1C] dark:text-red-400 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50">
                      {riskProbability}
                    </span>
                  </div>
                </div>

                {/* 2. CURRENT STAGE */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-1">
                  <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                    CURRENT STAGE
                  </div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                    {currentStage}
                  </div>
                </div>

                {/* 3. FINANCIAL EXPOSURE */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-1 font-mono-num">
                  <div className="flex items-center justify-between">
                    <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                      FINANCIAL EXPOSURE
                    </div>
                    <WhyButton
                      size="xs"
                      onClick={() => setWhyDrawer({ isOpen: true, metricType: 'exposure', caseData: drawerCase })}
                    />
                  </div>
                  <div className="text-base font-extrabold text-[#0F172A] dark:text-[#F3F6FA]">
                    &#8377;{financialExposure} Cr
                  </div>
                </div>

                {/* 4. PRIMARY RISK DRIVERS */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-2">
                  <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                    PRIMARY RISK DRIVERS
                  </div>
                  <ul className="space-y-1.5 text-2xs text-[#334155] dark:text-[#CBD5E1] font-medium">
                    {primaryDrivers.map((driver, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] shrink-0"></span>
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. PROJECTED DELAY */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-1 font-mono-num">
                  <div className="flex items-center justify-between">
                    <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                      PROJECTED DELAY
                    </div>
                    <WhyButton
                      size="xs"
                      onClick={() => setWhyDrawer({ isOpen: true, metricType: 'delay', caseData: drawerCase })}
                    />
                  </div>
                  <div className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                    {projectedDelay}
                  </div>
                </div>

                {/* 6. RECOMMENDED ACTION */}
                <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                      RECOMMENDED ACTION
                    </div>
                    <WhyButton
                      size="xs"
                      onClick={() => setWhyDrawer({ isOpen: true, metricType: 'action', caseData: drawerCase })}
                    />
                  </div>
                  <div className="text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA]">
                    {recommendedAction}
                  </div>
                </div>
              </div>

              {/* 7. Action Directives */}
              <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] space-y-2">
                <button
                  onClick={() => onSelectCase(drawerCase)}
                  className="w-full py-2 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Case</span>
                </button>

                <button
                  onClick={() => {
                    onSelectCase(drawerCase);
                    onNavigate('simulator');
                  }}
                  className="w-full py-2 px-3 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] border border-[#E2E8F0] dark:border-[#212B38] text-[#0F172A] dark:text-[#F3F6FA] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span>Simulate Mitigation</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 4. Right-Side Corridor Geospatial Intelligence Drawer */}
        {selectedCorridor && (
          <div className="gov-case-drawer absolute top-0 right-0 bottom-0 w-full sm:w-[380px] bg-white dark:bg-[#131923] border-l border-[#E2E8F0] dark:border-[#212B38] shadow-2xl flex flex-col transition-all duration-200 ease-out select-none z-20">
            {/* Drawer Masthead */}
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#212B38] flex items-start justify-between gap-2 bg-[#F8FAFC]/80 dark:bg-[#0F141C]/80">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1D4ED8] dark:text-[#60A5FA]">
                  <Route className="w-3.5 h-3.5" />
                  <span>LINEAR CORRIDOR ALIGNMENT</span>
                </div>
                <h2 className="text-base font-extrabold text-[#0F172A] dark:text-[#F3F6FA] leading-tight">
                  {selectedCorridor.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCorridor(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:text-[#9AA8B8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2332] cursor-pointer focus-ring"
                title="Close corridor drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {/* Status */}
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] space-y-1">
                <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                  STATUTORY RoW STATUS
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase text-xs ${selectedCorridor.riskLevel === 'High' ? 'text-[#B91C1C]' : 'text-emerald-700'}`}>
                    {selectedCorridor.status}
                  </span>
                  <span className="font-mono text-3xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38]">
                    {selectedCorridor.totalKm} km Alignment
                  </span>
                </div>
              </div>

              {/* Linear Chainage */}
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-1">
                <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                  CRITICAL CHOKEPOINT CHAINAGE
                </div>
                <div className="font-mono-num font-bold text-sm text-[#0F172A] dark:text-[#F3F6FA]">
                  {selectedCorridor.chainage}
                </div>
                <p className="text-2xs text-[#64748B] dark:text-[#9AA8B8] mt-0.5">
                  Right-of-Way (RoW) Width: 60m Dual 3-Lane Carriageway Specification
                </p>
              </div>

              {/* Spatial Dispute Details */}
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#131923] space-y-1.5">
                <div className="text-3xs font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9AA8B8]">
                  SPATIAL FRICTION ANALYSIS
                </div>
                <div className="text-xs text-[#334155] dark:text-[#CBD5E1] font-medium leading-snug">
                  {selectedCorridor.dispute}
                </div>
                <div className="flex items-center gap-2 pt-1 text-2xs text-[#B91C1C] dark:text-red-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedCorridor.monitoredParcels} Cadastral parcels actively litigated</span>
                </div>
              </div>

              {/* Environmental Buffer Intersections */}
              <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#212B38] bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1 text-emerald-950 dark:text-emerald-200">
                <div className="text-3xs font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  STATUTORY FOREST BUFFER OVERLAP
                </div>
                <p className="text-2xs leading-snug">
                  Corridor intersects MoEFCC Eco-Sensitive Zone buffer. Stage-II Forest Rights Act (FRA) diversion clearance required.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3.5 border-t border-[#E2E8F0] dark:border-[#212B38] bg-[#F8FAFC] dark:bg-[#0F141C] space-y-2">
              <button
                onClick={() => {
                  const match = cases.find((c) => (c.district || '').toLowerCase().includes(selectedCorridor.id === 'pune_ring_road' ? 'pune' : selectedCorridor.id === 'samruddhi' ? 'aurangabad' : 'nashik')) || cases[0];
                  if (match) onSelectCase(match);
                  onNavigate('simulator');
                }}
                className="w-full py-2 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulate Corridor Mitigation</span>
              </button>
              <button
                onClick={() => onNavigate('portfolio')}
                className="w-full py-2 px-3 bg-white dark:bg-[#131923] hover:bg-slate-50 dark:hover:bg-[#1A2332] border border-[#E2E8F0] dark:border-[#212B38] text-[#0F172A] dark:text-[#F3F6FA] text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
              >
                <FileText className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>View Affected Parcels in Register</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Maharashtra District Intelligence Modal */}
      {selectedDistrictModal && (
        <DistrictIntelligenceModal
          districtName={selectedDistrictModal}
          onClose={() => setSelectedDistrictModal(null)}
          onFilterDistrict={(dist) => {
            setSelectedDistrict(dist);
            setSelectedDistrictModal(null);
          }}
          onSimulateDistrict={() => {
            setSelectedDistrictModal(null);
            if (onNavigate) onNavigate('simulator');
          }}
        />
      )}

      {/* Accessible Evidence Drawer for Map Intelligence */}
      <WhyEvidenceDrawer
        isOpen={whyDrawer.isOpen}
        onClose={() => setWhyDrawer(prev => ({ ...prev, isOpen: false }))}
        metricType={whyDrawer.metricType}
        caseData={whyDrawer.caseData || selectedDrawerCase}
        onNavigate={onNavigate}
      />
    </div>
  );
}
