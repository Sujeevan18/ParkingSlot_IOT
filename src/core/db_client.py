from pymongo import MongoClient
from pymongo.errors import (
    ConnectionFailure,
    ConfigurationError,
    ServerSelectionTimeoutError,
    PyMongoError,
)
from src.config.settings import Settings


class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        try:
            self.client = MongoClient(Settings.MONGO_URI, serverSelectionTimeoutMS=5000)
            self.client.admin.command("ping")
            self.db = self.client[Settings.DB_NAME]
            print("MongoDB connection successful.")
            return self.db

        except ConnectionFailure as e:
            print(f"ConnectionFailure: Could not connect to MongoDB. {e}")
        except ConfigurationError as e:
            print(f"ConfigurationError: Check MongoDB configuration. {e}")
        except ServerSelectionTimeoutError as e:
            print(f"ServerSelectionTimeoutError: Server not reachable. {e}")
        except PyMongoError as e:
            print(f"PyMongoError: MongoDB error occurred. {e}")
        except Exception as e:
            print(f"Unexpected error while connecting to MongoDB: {e}")

        self.db = None
        return None

    def get_database(self):
        if self.db is None:
            raise ConnectionError("Database is not connected. Call connect() first.")
        return self.db