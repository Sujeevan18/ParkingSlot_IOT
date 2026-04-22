import { useState, useEffect } from 'react';
import { OccupancyTrendChart } from '../components/OccupancyTrendChart';
import { OccupancyPieChart } from '../components/OccupancyPieChart';
import { AnomalyBarChart } from '../components/AnomalyBarChart';
import { ClusterTable } from '../components/ClusterTable';
import { get } from '../api/api';

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
        const query = `?from=${dateRange.from || ''}&to=${dateRange.to || ''}`;

        const [occupancy, anomalyData, clusterData, statsData] = await Promise.all([
          get(`/analytics/occupancy${query}`),
          get(`/analytics/anomalies${query}`),
          get(`/analytics/clusters${query}`),
          get(`/dashboard/stats`),
        ]);

        setOccupancyData(occupancy);
        setAnomalies(anomalyData);
        setClusters(clusterData);
        setStats({
          available: statsData.available,
          occupied: statsData.occupied,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
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