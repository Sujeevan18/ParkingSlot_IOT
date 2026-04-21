import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from src.config.settings import Settings


class TemporalTrendModel:
    def __init__(self):
        self.model = RandomForestRegressor(random_state=42)

    def train(self, df: pd.DataFrame):
        if df.empty:
            print("No slot history data found.")
            return None

        hourly = (
            df.groupby(["date", "hour"])["status_num"]
            .mean()
            .reset_index()
            .rename(columns={"status_num": "occupancy_rate"})
        )

        if hourly.empty:
            print("No hourly occupancy data could be generated.")
            return None

        hourly["date"] = pd.to_datetime(hourly["date"], errors="coerce")
        hourly = hourly.dropna(subset=["date"])
        hourly["day_of_week"] = hourly["date"].dt.dayofweek

        X = hourly[["hour", "day_of_week"]]
        y = hourly["occupancy_rate"]

        if len(hourly) < 5:
            print("Not enough hourly records to train the temporal model.")
            hourly.to_csv(os.path.join(Settings.OUTPUT_DIR, "hourly_occupancy.csv"), index=False)
            return None

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model.fit(X_train, y_train)
        pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, pred)

        joblib.dump(self.model, os.path.join(Settings.OUTPUT_DIR, "temporal_model.pkl"))
        hourly.to_csv(os.path.join(Settings.OUTPUT_DIR, "hourly_occupancy.csv"), index=False)

        print("Temporal trend model trained successfully.")
        print("Total hourly records:", len(hourly))
        print("MAE:", mae)

        return {
            "mae": mae,
            "hourly_df": hourly
        }