/**
 * VehiclesTable component for displaying vehicle information
 */
export function VehiclesTable({ vehicles = [] }) {
  return (
    <div className="vehicles-table">
      <h2>Vehicles</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>License Plate</th>
            <th>Slot Number</th>
            <th>Entry Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.licensePlate}</td>
                <td>{vehicle.slotNumber}</td>
                <td>{new Date(vehicle.entryTime).toLocaleString()}</td>
                <td>{vehicle.duration} mins</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                No vehicles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VehiclesTable;
