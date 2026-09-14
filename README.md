<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Flask-2.x-000000?logo=flask&logoColor=white" alt="Flask">
  
  <br><br>

  <h1>🛡️ LandGuard AI</h1>
  <p><b>Institutional-grade Land Acquisition Risk Intelligence Platform</b></p>
  <p>Built for the <b>Smart India Hackathon 2026</b> (Problem Statement: PS 26017) by Team <b>CYBERLEEK</b>.</p>
</div>

---

## 📖 Executive Summary

**LandGuard AI** is an advanced risk intelligence and decision-support platform designed for infrastructure authorities, district administrations, and statutory land acquisition directorates. 

Built in strict accordance with the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act)**, LandGuard AI replaces reactive dispute management with explainable, empirical early-warning predictions. It allows officials to foresee litigation, mitigate project delays, and systematically track land acquisition across multiple stages.

---

## ✨ Core Features

*   **🔮 Predictive Risk Scoring:** Vectorized machine learning model evaluating delay and dispute probabilities across multi-phase acquisition workflows.
*   **🧠 Explainable AI (TreeSHAP):** Transparent attribution highlighting the factual triggers (active litigation, circle-rate disparity, SIA clearance lags) behind every predicted risk score.
*   **🗺️ Geospatial Intelligence:** Interactive Leaflet GIS mapping with district corridors, risk clusters, and milestone monitoring across Maharashtra.
*   **📊 Systemic Bottleneck Analytics:** Procedural bottleneck analysis identifying statutory stages with the highest risk concentration.
*   **📄 Document Intelligence Intake:** Automated extraction and risk assessment of crucial land documents (like Form VII-XII).
*   **🖥️ Enterprise-Grade UI/UX:** Restrained, high-contrast, data-dense interface designed for institutional operational credibility (featuring a custom Obsidian Dark Mode).

---

## 🏗️ System Architecture

The project consists of a high-performance REST API backend and an institutional-grade frontend interface.

```text
LandGuard AI
├── landguard-backend/         # Flask REST API & ML Inference Engine
│   ├── app.py                 # Vectorized API server + TreeSHAP explainability
│   ├── train_model.py         # Gradient-boosted risk prediction training pipeline
│   ├── generate_data.py       # Domain-calibrated RFCTLARR dataset generator
│   └── *.joblib               # Serialized model, encoders, explainer & feature artifacts
│
├── landguard-frontend/        # React + Vite Enterprise UI
│   ├── src/
│   │   ├── components/        # Specialized decision-support components (GIS Maps, Analytics, Document Intake)
│   │   ├── services/api.js    # Resilient API layer
│   │   ├── index.css          # Semantic institutional CSS variables (Obsidian palette)
│   │   └── App.jsx            # Main workspace orchestrator & view router
│   └── package.json           # Frontend dependencies
│
└── PPT&DOC/                   # Comprehensive presentation & technical documentation
```

---

## 🚀 Quick Start

### Prerequisites
*   **Python 3.10+**
*   **Node.js 18+** and **npm**

### 1. Start the Backend API (Flask + ML Engine)
```bash
cd landguard-backend
# Install dependencies
pip install flask flask-cors pandas scikit-learn shap joblib numpy
# Run the server
python app.py
```
*The backend runs on `http://localhost:5000` with pre-trained models ready for inference.*

### 2. Start the Frontend Application (React + Vite)
```bash
cd landguard-frontend
# Install Node dependencies
npm install
# Start the development server
npm run dev
```
*Open `http://localhost:3000` in your web browser to access the LandGuard AI dashboard.*

---

## ⚖️ Statutory & Regulatory Grounding

LandGuard AI tracks projects across the standard 5-stage RFCTLARR statutory workflow:
1.  **Section 11 Notification:** Preliminary notification of intent and land survey.
2.  **SIA Clearance:** Social Impact Assessment study and Gram Sabha consultations.
3.  **Section 19 Declaration:** Formal declaration of public purpose and rehabilitation scheme.
4.  **Section 23 Award Inquiry:** Valuation, circle-rate multiplier inquiry, and compensation determination.
5.  **Section 38/40 Possession:** Compensation disbursement and lawful vesting of land.

---

## 👨‍💻 Developed By

**Team CYBERLEEK**
*Smart India Hackathon 2026*
