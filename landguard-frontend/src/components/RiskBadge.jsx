import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level }) {
  const normLevel = (level || 'Low').toString().trim();

  if (normLevel === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-rose-950/70 text-rose-300 border border-rose-600/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"></span>
        <AlertOctagon className="w-3 h-3 text-rose-400" />
        <span>CRITICAL</span>
      </span>
    );
  }

  if (normLevel === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>ELEVATED</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      <span>STABLE</span>
    </span>
  );
}
