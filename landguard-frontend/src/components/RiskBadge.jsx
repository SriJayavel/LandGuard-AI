import React from 'react';

/**
 * Institutional Semantic Risk Badge
 * Calm, restrained, high-contrast. Zero glow, zero decorative fluff.
 * Uses Red for genuine critical risk, Amber for warning/elevated, Green for stable.
 */
export default function RiskBadge({ level = 'Low', score = null, size = 'sm' }) {
  const normLevel = (level || 'Low').toString().trim().toUpperCase();

  const isCritical = normLevel.includes('CRITICAL') || normLevel.includes('HIGH');
  const isElevated = normLevel.includes('ELEVATED') || normLevel.includes('MEDIUM');

  const sizeClasses = size === 'md'
    ? 'px-2 py-0.5 text-xs gap-1.5'
    : 'px-1.5 py-0.5 text-[11px] gap-1';

  const dotSize = 'w-1.5 h-1.5';

  if (isCritical) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded ${sizeClasses} bg-red-50 text-[#B91C1C] border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/40`}
      >
        <span className={`${dotSize} rounded-full bg-[#DC2626] shrink-0`}></span>
        <span className="tracking-wide">CRITICAL</span>
        {score !== null && score !== undefined && (
          <span className="font-mono-num ml-0.5 opacity-90">
            {typeof score === 'number' && score <= 1 ? `${Math.round(score * 100)}%` : `${score}%`}
          </span>
        )}
      </span>
    );
  }

  if (isElevated) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded ${sizeClasses} bg-amber-50 text-[#B45309] border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40`}
      >
        <span className={`${dotSize} rounded-full bg-[#D97706] shrink-0`}></span>
        <span className="tracking-wide">ELEVATED</span>
        {score !== null && score !== undefined && (
          <span className="font-mono-num ml-0.5 opacity-90">
            {typeof score === 'number' && score <= 1 ? `${Math.round(score * 100)}%` : `${score}%`}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded ${sizeClasses} bg-emerald-50 text-[#15803D] border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40`}
    >
      <span className={`${dotSize} rounded-full bg-[#16A34A] shrink-0`}></span>
      <span className="tracking-wide">STABLE</span>
      {score !== null && score !== undefined && (
        <span className="font-mono-num ml-0.5 opacity-90">
          {typeof score === 'number' && score <= 1 ? `${Math.round(score * 100)}%` : `${score}%`}
        </span>
      )}
    </span>
  );
}
