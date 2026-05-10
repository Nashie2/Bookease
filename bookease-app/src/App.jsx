// ============================================================
//  App — root component
//  Handles top-level screen routing: landing → auth → portal
// ============================================================

import { useApp }    from './context/AppContext'
import ToastContainer from './components/ui/Toast'

import Landing     from './pages/Landing'
import AuthScreen  from './pages/AuthScreen'
import AdminPortal from './pages/AdminPortal'
import UserPortal  from './pages/UserPortal'

import { useState } from 'react'

export default function App() {
  const { currentUser, authLoaded } = useApp()
  const [screen,   setScreen]   = useState('landing')   // 'landing' | 'auth'
  const [authHint, setAuthHint] = useState('user')       // 'user' | 'admin'

  // Show nothing until session restore is complete (prevents flash)
  if (!authLoaded) return null

  // Authenticated — show the correct portal
  if (currentUser) {
    return (
      <>
        {currentUser.role === 'admin' ? <AdminPortal /> : <UserPortal />}
        <ToastContainer />
      </>
    )
  }

  // Not authenticated — public screens
  return (
    <>
      {screen === 'landing' && (
        <Landing
          onGoAuth={(role) => {
            setAuthHint(role)
            setScreen('auth')
          }}
        />
      )}

      {screen === 'auth' && (
        <AuthScreen
          hint={authHint}
          onBack={() => setScreen('landing')}
        />
      )}

      <ToastContainer />
    </>
  )
}
