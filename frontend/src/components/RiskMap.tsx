import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FacilityFeature, FacilityFeatureCollection, FacilityKind } from '../types'

interface RiskMapProps {
  data: FacilityFeatureCollection
}

const COLORS: Record<FacilityKind, string> = {
  inpatient: '#ff4d5e',
  outpatient: '#42d7dc',
  support: '#f5c451',
  other: '#8da4ad',
}

function validCoordinates(feature: FacilityFeature): boolean {
  const [longitude, latitude] = feature.geometry.coordinates
  return Number.isFinite(longitude) && Number.isFinite(latitude)
    && longitude >= -180 && longitude <= 180
    && latitude >= -90 && latitude <= 90
}

function popupContent(feature: FacilityFeature): HTMLElement {
  const popup = document.createElement('div')
  popup.className = 'map-popup'

  const title = document.createElement('b')
  title.textContent = feature.properties.name
  const subtitle = document.createElement('span')
  subtitle.textContent = `${feature.properties.district} · ${feature.properties.institution}`
  const details = document.createElement('dl')

  ;[
    ['Categoría', feature.properties.category],
    ['Condición', feature.properties.status],
    ['Fuente', feature.properties.source],
  ].forEach(([label, value]) => {
    const term = document.createElement('dt')
    term.textContent = label
    const description = document.createElement('dd')
    description.textContent = value
    details.append(term, description)
  })

  popup.append(title, subtitle, details)
  return popup
}

export function RiskMap({ data }: RiskMapProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    const map = L.map(container.current, {
      center: [-12.07, -77.01],
      zoom: 10,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: true,
      preferCanvas: true,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map)

    const points = L.layerGroup().addTo(map)
    const bounds = L.latLngBounds([])

    data.features.filter(validCoordinates).forEach((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates
      const color = COLORS[feature.properties.kind]
      const radius = feature.properties.kind === 'inpatient' ? 7 : 5

      L.circleMarker([latitude, longitude], {
        radius,
        color: '#f5fbff',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.9,
      }).bindPopup(popupContent(feature), { maxWidth: 290 }).addTo(points)
      bounds.extend([latitude, longitude])
    })

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: window.innerWidth <= 720 ? [18, 18] : [36, 36],
        maxZoom: 12,
      })
    }

    const resize = () => map.invalidateSize({ pan: false })
    const frame = window.requestAnimationFrame(resize)
    const observer = new ResizeObserver(resize)
    observer.observe(container.current)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      map.remove()
    }
  }, [data])

  return <div ref={container} className="risk-map" aria-label="Mapa de establecimientos de salud registrados en SIGRID" />
}
