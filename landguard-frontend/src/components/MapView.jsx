import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import { ArrowRight, Compass } from 'lucide-react';

function MapRecenter({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ cases = [], onSelectCase, theme = 'light' }) {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  const districtCoords = {
    All: { center: [19.75, 75.71], zoom: 7 },
    Pune: { center: [18.5204, 73.8567], zoom: 10 },
    Thane: { center: [19.2183, 72.9781], zoom: 10 },
    Nagpur: { center: [21.1458, 79.0882], zoom: 10 },
    Nashik: { center: [19.9975, 73.7898], zoom: 10 },
    Amravati: { center: [20.9374, 77.7796], zoom: 10 },
    Aurangabad: { center: [19.8762, 75.3433], zoom: 10 },
    Raigad: { center: [18.5158, 73.1000], zoom: 10 },
    Kolhapur: { center: [16.7050, 74.2433], zoom: 10 },
  };

  const districts = ['All', 'Amravati', 'Aurangabad', 'Kolhapur', 'Nagpur', 'Nashik', 'Pune', 'Raigad', 'Thane'];

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (!c) return false;
      const matchesDistrict = selectedDistrict === 'All' || c.district === selectedDistrict;
      const matchesRisk = selectedRisk === 'All' || c.risk_level === selectedRisk;
      return matchesDistrict && matchesRisk;
    });
  }, [cases, selectedDistrict, selectedRisk]);

  const activeView = districtCoords[selectedDistrict] || districtCoords.All;
  const isDark = theme === 'dark';

  const getMarkerColor = (level) => {
    const norm = (level || 'Low').toString().toUpperCase();
    if (norm.includes('CRITICAL') || norm.includes('HIGH')) {
      return '#DC2626';
    }
    if (norm.includes('ELEVATED') || norm.includes('MEDIUM')) {
      return '#D97706';
    }
    return '#16A34A';
  };

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  return (
    <div className="space-y-3.5">
      {/* Compact GIS Control Bar */}
      <div className="gov-card p-3 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111A24]">
        <div>
          <h1 className="text-sm font-bold text-[#0F2942] dark:text-[#F3F6FA] tracking-tight flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1D4ED8] dark:text-[#3B82F6]" />
            <span>GIS Geospatial Risk Map</span>
          </h1>
          <p className="text-[11px] text-[#64748B] dark:text-[#9AA8B8]">
            Spatial distribution of monitored acquisition cases across regional corridors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] dark:text-[#9AA8B8]">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] px-2 py-1 rounded border border-[#E2E8F0] dark:border-[#263342] text-xs cursor-pointer focus:outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Districts' : `${d}`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#64748B] dark:text-[#9AA8B8]">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-[#0D141D] text-[#0F172A] dark:text-[#F3F6FA] px-2 py-1 rounded border border-[#E2E8F0] dark:border-[#263342] text-xs cursor-pointer focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="High">Critical</option>
              <option value="Medium">Elevated</option>
              <option value="Low">Stable</option>
            </select>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2.5 bg-[#F8FAFC] dark:bg-[#151F2B] px-2.5 py-1 rounded border border-[#E2E8F0] dark:border-[#263342] text-[11px] text-[#0F172A] dark:text-[#F3F6FA]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
              <span>Stable</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
              <span>Elevated</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
              <span>Critical</span>
            </span>
            <span className="font-mono-num text-[#64748B] dark:text-[#9AA8B8] border-l border-[#E2E8F0] dark:border-[#263342] pl-2">
              {filteredCases.length} mapped
            </span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="gov-card overflow-hidden h-[620px] bg-white dark:bg-[#111A24] relative">
        <MapContainer
          key={isDark ? 'dark-map-gov' : 'light-map-gov'}
          center={activeView.center}
          zoom={activeView.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapRecenter center={activeView.center} zoom={activeView.zoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a> &bull; LandGuard GIS'
            url={tileUrl}
          />

          {filteredCases.map((c) => {
            const lat = parseFloat(c.latitude) || 19.7;
            const lng = parseFloat(c.longitude) || 76.0;
            const color = getMarkerColor(c.risk_level);
            const probPct = Math.round((c.risk_score || 0.85) * 100);

            return (
              <CircleMarker
                key={c.case_id || c.project_id}
                center={[lat, lng]}
                radius={c.risk_level === 'High' ? 7 : 5}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: isDark ? '#111A24' : '#FFFFFF',
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="p-3 space-y-2 text-xs text-[#0F172A] dark:text-[#F3F6FA] min-w-[220px]">
                    <div>
                      <span className="font-mono-num text-[11px] font-bold text-[#1D4ED8] dark:text-[#3B82F6] block">
                        {c.case_id || c.project_id}
                      </span>
                      <h3 className="font-bold text-xs text-[#0F172A] dark:text-[#F3F6FA] leading-snug">
                        {c.project_name}
                      </h3>
                      <p className="text-[#64748B] dark:text-[#9AA8B8] text-[11px]">
                        {c.district} Corridor
                      </p>
                    </div>

                    <div className="py-2 border-y border-[#E2E8F0] dark:border-[#263342] space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B] dark:text-[#9AA8B8]">Status:</span>
                        <RiskBadge level={c.risk_level} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B] dark:text-[#9AA8B8]">Delay Probability:</span>
                        <span className="font-mono-num font-bold text-[#DC2626] dark:text-red-400">{probPct}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B] dark:text-[#9AA8B8]">Stage:</span>
                        <span className="font-medium text-[#0F172A] dark:text-[#F3F6FA] truncate max-w-[130px]">
                          {c.current_stage || c.stage || 'Notification'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B] dark:text-[#9AA8B8]">Outlay:</span>
                        <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                          &#8377;{c.compensation_offered_cr || '18.5'} Cr
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCase(c)}
                      className="w-full mt-1 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <span>Audit Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
