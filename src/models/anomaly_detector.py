import os
import pandas as pd
from sklearn.ensemble import IsolationForest
from src.config.settings import Settings


class AnomalyDetector:
    def __init__(self):
        self.slot_model = IsolationForest(contamination=0.05, random_state=42)
        self.alert_model = IsolationForest(contamination=0.1, random_state=42)

    def detect_slot_anomalies(self, slots: pd.DataFrame) -> pd.DataFrame:
        slot_anomalies = pd.DataFrame()

        if slots.empty:
            print("No slot data available for anomaly detection.")
            return slot_anomalies

        required_cols = ["distance", "status_num", "hour"]
        missing = [col for col in required_cols if col not in slots.columns]
        if missing:
            print(f"Missing slot columns for anomaly detection: {missing}")
            return slot_anomalies

        features = slots[["distance", "status_num", "hour"]].fillna(0)
        slots = slots.copy()
        slots["anomaly"] = self.slot_model.fit_predict(features)
        slot_anomalies = slots[slots["anomaly"] == -1]

        slot_anomalies.to_csv(
            os.path.join(Settings.OUTPUT_DIR, "slot_anomalies.csv"),
            index=False
        )
        return slot_anomalies

    def detect_alert_anomalies(self, alerts: pd.DataFrame) -> pd.DataFrame:
        alert_anomalies = pd.DataFrame()

        if alerts.empty:
            print("No alert data available for anomaly detection.")
            return alert_anomalies

        required_cols = ["value", "hour"]
        missing = [col for col in required_cols if col not in alerts.columns]
        if missing:
            print(f"Missing alert columns for anomaly detection: {missing}")
            return alert_anomalies

        features = alerts[["value", "hour"]].fillna(0)
        alerts = alerts.copy()
        alerts["anomaly"] = self.alert_model.fit_predict(features)
        alert_anomalies = alerts[alerts["anomaly"] == -1]

        alert_anomalies.to_csv(
            os.path.join(Settings.OUTPUT_DIR, "alert_anomalies.csv"),
            index=False
        )
        return alert_anomalies