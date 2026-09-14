import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function WhyButton({
  onClick = () => {},
  label = 'Why?',
  title = 'Inspect AI causal evidence & provenance',
  size = 'sm',
  className = ''
}) {
  const sizeClass = size === 'xs'
    ? 'px-1 py-0.2 text-3xs'
    : size === 'md'
    ? 'px-2 py-1 text-xs'
    : 'px-1.5 py-0.5 text-2xs';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`inline-flex items-center gap-1 font-semibold rounded bg-blue-50 text-[#1D4ED8] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-[#60A5FA] dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 transition-colors cursor-pointer focus-ring select-none shrink-0 ${sizeClass} ${className}`}
      title={title}
      aria-label={title}
    >
      <HelpCircle className="w-2.5 h-2.5 opacity-70" />
      <span>[{label}]</span>
    </button>
  );
}
