// ============================================================
//  AppLayout — sidebar + main area shell
// ============================================================

export default function AppLayout({ sidebar, topbar, children }) {
  return (
    <div className="app-layout">
      {sidebar}
      <div className="app-main">
        {topbar}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
