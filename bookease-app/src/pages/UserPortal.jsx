// ============================================================
//  UserPortal — shell that owns page routing for customers
// ============================================================

import { useState }   from 'react'
import { useApp }     from '../context/AppContext'
import { useSidebar } from '../hooks/useSidebar'
import { initials, fullName } from '../utils/helpers'
import AppLayout      from '../components/layout/AppLayout'
import Topbar         from '../components/layout/Topbar'
import UserSidebar    from '../components/user/UserSidebar'
import BookingWizard  from '../components/booking/BookingWizard'
import Avatar         from '../components/ui/Avatar'

// Pages
import Home       from './user/Home'
import MyBookings from './user/MyBookings'
import Services   from './user/Services'
import Profile    from './user/Profile'

const PAGE_TITLES = {
  home:         'Home',
  book:         'New Booking',
  'my-bookings': 'My Bookings',
  services:     'Browse Services',
  profile:      'My Profile',
}

export default function UserPortal() {
  const { currentUser } = useApp()
  const { isOpen, toggle, close } = useSidebar()
  const [page, setPage] = useState('home')
  const [editProfileOpen, setEditProfileOpen] = useState(false)

  function navigate(p) {
    setPage(p)
    if (window.innerWidth <= 768) close()
  }

  const sidebar = (
    <UserSidebar activePage={page} onNavigate={navigate} isOpen={isOpen} />
  )

  const topbar = (
    <Topbar
      title={PAGE_TITLES[page]}
      onMenuClick={toggle}
      right={
        <>
          <span className="text-muted text-small" style={{ display: 'none' }}>{fullName(currentUser)}</span>
          <Avatar user={currentUser} size="sm" />
        </>
      }
    />
  )

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <div className="mobile-overlay visible" onClick={close} />
      )}

      <AppLayout sidebar={sidebar} topbar={topbar}>
        {page === 'home' && (
          <Home
            onNavigate={navigate}
            onOpenEditProfile={() => {
              setEditProfileOpen(true)
              setPage('profile')
            }}
          />
        )}

        {page === 'book' && (
          <div style={{ maxWidth: 860 }}>
            <div className="card card-p">
              <BookingWizard
                user={currentUser}
                onDone={() => navigate('my-bookings')}
                onCancel={() => navigate('home')}
              />
            </div>
          </div>
        )}

        {page === 'my-bookings' && <MyBookings onNavigate={navigate} />}
        {page === 'services'    && <Services   onNavigate={navigate} />}

        {page === 'profile' && (
          <Profile
            editModalOpen={editProfileOpen}
            onCloseEditModal={(open) => {
              // if called with true, open the modal; otherwise close it
              setEditProfileOpen(open === true)
            }}
          />
        )}
      </AppLayout>
    </>
  )
}
