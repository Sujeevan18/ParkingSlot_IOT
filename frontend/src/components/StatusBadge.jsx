/**
 * StatusBadge component for displaying status indicators
 */
export function StatusBadge({ status, label }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
      case 'success':
        return '#28a745';
      case 'occupied':
      case 'warning':
        return '#ffc107';
      case 'offline':
      case 'error':
      case 'danger':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {label || status}
    </span>
  );
}

export default StatusBadge;
