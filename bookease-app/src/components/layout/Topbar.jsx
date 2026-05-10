// ============================================================
//  Topbar — sticky header with title, search slot, right slot
// ============================================================

export default function Topbar({ title, onMenuClick, right }) {
  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>
      <div className="topbar-title">{title}</div>
      <div style={{ flex: 1 }} />
      {right && <div className="flex-center">{right}</div>}
    </header>
  )
}
