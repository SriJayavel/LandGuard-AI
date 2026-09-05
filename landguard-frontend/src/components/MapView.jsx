import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import { MapPin, Layers, Sparkles, AlertTriangle } from 'lucide-react';

export default function MapView({ cases = [], projects = [], onSelectCase, onSelectProject }) {
  const dataList = cases && cases.length > 0 ? cases : projects;
  const handleSelect = onSelectCase || onSelectProject || (() => {});
  const [selectedDistrict, setSelectedDistrict] = useState('All');

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
    <div className="space-y-4">
      {/* Control Header */}
      <div className="solid-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm border border-blue-500">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100">
              Maharashtra Infrastructure GIS Cartography Map
            </h2>
            <p className="text-xs text-gray-400">
              Spatial risk score distribution across 36 Maharashtra Districts & Acquisition Corridors
            </p>
          </div>
        </div>

        {/* Filter & Legend */}
        <div className="flex items-center gap-4 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-gray-950 text-gray-200 px-3 py-2 rounded-md border border-gray-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d}>Filter District: {d}</option>
            ))}
          </select>

          {/* Color Legend */}
          <div className="flex items-center gap-3 bg-gray-950 px-3 py-1.5 rounded-md border border-gray-800 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low
            </span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div className="solid-card rounded-xl overflow-hidden border border-gray-800 h-[600px] relative shadow-xl bg-gray-950">
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

            return (
              <CircleMarker
                key={c.case_id || c.project_id}
                center={[lat, lng]}
                radius={c.risk_level === 'High' ? 10 : 7}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: '#ffffff',
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="p-3 space-y-2 font-sans text-xs max-w-xs">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <span className="font-mono font-bold text-blue-400">{c.case_id || c.project_id}</span>
                      <RiskBadge level={c.risk_level} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100 text-sm">{c.project_name}</h4>
                      <p className="text-gray-400 mt-0.5">{c.district} District &bull; {c.current_stage || c.stage}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-gray-900 p-2 rounded border border-gray-800 text-[11px] font-mono">
                      <div>
                        <span className="text-gray-500 block">Risk Score</span>
                        <span className="font-bold text-red-400">{((c.risk_score || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Outlay</span>
                        <span className="font-bold text-emerald-400">&#8377;{c.compensation_offered_cr} Cr</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(c)}
                      className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View SHAP Analysis</span>
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
