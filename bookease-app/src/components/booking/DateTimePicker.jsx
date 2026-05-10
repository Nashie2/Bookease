// ============================================================
//  DateTimePicker — Booking wizard step 2
// ============================================================

import { useApp } from '../../context/AppContext'
import { TIME_SLOTS, formatAmount, todayStr } from '../../utils/helpers'

export default function DateTimePicker({
  serviceId,
  date,
  time,
  notes,
  onDateChange,
  onTimeChange,
  onNotesChange,
  onBack,
  onNext,
}) {
  const { db } = useApp()
  const svc = db.services.find((s) => s.id === serviceId)

  const takenSlots = db.bookings
    .filter((b) => b.date === date && b.serviceId === serviceId && b.status !== 'cancelled')
    .map((b) => b.time)

  return (
    <div className="fade-up">
      <div className="mb-20">
        <div className="font-display" style={{ fontSize: '1.2rem', marginBottom: 4 }}>
          Pick a date &amp; time
        </div>
        <p className="text-muted text-small">
          {svc?.icon} {svc?.name} · {formatAmount(svc?.price)} · {svc?.duration} min
        </p>
      </div>

      {/* Date */}
      <div className="field" style={{ maxWidth: 240 }}>
        <label className="field-label">
          Date <span className="req">*</span>
        </label>
        <input
          type="date"
          className="input"
          value={date}
          min={todayStr()}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      {/* Time slots */}
      <div className="field">
        <label className="field-label">Available Time Slots</label>
        <div className="time-slots-grid">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot}
              className={[
                'time-slot',
                takenSlots.includes(slot) ? 'taken' : '',
                time === slot ? 'selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => !takenSlots.includes(slot) && onTimeChange(slot)}
            >
              {slot}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="field">
        <label className="field-label">
          Notes{' '}
          <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--ink-4)' }}>
            (optional)
          </span>
        </label>
        <textarea
          className="textarea"
          placeholder="Special requests or notes for your appointment…"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>

      <div className="flex-between" style={{ marginTop: 18 }}>
        <button className="btn btn-outline" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          disabled={!date || !time}
          onClick={onNext}
        >
          Review Booking →
        </button>
      </div>
    </div>
  )
}
