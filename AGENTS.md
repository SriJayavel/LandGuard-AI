# LandGuard AI — Design System Baseline & Governance Directives

> **Status:** APPROVED & LOCKED BASELINE  
> **Target Audience:** State Land Acquisition Officers, District Revenue Authorities, SIH 2026 Evaluation Jury  
> **Personality:** Professional, Institutional, Trustworthy, Intelligent, Calm, Data-Driven, Precise  

---

## 1. Core Design Mandate
- **The data is the hero, not the effects.**
- Artificial intelligence is demonstrated through **accurate risk prediction, SHAP explainability, prescriptive recommendations, priority work queues, and bottleneck analysis** — NEVER through glowing borders, neon text, futuristic terminology, or decorative badges.
- **Prioritize consistency, information hierarchy, usability, and government/enterprise credibility over visual novelty.**
- Do not introduce decorative UI elements unless they directly improve decision-making.

---

## 2. Color Palette & Semantic Tokens
- **Application Canvas:** `#F5F7FA` (Neutral light canvas)
- **Surfaces & Cards:** `#FFFFFF` (Pure white, 8px radius, 1px `#D9E1EA` border)
- **Primary Navy:** `#123B63` (Headers, brand identity, institutional typography)
- **Primary Blue:** `#1769AA` (Primary buttons, active navigation, links)
- **Secondary Blue:** `#2F80C0` (Subtle highlights)
- **Primary Text:** `#172033` (High contrast, readable body copy)
- **Secondary Text:** `#667085` (Metadata, subtitles, table column headers)
- **Border Color:** `#D9E1EA` (Clean 1px dividing lines)

### Semantic Risk Indicators (Exclusive Purpose)
*Blue is the primary interface accent. Red, orange, amber, and green communicate risk ONLY:*
- **LOW:** `#16A34A` (Background: `#F0FDF4`, Border: `#BBF7D0`)
- **MEDIUM:** `#D97706` (Background: `#FFFBEB`, Border: `#FDE68A`)
- **HIGH:** `#EA580C` (Background: `#FFF7ED`, Border: `#FED7AA`)
- **CRITICAL:** `#DC2626` (Background: `#FEF2F2`, Border: `#FECACA`)

---

## 3. Application Shell & Structure
- **Left Sidebar Navigation (`Sidebar.jsx`):**
  - Institutional crest and platform title: *LandGuard AI • Land Acquisition Risk Intelligence*
  - Functional navigation: `Overview`, `Projects`, `Alerts`, `Bottlenecks`, `GIS Map`, `Analytics`
  - Portal status footer: *Maharashtra State Portal • Online*
- **Top Header Bar (`Header.jsx`):**
  - Platform Title and functional subtitle: *Predictive monitoring • Explainable AI • Decision support*
  - Print/Export case briefing trigger, live date display.
  - Zero technical clutter (no `ENGINE: XGBoost`, `ROC-AUC`, or `LATENCY` in main headers).

---

## 4. Typography & Numbers
- **Font Family:** Inter (`font-sans`) for all UI text, headings, and controls.
- **Data Figures:** JetBrains Mono (`font-mono-num`) with tabular numerals enabled for all currency outlays (`₹ Cr`), case IDs, and percentage metrics.
- **Hierarchy:**
  - Page Titles: 20–24px bold (`#123B63` / `#172033`)
  - Section Headers: 14–16px bold (`#172033`)
  - Body & Table Text: 12–13px regular (`#172033`)
  - Metadata Labels: 10–11px medium (`#667085`)

---

## 5. Non-Negotiable Data Integrity
- **Never fabricate values.** Every displayed metric, count, percentage, and budget outlay must be derived directly from the active Flask backend API (`http://127.0.0.1:5000/api`) or calculated mathematically from the active 600-case dataset.
- If a metric does not exist, calculate it correctly from raw case attributes or omit it.

---

## 6. Conceptual Flow
Every case evaluation follows the decision-support flow:
$$\text{PREDICT} \longrightarrow \text{EXPLAIN (SHAP)} \longrightarrow \text{RECOMMEND} \longrightarrow \text{ACT}$$
