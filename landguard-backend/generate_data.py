import os
import pandas as pd
import numpy as np
from faker import Faker

def generate_land_data(output_path="land_cases.csv", N=600):
    fake = Faker('en_IN')
    np.random.seed(42)
    
    districts = ['Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Amravati', 'Kolhapur']
    stages = ['Notification', 'Survey', 'Award', 'Compensation', 'Possession']
    
    df = pd.DataFrame({
        'project_id': [f'LA-{1000+i}' for i in range(N)],
        'district': np.random.choice(districts, N),
        'stage': np.random.choice(stages, N),
        'days_in_stage': np.random.randint(1, 120, N),
        'legal_case_pending': np.random.choice([0, 1], N, p=[0.7, 0.3]),
        'rr_compliance_pct': np.random.randint(20, 100, N),
        'revenue_dept_delay_flag': np.random.choice([0, 1], N, p=[0.6, 0.4]),
        'num_landowners': np.random.randint(5, 300, N),
        'past_disputes_count': np.random.poisson(1.2, N),
    })
    
    # Formula-driven risk score + noise so XGBoost has strong signal to learn
    risk_raw = (
        0.02 * df.days_in_stage +
        3.0  * df.legal_case_pending +
        0.03 * (100 - df.rr_compliance_pct) +
        1.5  * df.revenue_dept_delay_flag +
        0.6  * df.past_disputes_count +
        np.random.normal(0, 1.2, N)
    )
    
    df['risk_label'] = (risk_raw > np.median(risk_raw)).astype(int)
    
    # Latitude & Longitude surrounding District headquarters
    centres = {
        'Nagpur': (21.1458, 79.0882),
        'Pune': (18.5204, 73.8567),
        'Nashik': (19.9975, 73.7898),
        'Aurangabad': (19.8762, 75.3433),
        'Amravati': (20.9374, 77.7796),
        'Kolhapur': (16.7050, 74.2433)
    }
    
    df['lat'] = df.district.map(lambda d: round(centres[d][0] + np.random.uniform(-0.15, 0.15), 6))
    df['lng'] = df.district.map(lambda d: round(centres[d][1] + np.random.uniform(-0.15, 0.15), 6))
    
    df.to_csv(output_path, index=False)
    print(f"Generated {N} synthetic land cases in '{output_path}'")
    print("Class distribution:\n", df.risk_label.value_counts())

if __name__ == "__main__":
    generate_land_data()
