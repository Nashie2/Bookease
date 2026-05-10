// ============================================================
//  Admin Dashboard
// ============================================================

import { useState, useEffect } from 'react'
import { useApp }      from '../../context/AppContext'
import { toast }       from '../../hooks/useToast'
import StatCard        from '../../components/ui/StatCard'
import BarChart        from '../../components/ui/BarChart'
import Badge           from '../../components/ui/Badge'
import Avatar          from '../../components/ui/Avatar'
import { formatDate, formatAmount, fullName, initials } from '../../utils/helpers'

export default function Dashboard({ onNavigate }) {
  const { db, dispatch } = useApp()
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Stats ────────────────────────────────────────────────
  const total     = db.bookings.length
  const confirmed = db.bookings.filter((b) => b.status === 'confirmed').length
  const pending   = db.bookings.filter((b) => b.status === 'pending').length
  const revenue   = db.bookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + b.amount, 0)

  // ── Weekly chart ─────────────────────────────────────────
  const now = new Date()
  const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    return {
      label: DAY_NAMES[d.getDay()],
      value: db.bookings.filter((b) => b.date === dateStr).length,
    }
  })

  // ── Today's schedule ─────────────────────────────────────
  const todayStr = now.toISOString().slice(0, 10)
  const todayBookings = db.bookings
    .filter((b) => b.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time))

  // ── Recent bookings ───────────────────────────────────────
  const recent = [...db.bookings]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5)

  const greeting =
    clock.getHours() < 12 ? 'Good morning'
    : clock.getHours() < 17 ? 'Good afternoon'
    : 'Good evening'

  return (
    <div className="fade-up">
      {/* Greeting */}
      <div className="mb-24">
        <div className="font-display" style={{ fontSize: '1.75rem', marginBottom: 3 }}>
          {greeting} ✦
        </div>
        <div className="text-muted text-small">
          {clock.toLocaleString('en-PH', {
            weekday: 'long', month: 'long', day: 'numeric',
            year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Bookings" value={total}          icon="📅" color="var(--teal)"  bg="var(--teal-dim)"  delta="+12% this month" deltaUp onClick={() => onNavigate('bookings')} />
        <StatCard label="Confirmed"      value={confirmed}      icon="✓"  color="var(--sky)"   bg="var(--sky-dim)"   delta="+8% this week"   deltaUp onClick={() => onNavigate('bookings')} />
        <StatCard label="Revenue"        value={formatAmount(revenue)} icon="₱" color="var(--amber)" bg="var(--amber-dim)" delta="Total earned"     deltaUp />
        <StatCard label="Pending"        value={pending}        icon="⏰" color="var(--rose)"  bg="var(--rose-dim)"  delta={`${pending} need action`} />
      </div>

      <div className="grid-2 mb-20">
        {/* Weekly chart */}
        <div className="card card-p">
          <div className="section-header">
            <div>
              <div className="section-title">Weekly Bookings</div>
              <div className="section-subtitle">Last 7 days</div>
            </div>
          </div>
          <BarChart data={weekData} accentIndex={6} />
        </div>

        {/* Today schedule */}
        <div className="card card-p">
          <div className="section-header">
            <div>
              <div className="section-title">Today's Schedule</div>
              <div className="section-subtitle">{formatDate(todayStr)}</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('bookings')}>
              + Book
            </button>
          </div>

          {todayBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '22px 0', color: 'var(--ink-3)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>☀️</div>
              <div>No bookings today</div>
            </div>
          ) : (
            todayBookings.map((b) => {
              const svc = db.services.find((s) => s.id === b.serviceId)
              const usr = db.users.find((u) => u.id === b.userId)
              return (
                <div
                  key={b.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--border)' }}
                >
                  <div style={{ width: 46, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.85rem' }}>{b.time}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{svc?.name}</div>
                    <div className="text-muted text-xs">{fullName(usr)}</div>
                  </div>
                  <Badge status={b.status} />
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Recent bookings table */}
      <div className="card card-p">
        <div className="section-header">
          <div className="section-title">Recent Bookings</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('bookings')}>
            View all →
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Service</th>
                <th>Date &amp; Time</th><th>Status</th><th>Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => {
                const svc = db.services.find((s) => s.id === b.serviceId)
                const usr = db.users.find((u) => u.id === b.userId)
                return (
                  <tr key={b.id}>
                    <td className="td-mono">{b.id}</td>
                    <td>
                      <div className="flex-center">
                        <Avatar user={usr} size="sm" />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{fullName(usr)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {svc?.icon?.startsWith('http') || svc?.icon?.startsWith('data:image') ? (
                          <img src={svc.icon} alt="" style={{ width: 14, height: 14, borderRadius: '2px', objectFit: 'cover' }} />
                        ) : (
                          <span>{svc?.icon || '⚙️'}</span>
                        )}
                        {svc?.name}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(b.date)} · {b.time}</td>
                    <td><Badge status={b.status} /></td>
                    <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{formatAmount(b.amount)}</td>
                    <td>
                      <div className="flex-center">
                        {b.status === 'pending' && (
                          <button
                            className="btn btn-success btn-xs"
                            onClick={() => {
                              dispatch({ type: 'UPDATE_BOOKING', id: b.id, payload: { status: 'confirmed' } })
                              toast('Booking confirmed!')
                            }}
                          >
                            Confirm
                          </button>
                        )}
                        {!['cancelled', 'completed'].includes(b.status) && (
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => {
                              dispatch({ type: 'UPDATE_BOOKING', id: b.id, payload: { status: 'cancelled' } })
                              toast('Booking cancelled', 'error')
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
