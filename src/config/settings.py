import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGO_URI = os.getenv("MONGO_URI", "")
    DB_NAME = os.getenv("DB_NAME", "parkingDB")
    SLOT_COLLECTION = os.getenv("SLOT_COLLECTION", "slothistory")
    ALERT_COLLECTION = os.getenv("ALERT_COLLECTION", "alerts")
    VEHICLE_COLLECTION = os.getenv("VEHICLE_COLLECTION", "vehicles")
    OUTPUT_DIR = "outputs"