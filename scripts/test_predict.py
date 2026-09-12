import json
from urllib.request import Request, urlopen

url = 'http://localhost:8000/predict'
payload = {
    'commodity': 'Wheat',
    'market': 'Nashik',
    'prediction_date': '2026-09-15'
}
data = json.dumps(payload).encode('utf-8')
req = Request(url, data=data, headers={'Content-Type': 'application/json'})
resp = urlopen(req)
print(resp.status)
print(resp.read().decode())
