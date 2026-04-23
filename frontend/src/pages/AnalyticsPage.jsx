import { useState, useEffect } from 'react';
import { OccupancyTrendChart } from '../components/OccupancyTrendChart';
import { OccupancyPieChart } from '../components/OccupancyPieChart';
import { get } from '../api/api';

export function AnalyticsPage() {
  const [occupancyData, setOccupancyData] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    occupied: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [slotHistory, statsData] = await Promise.all([
          get('/slot-history'),
          get('/dashboard/stats'),
        ]);

        const mappedTrend = slotHistory
          .slice()
          .reverse()
          .map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            occupancy: item.status === 'OCCUPIED' ? 1 : 0,
            distance: item.distance,
          }));

        setOccupancyData(mappedTrend);
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
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-page">
      <h1>Analytics & Reports</h1>

      <div className="charts-grid">
        <div className="chart-container">
          <OccupancyTrendChart data={occupancyData} />
        </div>

        <div className="chart-container">
          <OccupancyPieChart available={stats.available} occupied={stats.occupied} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;