import React from 'react';
import { Search, Printer, HelpCircle } from 'lucide-react';

export default function Header({ onSearchFocus, onExportReport }) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-[#D9E1EA] px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#123B63] tracking-tight">LandGuard AI</h1>
          <span className="text-xs text-[#667085] font-medium hidden sm:inline">&bull;</span>
          <span className="text-xs font-semibold text-[#1769AA] hidden sm:inline">
            Land Acquisition Risk Intelligence Platform
          </span>
        </div>
        <p className="text-xs text-[#667085] mt-0.5">
          Predictive monitoring &bull; Explainable AI &bull; Decision support
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs font-medium text-[#667085] bg-[#F5F7FA] px-3 py-1.5 rounded border border-[#D9E1EA]">
          {currentDate} &bull; Maharashtra Jurisdiction
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#172033] bg-white hover:bg-[#F5F7FA] rounded border border-[#D9E1EA] transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#667085]" />
          <span>Print Briefing</span>
        </button>
      </div>
    </header>
  );
}
