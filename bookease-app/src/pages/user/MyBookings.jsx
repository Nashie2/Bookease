// ============================================================
//  User — My Bookings page  (with cancel + reschedule modals)
// ============================================================

import { useState }  from 'react'
import { useApp }    from '../../context/AppContext'
import { toast }     from '../../hooks/useToast'
import Modal         from '../../components/ui/Modal'
import Badge         from '../../components/ui/Badge'
import EmptyState    from '../../components/ui/EmptyState'
import { TIME_SLOTS, formatDate, formatAmount, todayStr, isActionable } from '../../utils/helpers'
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

// ── Single booking row ──────────────────────────────────────
function BookingCard({ booking, onCancel, onReschedule }) {
  const { db } = useApp()
  const svc    = db.services.find((s) => s.id === booking.serviceId)
  const d      = new Date(booking.date + 'T00:00:00')
  const canAct = isActionable(booking)

  return (
    <div className="booking-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        {/* Date tile */}
        <div
          style={{
            width: 54,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '7px 5px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--ink-3)', letterSpacing: '0.05em' }}>
            {d.toLocaleDateString('en-PH', { month: 'short' })}
          </div>
          <div className="font-display" style={{ fontSize: '1.5rem', lineHeight: 1.1 }}>{d.getDate()}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--ink-3)' }}>
            {d.toLocaleDateString('en-PH', { weekday: 'short' })}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="flex-center mb-12" style={{ flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{svc?.name}</span>
            <Badge status={booking.status} />
          </div>
          <div className="flex-center text-xs text-muted" style={{ marginBottom: 3 }}>
            <Clock size={12} /> {booking.time} · {svc?.duration} min · <span style={{ fontFamily: 'monospace' }}>{booking.id}</span>
          </div>
          <div style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.88rem' }}>{formatAmount(booking.amount)}</div>
          {booking.notes && (
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 5 }}>
              "{booking.notes}"
            </div>
          )}
        </div>

        {/* Actions */}
        {canAct && (
          <div className="flex-center" style={{ flexShrink: 0, flexWrap: 'wrap', gap: 7 }}>
            <button className="btn btn-outline btn-sm" onClick={() => onReschedule(booking)}>Reschedule</button>
            <button className="btn btn-danger  btn-sm" onClick={() => onCancel(booking)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────
export default function MyBookings({ onNavigate }) {
  const { db, dispatch, currentUser } = useApp()

  const [cancelTarget,   setCancelTarget]   = useState(null)
  const [reschedTarget,  setReschedTarget]  = useState(null)
  const [newDate,        setNewDate]        = useState('')
  const [newTime,        setNewTime]        = useState('')

  const today = todayStr()
  const myBookings  = db.bookings.filter((b) => b.userId === currentUser.id).sort((a, b) => b.id.localeCompare(a.id))
  const upcoming    = myBookings.filter((b) => isActionable(b))
  const past        = myBookings.filter((b) => b.status === 'completed' || (b.date < today && b.status !== 'cancelled'))
  const cancelled   = myBookings.filter((b) => b.status === 'cancelled')

  function handleCancel() {
    dispatch({ type: 'UPDATE_BOOKING', id: cancelTarget.id, payload: { status: 'cancelled' } })
    toast('Booking cancelled', 'error')
    setCancelTarget(null)
  }

  function handleReschedule() {
    if (!newDate || !newTime) { toast('Please select a date and time', 'error'); return }
    dispatch({ type: 'UPDATE_BOOKING', id: reschedTarget.id, payload: { date: newDate, time: newTime, status: 'rescheduled' } })
    toast('Booking rescheduled ✦')
    setReschedTarget(null)
  }

  function openReschedule(booking) {
    setReschedTarget(booking)
    setNewDate(booking.date)
    setNewTime('')
  }

  // Taken slots for the reschedule picker
  const takenForResched = reschedTarget
    ? db.bookings
        .filter((b) => b.date === newDate && b.serviceId === reschedTarget.serviceId && b.status !== 'cancelled' && b.id !== reschedTarget.id)
        .map((b) => b.time)
    : []

  const GROUPS = [
    { label: <><Clock size={16} style={{marginRight: 6}} /> Upcoming</>, list: upcoming },
    { label: <><CheckCircle2 size={16} style={{marginRight: 6}} /> Completed</>, list: past },
    { label: <><XCircle size={16} style={{marginRight: 6}} /> Cancelled</>, list: cancelled },
  ]

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">My Bookings</div>
          <div className="section-subtitle">{myBookings.length} total</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('book')}>+ New Booking</button>
      </div>

      {GROUPS.map(({ label, list }) => (
        <div key={label} style={{ marginBottom: 28 }}>
          <div className="font-display flex-center" style={{ fontSize: '1.05rem', color: 'var(--ink-2)', marginBottom: 12, fontWeight: 600 }}>
            {label} ({list.length})
          </div>
          {list.length === 0
            ? <div className="text-muted text-small" style={{ padding: '10px 0' }}>None in this category.</div>
            : list.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={setCancelTarget}
                  onReschedule={openReschedule}
                />
              ))
          }
        </div>
      ))}

      {/* ── Cancel modal ──────────────────────────────────── */}
      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setCancelTarget(null)}>Keep It</button>
            <button className="btn btn-danger"  onClick={handleCancel}>Yes, Cancel</button>
          </>
        }
      >
        {cancelTarget && (
          <>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700 }}>
                {db.services.find((s) => s.id === cancelTarget.serviceId)?.name}
              </div>
              <div className="text-small text-muted" style={{ marginTop: 3 }}>
                {formatDate(cancelTarget.date)} at {cancelTarget.time}
              </div>
            </div>
            <div className="warn-box" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={16} /> This cannot be undone. You will need to rebook if you change your mind.
            </div>
          </>
        )}
      </Modal>

      {/* ── Reschedule modal ──────────────────────────────── */}
      <Modal
        open={!!reschedTarget}
        onClose={() => setReschedTarget(null)}
        title="Reschedule Booking"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setReschedTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleReschedule}>Confirm Reschedule</button>
          </>
        }
      >
        {reschedTarget && (
          <>
            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ fontWeight: 700 }}>
                {db.services.find((s) => s.id === reschedTarget.serviceId)?.name}
              </div>
              <div className="text-small text-muted" style={{ marginTop: 3 }}>
                Current: {formatDate(reschedTarget.date)} at {reschedTarget.time}
              </div>
            </div>

            <div className="field">
              <label className="field-label">New Date <span className="req">*</span></label>
              <input
                type="date"
                className="input"
                value={newDate}
                min={todayStr()}
                onChange={(e) => { setNewDate(e.target.value); setNewTime('') }}
              />
            </div>

            <div className="field">
              <label className="field-label">New Time <span className="req">*</span></label>
              <div className="time-slots-grid">
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className={[
                      'time-slot',
                      takenForResched.includes(slot) ? 'taken'    : '',
                      newTime === slot               ? 'selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => !takenForResched.includes(slot) && setNewTime(slot)}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
