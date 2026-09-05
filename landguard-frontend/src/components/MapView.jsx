import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import {
  MapPin, Layers, Sparkles, AlertTriangle, Compass,
  Eye, Building2, Coins, ShieldCheck
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
    if (level === 'High') return '#F43F5E';
    if (level === 'Medium') return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="space-y-4">
      {/* Tactical HUD Header */}
      <div className="art-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              Maharashtra GIS Spatial Cartography Studio
              <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                LIVE SAT-GRID
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive geographic clustering of delay-risk corridors across 36 Maharashtra Districts
            </p>
          </div>
        </div>

        {/* Tactical Legend & Controls */}
        <div className="flex items-center gap-4 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-950 text-slate-200 px-3.5 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>Focus District: {d}</option>
            ))}
          </select>

          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-white/5 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span> CRITICAL
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> ELEVATED
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> STABLE
            </span>
          </div>
        </div>
      </div>

      {/* Main Map Frame */}
      <div className="art-card rounded-2xl overflow-hidden h-[620px] relative shadow-2xl">
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
                radius={isHigh ? 11 : 7}
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
                  <div className="p-3 space-y-2.5 font-sans text-xs max-w-xs">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="font-mono font-bold text-cyan-400">{c.case_id || c.project_id}</span>
                      <RiskBadge level={c.risk_level} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.project_name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{c.district} District &bull; {c.current_stage || c.stage}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block">XGB-Risk</span>
                        <span className="font-bold text-rose-400">{((c.risk_score || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Outlay</span>
                        <span className="font-bold text-emerald-400">&#8377;{c.compensation_offered_cr} Cr</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(c)}
                      className="w-full mt-2 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border border-cyan-400/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>Launch SHAP Audit</span>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Tactical Hover Telemetry Overlay HUD */}
        {inspectedCase && (
          <div className="absolute top-4 right-4 z-[500] pointer-events-none w-72 art-card p-3.5 rounded-xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl animate-fade-in text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-white/10 pb-1">
              <span>ACTIVE TELEMETRY TARGET</span>
              <span className="text-cyan-400 font-bold">{inspectedCase.case_id || inspectedCase.project_id}</span>
            </div>
            <div>
              <div className="font-sans font-bold text-white text-xs truncate">{inspectedCase.project_name}</div>
              <div className="text-[11px] text-slate-400">{inspectedCase.district} &bull; {inspectedCase.current_stage || inspectedCase.stage}</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-900/90 p-2 rounded border border-white/5">
              <div>
                <span className="text-slate-500">COORDINATES:</span>
                <div className="text-cyan-300 font-mono">{parseFloat(inspectedCase.latitude || 19.7).toFixed(3)}, {parseFloat(inspectedCase.longitude || 76.0).toFixed(3)}</div>
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
