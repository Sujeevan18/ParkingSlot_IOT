/**
 * OccupancyPieChart component for displaying occupancy distribution
 * Note: Install Chart.js and react-chartjs-2 for full functionality
 */
export function OccupancyPieChart({ available = 0, occupied = 0 }) {
  const total = available + occupied;
  const occupancyPercent = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

  return (
    <div className="occupancy-pie-chart">
      <h2>Occupancy Distribution</h2>
      <div className="chart-placeholder">
        <div className="chart-stats">
          <p>Total Spaces: {total}</p>
          <p>Occupied: {occupied}</p>
          <p>Available: {available}</p>
          <p className="occupancy-percent">{occupancyPercent}%</p>
        </div>
        {/* Install Chart.js: npm install chart.js react-chartjs-2 */}
        {/* Then implement Pie chart for occupancy distribution */}
      </div>
    </div>
  );
}

export default OccupancyPieChart;
