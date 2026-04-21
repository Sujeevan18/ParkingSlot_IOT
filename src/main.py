from src.config.settings import Settings
from src.core.db_client import MongoDBClient
from src.core.file_manager import FileManager
from src.repositories.parking_repository import ParkingRepository
from src.preprocess.data_preprocessor import DataPreprocessor
from src.models.temporal_trend_model import TemporalTrendModel
from src.models.anomaly_detector import AnomalyDetector
from src.models.clustering_model import ClusteringModel
from src.models.occupancy_classifier import OccupancyClassifier
from src.visualization.temporal_visualizer import TemporalVisualizer


def main():
    FileManager.ensure_output_dir(Settings.OUTPUT_DIR)

    db_client = MongoDBClient()
    db = db_client.connect()
    if db is None:
        print("Stopping system because DB connection failed.")
        return

    repository = ParkingRepository(db_client)

    slots_df = repository.get_slots_df()
    alerts_df = repository.get_alerts_df()

    preprocessor = DataPreprocessor()
    slots_df = preprocessor.preprocess_slots(slots_df)
    alerts_df = preprocessor.preprocess_alerts(alerts_df)

    # 1. Temporal Trend
    temporal_model = TemporalTrendModel()
    temporal_model.train(slots_df)

    # 2. Anomaly Detection
    anomaly_detector = AnomalyDetector()
    slot_anomalies = anomaly_detector.detect_slot_anomalies(slots_df)
    alert_anomalies = anomaly_detector.detect_alert_anomalies(alerts_df)

    print("Slot anomalies:", len(slot_anomalies))
    print("Alert anomalies:", len(alert_anomalies))

    # 3. Clustering
    clustering_model = ClusteringModel()
    clustering_model.train(slots_df)

    # 4. Occupancy Classification
    classifier = OccupancyClassifier()
    classifier.train(slots_df)

    # 5. Visualization
    TemporalVisualizer.plot_hourly_occupancy(slots_df)


if __name__ == "__main__":
    main()