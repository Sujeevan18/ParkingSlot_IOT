import { useState } from 'react'
import { LiveMonitoringPage } from './pages/LiveMonitoringPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import './styles/app.css'

function App() {
  const [currentPage, setCurrentPage] = useState('live-monitoring')

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🅿️ Parking Management System</h1>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <nav>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage('live-monitoring')
            }}
            className={currentPage === 'live-monitoring' ? 'active' : ''}
          >
            📊 Live Monitoring
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage('analytics')
            }}
            className={currentPage === 'analytics' ? 'active' : ''}
          >
            📈 Analytics
          </a>
        </nav>
      </nav>

      {/* Main Content */}
      <div className="app-content">
        {currentPage === 'live-monitoring' && <LiveMonitoringPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
      </div>
    </div>
  )
}

export default App
