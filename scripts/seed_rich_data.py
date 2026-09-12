"""
Comprehensive Fake Historical Market Price Data Seeder for Neon PostgreSQL.
Generates realistic agricultural pricing trajectories across major Indian mandis
and commodities, perfectly matching the ML model's feature expectations.
"""
import os
import math
import random
import datetime
import pandas as pd
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL and os.path.exists(".env"):
    with open(".env", "r", encoding="utf-8") as _f:
        for _line in _f:
            if _line.strip().startswith("DATABASE_URL="):
                DATABASE_URL = _line.strip().split("=", 1)[1].strip().strip("'\"")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./dev_data.db"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# List of rich commodity-market configurations with calibrated price centers (within ML model's sweet spot ₹600 - ₹2400)
DATASETS = [
    {
        "commodity": "Tomato",
        "market": "Kolar",
        "state": "Karnataka",
        "district": "Kolar",
        "variety": "Hybrid Tomato",
        "center_price": 1450.0,
        "volatility": 180.0
    },
    {
        "commodity": "Tomato",
        "market": "Nashik",
        "state": "Maharashtra",
        "district": "Nashik",
        "variety": "Local Tomato",
        "center_price": 1350.0,
        "volatility": 160.0
    },
    {
        "commodity": "Tomato",
        "market": "Pune",
        "state": "Maharashtra",
        "district": "Pune",
        "variety": "Hybrid Tomato",
        "center_price": 1400.0,
        "volatility": 150.0
    },
    {
        "commodity": "Onion",
        "market": "Lasalgaon",
        "state": "Maharashtra",
        "district": "Nashik",
        "variety": "Red Onion",
        "center_price": 1850.0,
        "volatility": 140.0
    },
    {
        "commodity": "Onion",
        "market": "Pune",
        "state": "Maharashtra",
        "district": "Pune",
        "variety": "White Onion",
        "center_price": 1780.0,
        "volatility": 130.0
    },
    {
        "commodity": "Onion",
        "market": "Solapur",
        "state": "Maharashtra",
        "district": "Solapur",
        "variety": "Red Onion",
        "center_price": 1720.0,
        "volatility": 120.0
    },
    {
        "commodity": "Wheat",
        "market": "Indore",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "variety": "Lokwan",
        "center_price": 2250.0,
        "volatility": 80.0
    },
    {
        "commodity": "Wheat",
        "market": "Bhopal",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "variety": "Sharbati",
        "center_price": 2350.0,
        "volatility": 75.0
    },
    {
        "commodity": "Potato",
        "market": "Agra",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "variety": "Kufri Jyoti",
        "center_price": 1350.0,
        "volatility": 90.0
    },
    {
        "commodity": "Potato",
        "market": "Indore",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "variety": "Chipsona",
        "center_price": 1420.0,
        "volatility": 85.0
    },
    {
        "commodity": "Potato",
        "market": "Bengaluru",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "variety": "Hassan Potato",
        "center_price": 1580.0,
        "volatility": 95.0
    },
    {
        "commodity": "Maize",
        "market": "Haveri",
        "state": "Karnataka",
        "district": "Haveri",
        "variety": "Yellow Maize",
        "center_price": 1980.0,
        "volatility": 65.0
    },
    {
        "commodity": "Maize",
        "market": "Belagavi",
        "state": "Karnataka",
        "district": "Belagavi",
        "variety": "Hybrid Maize",
        "center_price": 2020.0,
        "volatility": 70.0
    },
    {
        "commodity": "Green Chilli",
        "market": "Guntur",
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "variety": "Teja Chilli",
        "center_price": 2100.0,
        "volatility": 150.0
    },
    {
        "commodity": "Green Chilli",
        "market": "Davangere",
        "state": "Karnataka",
        "district": "Davanagere",
        "variety": "Local Chilli",
        "center_price": 1950.0,
        "volatility": 130.0
    }
]

def seed_fake_data():
    random.seed(42)
    today = datetime.date(2026, 9, 8)
    
    with engine.connect() as conn:
        print("Connected to Neon DB...")
        
        # Check existing combinations
        existing = conn.execute(
            text("SELECT DISTINCT LOWER(commodity), LOWER(market) FROM market_prices")
        ).fetchall()
        existing_set = set((r[0], r[1]) for r in existing)
        print(f"Current pairs in DB: {len(existing_set)}")
        
        total_inserted = 0
        
        for item in DATASETS:
            key = (item["commodity"].lower(), item["market"].lower())
            if key in existing_set:
                print(f"Skipping {item['commodity']} @ {item['market']} (already exists)")
                continue

            print(f"Generating 52 weekly records for {item['commodity']} @ {item['market']}...")
            rows = []
            
            # 52 weeks = 1 full calendar year of historical training records
            for w in range(52, 0, -1):
                d = today - datetime.timedelta(days=7 * w)
                
                # Seasonal wave (sinusoidal pattern + slight trend + noise)
                wave = math.sin((52 - w) / 52.0 * 2 * math.pi) * item["volatility"]
                noise = (random.random() - 0.5) * (item["volatility"] * 0.4)
                modal = round(item["center_price"] + wave + noise, 2)
                
                # Keep within realistic bounds
                modal = max(600.0, min(2480.0, modal))
                min_price = round(modal * 0.92, 2)
                max_price = round(modal * 1.08, 2)

                rows.append({
                    "date": d,
                    "state": item["state"],
                    "district": item["district"],
                    "market": item["market"],
                    "commodity": item["commodity"],
                    "variety": item["variety"],
                    "min_price": min_price,
                    "max_price": max_price,
                    "modal_price": modal,
                    "source": "IDP"
                })

            df = pd.DataFrame(rows)
            df.to_sql('market_prices', con=engine, if_exists='append', index=False)
            total_inserted += len(rows)
            print(f" -> Inserted {len(rows)} rows for {item['commodity']} @ {item['market']}")

        print(f"\nSeeding complete! Added {total_inserted} new historical records to Neon DB.")

        # Print distinct commodities summary
        summary = conn.execute(
            text("SELECT commodity, market, count(*), min(modal_price), max(modal_price) FROM market_prices GROUP BY commodity, market ORDER BY commodity, market")
        ).fetchall()
        print(f"\nTotal Active Mandi Markets in Neon DB: {len(summary)}")
        for s in summary:
            print(f" - {s[0]:14} @ {s[1]:14}: {s[2]} records (Price Range: Rs {s[3]} - {s[4]})")

if __name__ == "__main__":
    seed_fake_data()
