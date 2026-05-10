// ============================================================
//  ProgressBar — labelled horizontal fill bar
// ============================================================

export default function ProgressBar({ label, value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0

  return (
    <div className="progress-item">
      <div className="progress-row">
        <span>{label}</span>
        <span style={{ fontWeight: 700 }}>
          {value} ({pct}%)
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
