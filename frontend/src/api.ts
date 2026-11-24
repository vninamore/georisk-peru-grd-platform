import type {
  FacilityFeatureCollection,
  FacilityKind,
  SigridFeatureCollection,
} from './types'

export const SIGRID_LAYER_URL =
  'https://sigrid.cenepred.gob.pe/arcgis/rest/services/sigrid/Elementos_Expuestos/MapServer/2020000'

const query = new URLSearchParams({
  where: "departamen = 'LIMA' AND estabcondicion = 'ACTIVO'",
  outFields:
    'objectid,nombre_del,departamen,provincia,distrito,institucion,categoria_des,estabcondicion,fuente_des',
  returnGeometry: 'true',
  outSR: '4326',
  resultRecordCount: '250',
  orderByFields: 'objectid ASC',
  f: 'geojson',
})

const LIVE_URL = `${SIGRID_LAYER_URL}/query?${query.toString()}`
const SNAPSHOT_URL = `${import.meta.env.BASE_URL}data/health_facilities_sigrid.geojson`

function classify(category: string): FacilityKind {
  const value = category.toUpperCase()
  if (value.includes('SIN INTERNAMIENTO')) return 'outpatient'
  if (value.includes('CON INTERNAMIENTO')) return 'inpatient'
  if (value.includes('SERVICIO MÉDICO')) return 'support'
  return 'other'
}

function normalize(raw: SigridFeatureCollection, live: boolean): FacilityFeatureCollection {
  return {
    type: 'FeatureCollection',
    name: 'sigrid_health_facilities_lima',
    metadata: {
      crs: 'EPSG:4326',
      source: 'SIGRID/CENEPRED — Elementos Expuestos; fuente declarada por la capa: MINSA',
      source_url: SIGRID_LAYER_URL,
      disclaimer:
        'Información oficial de referencia. La concentración territorial no equivale por sí sola a un nivel de riesgo.',
      live,
    },
    features: raw.features.map((feature) => ({
      type: 'Feature',
      id: String(feature.id),
      geometry: feature.geometry,
      properties: {
        facility_id: feature.properties.objectid,
        name: feature.properties.nombre_del,
        department: feature.properties.departamen,
        province: feature.properties.provincia,
        district: feature.properties.distrito?.trim() || 'Sin distrito',
        institution: feature.properties.institucion || 'Sin institución',
        category: feature.properties.categoria_des || 'Sin categoría',
        status: feature.properties.estabcondicion || 'Sin estado',
        source: feature.properties.fuente_des || 'SIGRID',
        kind: classify(feature.properties.categoria_des || ''),
      },
    })),
  }
}

async function request(url: string, signal?: AbortSignal): Promise<SigridFeatureCollection> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<SigridFeatureCollection>
}

export async function fetchFacilities(signal?: AbortSignal): Promise<FacilityFeatureCollection> {
  try {
    return normalize(await request(LIVE_URL, signal), true)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    return normalize(await request(SNAPSHOT_URL, signal), false)
  }
}
