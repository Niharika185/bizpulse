import jsPDF from 'jspdf'

export default function ExportPDF({ data, insights }) {
  const handleExport = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    const addTitle = (text, size = 16) => {
      doc.setFontSize(size)
      doc.setTextColor(59, 130, 246)
      doc.text(text, 20, y)
      y += 10
    }

    const addText = (text, size = 11) => {
      doc.setFontSize(size)
      doc.setTextColor(50, 50, 50)
      const lines = doc.splitTextToSize(text, pageWidth - 40)
      doc.text(lines, 20, y)
      y += lines.length * 7
    }

    const addDivider = () => {
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y, pageWidth - 20, y)
      y += 8
    }

    const checkNewPage = () => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    }

    // Header
    doc.setFillColor(15, 17, 23)
    doc.rect(0, 0, pageWidth, 35, 'F')
    doc.setFontSize(22)
    doc.setTextColor(59, 130, 246)
    doc.text('BizPulse', 20, 20)
    doc.setFontSize(11)
    doc.setTextColor(150, 150, 150)
    doc.text('AI-Powered Business Intelligence Report', 20, 29)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 29)
    y = 50

    // Data Overview
    addTitle('Data Overview')
    addDivider()
    addText(`Total Rows: ${data.meta.rows}`)
    addText(`Total Columns: ${data.meta.columns}`)
    addText(`Columns: ${data.meta.column_names.join(', ')}`)
    addText(`Anomalies Detected: ${data.anomalies.length}`)
    addText(`Forecast Points: ${data.forecast.length}`)
    y += 5

    // Key Statistics
    checkNewPage()
    addTitle('Key Statistics')
    addDivider()
    Object.entries(data.summary).forEach(([col, stats]) => {
      checkNewPage()
      doc.setFontSize(12)
      doc.setTextColor(59, 130, 246)
      doc.text(`- ${col}`, 20, y)
      y += 7
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      addText(`  Max: ${stats.max}   Min: ${stats.min}   Mean: ${stats.mean}   Sum: ${stats.sum}   Std Dev: ${stats.std}`)
      y += 3
    })
    y += 5

    // AI Insights
    checkNewPage()
    addTitle('AI Insights')
    addDivider()
    if (insights) {
      addText(insights)
    } else {
      addText('No insights available.')
    }
    y += 5

    // Anomalies
    checkNewPage()
    addTitle('Anomaly Detection')
    addDivider()
    if (data.anomalies.length === 0) {
      addText('No anomalies detected in the dataset.')
    } else {
      data.anomalies.forEach(a => {
        checkNewPage()
        addText(`Row ${a.row} - ${a.column}: ${a.value} (${a.type})`)
      })
    }
    y += 5

    // Forecast
    checkNewPage()
    addTitle('Forecast Predictions')
    addDivider()
    if (data.forecast.length === 0) {
      addText('Not enough data for forecasting.')
    } else {
      data.forecast.forEach(f => {
        checkNewPage()
        addText(`${f.period}: ${f.value}`)
      })
    }
    y += 10

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Powered by BizPulse AI  |  Page ${i} of ${pageCount}`,
        pageWidth / 2, 290,
        { align: 'center' }
      )
    }

    doc.save('bizpulse-report.pdf')
  }

  return (
    <button onClick={handleExport} style={styles.btn}>
      Export PDF Report
    </button>
  )
}

const styles = {
  btn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #4ade80, #06b6d4)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600'
  }
}