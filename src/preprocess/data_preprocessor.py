import pandas as pd


class DataPreprocessor:
    @staticmethod
    def preprocess_slots(df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            print("No slot data available.")
            return df

        required_cols = ["timestamp", "status"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            print(f"Missing required slot columns: {missing}")
            return pd.DataFrame()

        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df = df.dropna(subset=["timestamp"])

        df["status"] = df["status"].astype(str).str.upper().str.strip()
        df["status_num"] = df["status"].map({
            "FREE": 0,
            "OCCUPIED": 1
        }).fillna(0)

        df["hour"] = df["timestamp"].dt.hour
        df["day_of_week"] = df["timestamp"].dt.dayofweek
        df["date"] = df["timestamp"].dt.date

        return df.sort_values(by="timestamp").reset_index(drop=True)

    @staticmethod
    def preprocess_alerts(df: pd.DataFrame) -> pd.DataFrame:
        if df.empty:
            print("No alert data available.")
            return df

        if "createdAt" not in df.columns:
            print("Missing required alert column: createdAt")
            return pd.DataFrame()

        df = df.copy()
        df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
        df = df.dropna(subset=["createdAt"])
        df["hour"] = df["createdAt"].dt.hour
        df["day_of_week"] = df["createdAt"].dt.dayofweek

        return df.reset_index(drop=True)