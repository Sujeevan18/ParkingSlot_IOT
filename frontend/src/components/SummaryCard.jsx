/**
 * SummaryCard component for displaying summary statistics
 */
export function SummaryCard({ title, value, icon, backgroundColor = '#f0f0f0' }) {
  return (
    <div
      className="summary-card"
      style={{ backgroundColor }}
    >
      {icon && <div className="summary-card-icon">{icon}</div>}
      <div className="summary-card-content">
        <h3>{title}</h3>
        <p className="summary-card-value">{value}</p>
      </div>
    </div>
  );
}

export default SummaryCard;
