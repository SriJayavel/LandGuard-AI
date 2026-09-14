/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '3xs': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px (Metadata: 11-12px)
        '2xs': ['0.75rem', { lineHeight: '1rem' }],       // 12px (Metadata: 11-12px)
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px (Metadata: 11-12px)
        'body-sm': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px (Body: 13-14px)
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px (Body: 13-14px)
        'card-sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px (Card title: 14-16px)
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px (Card title: 14-16px)
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],   // 18px (Section title: 18-20px)
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px (Section title: 18-20px)
        '2xl': ['1.75rem', { lineHeight: '2.125rem' }],   // 28px (Page title: 28-32px)
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px (Page title: 28-32px / Large KPI: 28-36px)
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px (Large KPI: 28-36px)
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
