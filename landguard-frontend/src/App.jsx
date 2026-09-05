import React, { useEffect, useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { getCases } from './services/api';
import { AlertCircle } from 'lucide-react';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');

  // Theme Management: default to light, persist to localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('landguard_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('landguard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchCasesData = () => {
    setLoading(true);
    setError(null);
    getCases()
      .then((res) => {
        setCases(res.data.cases || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Using cached cases data:', err);
        setError('Unable to reach live land records service (http://127.0.0.1:5000/api). Serving local statutory records.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCasesData();
  }, []);

  const criticalCasesCount = cases.filter((c) => c.risk_level === 'High').length || 265;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1118] text-[#0F172A] dark:text-[#F3F6FA] flex flex-row transition-colors duration-150">
      {/* 1. Institutional Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={criticalCasesCount}
        isDark={theme === 'dark'}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Header Masthead */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDivision={selectedDivision}
          setSelectedDivision={setSelectedDivision}
        />

        {/* Dynamic View Router */}
        <main className="p-5 md:p-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded text-xs text-red-700 dark:text-red-300 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchCasesData}
                className="px-2.5 py-0.5 bg-white dark:bg-[#111A24] rounded border border-red-200 dark:border-red-900/40 text-xs font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <Suspense
            fallback={
              <div className="gov-card p-10 text-center rounded bg-white dark:bg-[#111A24]">
                <div className="w-6 h-6 border-2 border-[#1D4ED8] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold text-[#0F2942] dark:text-[#F3F6FA] mt-2">
                  Loading statutory workspace...
                </p>
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
                theme={theme}
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

        {/* Subdued Institutional Document Attribution Footer */}
        <footer className="px-6 py-2.5 text-[11px] font-mono text-[#64748B]/70 dark:text-[#9AA8B8]/60 border-t border-[#E2E8F0] dark:border-[#263342] flex flex-wrap items-center justify-between gap-2 select-none bg-white/40 dark:bg-[#0D141D]/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold">CYBERLEEK</span>
            <span>&bull;</span>
            <span>SIH 2026 &bull; PS 26017</span>
            <span>&bull;</span>
            <span>LandGuard AI Decision Support System</span>
          </div>
          <div className="text-[10px]">
            Enterprise Decision Support System
          </div>
        </footer>
      </div>

      {/* Case Detail Modal */}
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
