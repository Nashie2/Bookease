// ============================================================
//  BookingWizard — multi-step booking flow orchestrator
// ============================================================

import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { toast } from '../../hooks/useToast'
import { makeBookingId, todayStr } from '../../utils/helpers'
import ServicePicker  from './ServicePicker'
import DateTimePicker from './DateTimePicker'
import BookingConfirm from './BookingConfirm'

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Date & Time' },
  { number: 3, label: 'Confirm' },
]

function WizardSteps({ current }) {
  return (
    <div className="wizard-steps">
      {STEPS.map((step, idx) => {
        const done   = current > step.number
        const active = current === step.number
        return (
          <span key={step.number} style={{ display: 'contents' }}>
            <div className={`wizard-step${done ? ' done' : active ? ' active' : ''}`}>
              <div className="wizard-circle">{done ? '✓' : step.number}</div>
              <div className="wizard-label">{step.label}</div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`wizard-line${done ? ' done' : ''}`} />
            )}
          </span>
        )
      })}
    </div>
  )
}

export default function BookingWizard({ user, onDone, onCancel }) {
  const { db, dispatch } = useApp()

  const [step,      setStep]      = useState(1)
  const [serviceId, setServiceId] = useState(null)
  const [date,      setDate]      = useState(todayStr())
  const [time,      setTime]      = useState(null)
  const [notes,     setNotes]     = useState('')

  function handleDateChange(newDate) {
    setDate(newDate)
    setTime(null)   // reset time when date changes
  }

  function handleConfirm() {
    const svc = db.services.find((s) => s.id === serviceId)
    // Generate a new ID based on current booking count or timestamp
    const nextBid = db.bookings.length > 0 
      ? Math.max(...db.bookings.map(b => parseInt(b.id.replace(/\D/g, '')) || 0)) + 1 
      : 1;
    const id  = makeBookingId(nextBid)

    dispatch({
      type:    'ADD_BOOKING',
      payload: {
        id,
        serviceId,
        userId:  user.id,
        date,
        time,
        status:  'confirmed',
        amount:  svc.price,
        notes,
        created: todayStr(),
      },
    })

    toast(`Booking ${id} confirmed! ✦`)
    onDone()
  }

  return (
    <div>
      <WizardSteps current={step} />

      {step === 1 && (
        <ServicePicker
          selectedId={serviceId}
          onSelect={setServiceId}
          onNext={() => setStep(2)}
          onCancel={onCancel}
        />
      )}

      {step === 2 && (
        <DateTimePicker
          serviceId={serviceId}
          date={date}
          time={time}
          notes={notes}
          onDateChange={handleDateChange}
          onTimeChange={setTime}
          onNotesChange={setNotes}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <BookingConfirm
          serviceId={serviceId}
          date={date}
          time={time}
          notes={notes}
          user={user}
          onBack={() => setStep(2)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
