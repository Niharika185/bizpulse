import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import ExportPDF from './ExportPDF'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const COLORS = ['#3b82f6', '#8b5cf6', '#4ade80', '#f59e0b', '#ef4444', '#06b6d4']

export default function Dashboard({ data, fileId, onReset }) {
  const [insights, setInsights] = useState('')
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loadingAnswer, setLoadingAnswer] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    setLoadingInsights(true)
    try {
      const res = await axios.post(`${API}/api/insights/${fileId}`)
      setInsights(res.data.insights)
    } catch (err) {
      setInsights('Could not generate insights. Check your API key.')
    }
    setLoadingInsights(false)
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoadingAnswer(true)
    try {
      const res = await axios.post(`${API}/api/ask/${fileId}`, { question })
      setAnswer(res.data.answer)
    } catch (err) {
      setAnswer('Could not get answer. Try again.')
    }
    setLoadingAnswer(false)
  }

  const tabs = ['overview', 'charts', 'anomalies', 'forecast', 'ask ai']

  const tabIcons = {
    'overview': '🏠',
    'charts': '📊',
    'anomalies': '🚨',
    'forecast': '🔮',
    'ask ai': '💬'
  }

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>📊 BizPulse</span>
          <span style={styles.badge}>● Live Analysis</span>
        </div>
        <div style={styles.headerRight}>
          <ExportPDF data={data} insights={insights} />
          <button style={styles.resetBtn} onClick={onReset}>+ New File</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Rows', value: data.meta.rows, icon: '📋', color: '#3b82f6' },
          { label: 'Columns', value: data.meta.columns, icon: '📊', color: '#8b5cf6' },
          { label: 'Anomalies', value: data.anomalies.length, icon: '🚨', color: '#f59e0b' },
          { label: 'Forecasts', value: data.forecast.length, icon: '🔮', color: '#4ade80' }
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={{...styles.statValue, color: s.color}}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t}
            style={{ ...styles.tab, ...(activeTab === t ? styles.activeTab : {}) }}
            onClick={() => setActiveTab(t)}
          >
            {tabIcons[t]} {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{animation: 'fadeIn 0.5s ease'}}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🤖 AI Insights</h3>
              {loadingInsights ? (
                <div style={styles.loadingWrapper}>
                  <div style={styles.loadingDot} />
                  <p style={styles.loading}>Generating AI insights...</p>
                </div>
              ) : (
                <p style={styles.insightText}>{insights}</p>
              )}
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📋 Data Summary</h3>
              {Object.entries(data.summary).map(([col, stats]) => (
                <div key={col} style={styles.summaryRow}>
                  <span style={styles.colName}>{col}</span>
                  <div style={styles.statsGrid}>
                    {Object.entries(stats).map(([k, v]) => (
                      <div key={k} style={styles.statItem}>
                        <span style={styles.statKey}>{k}</span>
                        <span style={styles.statVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {activeTab === 'charts' && (
          <div style={{animation: 'fadeIn 0.5s ease'}}>
            {data.charts.bar.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📊 Bar Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.bar}>
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #3b82f6', borderRadius: '8px', color: '#e2e8f0' }} />
                    <Bar dataKey="value" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {data.charts.line.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📈 Trend Line</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.charts.line}>
                    <XAxis dataKey="index" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #8b5cf6', borderRadius: '8px', color: '#e2e8f0' }} />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {data.charts.pie.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🥧 Distribution</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={data.charts.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.charts.pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #4ade80', borderRadius: '8px', color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ANOMALIES TAB */}
        {activeTab === 'anomalies' && (
          <div style={{animation: 'fadeIn 0.5s ease'}}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🚨 Anomaly Detection</h3>
              {data.anomalies.length === 0 ? (
                <div style={styles.noDataWrapper}>
                  <span style={styles.noDataIcon}>✅</span>
                  <p style={styles.noData}>No anomalies detected in your data!</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Row', 'Column', 'Value', 'Type'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.anomalies.map((a, i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.td}>{a.row}</td>
                        <td style={styles.td}>{a.column}</td>
                        <td style={styles.td}>{a.value}</td>
                        <td style={styles.td}>
                          <span style={{ color: a.type === 'High' ? '#f59e0b' : '#ef4444', fontWeight: '600' }}>
                            {a.type === 'High' ? '⬆️ High' : '⬇️ Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* FORECAST TAB */}
        {activeTab === 'forecast' && (
          <div style={{animation: 'fadeIn 0.5s ease'}}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🔮 Future Predictions</h3>
              {data.forecast.length === 0 ? (
                <div style={styles.noDataWrapper}>
                  <p style={styles.noData}>Need at least 10 rows of data for forecasting.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.forecast}>
                    <XAxis dataKey="period" stroke="#475569" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #4ade80', borderRadius: '8px', color: '#e2e8f0' }} />
                    <Bar dataKey="value" fill="url(#greenGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* ASK AI TAB */}
        {activeTab === 'ask ai' && (
          <div style={{animation: 'fadeIn 0.5s ease'}}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💬 Ask Your Data</h3>
              <p style={styles.askSubtitle}>Ask anything about your data in plain English</p>
              <div style={styles.askBox}>
                <input
                  style={styles.askInput}
                  placeholder="e.g. Which product has highest sales?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button style={styles.askBtn} onClick={handleAsk} disabled={loadingAnswer}>
                  {loadingAnswer ? '⏳' : '➤'}
                </button>
              </div>
              {answer && (
                <div style={styles.answerBox}>
                  <p style={styles.answerLabel}>🤖 AI Answer:</p>
                  <p style={styles.answerText}>{answer}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0c14', padding: '20px', position: 'relative', overflow: 'hidden' },
  blob1: { position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', top: '-150px', left: '-150px', borderRadius: '50%', pointerEvents: 'none' },
  blob2: { position: 'fixed', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', bottom: '-150px', right: '-150px', borderRadius: '50%', pointerEvents: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '15px 25px', background: 'rgba(26,29,39,0.9)', borderRadius: '16px', border: '1px solid #1e2433', backdropFilter: 'blur(10px)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
  logo: { fontSize: '1.6rem', fontWeight: '800', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  badge: { background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(74,222,128,0.3)' },
  headerRight: { display: 'flex', gap: '10px' },
  resetBtn: { background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
  statCard: { background: 'rgba(26,29,39,0.9)', borderRadius: '16px', padding: '22px', textAlign: 'center', border: '1px solid #1e2433', backdropFilter: 'blur(10px)' },
  statIcon: { fontSize: '2rem', marginBottom: '10px' },
  statValue: { fontSize: '2.2rem', fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: '0.85rem', marginTop: '5px', fontWeight: '500' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', background: 'rgba(26,29,39,0.9)', padding: '8px', borderRadius: '14px', border: '1px solid #1e2433' },
  tab: { padding: '9px 18px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#64748b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', transition: 'all 0.2s' },
  activeTab: { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' },
  content: {},
  card: { background: 'rgba(26,29,39,0.9)', borderRadius: '16px', padding: '25px', marginBottom: '20px', border: '1px solid #1e2433', backdropFilter: 'blur(10px)' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0' },
  loadingWrapper: { display: 'flex', alignItems: 'center', gap: '10px', padding: '20px' },
  loadingDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s infinite' },
  loading: { color: '#64748b', fontStyle: 'italic' },
  insightText: { color: '#cbd5e1', lineHeight: '1.9', whiteSpace: 'pre-wrap', fontSize: '0.95rem' },
  summaryRow: { marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #1e2433' },
  colName: { color: '#3b82f6', fontWeight: '700', display: 'block', marginBottom: '8px' },
  statsGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '3px' },
  statKey: { color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
  statVal: { color: '#e2e8f0', fontWeight: '700', fontSize: '1rem' },
  noDataWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' },
  noDataIcon: { fontSize: '3rem', marginBottom: '15px' },
  noData: { color: '#64748b', textAlign: 'center', fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 15px', background: '#0a0c14', color: '#64748b', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #1e2433' },
  tr: { borderBottom: '1px solid #1e2433' },
  td: { padding: '12px 15px', color: '#cbd5e1', fontSize: '0.9rem' },
  askSubtitle: { color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' },
  askBox: { display: 'flex', gap: '10px', marginBottom: '20px' },
  askInput: { flex: 1, padding: '13px 18px', background: '#0a0c14', border: '1px solid #1e2433', borderRadius: '10px', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none' },
  askBtn: { padding: '13px 22px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '700' },
  answerBox: { background: '#0a0c14', borderRadius: '12px', padding: '20px', border: '1px solid rgba(59,130,246,0.3)' },
  answerLabel: { color: '#3b82f6', fontWeight: '700', marginBottom: '10px', fontSize: '0.9rem' },
  answerText: { color: '#cbd5e1', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }
}