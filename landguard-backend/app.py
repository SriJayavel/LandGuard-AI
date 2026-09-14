# pyright: reportMissingImports=false
# type: ignore
import os
import sys
import json
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request, send_from_directory  # type: ignore
from flask_cors import CORS  # type: ignore
import pandas as pd  # type: ignore
import joblib  # type: ignore
import numpy as np  # type: ignore

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'landguard-frontend', 'dist'))
app = Flask(__name__, static_folder=os.path.join(FRONTEND_DIST, 'assets'), static_url_path='/assets')
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'land_cases.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')

if not os.path.exists(DATA_PATH) or not os.path.exists(MODEL_PATH):
    from train_model import train
    train()

base_dir = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(base_dir, 'land_cases.csv'))
model = joblib.load(os.path.join(base_dir, 'model.joblib'))
encoders = joblib.load(os.path.join(base_dir, 'encoders.joblib'))
explainer = joblib.load(os.path.join(base_dir, 'explainer.joblib'))
features = joblib.load(os.path.join(base_dir, 'features.joblib'))

FRIENDLY_NAMES = {
    'legal_case_pending': 'Legal Case Pending',
    'rr_compliance_pct': 'Low R&R Compliance',
    'revenue_dept_delay_flag': 'Revenue Dept Delay',
    'days_in_stage': 'Time Stuck in Stage',
    'num_landowners': 'High Landowner Density',
    'past_disputes_count': 'History of Disputes',
    'district_enc': 'District Risk Baseline',
    'stage_enc': 'Acquisition Stage Bottleneck',
}

def risk_level(score):
    if score >= 0.66:
        return 'High'
    elif score >= 0.40:
        return 'Medium'
    return 'Low'

def score_row(row):
    r = row.copy()
    for c in ['district', 'stage']:
        r[c + '_enc'] = encoders[c].transform([r[c]])[0]
    X = pd.DataFrame([r[features]])
    proba = float(model.predict_proba(X)[0][1])
    return proba, X

# Precompute predictions in a single vectorized batch at startup
df_enc = df.copy()
for c in ['district', 'stage']:
    df_enc[c + '_enc'] = encoders[c].transform(df_enc[c])

X_all = df_enc[features]
all_probs = model.predict_proba(X_all)[:, 1]
df['risk_score'] = [round(float(p), 2) for p in all_probs]
df['risk_level'] = [risk_level(s) for s in df['risk_score']]

# Cache serialized representations for low-latency delivery
PRECOMPUTED_PROJECTS = [
    {
        'project_id': str(row.project_id),
        'district': str(row.district),
        'stage': str(row.stage),
        'risk_score': float(row.risk_score),
        'risk_level': str(row.risk_level),
        'lat': float(row.lat),
        'lng': float(row.lng),
        'days_in_stage': int(row.days_in_stage),
    }
    for _, row in df.iterrows()
]

HIGH_RISK_ALERTS = sorted(
    [p for p in PRECOMPUTED_PROJECTS if p['risk_level'] == 'High'],
    key=lambda p: -p['risk_score']
)

def build_insights_cache():
    counter = {}
    for item in HIGH_RISK_ALERTS[:25]:
        pid = item['project_id']
        matching = df[df.project_id == pid]
        if not matching.empty:
            row = matching.iloc[0]
            _, X = score_row(row)
            shap_vals = explainer.shap_values(X)[0]
            pairs = sorted(zip(features, shap_vals), key=lambda t: -abs(t[1]))[:2]
            for f, v in pairs:
                fname = FRIENDLY_NAMES.get(f, f)
                counter[fname] = counter.get(fname, 0) + 1
    ranked = sorted(counter.items(), key=lambda t: -t[1])[:5]
    return [{'factor': k, 'affected_projects': v} for k, v in ranked]

PRECOMPUTED_INSIGHTS = build_insights_cache()

# ==============================================================================
# In-Memory Action Tracker Store with Seed Data
# ==============================================================================
ACTIONS_FILE = os.path.join(base_dir, 'actions_store.json')

