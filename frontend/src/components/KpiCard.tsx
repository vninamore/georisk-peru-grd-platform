interface KpiCardProps {
  label: string
  value: string
  detail: string
  tone?: 'cyan' | 'amber' | 'red' | 'green'
}

export function KpiCard({ label, value, detail, tone = 'cyan' }: KpiCardProps) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <span className="kpi-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}
