// ============================================================
//  StatCard — metric display tile
// ============================================================

export default function StatCard({ label, value, icon, color, bg, delta, deltaUp, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-bar" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="stat-card-icon" style={{ background: bg, color }}>{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {delta && (
        <div className={`stat-card-delta ${deltaUp ? 'delta-up' : 'delta-dn'}`}>
          {deltaUp ? '↑' : '→'} {delta}
        </div>
      )}
    </div>
  )
}