DEFAULT_ACTIONS = [
    {
        "id": "act-0001",
        "project_id": "LA-1001",
        "category": "dro_escalation",
        "assigned_officer": "District Collector",
        "status": "hearing_scheduled",
        "statutory_deadline": "2026-10-15",
        "expected_risk_reduction_pct": 25,
        "notes": "Convened urgent review with Sub-Divisional Officer regarding writ petition WP-8921.",
        "created_by": "demo_user",
        "created_at": "2026-09-07T10:00:00Z",
        "updated_at": "2026-09-07T10:00:00Z"
    },
    {
        "id": "act-0002",
        "project_id": "LA-1014",
        "category": "multiplier_reconciliation",
        "assigned_officer": "Deputy Collector (Land Acquisition)",
        "status": "in_progress",
        "statutory_deadline": "2026-09-28",
        "expected_risk_reduction_pct": 35,
        "notes": "Recalculating circle rate ratio to align with 2026 ready reckoner rates.",
        "created_by": "demo_user",
        "created_at": "2026-09-07T11:30:00Z",
        "updated_at": "2026-09-07T11:30:00Z"
    },
    {
        "id": "act-0003",
        "project_id": "LA-1042",
        "category": "forest_clearance_fasttrack",
        "assigned_officer": "Nodal Officer (Forest Rights)",
        "status": "urgent_review",
        "statutory_deadline": "2026-09-20",
        "expected_risk_reduction_pct": 40,
        "notes": "Special Gram Sabha convened for CFR title clearance certificate.",
        "created_by": "demo_user",
        "created_at": "2026-09-07T12:15:00Z",
        "updated_at": "2026-09-07T12:15:00Z"
    }
]

