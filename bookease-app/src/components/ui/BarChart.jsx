// ============================================================
//  BarChart — simple vertical bar chart
// ============================================================

export default function BarChart({ data, height = 130, accentIndex }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div
            className="bar"
            style={{
              height: `${Math.max(4, (d.value / max) * 100)}%`,
              background: i === accentIndex ? 'var(--teal)' : undefined,
            }}
          >
            <div className="bar-tooltip">{d.value}</div>
          </div>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  )
}
