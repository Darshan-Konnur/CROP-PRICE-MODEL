from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import pandas as pd
from sqlalchemy import create_engine, text

app = FastAPI()

model = joblib.load("crop_price_model_real.pkl")
features = joblib.load("crop_price_features.pkl")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)


class PredictionRequest(BaseModel):
    commodity: str
    market: str
    prediction_date: str


@app.get("/")
def home():
    return {"message": "Crop Price Prediction API is running"}


@app.post("/predict")
def predict(request: PredictionRequest):

    prediction_date = pd.to_datetime(request.prediction_date)

    query = """
    SELECT date, modal_price
    FROM market_prices
    WHERE source = 'IDP'
      AND commodity = :commodity
      AND market = :market
      AND date < :prediction_date
    ORDER BY date
    """

    history = pd.read_sql(
        text(query),
        engine,
        params={
            "commodity": request.commodity,
            "market": request.market,
            "prediction_date": prediction_date
        }
    )

    if len(history) < 4:
        raise HTTPException(
            status_code=400,
            detail="Not enough historical data"
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

    return {
        "commodity": request.commodity,
        "market": request.market,
        "prediction_date": prediction_date.strftime("%Y-%m-%d"),
        "predicted_modal_price": round(float(prediction), 2)
    }