def load_actions():
    if os.path.exists(ACTIONS_FILE):
        try:
            with open(ACTIONS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return list(DEFAULT_ACTIONS)

def save_actions(actions_list):
    try:
        with open(ACTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(actions_list, f, indent=2)
    except Exception:
        pass

ACTIONS_DB = load_actions()


# ==============================================================================
# Routes
# ==============================================================================
@app.route('/api', methods=['GET'])
@app.route('/api/status', methods=['GET'])
def api_status():
    return jsonify({
        'name': 'LandGuard AI Decision Support REST API',
        'version': '2.0.0',
        'status': 'HEALTHY',
        'total_cases': len(df),
        'endpoints': [
            'GET /api/projects',
            'GET /api/projects/<id>',
            'GET /api/alerts',
            'GET /api/insights',
            'POST /api/simulate',
            'POST /api/document/analyze',
            'GET/POST /api/actions',
            'PATCH /api/actions/<id>',
            'GET /api/departments'
        ]
    })

@app.route('/api/projects', methods=['GET'])
def list_projects():
    return jsonify(PRECOMPUTED_PROJECTS)

@app.route('/api/projects/<pid>', methods=['GET'])
def project_detail(pid):
    matching = df[df.project_id == pid]
    if matching.empty:
        return jsonify({'error': f'Project ID {pid} not found'}), 404
        
    row = matching.iloc[0]
    score = float(row.risk_score)
    _, X = score_row(row)
    
    shap_vals = explainer.shap_values(X)[0]
    pairs = sorted(zip(features, shap_vals), key=lambda t: -abs(t[1]))[:3]
    top_factors = [
        {
            'feature': FRIENDLY_NAMES.get(f, f),
            'impact': round(float(v), 2)
        }
        for f, v in pairs
    ]
    
    if score >= 0.66:
        action = 'Escalate to District Revenue Officer - legal & compensation clearance overdue.'
    elif score >= 0.40:
        action = 'Monitor closely - schedule review meeting in 2 weeks.'
    else:
        action = 'On track - no immediate administrative intervention required.'
        
    return jsonify({
        'project_id': str(row.project_id),
        'district': str(row.district),
        'stage': str(row.stage),
        'days_in_stage': int(row.days_in_stage),
        'risk_score': score,
        'risk_level': str(row.risk_level),
        'top_factors': top_factors,
        'recommended_action': action,
    })

@app.route('/api/alerts', methods=['GET'])
def alerts():
    return jsonify(HIGH_RISK_ALERTS)

@app.route('/api/insights', methods=['GET'])
def insights():
    return jsonify(PRECOMPUTED_INSIGHTS)

# ==============================================================================
# 1. WHAT-IF RISK SIMULATOR ENDPOINT (POST /api/simulate)
# ==============================================================================
@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.get_json(silent=True) or {}
    pid = data.get('project_id', 'LA-1001')
    
    matching = df[df.project_id == pid]
    if matching.empty:
        matching = df.iloc[[0]]
    
    base_row = matching.iloc[0].copy()
    baseline_score = float(base_row.risk_score)
    baseline_level = str(base_row.risk_level)

    # Apply parameter adjustments
    if 'days_in_stage' in data:
        base_row['days_in_stage'] = int(data['days_in_stage'])
    if 'legal_case_pending' in data:
        base_row['legal_case_pending'] = 1 if data['legal_case_pending'] else 0
    if 'rr_compliance_pct' in data:
        # Accepts 0-100 on the wire; dataset uses 20-100 integer percent
        base_row['rr_compliance_pct'] = float(data['rr_compliance_pct'])
    if 'revenue_dept_delay_flag' in data:
        base_row['revenue_dept_delay_flag'] = 1 if data['revenue_dept_delay_flag'] else 0
    if 'past_disputes_count' in data:
        base_row['past_disputes_count'] = int(data['past_disputes_count'])

    new_proba, _ = score_row(base_row)
    new_score = round(float(new_proba), 2)
    new_level = risk_level(new_score)

    denom = baseline_score if baseline_score > 0 else 0.01
    delta_pct = round(((new_score - baseline_score) / denom) * 100, 1)
    
    # Financial exposure estimate (average outlay 16.5 Cr per project)
    outlay_base = 16.5
    projected_savings = round(max(0.0, (baseline_score - new_score) * outlay_base * 0.45), 1)
    projected_days = max(0, int((baseline_score - new_score) * 75))

    return jsonify({
        'project_id': pid,
        'risk_score': new_score,
        'risk_level': new_level,
        'baseline_risk_score': baseline_score,
        'baseline_risk_level': baseline_level,
        'delta_pct': delta_pct,
        'projected_savings_cr': projected_savings,
        'projected_timeline_days_saved': projected_days
    })

# ==============================================================================
# 2. STATUTORY DOCUMENT OCR / NLP RISK INTAKE (POST /api/document/analyze)
# ==============================================================================
DOCUMENT_TEMPLATES = {
    '712_extract': {
        'id': '712_extract',
        'document_name': 'Village Form VII-XII (Satbara Extract)',
        'statutory_authority': 'Department of Revenue & Forest, Govt of Maharashtra',
        'district': 'Pune',
        'stage': 'Notification',
        'entities': {
            'gat_survey_no': 'Gat No. 142/2A, 143/1B (Haveli Taluka)',
            'land_area_ha': '3.85 Ha (9.51 Acres)',
            'tenure_type': 'Class-1 Occupant (Bhogwadar Dharak)',
            'encumbrance_status': 'Active Title Dispute; Pending Co-op Bank Charge',
            'circle_multiplier_ratio': '1.42x (Disputed Market Rate)'
        },
        'risk_score': 0.78,
        'risk_level': 'High',
        'shap_breakdown': [
            {'feature': 'Unresolved Title Encumbrance', 'contribution': 0.32},
            {'feature': 'Circle Multiplier Rate Discrepancy', 'contribution': 0.26},
            {'feature': 'High Landowner Density (>80 Owners)', 'contribution': 0.16},
            {'feature': 'Sub-Divisional Revenue Flag', 'contribution': 0.12}
        ],
        'recommended_action': 'Sub-Divisional Officer must conduct joint title reconciliation before Section 19 declaration.'
    },
    'hc_writ_petition': {
        'id': 'hc_writ_petition',
        'document_name': 'Bombay High Court Writ Petition & Notice',
        'statutory_authority': 'High Court of Judicature at Bombay (Appellate Side)',
        'district': 'Nagpur',
        'stage': 'Award',
        'entities': {
            'gat_survey_no': 'Survey Nos. 88/1, 88/3 (Khandala Corridor)',
            'land_area_ha': '12.4 Ha (30.6 Acres)',
            'tenure_type': 'Freehold Agricultural Land',
            'encumbrance_status': 'Interim Stay Order Issued by Division Bench',
            'circle_multiplier_ratio': '2.0x Statutory Demand'
        },
        'risk_score': 0.89,
        'risk_level': 'High',
        'shap_breakdown': [
            {'feature': 'Active Judicial Stay Petition', 'contribution': 0.44},
            {'feature': 'Time Elapsed in Stage (>90 Days)', 'contribution': 0.28},
            {'feature': 'Low R&R Township Settlement (28%)', 'contribution': 0.18},
            {'feature': 'History of Multi-Party Disputes', 'contribution': 0.11}
        ],
        'recommended_action': 'District Collector must instruct Government Pleader to file expedited vacation motion.'
    },
    'gazette_s11': {
        'id': 'gazette_s11',
        'document_name': 'Section 11(1) Preliminary Gazette Notification',
        'statutory_authority': 'Collectorate & Land Acquisition Branch (RFCTLARR 2013)',
        'district': 'Nashik',
        'stage': 'Survey',
        'entities': {
            'gat_survey_no': 'Survey Nos. 12 to 24 (Nashik Industrial Bypass)',
            'land_area_ha': '45.2 Ha (111.7 Acres)',
            'tenure_type': 'Dry Crop Agricultural',
            'encumbrance_status': 'SIA Clearance Certified; Zero Injunctions',
            'circle_multiplier_ratio': '1.0x (Agreed Benchmark Rate)'
        },
        'risk_score': 0.24,
        'risk_level': 'Low',
        'shap_breakdown': [
            {'feature': 'Gram Sabha SIA Consent Certified (92%)', 'contribution': -0.32},
            {'feature': 'Zero Active Legal Petitions', 'contribution': -0.28},
            {'feature': 'On-Schedule Revenue Mutation', 'contribution': -0.16},
            {'feature': 'Single Title Ownership Structure', 'contribution': -0.12}
        ],
        'recommended_action': 'Proceed with Section 19 Corridor Declaration within statutory 12-month limit.'
    },
    'fra_diversion': {
        'id': 'fra_diversion',
        'document_name': 'Forest Rights Act (FRA 2006) Diversion Certificate',
        'statutory_authority': 'State Level Empowered Committee / MoEFCC',
        'district': 'Amravati',
        'stage': 'Compensation',
        'entities': {
            'gat_survey_no': 'Compartment No. 312 (Melghat Corridor)',
            'land_area_ha': '8.6 Ha Forest Diversion',
            'tenure_type': 'Community Forest Rights (CFR)',
            'encumbrance_status': 'Gram Sabha Resolution Pending Verification',
            'circle_multiplier_ratio': '1.25x Tribal Resettlement Multiplier'
        },
        'risk_score': 0.56,
        'risk_level': 'Medium',
        'shap_breakdown': [
            {'feature': 'Stage-2 Forest Clearance Pending', 'contribution': 0.28},
            {'feature': 'Gram Sabha Quorum Incomplete', 'contribution': 0.22},
            {'feature': 'Compensatory Afforestation Fund Deposited', 'contribution': -0.14},
            {'feature': 'Collectorate Nodal Review in Progress', 'contribution': 0.08}
        ],
        'recommended_action': 'Convene Special Gram Sabha with Integrated Tribal Development Project (ITDP) officer.'
    }
}

@app.route('/api/document/analyze', methods=['POST'])
def analyze_document():
    body = request.get_json(silent=True) or {}
    template_id = body.get('template_id', '712_extract')
    
    template = DOCUMENT_TEMPLATES.get(template_id)
    if not template:
        template = DOCUMENT_TEMPLATES['712_extract']
        
    return jsonify(template)

# ==============================================================================
# 3. ADMINISTRATIVE INTERVENTION ACTION TRACKER (CRUD /api/actions)
# ==============================================================================
@app.route('/api/actions', methods=['GET'])
def get_actions():
    return jsonify(ACTIONS_DB)

@app.route('/api/actions', methods=['POST'])
def create_action():
    body = request.get_json(silent=True) or {}
    now_iso = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    
    new_id = f"act-{len(ACTIONS_DB) + 1:04d}"
    new_action = {
        "id": new_id,
        "project_id": str(body.get('project_id', 'LA-1001')),
        "category": str(body.get('category', 'dro_escalation')),
        "assigned_officer": str(body.get('assigned_officer', 'District Collector')),
        "status": str(body.get('status', 'urgent_review')),
        "statutory_deadline": str(body.get('statutory_deadline', (datetime.utcnow()).strftime('%Y-%m-%d'))),
        "expected_risk_reduction_pct": int(body.get('expected_risk_reduction_pct', 25)),
        "notes": str(body.get('notes', 'Intervention recorded by nodal officer.')),
        "created_by": str(body.get('created_by', 'demo_user')),
        "created_at": now_iso,
        "updated_at": now_iso
    }
    
    ACTIONS_DB.insert(0, new_action)
    save_actions(ACTIONS_DB)
    return jsonify(new_action), 201

@app.route('/api/actions/<aid>', methods=['PATCH'])
def update_action(aid):
    body = request.get_json(silent=True) or {}
    target = None
    for item in ACTIONS_DB:
        if item['id'] == aid:
            target = item
            break
            
    if not target:
        return jsonify({'error': f'Action {aid} not found'}), 404
        
    for k in ['status', 'assigned_officer', 'statutory_deadline', 'notes', 'expected_risk_reduction_pct']:
        if k in body:
            target[k] = body[k]
            
    target['updated_at'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    save_actions(ACTIONS_DB)
    return jsonify(target)

# ==============================================================================
# 4. INTER-DEPARTMENTAL DELAY HEATMAP (GET /api/departments)
# ==============================================================================
@app.route('/api/departments', methods=['GET'])
def departments():
    dept_stats = [
        {
            "id": "rev",
            "department": "Revenue Department",
            "mandate": "Mutation, Land Record Reconciliation, 7/12 Extracts",
            "avg_delay_days": 54.2,
            "benchmark_days": 30.0,
            "active_bottlenecks": 38,
            "trend": "increasing",
            "lead_jurisdiction": "Pune & Kolhapur",
            "common_cause": "Pending Gat Sub-division & Title Inheritance Appeals"
        },
        {
            "id": "jud",
            "department": "Judiciary / High Court Benches",
            "mandate": "Writ Petitions, Interim Stay Injunctions, Title Stays",
            "avg_delay_days": 82.6,
            "benchmark_days": 45.0,
            "active_bottlenecks": 44,
            "trend": "increasing",
            "lead_jurisdiction": "Nagpur & Pune",
            "common_cause": "Section 19 Notification Challenges & Multiplier Stay Petitions"
        },
        {
            "id": "la_auth",
            "department": "Land Acquisition Authority",
            "mandate": "Section 23 Valuation Inquiry & Award Determination",
            "avg_delay_days": 61.4,
            "benchmark_days": 40.0,
            "active_bottlenecks": 29,
            "trend": "stable",
            "lead_jurisdiction": "Amravati & Nashik",
            "common_cause": "Ready Reckoner Multiplier vs Market Value Disagreements"
        },
        {
            "id": "forest",
            "department": "Forest & Environment Directorate",
            "mandate": "Stage-1/Stage-2 Clearance & FRA Community Consents",
            "avg_delay_days": 73.8,
            "benchmark_days": 45.0,
            "active_bottlenecks": 21,
            "trend": "decreasing",
            "lead_jurisdiction": "Amravati & Nashik",
            "common_cause": "Gram Sabha Quorum Deficits & Wildlife Corridor Approvals"
        },
        {
            "id": "rr",
            "department": "Rehabilitation & Resettlement (R&R)",
            "mandate": "Township Plot Allotment & Infrastructure Creation",
            "avg_delay_days": 48.0,
            "benchmark_days": 35.0,
            "active_bottlenecks": 19,
            "trend": "stable",
            "lead_jurisdiction": "Nagpur & Aurangabad",
            "common_cause": "Civic Amenity Delivery & Land-for-Land Settlement Disputes"
        }
    ]
    return jsonify(dept_stats)



@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
        return send_from_directory(FRONTEND_DIST, 'index.html')
    return jsonify({'error': 'Frontend build not found. Please run npm run build in landguard-frontend.'}), 404


if __name__ == '__main__':
    print(f"Starting Unified LandGuard AI Server on http://localhost:5000")
    print(f"Serving frontend from: {FRONTEND_DIST}")
    app.run(host='0.0.0.0', port=5000, debug=False)
