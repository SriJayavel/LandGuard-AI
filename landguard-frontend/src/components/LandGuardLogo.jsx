import React from 'react';

/**
 * Official LandGuard AI Institutional Mark
 * Concept:
 * - Shield perimeter: Governance, legal protection, RFCTLARR Act statutory framework
 * - Cadastral boundary lines: Surveyed land parcels & property divisions
 * - Central vertical axis: Infrastructure corridor & territorial protection
 * 
 * Vector SVG, scalable at 24px, 32px, 40px. Monochrome/duotone compliant.
 * Zero gradients, zero 3D, zero glow.
 */
export default function LandGuardLogo({ className = "w-7 h-7", isDark = false }) {
  const shieldColor = isDark ? "#F3F6FA" : "#0F2942";
  const innerColor = isDark ? "#3B82F6" : "#1D4ED8";
  const cadastreColor = isDark ? "#6F7D8D" : "#475569";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LandGuard AI Emblem"
    >
      {/* 1. Shield Perimeter (Constitutional & Legal Governance) */}
      <path
        d="M16 3L5.5 7V15.2C5.5 22.2 10 27.4 16 29C22 27.4 26.5 22.2 26.5 15.2V7L16 3Z"
        stroke={shieldColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Cadastral Land Parcel Division Grid */}
      <path
        d="M9.5 14.5H22.5"
        stroke={cadastreColor}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10 20L16 14.5L22 20"
        stroke={cadastreColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Central Infrastructure Protection Corridor Axis */}
      <path
        d="M16 8V24"
        stroke={innerColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      
      {/* 4. Central Geographic Survey Node */}
      <circle
        cx="16"
        cy="14.5"
        r="2"
        fill={innerColor}
      />
    </svg>
  );
}
