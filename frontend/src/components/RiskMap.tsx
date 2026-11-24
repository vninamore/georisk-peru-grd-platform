import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    if (!container.current || mapRef.current) return

    const map = new MapLibreMap({
      container: container.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-77.01, -12.07],
      zoom: 9.6,
      attributionControl: { compact: true },
    })
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
        new Popup({ offset: 14 })
          .setLngLat(event.lngLat)
          .setHTML(`
            <div class="map-popup">
              <b>${String(p.name)}</b>
              <span>${String(p.district)} · ${String(p.institution)}</span>
              <dl><dt>Categoría</dt><dd>${String(p.category)}</dd>
              <dt>Condición</dt><dd>${String(p.status)}</dd>
              <dt>Fuente</dt><dd>${String(p.source)}</dd></dl>
            </div>`)
          .addTo(map)
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

  return <div ref={container} className="risk-map" aria-label="Mapa de establecimientos de salud registrados en SIGRID" />
}
