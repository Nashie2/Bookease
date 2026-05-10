// ============================================================
//  Admin — Calendar page
// ============================================================

import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import Badge        from '../../components/ui/Badge'
import { formatDate, formatAmount, fullName, initials } from '../../utils/helpers'

export default function Calendar() {
  const { db } = useApp()
  const [current,    setCurrent]    = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const year  = current.getFullYear()
  const month = current.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const todayStr        = new Date().toISOString().slice(0, 10)

  // Build cell array
  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: daysInPrevMonth - firstDayOfWeek + i + 1, current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day:      d,
      current:  true,
      dateStr,
      bookings: db.bookings.filter((b) => b.date === dateStr),
    })
  }
  const trailing = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= trailing; i++) cells.push({ day: i, current: false })

  const selectedBookings = selectedDay
    ? db.bookings.filter((b) => b.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time))
    : []

  return (
    <div className="fade-up">
      {/* Nav */}
      <div className="section-header">
        <div className="section-title">Booking Calendar</div>
        <div className="flex-center">
          <button className="btn btn-outline btn-sm" onClick={() => setCurrent(new Date(year, month - 1, 1))}>← Prev</button>
          <span className="font-display" style={{ minWidth: 180, textAlign: 'center', fontSize: '1.05rem' }}>
            {current.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => setCurrent(new Date(year, month + 1, 1))}>Next →</button>
        </div>
      </div>

      {/* Grid */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
          {cells.map((cell, i) => (
            <div
              key={i}
              className={[
                'calendar-day',
                !cell.current        ? 'other-month' : '',
                cell.dateStr === todayStr ? 'today' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => cell.current && setSelectedDay(cell.dateStr)}
              style={{ cursor: cell.current ? 'pointer' : 'default' }}
            >
              {cell.dateStr === todayStr
                ? <div className="calendar-today-badge">{cell.day}</div>
                : <div className="calendar-day-num">{cell.day}</div>
              }
              {cell.bookings?.slice(0, 2).map((b) => {
                const svc = db.services.find((s) => s.id === b.serviceId)
                const cls = b.status === 'confirmed' ? 'ev-teal' : b.status === 'pending' ? 'ev-amber' : 'ev-sky'
                return (
                  <div key={b.id} className={`calendar-event ${cls}`}>
                    {b.time} {svc?.name?.split(' ')[0]}
                  </div>
                )
              })}
              {(cell.bookings?.length ?? 0) > 2 && (
                <div className="calendar-event" style={{ background: 'var(--surface-2)', color: 'var(--ink-4)' }}>
                  +{cell.bookings.length - 2}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="card card-p fade-in">
          <div className="section-header">
            <div>
              <div className="section-title">{formatDate(selectedDay)}</div>
              <div className="section-subtitle">{selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}</div>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setSelectedDay(null)}>✕</button>
          </div>

          {selectedBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink-3)' }}>📭 No bookings on this day</div>
          ) : (
            selectedBookings.map((b) => {
              const svc = db.services.find((s) => s.id === b.serviceId)
              const usr = db.users.find((u) => u.id === b.userId)
              return (
                <div
                  key={b.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}
                >
                  <div style={{ width: 50, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: 'var(--teal)' }}>{b.time}</span>
                  </div>
                  <div className="avatar avatar-sm">{initials(usr)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{svc?.icon} {svc?.name}</div>
                    <div className="text-xs text-muted">{fullName(usr)}</div>
                  </div>
                  <Badge status={b.status} />
                  <div style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.82rem' }}>{formatAmount(b.amount)}</div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
