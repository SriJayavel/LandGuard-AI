import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ level }) {
  const normLevel = (level || 'Low').toString().trim();

  if (normLevel === 'High') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider uppercase bg-red-950/80 text-red-300 border border-red-700/80 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        <AlertOctagon className="w-3 h-3 text-red-400" />
        <span>CRITICAL</span>
      </span>
    );
  }

  if (normLevel === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider uppercase bg-amber-950/80 text-amber-300 border border-amber-600/80 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>ELEVATED</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      <span>STABLE</span>
    </span>
  );
}
