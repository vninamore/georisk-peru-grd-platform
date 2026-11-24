import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FacilityFeatureCollection } from '../types'

export function RiskChart({ data }: { data: FacilityFeatureCollection }) {
  const counts = data.features.reduce<Record<string, number>>((result, feature) => {
    const district = feature.properties.district
    result[district] = (result[district] ?? 0) + 1
    return result
  }, {})
  const chartData = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([district, facilities]) => ({
      name: district.length > 10 ? `${district.slice(0, 9)}…` : district,
      facilities,
    }))

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -26, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#25414b" vertical={false} />
          <XAxis dataKey="name" stroke="#91a8b1" fontSize={9} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} stroke="#91a8b1" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} contentStyle={{ background: '#102a33', border: '1px solid #31515c', borderRadius: 8 }} />
          <Bar dataKey="facilities" name="Establecimientos" fill="#42d7dc" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
