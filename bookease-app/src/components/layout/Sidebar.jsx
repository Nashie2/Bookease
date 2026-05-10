// ============================================================
//  Sidebar — shared navigation shell used by both portals
// ============================================================

import { initials, fullName } from '../../utils/helpers'
import Avatar from '../ui/Avatar'

export default function Sidebar({ isOpen, brand, navItems, user, onLogout }) {
  return (
    <aside className={`sidebar${isOpen ? '' : ' closed'}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">✦</div>
          {brand.name}
        </div>
        <div className="sidebar-tagline">{brand.tagline}</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.type === 'section') {
            return (
              <div key={idx} className="sidebar-section">
                {item.label}
              </div>
            )
          }
          return (
            <div
              key={item.id}
              className={`sidebar-item${item.active ? ' active' : ''}`}
              onClick={item.onClick}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="sidebar-item-badge">{item.badge}</span>
              )}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={onLogout}>
          <Avatar user={user} className="sidebar-avatar" />
          <div>
            <div className="sidebar-user-name">{fullName(user)}</div>
            <div className="sidebar-user-role">Sign Out</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
