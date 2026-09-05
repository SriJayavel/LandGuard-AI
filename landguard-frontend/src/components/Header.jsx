import React, { useState, useEffect } from 'react';
import { Printer, Sun, Moon, Search } from 'lucide-react';

export default function Header({
  theme = 'light',
  toggleTheme,
  searchTerm = '',
  setSearchTerm = () => {},
  selectedDivision = 'All Divisions',
  setSelectedDivision = () => {}
}) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      setCurrentTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const divisions = [
    'All Divisions',
    'Pune Division',
    'Konkan Division',
    'Nagpur Division',
    'Nashik Division',
    'Amravati Division',
    'Chhatrapati Sambhajinagar'
  ];

  return (
    <header className="bg-white dark:bg-[#0D141D] border-b border-[#E2E8F0] dark:border-[#263342] px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 transition-colors duration-150">
      {/* 1. System Identification (Quiet, Authoritative) */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[#0F2942] dark:text-[#F3F6FA] tracking-tight">
          LandGuard AI
        </span>
        <span className="text-xs text-[#CBD5E1] dark:text-[#263342]">&bull;</span>
        <span className="text-xs text-[#64748B] dark:text-[#9AA8B8] font-medium hidden sm:inline">
          Land Acquisition Risk Intelligence System
        </span>
      </div>

      {/* 2. Utility Controls: Search + Division */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
        <div className="relative w-full max-w-xs hidden md:block">
          <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#6F7D8D] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cases or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8FAFC] dark:bg-[#111A24] text-[#0F172A] dark:text-[#F3F6FA] placeholder-[#64748B] dark:placeholder-[#6F7D8D] text-xs pl-8 pr-3 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="bg-[#F8FAFC] dark:bg-[#111A24] text-[#0F172A] dark:text-[#F3F6FA] text-xs px-2.5 py-1.5 rounded border border-[#E2E8F0] dark:border-[#263342] focus:outline-none focus:border-[#1D4ED8] dark:focus:border-[#3B82F6] cursor-pointer hidden sm:block"
        >
          {divisions.map((div) => (
            <option key={div} value={div}>{div}</option>
          ))}
        </select>
      </div>

      {/* 3. Secondary Actions: Date/Time + Print Briefing + Clean Utility Theme Toggle */}
      <div className="flex items-center gap-2">
        {/* Date & Time (Subdued Secondary Information) */}
        <span className="hidden lg:inline text-[11px] font-mono-num text-[#64748B] dark:text-[#6F7D8D] px-2 py-1">
          {currentTime || 'IST 05:30 GMT'}
        </span>

        {/* Print Briefing Button */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#334155] dark:text-[#9AA8B8] bg-white dark:bg-[#111A24] hover:bg-[#F1F5F9] dark:hover:bg-[#151F2B] rounded border border-[#E2E8F0] dark:border-[#263342] transition-colors cursor-pointer"
          title="Print official executive briefing"
        >
          <Printer className="w-3.5 h-3.5 text-[#64748B] dark:text-[#6F7D8D]" />
          <span className="hidden sm:inline">Print Briefing</span>
        </button>

        {/* Clean Neutral Theme Toggle (Utility Control, NOT Brightly Colored) */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#334155] dark:text-[#9AA8B8] bg-white dark:bg-[#111824] hover:bg-[#F1F5F9] dark:hover:bg-[#151F2B] rounded border border-[#E2E8F0] dark:border-[#263342] transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#9AA8B8]" />
              <span className="text-xs">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-xs">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
