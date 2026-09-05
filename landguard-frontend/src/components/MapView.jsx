import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RiskBadge from './RiskBadge';
import { Sparkles, MapPin } from 'lucide-react';

const MAHARASHTRA_CENTER = [19.7, 76.0];

const MapView = ({ cases, onSelectCase }) => {
  const getMarkerColor = (level) => {
    switch (level) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#64748B';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            GIS Land Acquisition Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial monitoring of land acquisition projects across Maharashtra districts
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span>High Risk ({cases.filter(c => c.risk_level === 'High').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
            <span>Medium Risk ({cases.filter(c => c.risk_level === 'Medium').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span>Low Risk ({cases.filter(c => c.risk_level === 'Low').length})</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-2 rounded-xl overflow-hidden h-[600px] relative border border-slate-700/50 shadow-2xl">
        <MapContainer
          center={MAHARASHTRA_CENTER}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '0.75rem', backgroundColor: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {cases.map((c) => {
            const lat = parseFloat(c.latitude);
            const lng = parseFloat(c.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;

            const color = getMarkerColor(c.risk_level);
            const radius = 6 + Math.round(c.risk_score * 8);

            return (
              <CircleMarker
                key={c.case_id}
                center={[lat, lng]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.65,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                  <div className="text-xs font-semibold text-slate-800">
                    <p className="font-bold">{c.project_name}</p>
                    <p className="text-[10px] text-slate-600">{c.district} &bull; Score: {(c.risk_score * 100).toFixed(0)}%</p>
                  </div>
                </Tooltip>

                <Popup className="custom-leaflet-popup">
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg max-w-xs font-sans text-xs space-y-2 border border-slate-700 shadow-xl">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-700 pb-2">
                      <div>
                        <p className="font-bold text-sm text-cyan-300 leading-tight">{c.project_name}</p>
                        <p className="text-[11px] text-slate-400">{c.district} District &bull; {c.current_stage}</p>
                      </div>
                      <RiskBadge level={c.risk_level} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/60 p-2 rounded border border-slate-700/50">
                      <div>
                        <span className="text-slate-400 block">Risk Score</span>
                        <span className="font-bold text-slate-200">{(c.risk_score * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Compensation</span>
                        <span className="font-bold text-emerald-400">&#8377;{c.compensation_offered_cr} Cr</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Legal Cases</span>
                        <span className="font-bold text-rose-400">{c.legal_cases_pending} Pending</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Protests</span>
                        <span className="font-bold text-amber-400">{c.local_protests_count} Logged</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCase(c)}
                      className="w-full mt-2 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-cyan-500/25"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                      <span>Explain AI Risk (SHAP)</span>
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
};

export default MapView;
