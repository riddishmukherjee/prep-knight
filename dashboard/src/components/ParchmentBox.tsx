interface Props {
  loading?: boolean
  error?: string | null
  text?: string
  placeholder?: string
}

export function ParchmentBox({ loading, error, text, placeholder }: Props) {
  if (loading) {
    return (
      <div className="parch-box loading">
        <div className="pb-content">The Oracle consults…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="parch-box error">
        <div className="pb-content">
          The Oracle could not be reached — check thy API key.
          <br />
          <small style={{ fontSize: 10, opacity: 0.7 }}>{error}</small>
        </div>
      </div>
    )
  }
  return (
    <div className="parch-box">
      <div className="pb-content">{text || placeholder || ''}</div>
    </div>
  )
}
