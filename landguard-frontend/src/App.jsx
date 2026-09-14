import React, { useEffect, useState, useTransition, useMemo, Component } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewView from './components/OverviewView';
import ProjectsTable from './components/ProjectsTable';
import MapView from './components/MapView';
import SimulatorView from './components/SimulatorView';
import DocumentIntakeView from './components/DocumentIntakeView';
import ActionTrackerView from './components/ActionTrackerView';
import InsightsPanel from './components/InsightsPanel';
import AnalyticsView from './components/AnalyticsView';
import CaseIntelligenceView from './components/CaseIntelligenceView';
import AlertsPanel from './components/AlertsPanel';
import { getCases } from './services/api';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const DIVISION_DISTRICTS = {
  'All Divisions': null,
  'Pune Division': ['Pune'],
  'Kolhapur Division': ['Kolhapur'],
  'Amravati Division': ['Amravati'],
  'Nashik Division': ['Nashik'],
  'Nagpur Division': ['Nagpur'],
  'Chhatrapati Sambhajinagar': ['Aurangabad', 'Chhatrapati Sambhajinagar'],
};

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
        <div className="gov-card p-6 bg-white dark:bg-[#131923] border border-red-200 dark:border-red-900/40 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-[#B91C1C] font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>
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
            className="px-3 py-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 focus-ring"
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
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [alertCategoryFilter, setAlertCategoryFilter] = useState('ALL');

  const [, startTransition] = useTransition();

  const handleTabChange = (tabId) => {
    // Normalization for legacy aliases
    let target = tabId;
    if (target === 'projects') target = 'portfolio';
    if (target === 'analytics') target = 'model-audit';

    startTransition(() => {
      setActiveTab(target);
    });
  };

  const handleNavigateToAlerts = (category = 'ALL') => {
    setAlertCategoryFilter(category);
    handleTabChange('alerts');
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

  // Filter cases by administrative division
  const divisionFilteredCases = useMemo(() => {
    if (!selectedDivision || selectedDivision === 'All Divisions') return cases;
    const allowed = DIVISION_DISTRICTS[selectedDivision];
    if (!allowed || allowed.length === 0) return [];
    return cases.filter((c) => {
      const d = (c.district || '').toLowerCase();
      return allowed.some((a) => d.includes(a.toLowerCase()));
    });
  }, [cases, selectedDivision]);

  const handleSelectCase = (c) => {
    if (!c) return;
    const id = c.case_id || c.project_id;
    const fullCase = cases.find((x) => (x.case_id === id || x.project_id === id));
    setSelectedCase(fullCase ? { ...fullCase, ...c } : c);
    handleTabChange('case-intelligence');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F4F6F8] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F3F6FA] flex flex-row transition-colors duration-150">
      {/* 1. Canonical Institutional Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isDark={theme === 'dark'}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh] overflow-x-hidden">
        {/* Header Masthead with Live Search and Division Dropdown */}
        <Header
          theme={theme}
          setTheme={setTheme}
          toggleTheme={toggleTheme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDivision={selectedDivision}
          setSelectedDivision={setSelectedDivision}
          cases={cases}
          onSelectCase={handleSelectCase}
          onNavigateToProjects={() => handleTabChange('portfolio')}
          onNavigateToAlerts={handleNavigateToAlerts}
          onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
        />

        {/* Dynamic View Router */}
        <main className="p-5 md:p-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchCasesData}
                className="px-2.5 py-0.5 bg-white dark:bg-[#131923] rounded-lg border border-red-200 dark:border-red-900/40 text-xs font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <ErrorBoundary onReset={() => handleTabChange('overview')}>
            {/* 1. Overview */}
            {activeTab === 'overview' && (
              <OverviewView
                cases={divisionFilteredCases}
                selectedDivision={selectedDivision}
                onResetDivision={() => setSelectedDivision('All Divisions')}
                onSelectCase={handleSelectCase}
                onViewAllProjects={() => handleTabChange('portfolio')}
                onFilterStage={(stage) => {
                  setSelectedStageFilter(stage);
                  handleTabChange('portfolio');
                }}
                onNavigate={handleTabChange}
                onQuickSimulate={(c) => {
                  setSelectedCase(c);
                  handleTabChange('simulator');
                }}
                onQuickAction={(c) => {
                  setSelectedCase(c);
                  handleTabChange('actions');
                }}
                onViewBottlenecks={() => handleTabChange('bottlenecks')}
                onViewMap={() => handleTabChange('map')}
              />
            )}

            {/* 1.5. Alert Center */}
            {activeTab === 'alerts' && (
              <AlertsPanel
                onSelectCase={handleSelectCase}
                onNavigate={handleTabChange}
                selectedDivision={selectedDivision}
                onResetDivision={() => setSelectedDivision('All Divisions')}
                initialCategory={alertCategoryFilter}
              />
            )}

            {/* 2. Portfolio (formerly Projects) */}
            {activeTab === 'portfolio' && (
              <ProjectsTable
                cases={divisionFilteredCases}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDivision={selectedDivision}
                onResetDivision={() => setSelectedDivision('All Divisions')}
                onSelectCase={handleSelectCase}
                loading={loading}
                selectedStage={selectedStageFilter}
                setSelectedStage={setSelectedStageFilter}
              />
            )}

            {/* 3. Case Intelligence (Dedicated Page) */}
            {activeTab === 'case-intelligence' && (
              <CaseIntelligenceView
                caseData={selectedCase || divisionFilteredCases.find((c) => (c.case_id || c.project_id) === 'LA-1059') || divisionFilteredCases[0]}
                allCases={divisionFilteredCases}
                onSelectCase={(c) => setSelectedCase(c)}
                onBack={() => handleTabChange('portfolio')}
                onNavigate={handleTabChange}
              />
            )}

            {/* 4. GIS Map */}
            {activeTab === 'map' && (
              <MapView
                cases={divisionFilteredCases}
                selectedDivision={selectedDivision}
                onResetDivision={() => setSelectedDivision('All Divisions')}
                onSelectCase={handleSelectCase}
                onNavigate={handleTabChange}
                theme={theme}
              />
            )}

            {/* 4. What-If Risk Simulator */}
            {activeTab === 'simulator' && (
              <SimulatorView
                projects={divisionFilteredCases}
                initialCase={selectedCase}
                onNavigate={handleTabChange}
              />
            )}

            {/* 5. Document Intake */}
            {activeTab === 'document-intake' && (
              <DocumentIntakeView
                onNavigate={handleTabChange}
              />
            )}

            {/* 6. Action Tracker */}
            {activeTab === 'actions' && (
              <ActionTrackerView
                projects={divisionFilteredCases}
                onNavigate={handleTabChange}
                onSelectCase={handleSelectCase}
              />
            )}

            {/* 7. Bottlenecks */}
            {activeTab === 'bottlenecks' && (
              <InsightsPanel
                cases={divisionFilteredCases}
                onNavigate={handleTabChange}
                onFilterDistrict={(dist) => {
                  setSearchTerm(dist);
                  handleTabChange('portfolio');
                }}
              />
            )}

            {/* 8. Model Audit (formerly Analytics) */}
            {activeTab === 'model-audit' && (
              <AnalyticsView
                cases={divisionFilteredCases}
                selectedDivision={selectedDivision}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Institutional Document Attribution Footer */}
        <footer className="px-6 py-2.5 text-2xs font-mono text-[#64748B]/70 dark:text-[#9AA8B8]/60 border-t border-[#E2E8F0] dark:border-[#212B38] flex flex-wrap items-center justify-between gap-2 select-none bg-white dark:bg-[#0C1017]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">CYBERLEEK</span>
            <span>&bull;</span>
            <span>SIH 2026 &bull; PS 26017</span>
            <span>&bull;</span>
            <span>LandGuard AI Decision Support System</span>
          </div>
          <div className="text-2xs text-[#64748B] dark:text-[#94A3B8]">
            State of Maharashtra &bull; RFCTLARR Act 2013
          </div>
        </footer>
      </div>

    </div>
  );
}

export default App;
