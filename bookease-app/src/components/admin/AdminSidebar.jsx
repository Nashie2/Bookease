// ============================================================
//  AdminSidebar — navigation for the admin portal
// ============================================================

import { useApp }   from '../../context/AppContext'
import Sidebar      from '../layout/Sidebar'

const NAV_SCHEMA = [
  { type: 'section', label: 'Overview' },
  { id: 'dashboard',  icon: '⬡', label: 'Dashboard' },
  { id: 'calendar',   icon: '◫', label: 'Calendar' },
  { type: 'section', label: 'Management' },
  { id: 'bookings',   icon: '◈', label: 'All Bookings', showBadge: true },
  { id: 'services',   icon: '◉', label: 'Services' },
  { id: 'customers',  icon: '◎', label: 'Customers' },
  { type: 'section', label: 'Analytics' },
  { id: 'reports',    icon: '◭', label: 'Reports' },
  { type: 'section', label: 'System' },
  { id: 'settings',   icon: '⊛', label: 'Settings' },
]

export default function AdminSidebar({ activePage, onNavigate, isOpen }) {
  const { db, currentUser, logout } = useApp()
  const pendingCount = db.bookings.filter((b) => b.status === 'pending').length

  const navItems = NAV_SCHEMA.map((item) => {
    if (item.type === 'section') return item
    return {
      ...item,
      active:  activePage === item.id,
      badge:   item.showBadge ? pendingCount : 0,
      onClick: () => onNavigate(item.id),
    }
  })

  return (
    <Sidebar
      isOpen={isOpen}
      brand={{ name: 'BookEase', tagline: 'Admin Portal' }}
      navItems={navItems}
      user={currentUser}
      onLogout={logout}
    />
  )
}
