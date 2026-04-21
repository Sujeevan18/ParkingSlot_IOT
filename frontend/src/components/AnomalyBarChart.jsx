/**
 * AnomalyBarChart component for displaying anomaly detection results
 * Note: Install Chart.js and react-chartjs-2 for full functionality
 */
export function AnomalyBarChart({ anomalies = [] }) {
  return (
    <div className="anomaly-bar-chart">
      <h2>Anomaly Detection</h2>
      <div className="chart-placeholder">
        <p>Anomalies detected: {anomalies.length}</p>
        {anomalies.length > 0 && (
          <ul>
            {anomalies.slice(0, 5).map((anomaly, idx) => (
              <li key={idx}>
                {anomaly.type}: {anomaly.severity}
              </li>
            ))}
          </ul>
        )}
        {/* Install Chart.js: npm install chart.js react-chartjs-2 */}
        {/* Then implement Bar chart for anomaly visualization */}
      </div>
    </div>
  );
}

export default AnomalyBarChart;
