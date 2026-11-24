export type FacilityKind = 'inpatient' | 'outpatient' | 'support' | 'other'

export interface FacilityProperties {
  facility_id: number
  name: string
  department: string
  province: string
  district: string
  institution: string
  category: string
  status: string
  source: string
  kind: FacilityKind
}

export interface FacilityFeature {
  type: 'Feature'
  id: string
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: FacilityProperties
}

export interface FacilityFeatureCollection {
  type: 'FeatureCollection'
  name: string
  metadata: {
    crs: string
    source: string
    source_url: string
    disclaimer: string
    live: boolean
  }
  features: FacilityFeature[]
}

export interface SigridFacilityProperties {
  objectid: number
  nombre_del: string
  departamen: string
  provincia: string
  distrito: string
  institucion: string
  categoria_des: string
  estabcondicion: string
  fuente_des: string
}

export interface SigridFeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    id: number
    geometry: { type: 'Point'; coordinates: [number, number] }
    properties: SigridFacilityProperties
  }>
}
