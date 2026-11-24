import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RiskFeatureCollection } from '../types'

export function RiskChart({ data }: { data: RiskFeatureCollection }) {
  const chartData = [...data.features]
    .sort((a, b) => b.properties.risk_score - a.properties.risk_score)
    .map((feature) => ({
      name: feature.properties.unit_id.replace('LIM-DEMO-', 'U-'),
      risk: feature.properties.risk_score,
      fill: feature.properties.risk_level === 'very_high' ? '#ff4d5e' : feature.properties.risk_level === 'high' ? '#ff8a4c' : feature.properties.risk_level === 'medium' ? '#f5c451' : '#39d98a',
    }))

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -26, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#25414b" vertical={false} />
          <XAxis dataKey="name" stroke="#91a8b1" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 0.7]} stroke="#91a8b1" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,.04)' }} contentStyle={{ background: '#102a33', border: '1px solid #31515c', borderRadius: 8 }} />
          <Bar dataKey="risk" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
