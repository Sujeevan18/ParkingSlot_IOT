import { useState, useEffect } from 'react';
import { SummaryCard } from '../components/SummaryCard';
import { LiveSlotPanel } from '../components/LiveSlotPanel';
import { AlertsTable } from '../components/AlertsTable';
import { VehiclesTable } from '../components/VehiclesTable';
import { get } from '../api/api';

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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsData, alertsData, vehiclesData, statsData] = await Promise.all([
          get('/slots'),
          get('/alerts'),
          get('/vehicle-history'),
          get('/dashboard/stats'),
        ]);

        const mappedSlots = slotsData.map((slot) => ({
          id: slot.slotNumber,
          slotNumber: slot.slotNumber,
          status: slot.status,
          occupied: slot.status === 'OCCUPIED',
          distance: slot.distance,
          updatedAt: slot.updatedAt || slot.timestamp,
        }));

        const mappedAlerts = alertsData.map((alert, index) => ({
          id: alert._id || index,
          timestamp: alert.createdAt,
          type: alert.type,
          message: alert.message,
          status: alert.type === 'SMOKE' ? 'Active' : 'Normal',
          value: alert.value,
        }));

        const mappedVehicles = vehiclesData.map((vehicle, index) => ({
          id: vehicle._id || index,
          vehicleId: vehicle.rfid,
          licensePlate: vehicle.vehicleNumber || vehicle.rfid,
          slotNumber: vehicle.slotNumber || 1,
          entryTime: vehicle.timestamp,
          duration: '-',
        }));

        setSlots(mappedSlots);
        setAlerts(mappedAlerts);
        setVehicles(mappedVehicles);
        setStats(statsData);
        setLastUpdated(new Date());
        setError('');
      } catch (error) {
        console.error('Error fetching live data:', error);
        setError('Failed to load live data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="live-monitoring-page">
      <h1>Live Monitoring</h1>

      <p style={{ marginBottom: '10px', color: '#555' }}>
        Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '---'}
      </p>

      {error && (
        <p style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </p>
      )}

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