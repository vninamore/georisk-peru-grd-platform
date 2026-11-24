import { useEffect, useMemo, useState } from 'react'
import { fetchDemoRisks } from './api'
import { KpiCard } from './components/KpiCard'
import { RiskChart } from './components/RiskChart'
import { RiskMap } from './components/RiskMap'
import type { RiskFeatureCollection } from './types'

const LABELS: Record<string, string> = {
  flood: 'Inundación', landslide: 'Mov. en masa', earthquake: 'Sismo', wildfire: 'Incendio',
}

function App() {
  const [data, setData] = useState<RiskFeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()
    fetchDemoRisks(controller.signal).then(setData).catch((reason: Error) => {
      if (reason.name !== 'AbortError') setError(reason.message)
    })
    return () => controller.abort()
  }, [])

  const filtered = useMemo<RiskFeatureCollection | null>(() => {
    if (!data) return null
    return { ...data, features: filter === 'all' ? data.features : data.features.filter((item) => item.properties.hazard_type === filter) }
  }, [data, filter])

  if (error) return <main className="state-page"><h1>GeoRisk Peru</h1><p>No se pudo conectar con la API: {error}</p></main>
  if (!filtered) return <main className="state-page"><div className="loader"/><p>Cargando inteligencia territorial…</p></main>

  const scores = filtered.features.map((f) => f.properties.risk_score)
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const critical = filtered.features.filter((f) => ['high', 'very_high'].includes(f.properties.risk_level)).length
  const maxFeature = [...filtered.features].sort((a, b) => b.properties.risk_score - a.properties.risk_score)[0]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">GR</div>
        <div><h1>GeoRisk <span>Peru</span></h1><p>Disaster Risk Intelligence Platform</p></div>
        <div className="topbar-meta"><span className="status-dot"/> Sistema operativo <b>v1.0</b></div>
      </header>

      <aside className="sidebar">
        <div className="side-title">ESCENARIOS</div>
        {[['all','Vista multiamenaza'], ['flood','Inundación'], ['landslide','Mov. en masa'], ['earthquake','Sismo'], ['wildfire','Incendio forestal']].map(([value, label]) => (
          <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}><i />{label}</button>
        ))}
        <div className="method-card"><span>MODELO</span><strong>R = P × E × V</strong><p>Índice normalizado, trazable y configurable.</p></div>
        <small className="disclaimer">Datos sintéticos. No representan información oficial.</small>
      </aside>

      <main className="dashboard">
        <section className="dashboard-head">
          <div><span className="eyebrow">ANÁLISIS TERRITORIAL</span><h2>Monitoreo multiamenaza</h2></div>
          <div className="timestamp">Actualización<br/><b>24 NOV 2026 · DEMO</b></div>
        </section>

        <section className="kpi-grid">
          <KpiCard label="Unidades evaluadas" value={String(filtered.features.length)} detail="Escenarios activos" />
          <KpiCard label="Riesgo promedio" value={average.toFixed(3)} detail="Índice normalizado" tone="amber" />
          <KpiCard label="Prioridad alta" value={String(critical)} detail="Requieren evaluación" tone="red" />
          <KpiCard label="Máximo riesgo" value={maxFeature?.properties.risk_score.toFixed(3) ?? '—'} detail={maxFeature?.properties.name ?? 'Sin resultados'} tone="green" />
        </section>

        <section className="content-grid">
          <article className="panel map-panel"><header><div><span className="panel-kicker">GEOINTELIGENCIA</span><h3>Distribución espacial del riesgo</h3></div><div className="legend"><span className="low"/>Bajo <span className="medium"/>Medio <span className="high"/>Alto <span className="very-high"/>Muy alto</div></header><RiskMap data={filtered}/></article>
          <article className="panel ranking-panel"><header><div><span className="panel-kicker">PRIORIZACIÓN</span><h3>Ranking territorial</h3></div></header><RiskChart data={filtered}/><div className="ranking-list">{[...filtered.features].sort((a,b) => b.properties.risk_score-a.properties.risk_score).slice(0,3).map((f,i)=><div key={f.id}><b>0{i+1}</b><span>{f.properties.name}<small>{LABELS[f.properties.hazard_type]}</small></span><strong>{f.properties.risk_score.toFixed(3)}</strong></div>)}</div></article>
        </section>
      </main>
    </div>
  )
}

export default App
