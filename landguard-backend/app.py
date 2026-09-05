# pyright: reportMissingImports=false
# type: ignore
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify  # type: ignore
from flask_cors import CORS  # type: ignore
import pandas as pd  # type: ignore
import joblib  # type: ignore
import numpy as np  # type: ignore

app = Flask(__name__)
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


@app.route('/', methods=['GET'])
def index():
    return '<html><head><title>LandGuard AI REST API</title></head><body style="font-family: system-ui, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b;"><h1 style="color: #0284c7;">LandGuard AI REST API Server</h1><p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">LIVE & HEALTHY</span></p><h3>Available REST API Endpoints:</h3><ul><li><a href="/api/projects"><code>GET /api/projects</code></a> - All project predictions</li><li><a href="/api/projects/LA-1001"><code>GET /api/projects/LA-1001</code></a> - Detailed SHAP attribution for LA-1001</li><li><a href="/api/alerts"><code>GET /api/alerts</code></a> - High risk alerts list</li><li><a href="/api/insights"><code>GET /api/insights</code></a> - Recurring bottleneck factors</li></ul></body></html>'

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

if __name__ == '__main__':
    print("Starting LandGuard AI Backend Server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
