from fastapi import FastAPI
import pandas as pd
import os

from src.config.settings import Settings
from src.core.db_client import MongoDBClient
from src.repositories.parking_repository import ParkingRepository
from src.preprocess.data_preprocessor import DataPreprocessor

app = FastAPI(title="Automated Parking IoT API")

db_client = MongoDBClient()
db_client.connect()
repository = ParkingRepository(db_client)
preprocessor = DataPreprocessor()


@app.get("/")
def root():
    return {"message": "Automated Parking IoT API is running"}


# -----------------------------
# Normal Data APIs
# -----------------------------
@app.get("/api/slots/current")
def get_current_slot():
    df = repository.get_slots_df()
    df = preprocessor.preprocess_slots(df)

    if df.empty:
        return {"error": "No slot data found"}

    latest = df.sort_values(by="timestamp", ascending=False).iloc[0].to_dict()

    return {
        "slotNumber": latest.get("slotNumber", 1),
        "status": latest.get("status", "UNKNOWN"),
        "vehicleNumber": latest.get("vehicleNumber", None),
        "distance": latest.get("distance", None),
        "timestamp": str(latest.get("timestamp"))
    }


@app.get("/api/slots/history")
def get_slot_history():
    df = repository.get_slots_df()
    if df.empty:
        return []
    return df.to_dict(orient="records")


@app.get("/api/vehicles")
def get_vehicles():
    df = repository.get_vehicles_df()
    if df.empty:
        return []
    return df.to_dict(orient="records")


@app.get("/api/alerts")
def get_alerts():
    df = repository.get_alerts_df()
    if df.empty:
        return []
    return df.to_dict(orient="records")


@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    slots_df = repository.get_slots_df()
    alerts_df = repository.get_alerts_df()
    vehicles_df = repository.get_vehicles_df()

    slots_df = preprocessor.preprocess_slots(slots_df)

    current_status = "UNKNOWN"
    if not slots_df.empty:
        latest = slots_df.sort_values(by="timestamp", ascending=False).iloc[0]
        current_status = latest.get("status", "UNKNOWN")

    return {
        "totalVehicles": len(vehicles_df),
        "totalAlerts": len(alerts_df),
        "totalSlotHistoryRecords": len(slots_df),
        "currentSlotStatus": current_status
    }


# -----------------------------
# Analytics APIs
# -----------------------------
@app.get("/api/analytics/trend")
def get_trend():
    file_path = os.path.join(Settings.OUTPUT_DIR, "hourly_occupancy.csv")

    if not os.path.exists(file_path):
        return {"error": "Trend data not found"}

    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")


@app.get("/api/analytics/anomalies")
def get_anomalies():
    slot_path = os.path.join(Settings.OUTPUT_DIR, "slot_anomalies.csv")
    alert_path = os.path.join(Settings.OUTPUT_DIR, "alert_anomalies.csv")

    slot_data = []
    alert_data = []

    if os.path.exists(slot_path):
        slot_data = pd.read_csv(slot_path).to_dict(orient="records")

    if os.path.exists(alert_path):
        alert_data = pd.read_csv(alert_path).to_dict(orient="records")

    return {
        "slot_anomalies": slot_data,
        "alert_anomalies": alert_data
    }


@app.get("/api/analytics/clusters")
def get_clusters():
    file_path = os.path.join(Settings.OUTPUT_DIR, "hourly_clusters.csv")

    if not os.path.exists(file_path):
        return {"error": "Cluster data not found"}

    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")


@app.get("/api/analytics/classification-summary")
def get_classification_summary():
    report_path = os.path.join(Settings.OUTPUT_DIR, "occupancy_classification_report.txt")

    if not os.path.exists(report_path):
        return {"error": "Classification report not found"}

    with open(report_path, "r") as f:
        report = f.read()

    return {"report": report}