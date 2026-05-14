// ============================================================
//  AuthScreen — Login + Registration for users and admins
// ============================================================

import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { toast } from '../hooks/useToast'
import { auth, googleProvider } from '../utils/firebase'
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'

const DEMO_ACCOUNTS = [

]

export default function AuthScreen({ hint, onBack }) {
  const { login, db } = useApp()

  const [isAdmin, setIsAdmin] = useState(hint === 'admin')
  const [tab, setTab] = useState('login')          // 'login' | 'register'
  const [form, setForm] = useState({ first: '', last: '', email: '', password: '', confirm: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // The redirect logic has been moved to AppContext.jsx to ensure it runs globally on load

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      // Use Popup instead of Redirect to prevent browser cookie blocking and page reloads
      const result = await signInWithPopup(auth, googleProvider);
      
      // Process the login immediately without waiting for a page reload
      const user = result.user;
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          first: user.displayName?.split(' ')[0] || 'User',
          last: user.displayName?.split(' ').slice(1).join(' ') || '',
          avatar: user.photoURL,
          role: 'user'
        })
      });

      if (res.ok) {
        const localUser = await res.json();
        toast(`Welcome back, ${localUser.first}! ✦`);
        login(localUser); // Instantly triggers redirect to UserPortal!
      } else {
        const errText = await res.text();
        console.error('Social login backend error:', errText);
        toast('Backend Error: ' + errText);
      }
    } catch (err) {
      console.error(err);
      toast(err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  }

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Password is required'

    if (tab === 'register') {
      if (!form.first.trim()) e.first = 'Required'
      if (!form.last.trim()) e.last = 'Required'
      if (form.password.length < 6) e.password = 'Minimum 6 characters'
      if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)

    try {
      if (tab === 'login') {
        // Login API call
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        })

        if (!res.ok) {
          const errData = await res.json()
          setErrors({ email: errData.error || 'Invalid email or password' })
          setLoading(false)
          return
        }

        const user = await res.json()

        if (isAdmin && user.role !== 'admin') {
          setErrors({ email: 'This account does not have admin access' })
          setLoading(false)
          return
        }

        toast(`Welcome back, ${user.first}! ✦`)
        login(user)
      } else {
        // Register API call
        if (isAdmin) {
          const adminCount = db.users.filter((u) => u.role === 'admin').length
          if (adminCount >= 2) {
            setErrors({ email: 'Administrator capacity reached (max 2 accounts)' })
            setLoading(false)
            return
          }
        }

        const newUserReq = {
          id: 'u' + Date.now(),
          first: form.first.trim(),
          last: form.last.trim(),
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: isAdmin ? 'admin' : 'user',
          created: new Date().toISOString().slice(0, 10),
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUserReq)
        })

        if (!res.ok) {
          const errData = await res.json()
          setErrors({ email: errData.error || 'Registration failed' })
          setLoading(false)
          return
        }

        const newUser = await res.json()

        toast(`Account created! Welcome, ${newUser.first}! ✦`)
        login(newUser)
      }
    } catch (err) {
      console.error(err)
      toast('Network error. Please make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  function switchRole(admin) {
    setIsAdmin(admin)
    setErrors({})
    if (admin) setTab('login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card scale-in" style={{ width: '100%', maxWidth: 420, overflow: 'hidden' }}>

        {/* Top band */}
        <div style={{ padding: '30px 32px 24px', background: 'var(--ink)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, background: 'var(--teal)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>✦</div>
            BookEase
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Online Booking Platform
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px 32px' }}>

          {/* Role tabs */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 22, border: '1px solid var(--border)' }}>
            {[['Customer', false], ['Administrator', true]].map(([label, admin]) => (
              <div
                key={label}
                onClick={() => switchRole(admin)}
                style={{
                  flex: 1, padding: 8, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)',
                  ...(isAdmin === admin
                    ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }
                    : { color: 'var(--ink-3)' }),
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Login / Register tabs */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 22, border: '1px solid var(--border)' }}>
            {[['Sign In', 'login'], ['Register', 'register']].map(([label, value]) => (
              <div
                key={value}
                onClick={() => { setTab(value); setErrors({}) }}
                style={{
                  flex: 1, padding: 8, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)',
                  ...(tab === value
                    ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }
                    : { color: 'var(--ink-3)' }),
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Register fields */}
          {tab === 'register' && (
            <div className="form-row">
              <div className="field">
                <label className="field-label">First Name <span className="req">*</span></label>
                <input className={`input${errors.first ? ' error' : ''}`} placeholder="Juan" value={form.first} onChange={(e) => setField('first', e.target.value)} />
                {errors.first && <div className="field-error">⚠ {errors.first}</div>}
              </div>
              <div className="field">
                <label className="field-label">Last Name <span className="req">*</span></label>
                <input className={`input${errors.last ? ' error' : ''}`} placeholder="dela Cruz" value={form.last} onChange={(e) => setField('last', e.target.value)} />
                {errors.last && <div className="field-error">⚠ {errors.last}</div>}
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">Email Address <span className="req">*</span></label>
            <input
              className={`input${errors.email ? ' error' : ''}`}
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          {tab === 'register' && (
            <div className="field">
              <label className="field-label">Phone</label>
              <input className="input" placeholder="+63 912 345 6789" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
          )}

          <div className="field">
            <label className="field-label">Password <span className="req">*</span></label>
            <input
              className={`input${errors.password ? ' error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          {tab === 'register' && (
            <div className="field">
              <label className="field-label">Confirm Password <span className="req">*</span></label>
              <input
                className={`input${errors.confirm ? ' error' : ''}`}
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setField('confirm', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {errors.confirm && <div className="field-error">⚠ {errors.confirm}</div>}
            </div>
          )}

          {/* Submit */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span className="spinner" />
              : isAdmin ? (tab === 'login' ? 'Sign In as Admin' : 'Register Admin')
                : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          {/* Demo accounts */}
          <div style={{ textAlign: 'center', fontSize: '0.73rem', color: 'var(--ink-4)', margin: '16px 0', position: 'relative' }}>
            <span style={{ background: 'var(--surface)', padding: '0 8px', position: 'relative', zIndex: 1 }}>OR CONTINUE WITH</span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)', zIndex: 0 }} />
          </div>

          <button
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', gap: 10, marginBottom: 14 }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.996 8.996 0 0 0 0 8.088l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                onClick={() => setForm((p) => ({ ...p, email: acc.email, password: acc.password }))}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)', border: '1.5px solid transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = 'rgba(26,122,110,.04)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--surface-2)' }}
              >
                <span style={{ fontSize: '1.2rem' }}>{acc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{acc.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ink-4)' }}>{acc.email} · {acc.password}</div>
                </div>
                <span className={`badge ${acc.badgeClass}`}>{acc.badge}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: '0.78rem' }}
            onClick={onBack}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
