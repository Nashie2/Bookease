// ============================================================
//  UserSidebar — navigation for the customer portal
// ============================================================

import { useApp }  from '../../context/AppContext'
import Sidebar     from '../layout/Sidebar'

const NAV_SCHEMA = [
  { id: 'home',        icon: '⬡', label: 'Home' },
  { id: 'book',        icon: '＋', label: 'New Booking' },
  { id: 'my-bookings', icon: '◈', label: 'My Bookings' },
  { id: 'services',    icon: '◉', label: 'Browse Services' },
  { id: 'profile',     icon: '◎', label: 'My Profile' },
]

export default function UserSidebar({ activePage, onNavigate, isOpen }) {
  const { currentUser, logout } = useApp()

  const navItems = NAV_SCHEMA.map((item) => ({
    ...item,
    active:  activePage === item.id,
    badge:   0,
    onClick: () => onNavigate(item.id),
  }))

  return (
    <Sidebar
      isOpen={isOpen}
      brand={{ name: 'BookEase', tagline: 'Customer Portal' }}
      navItems={navItems}
      user={currentUser}
      onLogout={logout}
    />
  )
}
