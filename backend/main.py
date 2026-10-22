import json
import os
import sqlite3
from datetime import datetime

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Insurance Claim Fraud Detection API")

# Allow the React app (running on port 5173) to call this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://vehicle-insurance-fraud-detection-sigma.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Load the saved files ONCE when the server starts (no retraining) ----------
models = {
    "Logistic Regression": joblib.load("models/logistic_regression.pkl"),
    "KNN": joblib.load("models/knn.pkl"),
    "Random Forest": joblib.load("models/random_forest.pkl"),
    "SVM": joblib.load("models/svm.pkl"),
}
scaler = joblib.load("models/scaler.pkl")
model_columns = joblib.load("models/model_columns.pkl")
categorical_columns = joblib.load("models/categorical_columns.pkl")

numerical_columns = ["WeekOfMonth", "WeekOfMonthClaimed", "Age", "RepNumber",
                     "Deductible", "DriverRating", "Year"]

# ---------- SQLite database ----------
DB_FILE = "predictions.db"


def create_table():
    conn = sqlite3.connect(DB_FILE)
    conn.execute(
        """CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            claim TEXT,
            model TEXT,
            label TEXT,
            fraud_probability REAL,
            genuine_probability REAL,
            risk_level TEXT,
            timestamp TEXT
        )"""
    )
    conn.commit()
    conn.close()


create_table()


# ---------- What the frontend sends us ----------
class PredictRequest(BaseModel):
    model_name: str
    claim: dict


# ---------- Predict ----------
@app.post("/predict")
def predict(request: PredictRequest):
    # 1. Check the model name
    if request.model_name not in models:
        raise HTTPException(status_code=400, detail="Unknown model: " + request.model_name)

    # 2. Check that all 31 claim fields are present
    missing = []
    for column in categorical_columns + numerical_columns:
        if column not in request.claim:
            missing.append(column)
    if len(missing) > 0:
        raise HTTPException(status_code=400, detail="Missing fields: " + ", ".join(missing))

    # 3. Same preprocessing as Step 14 of the notebook
    new_df = pd.DataFrame([request.claim])
    new_encoded = pd.get_dummies(new_df, columns=categorical_columns, dtype=int)
    new_encoded = new_encoded.reindex(columns=model_columns, fill_value=0)
    new_scaled = scaler.transform(new_encoded)

    # 4. Predict with the selected model
    model = models[request.model_name]
    prediction = int(model.predict(new_scaled)[0])
    probabilities = model.predict_proba(new_scaled)[0]
    genuine_probability = float(probabilities[0])
    fraud_probability = float(probabilities[1])

    # 5. Risk level
    if fraud_probability < 0.30:
        risk_level = "Low"
    elif fraud_probability < 0.60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    if prediction == 1:
        label = "Potentially Fraudulent"
    else:
        label = "Genuine"

    # 6. Save to SQLite
    conn = sqlite3.connect(DB_FILE)
    conn.execute(
        """INSERT INTO predictions
           (claim, model, label, fraud_probability, genuine_probability, risk_level, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (json.dumps(request.claim), request.model_name, label, fraud_probability,
         genuine_probability, risk_level, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()

    # 7. Send the answer back to the frontend
    return {
        "model": request.model_name,
        "prediction": prediction,
        "label": label,
        "fraud_probability": fraud_probability,
        "genuine_probability": genuine_probability,
        "risk_level": risk_level,
    }


# ---------- History ----------
@app.get("/history")
def history():
    conn = sqlite3.connect(DB_FILE)
    rows = conn.execute(
        "SELECT id, claim, model, label, fraud_probability, genuine_probability, risk_level, timestamp "
        "FROM predictions ORDER BY id DESC"
    ).fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "claim": json.loads(row[1]),
            "model": row[2],
            "label": row[3],
            "fraud_probability": row[4],
            "genuine_probability": row[5],
            "risk_level": row[6],
            "timestamp": row[7],
        })
    return result


# ---------- Model evaluation results (for the Model Comparison / Visualizations pages) ----------
# The scores live in model_metrics.json. Re-create it with export_metrics.py if you retrain.
@app.get("/model-metrics")
def model_metrics():
    path = os.path.join(os.path.dirname(__file__), "model_metrics.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="model_metrics.json not found. Run export_metrics.py first.")
    with open(path) as f:
        return json.load(f)


# ---------- Model evaluation scores (for the Visualizations / Comparison pages) ----------
# models/model_metrics.json is created by build_metrics.py from your notebook results.
@app.get("/metrics")
def metrics():
    try:
        with open("models/model_metrics.json", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="models/model_metrics.json not found. Run: python build_metrics.py <your notebook>.ipynb",
        )
