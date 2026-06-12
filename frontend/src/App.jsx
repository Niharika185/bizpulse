import { useState } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import './index.css'

function App() {
  const [dashboardData, setDashboardData] = useState(null)
  const [fileId, setFileId] = useState(null)

  const handleUploadSuccess = (data, id) => {
    setDashboardData(data)
    setFileId(id)
  }

  const handleReset = () => {
    setDashboardData(null)
    setFileId(null)
  }

  return (
    <div>
      {!dashboardData ? (
        <Upload onUploadSuccess={handleUploadSuccess} />
      ) : (
        <Dashboard
          data={dashboardData}
          fileId={fileId}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App