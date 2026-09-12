import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app
import json

crops = [
    ('Tomato', 'Davangere', '2026-09-15'),
    ('Wheat', 'Nashik', '2026-09-15'),
    ('Onion', 'Nashik', '2026-09-15'),
    ('Potato', 'Pune', '2026-09-15'),
    ('Rice', 'Bengaluru', '2026-09-15'),
    ('Cotton', 'Nagpur', '2026-09-15'),
    ('Soybean', 'Indore', '2026-09-15'),
    ('Maize', 'Davangere', '2026-09-15')
]

print("=== Testing Neon PostgreSQL End-to-End Predictions ===")
for commodity, market, date in crops:
    req = app.PredictionRequest(commodity=commodity, market=market, prediction_date=date)
    res = app.predict(req)
    print(f"SUCCESS: {commodity:10} @ {market:10} | Target: {date} | Predicted: Rs {res['predicted_modal_price']:>7.2f}/Q | Latest: Rs {res['latest_recorded_price']:>7.2f}/Q | Trend: {res['percentage_change']:>+6.2f}% | Points: {len(res['history'])}")

print("\n=== Testing /meta Metadata Endpoint ===")
meta = app.get_metadata()
print(f"Status: {meta['status']}")
print(f"Total Available Pairs: {len(meta['pairs'])}")
for p in meta['pairs']:
    print(f" - {p['commodity']:10} @ {p['market']:10} ({p['count']} records)")
