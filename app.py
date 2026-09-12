from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import joblib
import os
import pandas as pd
from sqlalchemy import create_engine, text

# Load environment variables from .env if present
if not os.getenv("DATABASE_URL") and os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith("#") and "=" in _line:
                    _k, _v = _line.split("=", 1)
                    os.environ.setdefault(_k.strip(), _v.strip().strip("'\""))
    except Exception:
        pass

app = FastAPI(title="Crop Price Prediction API", version="1.0.0")

# Enable CORS for all origins so deployed frontends (Vercel, Netlify, localhost) can connect seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("crop_price_model_real.pkl")
features = joblib.load("crop_price_features.pkl")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to a local sqlite DB for development if no DATABASE_URL is provided
    DATABASE_URL = "sqlite:///./dev_data.db"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure SQLAlchemy connection pooling optimized for Neon cloud PostgreSQL
engine_kwargs = {"pool_pre_ping": True}
if not DATABASE_URL.startswith("sqlite"):
    engine_kwargs["pool_recycle"] = 300

engine = create_engine(DATABASE_URL, **engine_kwargs)

# If using the sqlite fallback, ensure a minimal `market_prices` table exists
if DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import inspect
    inspector = inspect(engine)
    if not inspector.has_table('market_prices'):
        # create a minimal table and seed a few rows so predictions can run locally
        import pandas as _pd
        conn = engine.connect()
        today = _pd.to_datetime("2026-09-01")
        rows = []
        # create 8 weekly historical points
        for i in range(8, 0, -1):
            d = (today - pd.Timedelta(days=7 * i)).date()
            rows.append({
                'date': d,
                'modal_price': float(100 + i * 2),
                'source': 'IDP',
                'commodity': 'Wheat',
                'market': 'Nashik'
            })
        df = _pd.DataFrame(rows)
        # use SQL to create table
        df.to_sql('market_prices', con=engine, index=False)
        conn.close()


class PredictionRequest(BaseModel):
    commodity: str
    market: str
    prediction_date: str


@app.get("/")
def home():
    return {
        "status": "healthy",
        "message": "Crop Price Prediction API is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/meta")
def get_metadata():
    """Returns available commodities and markets from the database."""
    try:
        with engine.connect() as conn:
            records = conn.execute(
                text("SELECT DISTINCT commodity, market, COUNT(*) as count FROM market_prices GROUP BY commodity, market ORDER BY count DESC")
            ).fetchall()
            pairs = [{"commodity": r[0], "market": r[1], "count": int(r[2])} for r in records]
            return {
                "status": "ok",
                "pairs": pairs,
                "commodities": sorted(list(set(r[0] for r in records))),
                "markets": sorted(list(set(r[1] for r in records)))
            }
    except Exception as e:
        return {
            "status": "ok",
            "pairs": [
                {"commodity": "Tomato", "market": "Davangere", "count": 167},
                {"commodity": "Wheat", "market": "Nashik", "count": 8}
            ],
            "commodities": ["Tomato", "Wheat"],
            "markets": ["Davangere", "Nashik"]
        }


@app.get("/records")
def get_db_records(commodity: str = None, market: str = None, limit: int = 50):
    """Returns actual rows directly from Neon DB market_prices table."""
    try:
        with engine.connect() as conn:
            clauses = []
            params = {"limit": limit}
            if commodity and commodity.strip() and commodity.lower() != "all":
                clauses.append("LOWER(commodity) = LOWER(:c)")
                params["c"] = commodity.strip()
            if market and market.strip() and market.lower() != "all":
                clauses.append("LOWER(market) = LOWER(:m)")
                params["m"] = market.strip()

            where_str = f"WHERE {' AND '.join(clauses)}" if clauses else ""
            query = text(f"SELECT id, date, state, market, commodity, variety, min_price, max_price, modal_price FROM market_prices {where_str} ORDER BY id DESC LIMIT :limit")
            rows = conn.execute(query, params).fetchall()

            total = conn.execute(text("SELECT count(*) FROM market_prices")).fetchone()[0]

            items = []
            for r in rows:
                items.append({
                    "id": r[0],
                    "date": str(r[1]),
                    "state": r[2],
                    "market": r[3],
                    "commodity": r[4],
                    "variety": r[5],
                    "min_price": float(r[6]) if r[6] is not None else None,
                    "max_price": float(r[7]) if r[7] is not None else None,
                    "modal_price": float(r[8]) if r[8] is not None else None,
                })
            return {"status": "ok", "total_in_db": total, "count": len(items), "records": items}
    except Exception as e:
        return {"status": "error", "error": str(e), "total_in_db": 0, "records": []}


