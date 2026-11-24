import { useEffect, useMemo, useState } from 'react'
import { fetchFacilities, SIGRID_LAYER_URL } from './api'
import { KpiCard } from './components/KpiCard'
import { RiskChart } from './components/RiskChart'
import { RiskMap } from './components/RiskMap'
import type { FacilityFeatureCollection, FacilityKind } from './types'

const FILTERS: Array<[FacilityKind | 'all' | 'public', string]> = [
  ['all', 'Todos los establecimientos'],
  ['inpatient', 'Con internamiento'],
  ['outpatient', 'Sin internamiento'],
  ['support', 'Servicios médicos de apoyo'],
  ['public', 'Gestión pública'],
]

function App() {
  const [data, setData] = useState<FacilityFeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FacilityKind | 'all' | 'public'>('all')

  useEffect(() => {
    const controller = new AbortController()
    fetchFacilities(controller.signal).then(setData).catch((reason: Error) => {
      if (reason.name !== 'AbortError') setError(reason.message)
    })
    return () => controller.abort()
  }, [])

  const filtered = useMemo<FacilityFeatureCollection | null>(() => {
    if (!data) return null
    const features = data.features.filter((item) => {
      if (filter === 'all') return true
      if (filter === 'public') return item.properties.institution !== 'PRIVADO'
      return item.properties.kind === filter
    })
    return { ...data, features }
  }, [data, filter])

  if (error) return <main className="state-page"><h1>GeoRisk Peru</h1><p>No se pudieron cargar los datos: {error}</p></main>
  if (!filtered || !data) return <main className="state-page"><div className="loader"/><p>Consultando infraestructura expuesta en SIGRID…</p></main>

  const active = filtered.features.filter((feature) => feature.properties.status === 'ACTIVO').length
  const inpatient = filtered.features.filter((feature) => feature.properties.kind === 'inpatient').length
  const districts = new Set(filtered.features.map((feature) => feature.properties.district)).size
  const districtCounts = Object.entries(
    filtered.features.reduce<Record<string, number>>((counts, feature) => {
      const district = feature.properties.district
      counts[district] = (counts[district] ?? 0) + 1
      return counts
    }, {}),
  ).sort(([, a], [, b]) => b - a)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">GR</div>
        <div><h1>GeoRisk <span>Peru</span></h1><p>Disaster Risk Intelligence Platform</p></div>
        <div className="topbar-meta"><span className="status-dot"/> {data.metadata.live ? 'SIGRID conectado' : 'Respaldo local'} <b>v1.1</b></div>
      </header>

      <aside className="sidebar">
        <div className="side-title">ELEMENTOS EXPUESTOS</div>
        {FILTERS.map(([value, label]) => (
          <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}><i />{label}</button>
        ))}
        <div className="method-card"><span>FUENTE OFICIAL</span><strong>SIGRID · CENEPRED</strong><p>Capa de establecimientos de salud para análisis territorial de exposición.</p></div>
        <a className="source-link" href={SIGRID_LAYER_URL} target="_blank" rel="noreferrer">Consultar servicio ArcGIS REST</a>
        <small className="disclaimer">La concentración de infraestructura no constituye por sí sola una evaluación oficial de riesgo.</small>
      </aside>

      <main className="dashboard">
        <section className="dashboard-head">
          <div><span className="eyebrow">ANÁLISIS TERRITORIAL · LIMA</span><h2>Infraestructura de salud expuesta</h2></div>
          <div className="timestamp">FUENTE<br/><b>SIGRID / MINSA · 24 NOV 2026</b></div>
        </section>

        <section className="kpi-grid">
          <KpiCard label="Registros consultados" value={String(filtered.features.length)} detail={data.metadata.live ? 'Servicio SIGRID en vivo' : 'Muestra oficial de respaldo'} />
          <KpiCard label="Establecimientos activos" value={String(active)} detail="Condición registrada" tone="green" />
          <KpiCard label="Con internamiento" value={String(inpatient)} detail="Capacidad hospitalaria" tone="red" />
          <KpiCard label="Distritos cubiertos" value={String(districts)} detail="Cobertura territorial" tone="amber" />
        </section>

        <section className="content-grid">
          <article className="panel map-panel"><header><div><span className="panel-kicker">GEOINTELIGENCIA</span><h3>Distribución de establecimientos</h3></div><div className="legend"><span className="inpatient"/>Internamiento <span className="outpatient"/>Sin internamiento <span className="support"/>Apoyo</div></header><RiskMap data={filtered}/></article>
          <article className="panel ranking-panel"><header><div><span className="panel-kicker">CONCENTRACIÓN TERRITORIAL</span><h3>Establecimientos por distrito</h3></div></header><RiskChart data={filtered}/><div className="ranking-list">{districtCounts.slice(0, 5).map(([district, count], index) => <div key={district}><b>{String(index + 1).padStart(2, '0')}</b><span>{district}<small>Lima</small></span><strong>{count}</strong></div>)}</div></article>
        </section>
      </main>
    </div>
  )
}

export default App
