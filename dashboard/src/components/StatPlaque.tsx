interface Props {
  value: number | string
  label: string
  colour?: string
}

export function StatPlaque({ value, label, colour }: Props) {
  return (
    <div className="stat-plaque">
      <div className="sp-num" style={colour ? { color: colour } : undefined}>{value}</div>
      <div className="sp-label">{label}</div>
    </div>
  )
}
