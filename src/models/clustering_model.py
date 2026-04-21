import os
import pandas as pd
from sklearn.cluster import KMeans
from src.config.settings import Settings


class ClusteringModel:
    def __init__(self, n_clusters: int = 3):
        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)

    def train(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            print("No slot history data found.")
            return pd.DataFrame()

        required_cols = ["hour", "status_num"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            print(f"Missing required columns for clustering: {missing}")
            return pd.DataFrame()

        hourly_summary = (
            df.groupby("hour")
            .agg(
                occupancy_rate=("status_num", "mean"),
                total_records=("status_num", "count")
            )
            .reset_index()
        )

        if len(hourly_summary) < 3:
            print("Not enough hourly groups for clustering.")
            return pd.DataFrame()

        X = hourly_summary[["hour", "occupancy_rate"]]
        hourly_summary["cluster"] = self.model.fit_predict(X)

        hourly_summary.to_csv(
            os.path.join(Settings.OUTPUT_DIR, "hourly_clusters.csv"),
            index=False
        )

        print("Clustering completed.")
        print(hourly_summary)

        return hourly_summary