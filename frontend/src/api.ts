import type { RiskFeatureCollection } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function fetchDemoRisks(signal?: AbortSignal): Promise<RiskFeatureCollection> {
  const response = await fetch(`${API_URL}/api/v1/demo/risks.geojson`, { signal })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json() as Promise<RiskFeatureCollection>
}
