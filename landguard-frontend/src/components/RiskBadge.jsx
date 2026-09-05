import React from 'react';

export default function RiskBadge({ level, score }) {
  const getBadgeClass = (lvl) => {
    switch (lvl) {
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      case 'Low':
        return 'badge-low';
      default:
        return 'badge-low';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(level)}`}
      style={{
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: level === 'High' ? '#ef4444' : level === 'Medium' ? '#f59e0b' : '#10b981'
        }}
      />
      {level} {score !== undefined && `(${Math.round(score * 100)}%)`}
    </span>
  );
}
