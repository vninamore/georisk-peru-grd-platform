import { useEffect, useRef } from 'react'
import {
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  ScaleControl,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from 'maplibre-gl'
import type { RiskFeatureCollection } from '../types'

interface RiskMapProps {
  data: RiskFeatureCollection
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
      zoom: 9.8,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl(), 'top-right')
    map.addControl(new ScaleControl({ unit: 'metric' }))

    map.on('load', () => {
      map.addSource('risks', { type: 'geojson', data })
      map.addLayer({
        id: 'risk-halo',
        type: 'circle',
        source: 'risks',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'risk_score'], 0, 12, 0.6, 34],
          'circle-color': [
            'match', ['get', 'risk_level'],
            'low', '#39d98a', 'medium', '#f5c451', 'high', '#ff8a4c', '#ff4d5e',
          ],
          'circle-opacity': 0.23,
          'circle-blur': 0.25,
        },
      })
      map.addLayer({
        id: 'risk-points',
        type: 'circle',
        source: 'risks',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'risk_score'], 0, 6, 0.6, 15],
          'circle-color': [
            'match', ['get', 'risk_level'],
            'low', '#39d98a', 'medium', '#f5c451', 'high', '#ff8a4c', '#ff4d5e',
          ],
          'circle-stroke-color': '#f5fbff',
          'circle-stroke-width': 1.5,
        },
      })

      map.on('click', 'risk-points', (event: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const feature = event.features?.[0]
        if (!feature?.properties) return
        const p = feature.properties
        new Popup({ offset: 14 })
          .setLngLat(event.lngLat)
          .setHTML(`
            <div class="map-popup">
              <b>${p.name}</b>
              <span>${String(p.hazard_type).toUpperCase()}</span>
              <dl><dt>Riesgo</dt><dd>${Number(p.risk_score).toFixed(3)}</dd>
              <dt>Nivel</dt><dd>${String(p.risk_level).replace('_', ' ')}</dd></dl>
            </div>`)
          .addTo(map)
      })
      map.on('mouseenter', 'risk-points', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'risk-points', () => { map.getCanvas().style.cursor = '' })
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [data])

  return <div ref={container} className="risk-map" aria-label="Mapa de escenarios de riesgo" />
}
