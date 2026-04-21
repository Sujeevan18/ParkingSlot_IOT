import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from src.config.settings import Settings


class OccupancyClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(random_state=42)

    def train(self, df: pd.DataFrame):
        if df.empty:
            print("No slot history data found.")
            return None

        required_cols = ["hour", "day_of_week", "status_num"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            print(f"Missing required columns: {missing}")
            return None

        X = df[["hour", "day_of_week"]]
        y = df["status_num"]

        print("Class distribution:")
        print(y.value_counts())

        if len(df) < 10:
            print("Not enough records to train a reliable classifier.")
            return None

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, target_names=["FREE", "OCCUPIED"])
        cm = confusion_matrix(y_test, y_pred)

        joblib.dump(self.model, os.path.join(Settings.OUTPUT_DIR, "occupancy_classifier.pkl"))

        results_df = X_test.copy()
        results_df["actual"] = y_test.values
        results_df["predicted"] = y_pred
        results_df["actual_label"] = results_df["actual"].map({0: "FREE", 1: "OCCUPIED"})
        results_df["predicted_label"] = results_df["predicted"].map({0: "FREE", 1: "OCCUPIED"})
        results_df.to_csv(os.path.join(Settings.OUTPUT_DIR, "occupancy_predictions.csv"), index=False)

        with open(os.path.join(Settings.OUTPUT_DIR, "occupancy_classification_report.txt"), "w") as f:
            f.write(f"Accuracy: {accuracy:.4f}\n\n")
            f.write("Classification Report:\n")
            f.write(report)
            f.write("\nConfusion Matrix:\n")
            f.write(str(cm))

        print("Occupancy classification model trained successfully.")
        print("Accuracy:", round(accuracy, 4))
        print("\nClassification Report:\n", report)
        print("Confusion Matrix:\n", cm)

        return {
            "accuracy": accuracy,
            "confusion_matrix": cm,
            "report": report
        }