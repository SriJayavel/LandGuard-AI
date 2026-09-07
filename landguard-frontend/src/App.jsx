import React, { useEffect, useState, useTransition, Component } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewView from './components/OverviewView';
import ProjectsTable from './components/ProjectsTable';
import MapView from './components/MapView';
import AlertsPanel from './components/AlertsPanel';
import InsightsPanel from './components/InsightsPanel';
import AnalyticsView from './components/AnalyticsView';
import CaseDetailModal from './components/CaseDetailModal';
import { getCases } from './services/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Workspace ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="gov-card p-6 bg-white dark:bg-[#111A24] border border-red-200 dark:border-red-900/40 rounded space-y-3">
          <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
            <span>Workspace View Recovery</span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#9AA8B8]">
            An unexpected error occurred while rendering this view. Your session and data remain safe.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-3 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-medium cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return to Executive Overview</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');

  const [, startTransition] = useTransition();

  const handleTabChange = (tabId) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

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
        setActiveTab={handleTabChange}
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

          <ErrorBoundary onReset={() => handleTabChange('overview')}>
            {activeTab === 'overview' && (
              <OverviewView
                cases={cases}
                onSelectCase={(c) => setSelectedCase(c)}
                onViewAllProjects={() => handleTabChange('projects')}
                onViewAlerts={() => handleTabChange('alerts')}
                onViewBottlenecks={() => handleTabChange('bottlenecks')}
                onViewMap={() => handleTabChange('map')}
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
          </ErrorBoundary>
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
