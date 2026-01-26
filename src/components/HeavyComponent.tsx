function HeavyComponent() {
    // Симуляция тяжелого компонента
    const heavyData = Array.from({ length: 1000 }, (_, i) => `Элемент ${i + 1}`)
  
    return (
      <div style={{ padding: '2rem', background: '#f0f9ff', borderRadius: '8px' }}>
        <h3>Тяжелый компонент загружен!</h3>
        <p>Этот компонент был загружен через lazy loading.</p>
        <div style={{ maxHeight: '300px', overflow: 'auto', marginTop: '1rem' }}>
          {heavyData.map((item, idx) => (
            <div key={idx} style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default HeavyComponent
  
  