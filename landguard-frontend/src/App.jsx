import React, { useEffect, useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { getCases } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Lazy load views for instant responsiveness
const OverviewView = lazy(() => import('./components/OverviewView'));
const ProjectsTable = lazy(() => import('./components/ProjectsTable'));
const MapView = lazy(() => import('./components/MapView'));
const AlertsPanel = lazy(() => import('./components/AlertsPanel'));
const InsightsPanel = lazy(() => import('./components/InsightsPanel'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView'));
const CaseDetailModal = lazy(() => import('./components/CaseDetailModal'));

function App() {
  const [activeTab, setActiveTab] = useState('overview');
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
        console.error('Failed to load cases:', err);
        setError('Unable to load project data. Verify backend connection at http://127.0.0.1:5000/api.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCasesData();
  }, []);

  const criticalCasesCount = cases.filter((c) => c.risk_level === 'High').length || 120;

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex flex-row">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={criticalCasesCount}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Main Body */}
        <main className="p-8 flex-1">
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchCasesData}
                className="px-3 py-1 bg-white hover:bg-red-100 rounded border border-red-300 font-semibold cursor-pointer text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Suspense Views */}
          <Suspense
            fallback={
              <div className="gov-card p-12 text-center rounded space-y-2">
                <p className="text-xs font-semibold text-[#1769AA]">Loading platform data...</p>
                <p className="text-[11px] text-[#667085]">Retrieving records from state land acquisition database</p>
              </div>
            }
          >
            {activeTab === 'overview' && (
              <OverviewView
                cases={cases}
                onSelectCase={(c) => setSelectedCase(c)}
                onViewAllProjects={() => setActiveTab('projects')}
                onViewAlerts={() => setActiveTab('alerts')}
                onViewBottlenecks={() => setActiveTab('bottlenecks')}
                onViewMap={() => setActiveTab('map')}
              />
            )}
            {activeTab === 'projects' && (
              <ProjectsTable
                cases={cases}
                onSelectCase={(c) => setSelectedCase(c)}
                loading={loading}
              />
            )}
            {activeTab === 'map' && (
              <MapView
                cases={cases}
                onSelectCase={(c) => setSelectedCase(c)}
              />
            )}
            {activeTab === 'alerts' && (
              <AlertsPanel
                onSelectCase={(c) => setSelectedCase(c)}
              />
            )}
            {activeTab === 'bottlenecks' && (
              <InsightsPanel />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsView
                cases={cases}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* 3. Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}

export default App;
