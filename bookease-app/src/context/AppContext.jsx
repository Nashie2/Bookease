// ============================================================
//  APP CONTEXT — DB state, auth state, and dispatch
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import { loadSession, saveSession, clearSession, createToken } from '../utils/auth'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [db, setDb] = useState({ services: [], bookings: [], settings: {}, users: [] })
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoaded, setAuthLoaded]   = useState(false)
  const [dbLoaded, setDbLoaded] = useState(false)

  // Initial load
  useEffect(() => {
    async function init() {
      // 1. Fetch DB state
      try {
        const [servRes, bookRes, setRes, userRes] = await Promise.all([
          fetch('http://localhost:5000/api/services'),
          fetch('http://localhost:5000/api/bookings'),
          fetch('http://localhost:5000/api/settings'),
          fetch('http://localhost:5000/api/users')
        ])
        
        const services = servRes.ok ? await servRes.json() : []
        const bookings = bookRes.ok ? await bookRes.json() : []
        const settings = setRes.ok ? await setRes.json() : {}
        const users = userRes.ok ? await userRes.json() : []

        setDb({ services, bookings, settings, users })
      } catch (err) {
        console.error("Failed to fetch initial DB state", err)
      }
      setDbLoaded(true)

      // 2. Restore session
      const session = loadSession()
      if (session) {
        try {
          const res = await fetch(`http://localhost:5000/api/users/${session.userId}`);
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
          } else {
            clearSession();
          }
        } catch (e) {
          console.error("Failed to restore session from backend", e);
        }
      }
      setAuthLoaded(true)
    }
    init()
  }, [])

  function login(user) {
    const token = createToken(user)
    saveSession(user.id, token)
    setCurrentUser(user)
  }

  function logout() {
    clearSession()
    setCurrentUser(null)
  }

  // Intercept dispatches and route to backend
  async function apiDispatch(action) {
    try {
      switch (action.type) {
        case 'ADD_BOOKING':
          await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          setDb(prev => ({ ...prev, bookings: [...prev.bookings, action.payload] }))
          break
        case 'UPDATE_BOOKING':
          await fetch(`http://localhost:5000/api/bookings/${action.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          setDb(prev => ({ ...prev, bookings: prev.bookings.map(b => b.id === action.id ? { ...b, ...action.payload } : b) }))
          break
        case 'DELETE_BOOKING':
          await fetch(`http://localhost:5000/api/bookings/${action.id}`, { method: 'DELETE' })
          setDb(prev => ({ ...prev, bookings: prev.bookings.filter(b => b.id !== action.id) }))
          break

        case 'ADD_SERVICE':
          await fetch('http://localhost:5000/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          setDb(prev => ({ ...prev, services: [...prev.services, action.payload] }))
          break
        case 'UPDATE_SERVICE':
          await fetch(`http://localhost:5000/api/services/${action.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          setDb(prev => ({ ...prev, services: prev.services.map(s => s.id === action.id ? { ...s, ...action.payload } : s) }))
          break
        case 'DELETE_SERVICE':
          await fetch(`http://localhost:5000/api/services/${action.id}`, { method: 'DELETE' })
          setDb(prev => ({ ...prev, services: prev.services.filter(s => s.id !== action.id) }))
          break

        case 'UPDATE_USER':
          await fetch(`http://localhost:5000/api/users/${action.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload)
          })
          setDb(prev => ({ ...prev, users: prev.users.map(u => u.id === action.id ? { ...u, ...action.payload } : u) }))
          if (currentUser?.id === action.id) {
            setCurrentUser(prev => ({ ...prev, ...action.payload }))
          }
          break
          
        case 'UPDATE_SETTINGS':
          await fetch('http://localhost:5000/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...db.settings, ...action.payload })
          })
          setDb(prev => ({ ...prev, settings: { ...prev.settings, ...action.payload } }))
          break
          
        case 'ADD_USER':
          setDb(prev => ({ ...prev, users: [...prev.users, action.payload] }))
          break
      }
    } catch (err) {
      console.error("Dispatch API Error:", err)
    }
  }

  // Show a loading screen until both DB and Auth are loaded
  if (!dbLoaded || !authLoaded) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading BookEase...</div>
  }

  return (
    <AppContext.Provider value={{ db, dispatch: apiDispatch, currentUser, login, logout, authLoaded }}>
      {children}
    </AppContext.Provider>
  )
}

/** Convenience hook */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