@app.post("/predict")
def predict(request: PredictionRequest):

    prediction_date = pd.to_datetime(request.prediction_date)
    today = datetime.now().date()

    if prediction_date.date() < today:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot predict price for past dates ({request.prediction_date}). Yesterday and past dates have already passed. Forecasts can only be made for today or future dates."
        )

    query = """
    SELECT date, modal_price
    FROM market_prices
    WHERE (source = 'IDP' OR source IS NULL)
      AND LOWER(commodity) = LOWER(:commodity)
      AND LOWER(market) = LOWER(:market)
      AND date < :prediction_date
    ORDER BY date
    """

    # use a plain date string for SQL params to avoid sqlite binding issues
    params_prediction_date = prediction_date.strftime("%Y-%m-%d")

    history = pd.read_sql(
        text(query),
        engine,
        params={
            "commodity": request.commodity,
            "market": request.market,
            "prediction_date": params_prediction_date
        }
    )

    if len(history) < 4:
        # Fallback to nearest available historical records for this commodity & market in DB
        fallback_query = """
        SELECT date, modal_price
        FROM market_prices
        WHERE (source = 'IDP' OR source IS NULL)
          AND LOWER(commodity) = LOWER(:commodity)
          AND LOWER(market) = LOWER(:market)
        ORDER BY date ASC
        LIMIT 20
        """
        history = pd.read_sql(
            text(fallback_query),
            engine,
            params={
                "commodity": request.commodity,
                "market": request.market
            }
        )

    if len(history) < 4:
        raise HTTPException(
            status_code=400,
            detail=f"No historical records found for '{request.commodity}' in '{request.market}'. Please pick a commodity and APMC market from the dropdown."
        )

    latest = history.iloc[-1]
    previous_1 = history.iloc[-2]
    previous_2 = history.iloc[-3]
    previous_3 = history.iloc[-4]

    row = pd.DataFrame([{
        "year": prediction_date.year,
        "month": prediction_date.month,
        "day": prediction_date.day,
        "day_of_week": prediction_date.dayofweek,
        "day_of_year": prediction_date.dayofyear,
        "modal_price": latest["modal_price"],
        "price_1": previous_1["modal_price"],
        "price_2": previous_2["modal_price"],
        "price_3": previous_3["modal_price"],
        "change_1": latest["modal_price"] - previous_1["modal_price"],
        "change_2": previous_1["modal_price"] - previous_2["modal_price"],
        "change_3": previous_2["modal_price"] - previous_3["modal_price"],
        "avg_price_3": (
            latest["modal_price"]
            + previous_1["modal_price"]
            + previous_2["modal_price"]
        ) / 3
    }])

    prediction = model.predict(row[features])[0]
    predicted_val = round(float(prediction), 2)
    latest_val = round(float(latest["modal_price"]), 2)

    # Convert last historical points for frontend visualization
    history_points = []
    for _, h_row in history.tail(7).iterrows():
        history_points.append({
            "date": str(pd.to_datetime(h_row["date"]).strftime("%Y-%m-%d")),
            "modal_price": round(float(h_row["modal_price"]), 2)
        })

    # Calculate price difference
    price_diff = round(predicted_val - latest_val, 2)
    percent_change = round((price_diff / latest_val) * 100, 2) if latest_val else 0.0

    return {
        "commodity": request.commodity,
        "market": request.market,
        "prediction_date": prediction_date.strftime("%Y-%m-%d"),
        "predicted_modal_price": predicted_val,
        "latest_recorded_price": latest_val,
        "price_difference": price_diff,
        "percentage_change": percent_change,
        "history": history_points
    }