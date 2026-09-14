import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Printer, Sun, Moon, Search, X, ArrowRight, Menu, ShieldCheck,
  Bell
} from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function Header({
  theme = 'light',
  setTheme,
  toggleTheme,
  searchTerm = '',
  setSearchTerm = () => {},
  selectedDivision = 'All Divisions',
  setSelectedDivision = () => {},
  cases = [],
  onSelectCase = () => {},
  onNavigateToProjects = () => {},
  onNavigateToAlerts = () => {},
  onToggleMobile = () => {}
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const notificationsRef = useRef(null);

  // Global Keyboard Shortcut: ⌘K / Ctrl K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close floating popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const divisions = [
    'All Divisions',
    'Pune Division',
    'Kolhapur Division',
    'Amravati Division',
    'Nashik Division',
    'Nagpur Division',
    'Chhatrapati Sambhajinagar'
  ];

  const [searchDimensionFilter, setSearchDimensionFilter] = useState('All');
  const [keyboardSelectedIndex, setKeyboardSelectedIndex] = useState(0);

  // Multi-dimensional search matching across:
  // 1. Case ID
  // 2. Project name
  // 3. District
  // 4. Survey number
  // 5. Document type
  const matchingResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();

    const results = cases
      .map((c) => {
        if (!c) return null;
        const id = (c.case_id || c.project_id || '').toString().toLowerCase();
        const name = (c.project_name || c.name || '').toString().toLowerCase();
        const dist = (c.district || '').toString().toLowerCase();
        const survey = (c.survey_number || c.survey_no || c.gat_no || '').toString().toLowerCase();
        const doc = (c.document_type || c.doc_type || c.statutory_evidence || c.current_stage || c.stage || '').toString().toLowerCase();

        let matchDimension = null;
        let matchFieldVal = '';
        if (id.includes(term)) {
          matchDimension = 'Case ID';
          matchFieldVal = c.case_id || c.project_id;
        } else if (name.includes(term)) {
          matchDimension = 'Project';
          matchFieldVal = c.project_name;
        } else if (dist.includes(term)) {
          matchDimension = 'District';
          matchFieldVal = c.district;
        } else if (survey.includes(term)) {
          matchDimension = 'Survey number';
          matchFieldVal = c.survey_number || c.survey_no;
        } else if (doc.includes(term)) {
          matchDimension = 'Document';
          matchFieldVal = c.document_type || 'Village Form VII-XII';
        }

        if (!matchDimension) return null;
        return { item: c, matchDimension, matchFieldVal };
      })
      .filter(Boolean);

    if (searchDimensionFilter === 'All') return results;
    if (searchDimensionFilter === 'Survey No') {
      return results.filter((r) => r.matchDimension === 'Survey number');
    }
    return results.filter((r) => r.matchDimension === searchDimensionFilter);
  }, [cases, searchTerm, searchDimensionFilter]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setKeyboardSelectedIndex((prev) => (matchingResults.length > 0 ? (prev + 1) % matchingResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setKeyboardSelectedIndex((prev) => (matchingResults.length > 0 ? (prev - 1 + matchingResults.length) % matchingResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingResults.length > 0 && matchingResults[keyboardSelectedIndex]) {
        onSelectCase(matchingResults[keyboardSelectedIndex].item);
        setIsSearchOpen(false);
      } else {
        setIsSearchOpen(false);
        onNavigateToProjects();
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-[#E2E8F0] dark:border-[#212B38] bg-white dark:bg-[#0C1017] transition-colors duration-150 shadow-xs select-none">
      {/* Command Header Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#131923]">
        {/* LEFT: Brand & Risk Intelligence Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus-ring"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F2942] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-center text-white font-bold text-xs tracking-wider">
              LG
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A] dark:text-[#F3F6FA] tracking-tight leading-none">
                LandGuard AI
              </div>
              <div className="text-2xs text-[#475569] dark:text-[#94A3B8] font-medium leading-tight mt-0.5">
                Land Acquisition Risk Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* CENTER & FILTER: Global Search Bar and Division / District Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl justify-center">
          {/* Global Search Bar with ⌘K / Ctrl K shortcut badge */}
          <div ref={searchRef} className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#6F7D8D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search Case ID, Project, District, Survey No, Document... (⌘K)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
                setKeyboardSelectedIndex(0);
              }}
              onFocus={() => {
                if (searchTerm.trim()) setIsSearchOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#F4F6F8] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F1F5F9] placeholder-[#64748B] dark:placeholder-[#6F7D8D] text-xs pl-8 pr-24 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] transition-colors focus-ring"
            />

            {/* Keyboard Shortcut Badge (⌘K / Ctrl K) or Clear Button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(false);
                    inputRef.current?.focus();
                  }}
                  className="text-[#64748B] hover:text-[#0F172A] dark:text-[#6F7D8D] dark:hover:text-white p-0.5 rounded cursor-pointer focus-ring"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center text-3xs font-mono font-medium text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] px-1.5 py-0.5 rounded pointer-events-none">
                  ⌘K / Ctrl K
                </span>
              )}
            </div>

            {/* Multi-Dimensional Instant Search Results Dropdown */}
            {isSearchOpen && searchTerm.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in-50 duration-100 min-w-[360px]">
                {/* Search Dimension Filter Pills */}
                <div className="px-3 py-1.5 bg-[#F4F6F8] dark:bg-[#0F141C] border-b border-[#E2E8F0] dark:border-[#212B38] flex items-center gap-1.5 overflow-x-auto text-3xs">
                  {['All', 'Case ID', 'Project', 'District', 'Survey No', 'Document'].map((dim) => (
                    <button
                      key={dim}
                      onClick={() => setSearchDimensionFilter(dim)}
                      className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors whitespace-nowrap ${
                        searchDimensionFilter === dim
                          ? 'bg-[#1D4ED8] text-white shadow-xs'
                          : 'bg-white dark:bg-[#131923] text-[#475569] dark:text-[#9AA8B8] border border-[#E2E8F0] dark:border-[#212B38] hover:text-[#0F172A]'
                      }`}
                    >
                      {dim}
                    </button>
                  ))}
                </div>

                <div className="px-3 py-1 bg-white dark:bg-[#131923] border-b border-[#E2E8F0]/60 dark:border-[#212B38]/60 flex items-center justify-between text-3xs text-[#64748B] dark:text-[#9AA8B8]">
                  <span>Matches: <strong>{matchingResults.length}</strong> official records</span>
                  <span className="font-mono">Use &uarr; &darr; + Enter to open</span>
                </div>

                {matchingResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#64748B] dark:text-[#9AA8B8]">
                    No matching records for "{searchTerm}" in dimension: {searchDimensionFilter}.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#212B38]">
                    {matchingResults.slice(0, 7).map(({ item: c, matchDimension }, idx) => {
                      const isFocused = idx === keyboardSelectedIndex;
                      return (
                        <div
                          key={c.case_id || c.project_id}
                          onClick={() => {
                            onSelectCase(c);
                            setIsSearchOpen(false);
                          }}
                          className={`p-2.5 cursor-pointer flex items-center justify-between gap-2 transition-colors text-left focus-ring ${
                            isFocused
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-inset ring-[#1D4ED8]'
                              : 'hover:bg-[#F1F5F9] dark:hover:bg-[#1A2332]'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            {/* Row 1: Case ID, Project Name, Match Category Tag */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-2xs font-bold text-[#1D4ED8] dark:text-[#60A5FA]">
                                {c.case_id || c.project_id}
                              </span>
                              <span className="text-xs font-medium text-[#0F172A] dark:text-[#F3F6FA] truncate">
                                {c.project_name || 'Acquisition Project'}
                              </span>
                              <span className="ml-auto text-3xs font-mono font-medium px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/40">
                                {matchDimension}
                              </span>
                            </div>

                            {/* Row 2: District, Survey Number, Document Type */}
                            <div className="text-2xs text-[#64748B] dark:text-[#9AA8B8] flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="font-medium text-[#334155] dark:text-[#CBD5E1]">{c.district}</span>
                              <span>&bull;</span>
                              <span className="font-mono-num font-semibold text-[#0F172A] dark:text-[#F3F6FA]">
                                {c.survey_number || c.survey_no || 'Gat No. 142'}
                              </span>
                              <span>&bull;</span>
                              <span className="truncate">{c.document_type || 'Village Form VII-XII'}</span>
                            </div>
                          </div>

                          {/* Severity Badge */}
                          <div className="shrink-0 flex items-center gap-1.5 pl-2">
                            <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                          </div>
                        </div>
                      );
                    })}

                    {matchingResults.length > 7 && (
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          onNavigateToProjects();
                        }}
                        className="w-full px-3 py-2 text-xs font-semibold text-[#1D4ED8] dark:text-[#60A5FA] bg-[#F8FAFC] dark:bg-[#0F141C] hover:bg-[#F1F5F9] dark:hover:bg-[#1A2332] flex items-center justify-center gap-1 border-t border-[#E2E8F0] dark:border-[#212B38] cursor-pointer focus-ring"
                      >
                        <span>View all {matchingResults.length} matching cases in portfolio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FILTER: Division / District Dropdown */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            aria-label="Filter by Division or District"
            className="bg-[#F4F6F8] dark:bg-[#0C1017] text-[#0F172A] dark:text-[#F1F5F9] text-xs px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#212B38] cursor-pointer shrink-0 focus-ring"
          >
            {divisions.map((div) => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        {/* RIGHT: Data freshness, Notifications, Print Briefing, User menu */}
        <div className="flex items-center gap-2 shrink-0">


          {/* Notifications Flyout */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false);
              }}
              className="relative p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white bg-white dark:bg-[#131923] hover:bg-[#F4F6F8] dark:hover:bg-[#1A2332] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] transition-colors cursor-pointer focus-ring"
              title="Operational notifications"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#B91C1C] rounded-full ring-2 ring-white dark:ring-[#131923]"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-88 bg-white dark:bg-[#131923] border border-[#E2E8F0] dark:border-[#212B38] rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in-50 duration-100">
                <div className="p-3 bg-[#F4F6F8] dark:bg-[#0F141C] border-b border-[#E2E8F0] dark:border-[#212B38] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">Alert Center Summary</span>
                  </div>
                  <span className="text-3xs font-mono font-semibold px-1.5 py-0.5 rounded bg-red-50 text-[#B91C1C] dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                    26 Active Alerts
                  </span>
                </div>

                {/* 4 Official Alert Center Buckets */}
                <div className="p-2 space-y-1.5 divide-y divide-[#E2E8F0]/50 dark:divide-[#212B38]/50">
                  {/* Bucket 1: 12 New Critical Cases */}
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateToAlerts('CRITICAL');
                    }}
                    className="pt-1.5 first:pt-0 p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1A2332] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#B91C1C] shrink-0"></span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                          12 new critical cases
                        </div>
                        <div className="text-3xs text-[#64748B] dark:text-[#94A3B8] truncate">
                          Valuation disputes and Section 25 limitation breaches
                        </div>
                      </div>
                    </div>
                    <span className="text-2xs font-mono-num font-bold text-[#B91C1C] dark:text-red-400 shrink-0">
                      12
                    </span>
                  </div>

                  {/* Bucket 2: 4 Cases Crossed Delay Threshold */}
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateToAlerts('DELAY');
                    }}
                    className="pt-1.5 p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1A2332] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#B45309] shrink-0"></span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                          4 cases crossed delay threshold
                        </div>
                        <div className="text-3xs text-[#64748B] dark:text-[#94A3B8] truncate">
                          Overdue &gt;120 days in Award &amp; Compensation stages
                        </div>
                      </div>
                    </div>
                    <span className="text-2xs font-mono-num font-bold text-[#B45309] dark:text-amber-400 shrink-0">
                      4
                    </span>
                  </div>

                  {/* Bucket 3: 3 Legal Stays Detected */}
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateToAlerts('STAY');
                    }}
                    className="pt-1.5 p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1A2332] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                          3 legal stays detected
                        </div>
                        <div className="text-3xs text-[#64748B] dark:text-[#94A3B8] truncate">
                          High Court Art 226 injunctions (Pune, Thane, Nashik)
                        </div>
                      </div>
                    </div>
                    <span className="text-2xs font-mono-num font-bold text-red-600 dark:text-red-400 shrink-0">
                      3
                    </span>
                  </div>

                  {/* Bucket 4: 7 Compensation Disputes Escalated */}
                  <div
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateToAlerts('COMPENSATION');
                    }}
                    className="pt-1.5 p-2 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1A2332] transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] shrink-0"></span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F3F6FA]">
                          7 compensation disputes escalated
                        </div>
                        <div className="text-3xs text-[#64748B] dark:text-[#94A3B8] truncate">
                          Ready Reckoner circle-rate multiplier appeals
                        </div>
                      </div>
                    </div>
                    <span className="text-2xs font-mono-num font-bold text-[#1D4ED8] dark:text-blue-400 shrink-0">
                      7
                    </span>
                  </div>
                </div>

                {/* Footer Action to open full Alert Center */}
                <div className="p-2.5 bg-[#F4F6F8] dark:bg-[#0F141C] border-t border-[#E2E8F0] dark:border-[#212B38]">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateToAlerts('ALL');
                    }}
                    className="w-full py-1.5 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] active:bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus-ring"
                  >
                    <span>Open Alert Center (26 Alerts)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Action: Print Briefing */}
          <button
            onClick={() => window.print()}
            className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white bg-white dark:bg-[#131923] hover:bg-[#F4F6F8] dark:hover:bg-[#1A2332] rounded-lg border border-[#E2E8F0] dark:border-[#212B38] transition-colors cursor-pointer focus-ring"
            title="Print official executive briefing"
            aria-label="Print executive briefing"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Executive Theme Option Switcher (Replaces redundant role dropdown) */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-[#F1F5F9] dark:bg-[#161F32] border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs select-none"
            role="radiogroup"
            aria-label="Interface theme selector"
          >
            <button
              type="button"
              onClick={() => {
                if (setTheme) setTheme('light');
                else if (theme !== 'light') toggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              title="Switch to Light theme"
              aria-label="Light mode"
              aria-checked={theme === 'light'}
              role="radio"
            >
              <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
              <span className="hidden sm:inline text-2xs font-medium">Light</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (setTheme) setTheme('dark');
                else if (theme !== 'dark') toggleTheme();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#1D4ED8] text-white shadow-xs ring-1 ring-blue-500/40'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
              title="Switch to Dark theme"
              aria-label="Dark mode"
              aria-checked={theme === 'dark'}
              role="radio"
            >
              <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-100 fill-blue-100/20' : 'text-slate-400'}`} />
              <span className="hidden sm:inline text-2xs font-medium">Dark</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
