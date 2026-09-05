import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import { MapPin, ArrowRight } from 'lucide-react';

export default function MapView({ cases = [], onSelectCase }) {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const districts = ['All', 'Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Kolhapur', 'Thane', 'Raigad'];

  const filteredCases = cases.filter((c) => {
    if (!c) return false;
    return selectedDistrict === 'All' || c.district === selectedDistrict;
  });

  const centerLat = 19.75;
  const centerLng = 75.71;

  const getMarkerColor = (level) => {
    const norm = (level || 'Low').toString().toUpperCase();
    if (norm === 'CRITICAL' || norm === 'HIGH RISK' || norm === 'HIGH') {
      return '#DC2626'; // Red
    }
    if (norm === 'MEDIUM') {
      return '#D97706'; // Amber
    }
    return '#16A34A'; // Green
  };

  return (
    <div className="space-y-4">
      {/* Administrative Map Control Bar */}
      <div className="gov-card p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">Geographic Risk Intelligence Map</h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Spatial distribution of active acquisition cases and localized delay clusters across Maharashtra
          </p>
        </div>

        {/* Filter & Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#667085] font-medium">Filter District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-[#F5F7FA] text-[#172033] px-3 py-1.5 rounded border border-[#D9E1EA] focus:outline-none focus:border-[#1769AA] cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-[#F8FAFC] px-3 py-1.5 rounded border border-[#D9E1EA] text-[11px] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span> Low Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> Medium Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span> High / Critical
            </span>
          </div>
        </div>
      </div>

      {/* Professional Administrative Leaflet Map */}
      <div className="gov-card overflow-hidden h-[620px] bg-white border border-[#D9E1EA]">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> Positron'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {filteredCases.map((c) => {
            const lat = parseFloat(c.latitude) || 19.7;
            const lng = parseFloat(c.longitude) || 76.0;
            const color = getMarkerColor(c.risk_level);
            const probPct = ((c.risk_score || 0) * 100).toFixed(0);

            return (
              <CircleMarker
                key={c.case_id || c.project_id}
                center={[lat, lng]}
                radius={c.risk_level === 'High' ? 8 : 6}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: '#FFFFFF',
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="p-3 space-y-2 text-xs font-sans text-[#172033] min-w-[200px]">
                    <div>
                      <span className="font-mono text-[11px] text-[#1769AA] font-bold block">
                        {c.case_id || c.project_id}
                      </span>
                      <h4 className="font-bold text-sm text-[#172033] leading-snug">
                        {c.project_name}
                      </h4>
                      <p className="text-[#667085] text-[11px] mt-0.5">
                        {c.district} District &bull; Maharashtra
                      </p>
                    </div>

                    <div className="py-2 border-y border-[#D9E1EA] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#667085]">Risk:</span>
                        <RiskBadge level={c.risk_level} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#667085]">Delay probability:</span>
                        <span className="font-mono font-bold text-[#DC2626]">{probPct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#667085]">Current phase:</span>
                        <span className="font-medium text-[#172033]">{c.current_stage || c.stage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#667085]">Budget outlay:</span>
                        <span className="font-mono font-bold text-[#16A34A]">&#8377;{c.compensation_offered_cr} Cr</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCase(c)}
                      className="w-full mt-2 py-1.5 bg-[#1769AA] hover:bg-[#123B63] text-white rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Case</span>
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
