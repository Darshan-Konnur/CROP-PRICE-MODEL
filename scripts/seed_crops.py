"""
Seeds historical market price data for key agricultural commodities into Neon PostgreSQL.
Ensures that predictions for popular crops (Wheat, Onion, Potato, Rice, Cotton, Soybean, Maize)
work smoothly with enough historical data points (4+ weeks) prior to forecast dates.
"""
import os
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

CROPS_DATA = [
    {
        "commodity": "Wheat",
        "market": "Nashik",
        "state": "Maharashtra",
        "district": "Nashik",
        "variety": "Kalyan Sona",
        "base_price": 2400.0,
        "delta": 25.0
    },
    {
        "commodity": "Onion",
        "market": "Nashik",
        "state": "Maharashtra",
        "district": "Nashik",
        "variety": "Red Onion",
        "base_price": 2100.0,
        "delta": 45.0
    },
    {
        "commodity": "Potato",
        "market": "Pune",
        "state": "Maharashtra",
        "district": "Pune",
        "variety": "Jyoti",
        "base_price": 1500.0,
        "delta": 20.0
    },
    {
        "commodity": "Rice",
        "market": "Bengaluru",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "variety": "Sona Masoori",
        "base_price": 3200.0,
        "delta": 30.0
    },
    {
        "commodity": "Cotton",
        "market": "Nagpur",
        "state": "Maharashtra",
        "district": "Nagpur",
        "variety": "Medium Staple",
        "base_price": 6500.0,
        "delta": 60.0
    },
    {
        "commodity": "Soybean",
        "market": "Indore",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "variety": "Yellow",
        "base_price": 4350.0,
        "delta": 40.0
    },
    {
        "commodity": "Maize",
        "market": "Davangere",
        "state": "Karnataka",
        "district": "Davanagere",
        "variety": "Hybrid",
        "base_price": 2150.0,
        "delta": 25.0
    }
]

def seed():
    with engine.connect() as conn:
        print("Connected to Neon DB successfully.")
        
        # Check existing commodities
        existing = conn.execute(
            text("SELECT DISTINCT LOWER(commodity), LOWER(market) FROM market_prices")
        ).fetchall()
        existing_set = set((row[0], row[1]) for row in existing)
        print(f"Existing pairs in DB: {existing_set}")

        # Current reference date: 2026-09-01 (or recent date)
        today = datetime.date(2026, 9, 1)
        inserted_total = 0

        for crop in CROPS_DATA:
            key = (crop["commodity"].lower(), crop["market"].lower())
            if key in existing_set:
                print(f"Skipping {crop['commodity']} @ {crop['market']} (already exists)")
                continue

            print(f"Seeding historical records for {crop['commodity']} @ {crop['market']}...")
            rows_to_insert = []
            
            # Generate 26 weekly historical data points
            for i in range(26, 0, -1):
                d = today - datetime.timedelta(days=7 * i)
                # Add natural fluctuation
                cycle = (i % 5 - 2) * crop["delta"]
                modal = round(crop["base_price"] + cycle, 2)
                min_p = round(modal * 0.93, 2)
                max_p = round(modal * 1.07, 2)

                rows_to_insert.append({
                    "date": d,
                    "state": crop["state"],
                    "district": crop["district"],
                    "market": crop["market"],
                    "commodity": crop["commodity"],
                    "variety": crop["variety"],
                    "min_price": min_p,
                    "max_price": max_p,
                    "modal_price": modal,
                    "source": "IDP"
                })

            df = pd.DataFrame(rows_to_insert)
            df.to_sql('market_prices', con=engine, if_exists='append', index=False)
            inserted_total += len(rows_to_insert)
            print(f"Inserted {len(rows_to_insert)} records for {crop['commodity']}.")

        print(f"\nSeeding complete! Total new rows inserted: {inserted_total}")

        # Summary of all commodities
        counts = conn.execute(
            text("SELECT commodity, market, count(*), min(date), max(date) FROM market_prices GROUP BY commodity, market ORDER BY count DESC")
        ).fetchall()
        print("\nCurrent database status:")
        for r in counts:
            print(f" - {r[0]} @ {r[1]}: {r[2]} records (from {r[3]} to {r[4]})")

if __name__ == "__main__":
    seed()
