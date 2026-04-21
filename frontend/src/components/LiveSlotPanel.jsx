/**
 * LiveSlotPanel component for displaying real-time parking slot status
 */
export function LiveSlotPanel({ slots = [] }) {
  return (
    <div className="live-slot-panel">
      <h2>Live Parking Slots</h2>
      <div className="slots-grid">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`slot ${slot.occupied ? 'occupied' : 'available'}`}
          >
            <span className="slot-id">{slot.id}</span>
            <span className="slot-status">
              {slot.occupied ? '🚗' : '✓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveSlotPanel;
