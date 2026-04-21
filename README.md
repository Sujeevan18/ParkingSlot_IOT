# MLModels_trained

A machine learning project for parking occupancy prediction and analysis.

## Project Structure

```
MLModels_trained/
├── src/
│   ├── config/
│   │   └── settings.py
│   ├── core/
│   │   ├── db_client.py
│   │   └── file_manager.py
│   ├── repositories/
│   │   └── parking_repository.py
│   ├── preprocess/
│   │   └── data_preprocessor.py
│   ├── models/
│   │   ├── temporal_trend_model.py
│   │   ├── anomaly_detector.py
│   │   ├── clustering_model.py
│   │   └── occupancy_classifier.py
│   ├── visualization/
│   │   └── temporal_visualizer.py
│   └── main.py
├── outputs/
├── .env
├── requirements.txt
└── README.md
```

## Installation

Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run the main application:

```bash
python src/main.py
```

## Features

- **Temporal Trend Analysis**: Analyze time-series patterns in parking data
- **Anomaly Detection**: Identify unusual occupancy patterns
- **Clustering**: Group similar parking patterns
- **Occupancy Classification**: Predict parking space availability
- **Visualization**: Generate temporal visualizations of results

## Configuration

Configure your environment variables in `.env` file.
