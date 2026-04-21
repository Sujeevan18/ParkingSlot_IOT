import pandas as pd
from src.config.settings import Settings


class ParkingRepository:
    def __init__(self, db_client):
        self.db_client = db_client
        self.db = db_client.get_database()

    def _fetch_collection_as_df(self, collection_name: str) -> pd.DataFrame:
        try:
            if collection_name not in self.db.list_collection_names():
                print(f"Warning: Collection '{collection_name}' does not exist.")
                return pd.DataFrame()

            data = list(self.db[collection_name].find({}, {"_id": 0}))
            if not data:
                print(f"Warning: Collection '{collection_name}' is empty.")
                return pd.DataFrame()

            df = pd.DataFrame(data)
            print(f"Fetched {len(df)} records from '{collection_name}'.")
            return df

        except Exception as e:
            print(f"Error fetching '{collection_name}': {e}")
            return pd.DataFrame()

    def get_slots_df(self) -> pd.DataFrame:
        return self._fetch_collection_as_df(Settings.SLOT_COLLECTION)

    def get_alerts_df(self) -> pd.DataFrame:
        return self._fetch_collection_as_df(Settings.ALERT_COLLECTION)

    def get_vehicles_df(self) -> pd.DataFrame:
        return self._fetch_collection_as_df(Settings.VEHICLE_COLLECTION)