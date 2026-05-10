// ============================================================
//  User — Home / overview page
// ============================================================

import { useApp }  from '../../context/AppContext'
import StatCard    from '../../components/ui/StatCard'
import Badge       from '../../components/ui/Badge'
import { formatDate, formatAmount, todayStr, isActionable } from '../../utils/helpers'
import { Calendar, ClipboardList, Tags, User, Clock, Inbox } from 'lucide-react'

export default function Home({ onNavigate, onOpenEditProfile }) {
  const { db, currentUser } = useApp()

  const myBookings = db.bookings.filter((b) => b.userId === currentUser.id)
  const upcoming   = myBookings.filter((b) => isActionable(b))
  const spent      = myBookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + b.amount, 0)

  const today = todayStr()

  const QUICK_ACTIONS = [
    { icon: <Calendar size={20} />, title: 'Book an appointment', desc: 'Browse and schedule services',   action: () => onNavigate('book') },
    { icon: <ClipboardList size={20} />, title: 'View my bookings',    desc: 'Manage your appointments',        action: () => onNavigate('my-bookings') },
    { icon: <Tags size={20} />, title: 'Browse services',     desc: 'See all available services',     action: () => onNavigate('services') },
    { icon: <User size={20} />, title: 'Edit my profile',     desc: 'Update your information',         action: onOpenEditProfile },
  ]

  return (
    <div className="fade-up">
      {/* Greeting */}
      <div className="mb-24">
        <div className="font-display" style={{ fontSize: '1.75rem', marginBottom: 3, fontWeight: 700 }}>
          Welcome back, {currentUser.first}
        </div>
        <div className="text-muted text-small">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard label="Total Bookings" value={myBookings.length} icon={<Calendar size={22} />} color="var(--teal)"  bg="var(--teal-dim)" />
        <StatCard label="Upcoming"       value={upcoming.length}   icon={<Clock size={22} />} color="var(--sky)"   bg="var(--sky-dim)"  />
        <StatCard label="Total Spent"    value={formatAmount(spent)} icon={<span style={{fontSize:'1.2rem'}}>₱</span>} color="var(--amber)" bg="var(--amber-dim)" />
      </div>

      <div className="grid-2">
        {/* Upcoming appointments */}
        <div className="card card-p">
          <div className="section-header">
            <div className="section-title">Upcoming Appointments</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('my-bookings')}>All →</button>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '22px 0' }}>
              <div style={{ color: 'var(--ink-4)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                <Inbox size={32} />
              </div>
              <div className="text-muted text-small">No upcoming bookings</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => onNavigate('book')}>
                Book Now
              </button>
            </div>
          ) : (
            upcoming.slice(0, 4).map((b) => {
              const svc = db.services.find((s) => s.id === b.serviceId)
              const d   = new Date(b.date + 'T00:00:00')
              return (
                <div
                  key={b.id}
                  style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}
                >
                  {/* Date badge */}
                  <div
                    style={{
                      width: 46,
                      textAlign: 'center',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '5px 4px',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)', textTransform: 'uppercase' }}>
                      {d.toLocaleDateString('en-PH', { month: 'short' })}
                    </div>
                    <div className="font-display" style={{ fontSize: '1.3rem', lineHeight: 1.1 }}>{d.getDate()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{svc?.name}</div>
                    <div className="text-muted text-xs">{b.time} · {formatAmount(b.amount)}</div>
                  </div>
                  <Badge status={b.status} />
                </div>
              )
            })
          )}
        </div>

        {/* Quick actions */}
        <div className="card card-p">
          <div className="section-title mb-16">Quick Actions</div>
          {QUICK_ACTIONS.map((a, i) => (
            <div
              key={i}
              onClick={a.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 13px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                marginBottom: 8,
                border: '1px solid var(--border)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--teal)'
                e.currentTarget.style.background  = 'rgba(26,122,110,.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background  = 'var(--surface-2)'
              }}
            >
              <div style={{ display: 'flex', color: 'var(--ink-3)', padding: '4px' }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{a.title}</div>
                <div className="text-xs text-muted">{a.desc}</div>
              </div>
              <span className="text-muted">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
