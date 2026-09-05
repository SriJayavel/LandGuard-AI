import React, { useEffect, useState, lazy, Suspense } from 'react';
import Header from './components/Header';
import { getCases } from './services/api';
import { Cpu, RefreshCw, AlertTriangle } from 'lucide-react';

// Lazy-load ALL view components to allow instant paint of Header, Shell UI, and Footer (LCP < 50ms)
const ProjectsTable = lazy(() => import('./components/ProjectsTable'));
const MapView = lazy(() => import('./components/MapView'));
const AlertsPanel = lazy(() => import('./components/AlertsPanel'));
const InsightsPanel = lazy(() => import('./components/InsightsPanel'));
const CaseDetailModal = lazy(() => import('./components/CaseDetailModal'));

// Table Skeleton fallback for instant zero-CLS paint while table bundle loads
const TableSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="glass-card p-4 rounded-xl flex justify-between items-center h-14 border border-slate-700/50">
      <div className="h-6 bg-slate-800 rounded w-64"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-slate-800 rounded w-28"></div>
        <div className="h-8 bg-slate-800 rounded w-28"></div>
      </div>
    </div>
    <div className="glass-card rounded-xl border border-slate-700/50 overflow-hidden p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-900/80 rounded border border-slate-800/60"></div>
      ))}
    </div>
  </div>
);

const ComponentLoader = ({ text }) => (
  <div className="glass-card p-12 text-center rounded-2xl space-y-3 my-4 animate-fade-in">
    <div className="w-7 h-7 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
    <p className="text-xs text-cyan-300 font-medium animate-pulse">{text}</p>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const fetchCasesData = () => {
    setLoading(true);
    setError(null);
    getCases()
      .then((res) => {
        setCases(res.data.cases || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load land acquisition cases:', err);
        setError('Unable to connect to LandGuard AI Backend Server at http://127.0.0.1:5000/api. Make sure Flask app is running.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCasesData();
  }, []);

  // Compute portfolio KPIs
  const totalCases = cases.length;
  const highRiskCount = cases.filter((c) => c.risk_level === 'High').length;
  const totalCompCr = cases.reduce((sum, c) => sum + (parseFloat(c.compensation_offered_cr) || 0), 0);
  const avgRiskScore = totalCases > 0 ? cases.reduce((sum, c) => sum + (parseFloat(c.risk_score) || 0), 0) / totalCases : 0;

  const stats = {
    totalCases,
    highRiskCount,
    totalCompCr,
    avgRiskScore,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-900/15 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Navigation & Header - Renders immediately with zero delay */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

        {/* Global Error Notifications */}
        {error && (
          <div className="glass-card p-6 rounded-2xl border border-rose-800 bg-rose-950/40 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-rose-300">Backend Connection Warning</h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">{error}</p>
            <button
              onClick={fetchCasesData}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Tab Views with Suspense Boundaries */}
        <main className="transition-all duration-300">
          {activeTab === 'table' && (
            <Suspense fallback={<TableSkeleton />}>
              <ProjectsTable cases={cases} onSelectCase={(c) => setSelectedCase(c)} loading={loading} />
            </Suspense>
          )}
          {activeTab === 'map' && (
            <Suspense fallback={<ComponentLoader text="Initializing Leaflet GIS Cartography Engine..." />}>
              <MapView cases={cases} onSelectCase={(c) => setSelectedCase(c)} />
            </Suspense>
          )}
          {activeTab === 'alerts' && (
            <Suspense fallback={<ComponentLoader text="Loading Priority Risk Queue..." />}>
              <AlertsPanel onSelectCase={(c) => setSelectedCase(c)} />
            </Suspense>
          )}
          {activeTab === 'insights' && (
            <Suspense fallback={<ComponentLoader text="Rendering Recharts Delay Analytics..." />}>
              <InsightsPanel />
            </Suspense>
          )}
        </main>
      </div>

      {/* SHAP TreeExplainer Modal */}
      {selectedCase && (
        <Suspense fallback={<ComponentLoader text="Computing SHAP TreeExplainer Waterfall..." />}>
          <CaseDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
        </Suspense>
      )}

      {/* Footer - Immediate paint for instant LCP */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 px-6 mt-12 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">LandGuard AI &bull; Smart India Hackathon (SIH) 2026</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-medium">Team CyberLeek (PS ID 26017)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            AI-Driven Predictive Risk & SHAP Explainability System for Infrastructure Land Acquisition
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
