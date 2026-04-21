/**
 * ClusterTable component for displaying clustering analysis results
 */
export function ClusterTable({ clusters = [] }) {
  return (
    <div className="cluster-table">
      <h2>Clusters</h2>
      <table>
        <thead>
          <tr>
            <th>Cluster ID</th>
            <th>Size</th>
            <th>Center</th>
            <th>Density</th>
            <th>Characteristics</th>
          </tr>
        </thead>
        <tbody>
          {clusters.length > 0 ? (
            clusters.map((cluster) => (
              <tr key={cluster.id}>
                <td>{cluster.id}</td>
                <td>{cluster.size}</td>
                <td>{cluster.center?.toFixed(2)}</td>
                <td>{cluster.density?.toFixed(2)}</td>
                <td>{cluster.characteristics}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                No clusters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClusterTable;
