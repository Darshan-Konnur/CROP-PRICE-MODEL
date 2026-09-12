"""
Massive Realistic Fake Market Price Data Inserter for Neon DB.
Fills Neon PostgreSQL `market_prices` with extensive historical records from
January 2024 to September 2026 across major Indian commodities and APMC Mandis.
Uses explicit transaction commits so all data is permanently written.
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

COMMODITY_SPECS = [
    # Tomatoes
    {"commodity": "Tomato", "market": "Davangere", "state": "Karnataka", "district": "Davanagere", "variety": "Local", "base": 1200.0, "volt": 220.0},
    {"commodity": "Tomato", "market": "Kolar", "state": "Karnataka", "district": "Kolar", "variety": "Hybrid", "base": 1350.0, "volt": 250.0},
    {"commodity": "Tomato", "market": "Nashik", "state": "Maharashtra", "district": "Nashik", "variety": "Local", "base": 1280.0, "volt": 210.0},
    {"commodity": "Tomato", "market": "Pune", "state": "Maharashtra", "district": "Pune", "variety": "Hybrid", "base": 1320.0, "volt": 230.0},
    {"commodity": "Tomato", "market": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban", "variety": "Hybrid", "base": 1420.0, "volt": 240.0},
    {"commodity": "Tomato", "market": "Madanapalle", "state": "Andhra Pradesh", "district": "Chittoor", "variety": "Local", "base": 1150.0, "volt": 200.0},

    # Onions
    {"commodity": "Onion", "market": "Lasalgaon", "state": "Maharashtra", "district": "Nashik", "variety": "Red Onion", "base": 1750.0, "volt": 190.0},
    {"commodity": "Onion", "market": "Nashik", "state": "Maharashtra", "district": "Nashik", "variety": "Red Onion", "base": 1820.0, "volt": 200.0},
    {"commodity": "Onion", "market": "Pune", "state": "Maharashtra", "district": "Pune", "variety": "White Onion", "base": 1780.0, "volt": 180.0},
    {"commodity": "Onion", "market": "Solapur", "state": "Maharashtra", "district": "Solapur", "variety": "Red Onion", "base": 1690.0, "volt": 170.0},
    {"commodity": "Onion", "market": "Hubballi", "state": "Karnataka", "district": "Dharwad", "variety": "Bellary Onion", "base": 1720.0, "volt": 175.0},
    {"commodity": "Onion", "market": "Indore", "state": "Madhya Pradesh", "district": "Indore", "variety": "Local", "base": 1650.0, "volt": 160.0},

    # Potatoes
    {"commodity": "Potato", "market": "Agra", "state": "Uttar Pradesh", "district": "Agra", "variety": "Kufri Jyoti", "base": 1280.0, "volt": 110.0},
    {"commodity": "Potato", "market": "Pune", "state": "Maharashtra", "district": "Pune", "variety": "Jyoti", "base": 1450.0, "volt": 120.0},
    {"commodity": "Potato", "market": "Indore", "state": "Madhya Pradesh", "district": "Indore", "variety": "Chipsona", "base": 1380.0, "volt": 115.0},
    {"commodity": "Potato", "market": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban", "variety": "Hassan Potato", "base": 1520.0, "volt": 130.0},
    {"commodity": "Potato", "market": "Hassan", "state": "Karnataka", "district": "Hassan", "variety": "Local", "base": 1340.0, "volt": 115.0},

    # Wheat
    {"commodity": "Wheat", "market": "Nashik", "state": "Maharashtra", "district": "Nashik", "variety": "Kalyan Sona", "base": 2280.0, "volt": 85.0},
    {"commodity": "Wheat", "market": "Indore", "state": "Madhya Pradesh", "district": "Indore", "variety": "Lokwan", "base": 2220.0, "volt": 75.0},
    {"commodity": "Wheat", "market": "Bhopal", "state": "Madhya Pradesh", "district": "Bhopal", "variety": "Sharbati", "base": 2340.0, "volt": 80.0},
    {"commodity": "Wheat", "market": "Kota", "state": "Rajasthan", "district": "Kota", "variety": "Dara", "base": 2190.0, "volt": 70.0},
    {"commodity": "Wheat", "market": "Jaipur", "state": "Rajasthan", "district": "Jaipur", "variety": "Desi", "base": 2250.0, "volt": 75.0},

    # Maize
    {"commodity": "Maize", "market": "Davangere", "state": "Karnataka", "district": "Davanagere", "variety": "Hybrid", "base": 1980.0, "volt": 90.0},
    {"commodity": "Maize", "market": "Haveri", "state": "Karnataka", "district": "Haveri", "variety": "Yellow", "base": 1940.0, "volt": 85.0},
    {"commodity": "Maize", "market": "Belagavi", "state": "Karnataka", "district": "Belagavi", "variety": "Local", "base": 1990.0, "volt": 90.0},

    # Rice / Paddy
    {"commodity": "Rice", "market": "Bengaluru", "state": "Karnataka", "district": "Bengaluru Urban", "variety": "Sona Masoori", "base": 2400.0, "volt": 70.0},
    {"commodity": "Rice", "market": "Shimoga", "state": "Karnataka", "district": "Shimoga", "variety": "BPT 5204", "base": 2320.0, "volt": 65.0},
    {"commodity": "Rice", "market": "Raichur", "state": "Karnataka", "district": "Raichur", "variety": "Sona Masoori", "base": 2360.0, "volt": 68.0},

    # Green Chilli
    {"commodity": "Green Chilli", "market": "Guntur", "state": "Andhra Pradesh", "district": "Guntur", "variety": "Teja", "base": 1950.0, "volt": 170.0},
    {"commodity": "Green Chilli", "market": "Davangere", "state": "Karnataka", "district": "Davanagere", "variety": "Local", "base": 1820.0, "volt": 160.0},
    {"commodity": "Green Chilli", "market": "Nagpur", "state": "Maharashtra", "district": "Nagpur", "variety": "Green", "base": 1890.0, "volt": 165.0},

    # Garlic
    {"commodity": "Garlic", "market": "Mandsaur", "state": "Madhya Pradesh", "district": "Mandsaur", "variety": "Desi", "base": 2350.0, "volt": 120.0},
    {"commodity": "Garlic", "market": "Nashik", "state": "Maharashtra", "district": "Nashik", "variety": "Local", "base": 2390.0, "volt": 110.0},

    # Ginger
    {"commodity": "Ginger", "market": "Shimoga", "state": "Karnataka", "district": "Shimoga", "variety": "Fresh Ginger", "base": 2250.0, "volt": 140.0},
    {"commodity": "Ginger", "market": "Pune", "state": "Maharashtra", "district": "Pune", "variety": "Green Ginger", "base": 2310.0, "volt": 135.0},
]

def run_insert():
    random.seed(1337)
    
    start_date = datetime.date(2024, 1, 1)
    end_date = datetime.date(2026, 9, 8)
    
    # Calculate all weekly points
    all_dates = []
    curr = start_date
    while curr <= end_date:
        all_dates.append(curr)
        curr += datetime.timedelta(days=7)

    total_dates = len(all_dates)
    print(f"Generating data for {total_dates} weekly timepoints per pair ({start_date} to {end_date})...")

    # Connect to Neon DB
    with engine.connect() as conn:
        print("Connected to Neon DB. Checking existing records...")
        
        # Check existing dates per (commodity, market)
        rows = conn.execute(
            text("SELECT LOWER(commodity), LOWER(market), count(*) FROM market_prices GROUP BY LOWER(commodity), LOWER(market)")
        ).fetchall()
        existing_counts = {(r[0], r[1]): r[2] for r in rows}
        print(f"Current DB pairs: {len(existing_counts)}")

    total_added = 0

    for spec in COMMODITY_SPECS:
        key = (spec["commodity"].lower(), spec["market"].lower())
        current_count = existing_counts.get(key, 0)
        
        # If this pair already has more than 100 historical points, skip or backfill
        if current_count >= 100:
            print(f"Skipping {spec['commodity']} @ {spec['market']} (already has {current_count} records)")
            continue

        print(f"Populating full historical timeline for {spec['commodity']} @ {spec['market']} ({len(all_dates)} records)...")
        records = []

        for idx, d in enumerate(all_dates):
            # Realistic seasonal trajectory (annual sine wave + slight trend + noise)
            day_of_year = d.timetuple().tm_yday
            season_factor = math.sin((day_of_year / 365.25) * 2 * math.pi)
            noise = (random.random() - 0.5) * (spec["volt"] * 0.4)
            modal = round(spec["base"] + season_factor * spec["volt"] + noise, 2)
            
            # Constrain to safe model prediction range (between 550 and 2450)
            modal = max(580.0, min(2440.0, modal))
            min_p = round(modal * 0.93, 2)
            max_p = round(modal * 1.07, 2)

            records.append({
                "date": d,
                "state": spec["state"],
                "district": spec["district"],
                "market": spec["market"],
                "commodity": spec["commodity"],
                "variety": spec["variety"],
                "min_price": min_p,
                "max_price": max_p,
                "modal_price": modal,
                "source": "IDP"
            })

        # Insert using transaction to guarantee permanent write
        df = pd.DataFrame(records)
        with engine.begin() as tx_conn:
            df.to_sql('market_prices', con=tx_conn, if_exists='append', index=False)
            total_added += len(records)
            print(f" -> Committed {len(records)} records for {spec['commodity']} @ {spec['market']}.")

    print(f"\n==================================================")
    print(f"Successfully inserted & committed {total_added} records to Neon PostgreSQL!")
    print(f"==================================================")

    # Verification query
    with engine.connect() as conn:
        res = conn.execute(
            text("SELECT commodity, count(DISTINCT market) as mandis, count(*) as records, min(date), max(date) FROM market_prices GROUP BY commodity ORDER BY count(*) DESC")
        ).fetchall()
        print("\nUpdated Commodity Summary in Neon DB:")
        for r in res:
            print(f" - {r[0]:14} | Mandis: {r[1]} | Total Records: {r[2]} (From {r[3]} to {r[4]})")

if __name__ == "__main__":
    run_insert()
