import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import {
  MapPin, Layers, Sparkles, AlertTriangle, Compass,
  Building2, Coins, ShieldCheck
} from 'lucide-react';

export default function MapView({ cases = [], projects = [], onSelectCase, onSelectProject }) {
  const dataList = cases && cases.length > 0 ? cases : projects;
  const handleSelect = onSelectCase || onSelectProject || (() => {});
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [inspectedCase, setInspectedCase] = useState(null);

  const districts = ['All', 'Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Kolhapur', 'Thane', 'Raigad'];

  const filteredCases = dataList.filter((c) => {
    if (!c) return false;
    return selectedDistrict === 'All' || c.district === selectedDistrict;
  });

  const centerLat = 19.75;
  const centerLng = 75.71;

  const getMarkerColor = (level) => {
    if (level === 'High') return '#EF4444';
    if (level === 'Medium') return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="space-y-3">
      {/* Control Header */}
      <div className="cockpit-card p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 bg-[#0e1422]">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm border border-blue-400/40">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
              Maharashtra GIS Spatial Cartography Engine
              <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.2 rounded border border-blue-800">
                LIVE SAT-TELEMETRY
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Geographic clustering of predicted acquisition delay risks across 36 Maharashtra Districts
            </p>
          </div>
        </div>

        {/* Filter & Legend */}
        <div className="flex items-center gap-3 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#090d16] text-slate-200 px-3 py-1.5 rounded-md border border-white/10 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>Focus District: {d}</option>
            ))}
          </select>

          <div className="flex items-center gap-3 bg-[#090d16] px-3 py-1.5 rounded-md border border-white/5 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> CRITICAL
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ELEVATED
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> STABLE
            </span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="cockpit-card rounded-lg overflow-hidden h-[600px] relative shadow-xl bg-[#090d16]">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {filteredCases.map((c) => {
            const lat = parseFloat(c.latitude) || 19.7;
            const lng = parseFloat(c.longitude) || 76.0;
            const color = getMarkerColor(c.risk_level);
            const isHigh = c.risk_level === 'High';

            return (
              <CircleMarker
                key={c.case_id || c.project_id}
                center={[lat, lng]}
                radius={isHigh ? 10 : 6}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: isHigh ? '#ffffff' : color,
                  weight: isHigh ? 2 : 1,
                }}
                eventHandlers={{
                  mouseover: () => setInspectedCase(c),
                }}
              >
                <Popup>
                  <div className="p-2.5 space-y-2 font-sans text-xs max-w-xs">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <span className="font-mono font-bold text-blue-400">{c.case_id || c.project_id}</span>
                      <RiskBadge level={c.risk_level} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{c.project_name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{c.district} District &bull; {c.current_stage || c.stage}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 bg-[#090d16] p-2 rounded border border-slate-800 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block">Risk Score</span>
                        <span className="font-bold text-red-400">{((c.risk_score || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Outlay</span>
                        <span className="font-bold text-emerald-400">&#8377;{c.compensation_offered_cr} Cr</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(c)}
                      className="w-full mt-1.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-blue-400/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Launch SHAP Audit</span>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Live Hover Telemetry Overlay HUD */}
        {inspectedCase && (
          <div className="absolute top-3 right-3 z-[500] pointer-events-none w-72 cockpit-card p-3 rounded-lg border border-blue-500/40 bg-[#0e1422]/95 shadow-2xl animate-fade-in text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-white/10 pb-1">
              <span>TARGET TELEMETRY</span>
              <span className="text-blue-400 font-bold">{inspectedCase.case_id || inspectedCase.project_id}</span>
            </div>
            <div>
              <div className="font-sans font-bold text-white text-xs truncate">{inspectedCase.project_name}</div>
              <div className="text-[11px] text-slate-400">{inspectedCase.district} &bull; {inspectedCase.current_stage || inspectedCase.stage}</div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] bg-[#090d16] p-1.5 rounded border border-white/5">
              <div>
                <span className="text-slate-500">COORDINATES:</span>
                <div className="text-blue-300 font-mono">{parseFloat(inspectedCase.latitude || 19.7).toFixed(3)}, {parseFloat(inspectedCase.longitude || 76.0).toFixed(3)}</div>
              </div>
              <div>
                <span className="text-slate-500">OUTLAY:</span>
                <div className="text-emerald-400 font-mono">&#8377;{inspectedCase.compensation_offered_cr} Cr</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
