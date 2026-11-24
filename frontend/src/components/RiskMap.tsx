import { useEffect, useRef, useState } from 'react'
import {
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  ScaleControl,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from 'maplibre-gl'
import type { FacilityFeatureCollection } from '../types'

interface RiskMapProps {
  data: FacilityFeatureCollection
}

export function RiskMap({ data }: RiskMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [mapUnavailable, setMapUnavailable] = useState(false)

  useEffect(() => {
    if (!container.current || mapRef.current) return

    const webGl2 = document.createElement('canvas').getContext('webgl2')
    if (!webGl2) {
      setMapUnavailable(true)
      return
    }

    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container: container.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-77.01, -12.07],
        zoom: 9.6,
        attributionControl: { compact: true },
      })
    } catch {
      setMapUnavailable(true)
      return
    }
    map.addControl(new NavigationControl(), 'top-right')
    map.addControl(new ScaleControl({ unit: 'metric' }))

    map.on('load', () => {
      map.addSource('facilities', { type: 'geojson', data })
      map.addLayer({
        id: 'facility-halo',
        type: 'circle',
        source: 'facilities',
        paint: {
          'circle-radius': 12,
          'circle-color': ['match', ['get', 'kind'], 'inpatient', '#ff4d5e', 'outpatient', '#42d7dc', 'support', '#f5c451', '#8da4ad'],
          'circle-opacity': 0.18,
          'circle-blur': 0.2,
        },
      })
      map.addLayer({
        id: 'facility-points',
        type: 'circle',
        source: 'facilities',
        paint: {
          'circle-radius': ['match', ['get', 'kind'], 'inpatient', 7, 5],
          'circle-color': ['match', ['get', 'kind'], 'inpatient', '#ff4d5e', 'outpatient', '#42d7dc', 'support', '#f5c451', '#8da4ad'],
          'circle-stroke-color': '#f5fbff',
          'circle-stroke-width': 1,
          'circle-opacity': 0.9,
        },
      })

      map.on('click', 'facility-points', (event: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = event.features?.[0]
        if (!feature?.properties) return
        const p = feature.properties
        const popup = document.createElement('div')
        popup.className = 'map-popup'
        const title = document.createElement('b')
        title.textContent = String(p.name)
        const subtitle = document.createElement('span')
        subtitle.textContent = `${String(p.district)} · ${String(p.institution)}`
        const details = document.createElement('dl')
        ;[
          ['Categoría', p.category],
          ['Condición', p.status],
          ['Fuente', p.source],
        ].forEach(([label, value]) => {
          const term = document.createElement('dt')
          term.textContent = String(label)
          const description = document.createElement('dd')
          description.textContent = String(value)
          details.append(term, description)
        })
        popup.append(title, subtitle, details)
        new Popup({ offset: 14 }).setLngLat(event.lngLat).setDOMContent(popup).addTo(map)
      })
      map.on('mouseenter', 'facility-points', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'facility-points', () => { map.getCanvas().style.cursor = '' })
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [data])

  if (mapUnavailable) {
    return (
      <div className="map-fallback" role="status">
        <div className="map-fallback-head">
          <span>VISTA COMPATIBLE</span>
          <strong>{data.features.length} establecimientos georreferenciados</strong>
          <p>El navegador no habilitó WebGL2. Los datos y filtros continúan disponibles.</p>
        </div>
        <div className="map-fallback-list">
          {data.features.slice(0, 8).map((feature) => (
            <div key={feature.id}>
              <i className={feature.properties.kind} />
              <span>{feature.properties.name}<small>{feature.properties.district} · {feature.properties.category}</small></span>
              <b>{feature.properties.status}</b>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return <div ref={container} className="risk-map" aria-label="Mapa de establecimientos de salud registrados en SIGRID" />
}
