/**
 * OccupancyTrendChart component for displaying occupancy trends over time
 * Note: Install Chart.js and react-chartjs-2 for full functionality
 */
export function OccupancyTrendChart({ data = [] }) {
  return (
    <div className="occupancy-trend-chart">
      <h2>Occupancy Trend</h2>
      <div className="chart-placeholder">
        <p>Chart visualization area</p>
        {/* Install Chart.js: npm install chart.js react-chartjs-2 */}
        {/* Then implement Line chart for occupancy trends */}
        {data.length > 0 && (
          <ul>
            {data.slice(0, 5).map((item, idx) => (
              <li key={idx}>
                {item.timestamp}: {item.occupancy}%
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default OccupancyTrendChart;
