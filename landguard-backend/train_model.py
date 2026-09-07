# pyright: reportMissingImports=false
# type: ignore
import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import shap

def train(regenerate=True):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "land_cases.csv")
    
    if regenerate or not os.path.exists(data_path):
        from generate_data import generate_land_data
        generate_land_data(data_path, N=600)

    df = pd.read_csv(data_path)
    
    cat_cols = ['district', 'stage']
    encoders = {}
    for c in cat_cols:
        le = LabelEncoder()
        df[c + '_enc'] = le.fit_transform(df[c])
        encoders[c] = le
        
    features = [
        'district_enc', 'stage_enc', 'days_in_stage', 'legal_case_pending',
        'rr_compliance_pct', 'revenue_dept_delay_flag', 'num_landowners',
        'past_disputes_count'
    ]
    
    X = df[features]
    y = df['risk_label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.1,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train, y_train)
    
    acc = model.score(X_test, y_test)
    print(f"XGBoost Model Test Accuracy: {acc * 100:.2f}%")
    
    explainer = shap.TreeExplainer(model)
    
    joblib.dump(model, os.path.join(base_dir, 'model.joblib'))
    joblib.dump(encoders, os.path.join(base_dir, 'encoders.joblib'))
    joblib.dump(explainer, os.path.join(base_dir, 'explainer.joblib'))
    joblib.dump(features, os.path.join(base_dir, 'features.joblib'))
    
    print("Saved model artifacts: model.joblib, encoders.joblib, explainer.joblib, features.joblib")

if __name__ == "__main__":
    train(regenerate=True)
