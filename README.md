# LandGuard AI — Land Acquisition Risk Intelligence Platform

> **Smart India Hackathon 2026 &bull; Problem Statement: PS 26017**  
> **Team:** CYBERLEEK  
> **System Category:** Enterprise Decision-Support &amp; Statutory Risk Intelligence

---

## Executive Summary

**LandGuard AI** is an institutional-grade risk intelligence platform designed for infrastructure authorities, district revenue administrations, and statutory land acquisition directorates. Built in strict accordance with the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act)**, the platform replaces reactive dispute management with explainable, empirical early-warning predictions.

### Core Value Propositions
- **Predictive Risk Scoring:** Vectorized machine learning model evaluating delay and dispute probabilities across multi-phase acquisition workflows.
- **Explainable AI (TreeSHAP):** Transparent attribution highlighting the top factual triggers (active litigation, circle-rate disparity, SIA clearance lags) behind every predicted score.
- **Geospatial Intelligence:** Interactive Leaflet GIS mapping with district corridors, risk clusters, and milestone monitoring.
- **Systemic Bottleneck Analytics:** Procedural bottleneck analysis identifying statutory stages with the highest risk concentration.
- **Restrained Decision-Support UI:** Clean, high-contrast, data-dense interface designed for institutional operational credibility in both light and dark modes.

---

## System Architecture

```
LandGuard AI
├── landguard-backend/         # Flask REST API & ML Inference Engine
│   ├── app.py                 # Vectorized REST API server with TreeSHAP explainability
│   ├── land_cases.csv         # 600 statutory land acquisition cases across Maharashtra
│   ├── train_model.py         # Gradient-boosted risk prediction training pipeline
│   ├── generate_data.py       # Domain-calibrated RFCTLARR dataset generator
│   └── *.joblib               # Serialized model, encoders, explainer & feature artifacts
│
├── landguard-frontend/        # React + Vite Enterprise UI
│   ├── src/
│   │   ├── components/        # Specialized decision-support components
│   │   │   ├── OverviewView.jsx      # High-level portfolio KPIs & urgent action queue
│   │   │   ├── ProjectsTable.jsx     # Official statutory case registry with sorting & export
│   │   │   ├── MapView.jsx           # GIS spatial risk mapping across Maharashtra districts
│   │   │   ├── AlertsPanel.jsx       # Operational work queue categorized by alert type
│   │   │   ├── InsightsPanel.jsx     # Stage bottleneck & factor concentration analytics
│   │   │   ├── AnalyticsView.jsx     # Global SHAP factor attribution & model metrics
│   │   │   ├── CaseDetailModal.jsx   # Complete case audit dossier & milestone progression
│   │   │   ├── Sidebar.jsx           # Clean institutional navigation
│   │   │   ├── Header.jsx            # Masthead with search & dark/light theme switch
│   │   │   ├── RiskBadge.jsx         # Standardized risk severity badge
│   │   │   └── LandGuardLogo.jsx     # Official shield & GIS node vector mark
│   │   ├── services/api.js    # Resilient API layer with automatic fallbacks
│   │   ├── index.css          # Semantic institutional CSS variables & design tokens
│   │   └── App.jsx            # Main workspace orchestrator & view router
│   └── package.json           # Frontend dependencies & build scripts
│
└── PPT&DOC/                   # Comprehensive presentation & technical documentation
```

---

## Quick Start & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

---

### 1. Start Backend API Server

```bash
cd landguard-backend
pip install -r requirements.txt  # or: pip install flask flask-cors pandas scikit-learn shap joblib numpy
python app.py
```
The backend starts at `http://127.0.0.1:5000` with instant response times:
- `GET /api/projects` — All 600 acquisition cases with predicted scores
- `GET /api/projects/<case_id>` — Case dossier with TreeSHAP factor attributions
- `GET /api/alerts` — Critical high-risk cases requiring urgent intervention
- `GET /api/insights` — Recurring statutory bottleneck factors

---

### 2. Start Frontend Application

```bash
cd landguard-frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

### 3. Production Build Validation

```bash
cd landguard-frontend
npm run build
```
Creates an optimized production bundle in `dist/` with zero lint or build errors.

---

## Statutory & Regulatory Grounding

LandGuard AI tracks projects across the standard 5-stage RFCTLARR statutory workflow:
1. **Section 11 Notification:** Preliminary notification of intent and land survey.
2. **SIA Clearance:** Social Impact Assessment study and Gram Sabha consultations.
3. **Section 19 Declaration:** Formal declaration of public purpose and rehabilitation scheme.
4. **Section 23 Award Inquiry:** Valuation, circle-rate multiplier inquiry, and compensation determination.
5. **Section 38/40 Possession:** Compensation disbursement and lawful vesting of land.

---

## License & Credits

- Developed for **Smart India Hackathon 2026** (Problem Statement 26017).
- Team **CYBERLEEK**.
