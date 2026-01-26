function Reports() {
    const reports = [
      { id: 1, name: 'Отчет за январь', date: '2024-01-31' },
      { id: 2, name: 'Отчет за февраль', date: '2024-02-29' },
      { id: 3, name: 'Отчет за март', date: '2024-03-31' },
    ]
  
    return (
      <div style={{ padding: '2rem', background: '#fef3c7', borderRadius: '8px' }}>
        <h3>Отчеты загружены!</h3>
        <p>Этот компонент был загружен через lazy loading.</p>
        <div style={{ marginTop: '1rem' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '6px',
                marginBottom: '0.5rem',
              }}
            >
              <h4>{report.name}</h4>
              <p>Дата: {report.date}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default Reports
  

  