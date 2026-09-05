import React from 'react';

export default function RiskBadge({ level }) {
  const normLevel = (level || 'Low').toString().trim().toUpperCase();

  if (normLevel === 'CRITICAL' || normLevel === 'HIGH RISK') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
        CRITICAL
      </span>
    );
  }

  if (normLevel === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
        HIGH
      </span>
    );
  }

  if (normLevel === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        MEDIUM
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
      LOW
    </span>
  );
}
