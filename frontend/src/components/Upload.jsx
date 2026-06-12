import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx'))) {
      setFile(f)
      setError('')
    } else {
      setError('Please upload a CSV or Excel file only')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return setError('Please select a file first')
    setLoading(true)
    setError('')
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post(`${API}/api/upload`, formData, {
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total))
        }
      })
      onUploadSuccess(res.data.analysis, res.data.fileId)
    } catch (err) {
      setError('Upload failed. Make sure backend is running.')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={{...styles.container, animation: 'fadeIn 0.8s ease'}}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoWrapper}>
            <span style={styles.logoIcon}>📊</span>
            <span style={styles.logoText}>BizPulse</span>
          </div>
          <div style={styles.taglineWrapper}>
            <span style={styles.tagline}>AI-Powered Business Intelligence Dashboard</span>
          </div>
          <p style={styles.sub}>Upload your data → Get instant AI insights, charts & predictions</p>
        </div>

        {/* Upload Box */}
        <div
          style={{...styles.dropzone, ...(drag ? styles.dragOver : {})}}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
        >
          <div style={styles.uploadIconWrapper}>
            <span style={styles.uploadIcon}>📁</span>
          </div>
          <p style={styles.uploadText}>Drag & Drop your file here</p>
          <p style={styles.uploadSub}>Supports CSV and Excel (.xlsx) files</p>
          <label style={styles.browseBtn}>
            Browse File
            <input type="file" accept=".csv,.xlsx" hidden onChange={(e) => handleFile(e.target.files[0])} />
          </label>
          {file && (
            <div style={styles.fileSelected}>
              ✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {loading && (
          <div style={styles.progressWrapper}>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${progress}%`}} />
            </div>
            <p style={styles.progressText}>⏳ Analyzing your data... {progress}%</p>
          </div>
        )}

        {error && <p style={styles.error}>⚠️ {error}</p>}

        <button
          style={{...styles.analyzeBtn, opacity: loading ? 0.7 : 1}}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? '⏳ Analyzing...' : '🚀 Analyze My Data'}
        </button>

        {/* Features Grid */}
        <div style={styles.featuresTitle}>What BizPulse does for you</div>
        <div style={styles.features}>
          {[
            { icon: '📊', label: 'Auto Charts', desc: 'Bar, Line & Pie' },
            { icon: '🤖', label: 'AI Insights', desc: 'Plain English analysis' },
            { icon: '🔮', label: 'Predictions', desc: 'Future forecasting' },
            { icon: '🚨', label: 'Anomalies', desc: 'Detect outliers' },
            { icon: '💬', label: 'Ask AI', desc: 'Query your data' },
            { icon: '📤', label: 'Export PDF', desc: 'Download report' },
          ].map(f => (
            <div key={f.label} style={styles.featureCard}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureLabel}>{f.label}</span>
              <span style={styles.featureDesc}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' },
  blob1: { position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', top: '-100px', left: '-100px', borderRadius: '50%' },
  blob2: { position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', bottom: '-100px', right: '-100px', borderRadius: '50%' },
  container: { width: '100%', maxWidth: '650px', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: '35px' },
  logoWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' },
  logoIcon: { fontSize: '2.5rem' },
  logoText: { fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  taglineWrapper: { marginBottom: '8px' },
  tagline: { color: '#94a3b8', fontSize: '1rem', fontWeight: '500' },
  sub: { color: '#64748b', fontSize: '0.875rem' },
  dropzone: { border: '2px dashed #2d3748', borderRadius: '20px', padding: '50px 30px', textAlign: 'center', background: 'rgba(26,29,39,0.8)', cursor: 'pointer', transition: 'all 0.3s', marginBottom: '20px', backdropFilter: 'blur(10px)' },
  dragOver: { background: 'rgba(59,130,246,0.1)', borderColor: '#3b82f6', transform: 'scale(1.02)' },
  uploadIconWrapper: { width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  uploadIcon: { fontSize: '2.5rem' },
  uploadText: { color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' },
  uploadSub: { color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' },
  browseBtn: { display: 'inline-block', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', padding: '10px 28px', borderRadius: '25px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' },
  fileSelected: { marginTop: '15px', color: '#4ade80', fontSize: '0.9rem', fontWeight: '500' },
  progressWrapper: { marginBottom: '15px' },
  progressBar: { width: '100%', height: '6px', background: '#1e2433', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: '3px', transition: 'width 0.3s ease' },
  progressText: { color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center' },
  error: { color: '#f87171', textAlign: 'center', marginBottom: '15px', fontSize: '0.9rem' },
  analyzeBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', marginBottom: '35px', boxShadow: '0 8px 32px rgba(59,130,246,0.3)', transition: 'transform 0.2s' },
  featuresTitle: { textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  featureCard: { background: 'rgba(26,29,39,0.8)', border: '1px solid #1e2433', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center' },
  featureIcon: { fontSize: '1.5rem' },
  featureLabel: { color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '600' },
  featureDesc: { color: '#64748b', fontSize: '0.75rem' },
}