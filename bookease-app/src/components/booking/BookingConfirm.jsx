// ============================================================
//  BookingConfirm — Booking wizard step 3 (review & confirm)
// ============================================================

import { useApp } from '../../context/AppContext'
import { formatDate, formatAmount, fullName } from '../../utils/helpers'

export default function BookingConfirm({ serviceId, date, time, notes, user, onBack, onConfirm }) {
  const { db } = useApp()
  const svc = db.services.find((s) => s.id === serviceId)

  const details = [
    ['Service', `${svc?.icon} ${svc?.name}`],
    ['Price', formatAmount(svc?.price)],
    ['Date', formatDate(date)],
    ['Time', time],
    ['Duration', `${svc?.duration} min`],
    ['Name', fullName(user)],
  ]

  return (
    <div className="fade-up">
      <div className="mb-20">
        <div className="font-display" style={{ fontSize: '1.2rem', marginBottom: 4 }}>
          Review &amp; confirm
        </div>
        <p className="text-muted text-small">Please review your booking details below</p>
      </div>

      {/* Summary box */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 22,
          marginBottom: 18,
        }}
      >
        <div className="grid-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--ink-3)',
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{value}</div>
            </div>
          ))}
        </div>

        {notes && (
          <div
            style={{
              marginTop: 14,
              background: 'var(--surface)',
              padding: '10px 13px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              color: 'var(--ink-2)',
              borderLeft: '3px solid var(--teal)',
            }}
          >
            📝 {notes}
          </div>
        )}
      </div>

      <div className="flex-between">
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onConfirm}>✦ Confirm Booking</button>
      </div>
    </div>
  )
}
