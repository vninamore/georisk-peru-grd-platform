export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'
export type HazardType = 'flood' | 'landslide' | 'earthquake' | 'wildfire'

export interface RiskProperties {
  unit_id: string
  name: string
  hazard_type: HazardType
  hazard_index: number
  exposure_index: number
  vulnerability_index: number
  risk_score: number
  adjusted_risk_score: number
  risk_level: RiskLevel
  confidence: number
  method_version: string
}

export interface RiskFeature {
  type: 'Feature'
  id: string
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: RiskProperties
}

export interface RiskFeatureCollection {
  type: 'FeatureCollection'
  name: string
  metadata: { crs: string; disclaimer: string }
  features: RiskFeature[]
}
