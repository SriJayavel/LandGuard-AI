import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ level }) {
  const normLevel = (level || 'Low').toString().trim();

  if (normLevel === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-950/80 text-red-400 border border-red-800/80 shadow-sm">
        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
        <span>HIGH RISK</span>
      </span>
    );
  }

  if (normLevel === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>MEDIUM RISK</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-sm">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span>LOW RISK</span>
    </span>
  );
}
