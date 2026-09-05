import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ level }) {
  const normLevel = (level || 'Low').toString().trim();

  if (normLevel === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
        <AlertCircle className="w-3 h-3 text-red-400" />
        <span>Critical</span>
      </span>
    );
  }

  if (normLevel === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>Elevated</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      <span>Stable</span>
    </span>
  );
}
