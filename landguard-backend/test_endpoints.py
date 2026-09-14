import urllib.request
import json

def test_endpoints():
    print("Testing LandGuard AI Endpoints...")

    # 1. Simulate
    sim_data = json.dumps({
        'project_id': 'LA-1001',
        'days_in_stage': 120,
        'legal_case_pending': False,
        'rr_compliance_pct': 90,
        'revenue_dept_delay_flag': False,
        'past_disputes_count': 1
    }).encode('utf-8')
    req1 = urllib.request.Request('http://127.0.0.1:5000/api/simulate', data=sim_data, headers={'Content-Type': 'application/json'})
    res1 = json.loads(urllib.request.urlopen(req1).read())
    assert 'risk_score' in res1 and 'risk_level' in res1 and 'baseline_risk_score' in res1 and 'delta_pct' in res1
    assert 'projected_savings_cr' in res1 and 'projected_timeline_days_saved' in res1
    print(f"[PASS] /api/simulate PASSED: {res1['baseline_risk_level']} -> {res1['risk_level']} | Delta: {res1['delta_pct']}% | Savings: Rs.{res1['projected_savings_cr']} Cr")

    # 2. Document Analyze
    for tid in ['712_extract', 'hc_writ_petition', 'gazette_s11', 'fra_diversion']:
        doc_data = json.dumps({'template_id': tid}).encode('utf-8')
        req2 = urllib.request.Request('http://127.0.0.1:5000/api/document/analyze', data=doc_data, headers={'Content-Type': 'application/json'})
        res2 = json.loads(urllib.request.urlopen(req2).read())
        assert 'entities' in res2 and 'shap_breakdown' in res2 and 'risk_score' in res2
        assert 'gat_survey_no' in res2['entities'] and 'circle_multiplier_ratio' in res2['entities']
        print(f"[PASS] /api/document/analyze ({tid}) PASSED: Risk: {res2['risk_level']} ({res2['risk_score']})")

    # 3. Actions GET & POST & PATCH
    act_data = json.dumps({
        'project_id': 'LA-1001',
        'category': 'dro_escalation',
        'assigned_officer': 'District Collector',
        'status': 'urgent_review',
        'statutory_deadline': '2026-10-15',
        'expected_risk_reduction_pct': 25
    }).encode('utf-8')
    req3 = urllib.request.Request('http://127.0.0.1:5000/api/actions', data=act_data, headers={'Content-Type': 'application/json'})
    res3 = json.loads(urllib.request.urlopen(req3).read())
    aid = res3['id']
    assert aid and res3['status'] == 'urgent_review'
    print(f"[PASS] /api/actions POST PASSED: Created action {aid}")

    patch_data = json.dumps({'status': 'hearing_scheduled'}).encode('utf-8')
    req3_patch = urllib.request.Request(f'http://127.0.0.1:5000/api/actions/{aid}', data=patch_data, headers={'Content-Type': 'application/json'}, method='PATCH')
    res3_patch = json.loads(urllib.request.urlopen(req3_patch).read())
    assert res3_patch['status'] == 'hearing_scheduled'
    print(f"[PASS] /api/actions PATCH PASSED: Updated {aid} to {res3_patch['status']}")

    # 4. Departments
    req4 = urllib.request.Request('http://127.0.0.1:5000/api/departments')
    res4 = json.loads(urllib.request.urlopen(req4).read())
    assert len(res4) == 5
    print(f"[PASS] /api/departments PASSED: {len(res4)} directorates returned")

    print("\nALL 4 ENDPOINT SUITES PASSED VERIFICATION!")

if __name__ == '__main__':
    test_endpoints()
