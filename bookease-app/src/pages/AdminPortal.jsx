// ============================================================
//  AdminPortal — shell that owns page routing for admins
// ============================================================

import { useState }      from 'react'
import { useApp }        from '../context/AppContext'
import { useSidebar }    from '../hooks/useSidebar'
import { initials }      from '../utils/helpers'
import AppLayout         from '../components/layout/AppLayout'
import Topbar            from '../components/layout/Topbar'
import AdminSidebar      from '../components/admin/AdminSidebar'
import Avatar           from '../components/ui/Avatar'

// Pages
import Dashboard  from './admin/Dashboard'
import Bookings   from './admin/Bookings'
import Calendar   from './admin/Calendar'
import Services   from './admin/Services'
import Customers  from './admin/Customers'
import Reports    from './admin/Reports'
import Settings   from './admin/Settings'

const PAGE_TITLES = {
  dashboard:  'Dashboard',
  bookings:   'All Bookings',
  calendar:   'Calendar',
  services:   'Services',
  customers:  'Customers',
  reports:    'Reports',
  settings:   'Settings',
}

export default function AdminPortal() {
  const { currentUser } = useApp()
  const { isOpen, toggle, close } = useSidebar()
  const [page, setPage] = useState('dashboard')

  function navigate(p) {
    setPage(p)
    if (window.innerWidth <= 768) close()
  }

  const sidebar = (
    <AdminSidebar activePage={page} onNavigate={navigate} isOpen={isOpen} />
  )

  const topbar = (
    <Topbar
      title={PAGE_TITLES[page]}
      onMenuClick={toggle}
      right={
        <>
          <span className="badge badge-admin">Admin</span>
          <Avatar user={currentUser} size="sm" style={{ fontSize: '0.72rem' }} />
        </>
      }
    />
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && window.innerWidth <= 768 && (
        <div className="mobile-overlay visible" onClick={close} />
      )}

      <AppLayout sidebar={sidebar} topbar={topbar}>
        {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {page === 'bookings'  && <Bookings />}
        {page === 'calendar'  && <Calendar />}
        {page === 'services'  && <Services />}
        {page === 'customers' && <Customers />}
        {page === 'reports'   && <Reports />}
        {page === 'settings'  && <Settings />}
      </AppLayout>
    </>
  )
}
