import { useState, useEffect } from 'react';
import { SummaryCard } from '../components/SummaryCard';
import { StatusBadge } from '../components/StatusBadge';
import { LiveSlotPanel } from '../components/LiveSlotPanel';
import { AlertsTable } from '../components/AlertsTable';
import { VehiclesTable } from '../components/VehiclesTable';
import { get } from '../api/api';

/**
 * LiveMonitoringPage component for real-time parking monitoring
 */
export function LiveMonitoringPage() {
  const [slots, setSlots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalSlots: 0,
    occupied: 0,
    available: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch live data from API
        // const slotsData = await get('/parking/slots');
        // const alertsData = await get('/alerts');
        // const vehiclesData = await get('/vehicles');

        // Temporary mock data
        setSlots([
          { id: 'A1', occupied: true },
          { id: 'A2', occupied: false },
          { id: 'A3', occupied: true },
          { id: 'B1', occupied: false },
          { id: 'B2', occupied: false },
        ]);

        setAlerts([
          { id: 1, timestamp: new Date(), type: 'Warning', message: 'High occupancy detected', status: 'Active' },
        ]);

        setVehicles([
          { id: 1, licensePlate: 'ABC123', slotNumber: 'A1', entryTime: new Date(), duration: 45 },
        ]);

        setStats({ totalSlots: 5, occupied: 2, available: 3 });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    // Optional: Set up interval for real-time updates
    // const interval = setInterval(fetchData, 5000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="live-monitoring-page">
      <h1>Live Monitoring</h1>

      <div className="summary-cards">
        <SummaryCard title="Total Slots" value={stats.totalSlots} backgroundColor="#e3f2fd" />
        <SummaryCard title="Occupied" value={stats.occupied} backgroundColor="#ffebee" />
        <SummaryCard title="Available" value={stats.available} backgroundColor="#e8f5e9" />
      </div>

      <div className="page-content">
        <div className="left-panel">
          <LiveSlotPanel slots={slots} />
        </div>

        <div className="right-panel">
          <AlertsTable alerts={alerts} />
          <VehiclesTable vehicles={vehicles} />
        </div>
      </div>
    </div>
  );
}

export default LiveMonitoringPage;
