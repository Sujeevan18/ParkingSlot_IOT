import { useState, useEffect } from 'react';
import { OccupancyTrendChart } from '../components/OccupancyTrendChart';
import { OccupancyPieChart } from '../components/OccupancyPieChart';
import { AnomalyBarChart } from '../components/AnomalyBarChart';
import { ClusterTable } from '../components/ClusterTable';
import { get } from '../api/api';

/**
 * AnalyticsPage component for viewing parking analytics and reports
 */
export function AnalyticsPage() {
  const [occupancyData, setOccupancyData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    occupied: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch analytics data from API
        // const occupancy = await get('/analytics/occupancy');
        // const anomalyData = await get('/analytics/anomalies');
        // const clusterData = await get('/analytics/clusters');

        // Temporary mock data
        setOccupancyData([
          { timestamp: '10:00', occupancy: 45 },
          { timestamp: '11:00', occupancy: 52 },
          { timestamp: '12:00', occupancy: 78 },
          { timestamp: '13:00', occupancy: 85 },
          { timestamp: '14:00', occupancy: 72 },
        ]);

        setAnomalies([
          { type: 'Unusual Pattern', severity: 'High' },
          { type: 'Peak Hour', severity: 'Medium' },
        ]);

        setClusters([
          { id: 'C1', size: 45, center: 0.65, density: 0.8, characteristics: 'Peak Hours' },
          { id: 'C2', size: 30, center: 0.35, density: 0.6, characteristics: 'Off-Peak' },
        ]);

        setStats({ available: 25, occupied: 75 });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-page">
      <h1>Analytics & Reports</h1>

      <div className="date-filter">
        <label>
          From:
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </label>
        <label>
          To:
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </label>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <OccupancyTrendChart data={occupancyData} />
        </div>

        <div className="chart-container">
          <OccupancyPieChart available={stats.available} occupied={stats.occupied} />
        </div>

        <div className="chart-container">
          <AnomalyBarChart anomalies={anomalies} />
        </div>
      </div>

      <div className="clusters-section">
        <ClusterTable clusters={clusters} />
      </div>
    </div>
  );
}

export default AnalyticsPage;
