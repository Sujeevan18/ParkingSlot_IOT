import matplotlib.pyplot as plt
import pandas as pd


class TemporalVisualizer:
    @staticmethod
    def plot_hourly_occupancy(df: pd.DataFrame):
        if df.empty:
            print("No slot history data found.")
            return

        hourly_avg = df.groupby("hour")["status_num"].mean()

        plt.figure(figsize=(8, 5))
        plt.plot(hourly_avg.index, hourly_avg.values, marker="o")
        plt.xlabel("Hour of Day")
        plt.ylabel("Average Occupancy Rate")
        plt.title("Average Parking Slot Occupancy by Hour")
        plt.grid(True)
        plt.show()