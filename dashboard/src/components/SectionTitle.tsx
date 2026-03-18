interface Props { children: string }

export function SectionTitle({ children }: Props) {
  return (
    <div className="sec-title">
      <div className="at-line" />
      <span>⚔</span>
      <span>{children}</span>
      <span>⚔</span>
      <div className="at-line" />
    </div>
  )
}
