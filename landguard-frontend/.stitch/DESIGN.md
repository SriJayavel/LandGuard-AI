# LandGuard AI — Stitch Semantic Design System (DESIGN.md)
*SIH 2026 • PS 26017 • State of Maharashtra (RFCTLARR Act 2013) • Team CyberLeek*

---

## 1. Visual Atmosphere & Philosophy
- **Domain Intent**: Enterprise Government Decision-Support Platform for District Collectors, Divisional Commissioners, and Land Acquisition Officers.
- **Density Index**: `8/10 (Cockpit Dense)` — High-precision tabular data, instant filtering, tabular numbers, and zero unnecessary white-space padding.
- **Variance Index**: `6/10 (Offset Asymmetric)` — Purpose-built asymmetric split panels (parameter inputs on left, predictive outcomes on right).
- **Motion Index**: `5/10 (Fluid Micro-Transitions)` — Hardware-accelerated CSS transitions, smooth SVG gauge meters, and zero sluggish multi-second animations.
- **Surface Styling**: Institutional Glassmorphism (`backdrop-filter: blur(16px)` with subtle 1px inner bevels and WCAG AA contrast).

---

## 2. Calibrated Color Palette

| Token Name | Hex / RGBA | Role & Application |
|---|---|---|
| `--color-slate` | `#0B1118` | Deep cockpit background canvas in dark mode |
| `--color-acrylic` | `rgba(17, 26, 36, 0.70)` | Frosted glass card backdrop in dark mode |
| `--glass-bg` | `rgba(255, 255, 255, 0.78)` | Crisp semi-translucent glass in light mode |
| `--glass-border` | `rgba(226, 232, 240, 0.85)` | High-precision border perimeter for light glass |
| `--color-sovereign-blue` | `#1D4ED8` | Institutional government authority blue; primary interactive accent |
| `--color-signal-crimson` | `#DC2626` | High risk, Section 11/19 breaches, active court writs |
| `--color-signal-amber` | `#D97706` | Elevated risk, revenue department delay flags, quorum shortfalls |
| `--color-signal-emerald` | `#16A34A` | Stable statutory progress, certified SIA clearance, verified mutations |

### Banned Aesthetic Patterns
- ❌ **NO AI Purple / Cyan Gradients**: No glowing neon borders, holographic gradients, or generic crypto/cyber aesthetics.
- ❌ **NO Pure Black (`#000000`)**: Canvas must always use `#0B1118` or Slate-900.
- ❌ **NO Blurry Unreadable Glass**: Every text element on glass must exceed WCAG AA 4.5:1 contrast.

---

## 3. Typographic Architecture

| Hierarchy | Typeface | Size / Weight | Application |
|---|---|---|---|
| **Display / Masthead** | `Plus Jakarta Sans` | `24px / Bold (700)` | Primary screen headers & statutory banners |
| **Section Headlines** | `Plus Jakarta Sans` | `14px / Semibold (600)` | Card titles, modal headers, navigation groups |
| **Body Text** | `Plus Jakarta Sans` | `12px - 13px / Regular` | Dossier details, legal extracts, directives |
| **Tabular Numbers** | `JetBrains Mono` | `11px - 36px / Bold` | Currency (₹ Cr), risk scores (0-1.0), dates, project IDs |

---

## 4. Canonical 8-Screen Architecture

All views conform strictly to keyboard shortcuts `1`–`8`:

1. **Screen 1 — `overview` (Overview / Core Intelligence)**
   - Glass metric cards (Critical Cases, Outlay at Risk, Total Tracked, Avg Stage Lag).
   - 5-Milestone statutory acquisition pipeline with bottleneck indicator.
   - Priority review queue table with direct `Simulate` and `Order` quick-action buttons.
   - Regional risk concentration barometer across 6 districts.

2. **Screen 2 — `portfolio` (Portfolio / Core Intelligence)**
   - Master data table of all statutory proceedings across Pune, Kolhapur, Nagpur, Nashik, Amravati, Aurangabad.
   - Multi-parameter live search and division filter.

3. **Screen 3 — `map` (GIS Map / Core Intelligence)**
   - Regional spatial heatmap of the 6 Maharashtra districts with cluster markers, polygon overlays, and risk color coding.

4. **Screen 4 — `simulator` (What-If Simulator / Decision & Action)**
   - Real-time parameter controls: Elapsed Days (10–365d), R&R Compliance (0–100%), Legal Case Toggle, Revenue Delay Flag, Prior Disputes Count.
   - Dual baseline vs simulated risk score meters with delta % calculation.
   - Fiscal savings projection (₹ Cr) and timeline days saved.
   - "Commit Simulation to Action Plan" CTA.

5. **Screen 5 — `document-intake` (Document Intake / Decision & Action)**
   - 4 Statutory Canned Templates:
     1. Village Form VII-XII (Satbara Extract)
     2. Bombay High Court Writ Petition
     3. Section 11(1) Preliminary Gazette
     4. Forest Rights Act (FRA 2006) Diversion Certificate
   - Dual-column viewport: Legal Marathi/English raw text on left; Extracted Entity Chips & TreeSHAP factor breakdown on right.

6. **Screen 6 — `actions` (Action Tracker / Decision & Action)**
   - Administrative action ledger with status filters (`All`, `Urgent Review`, `Hearing Scheduled`, `In Progress`, `Resolved`).
   - Add Action modal with statutory deadline, expected risk drop %, and assigned officer.
   - In-place quick status mutation with audit timestamp persistence.
   - Print-ready memorandum generator.

7. **Screen 7 — `bottlenecks` (Bottlenecks / Diagnostics)**
   - Inter-departmental delay heatmap across 5 statutory directorates (Revenue, Judiciary, LA Authority, Forest, R&R).
   - Stage duration vertical bar chart.
   - Systemic operational mitigation directives.

8. **Screen 8 — `model-audit` (Model Audit / Diagnostics)**
   - Algorithmic fairness, feature importance metrics, and ROC-AUC / Precision-Recall evaluation figures.

---

## 5. Offline Demo Static Asset References
- Stored under `dist/` and `src/assets/` as offline fallback assets.
- Live Stitch calls are omitted on stage to protect demo uptime against third-party network outages.
