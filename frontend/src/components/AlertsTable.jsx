/**
 * AlertsTable component for displaying system alerts and notifications
 */
export function AlertsTable({ alerts = [] }) {
  return (
    <div className="alerts-table">
      <h2>Alerts</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{new Date(alert.timestamp).toLocaleString()}</td>
                <td>{alert.type}</td>
                <td>{alert.message}</td>
                <td>{alert.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                No alerts
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AlertsTable;
