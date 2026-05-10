// ============================================================
//  HELPERS — Formatting, constants, and small utilities
// ============================================================

export const BOOKING_STATUSES = ['confirmed', 'pending', 'completed', 'cancelled', 'rescheduled']

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
]

export const SERVICE_CATEGORIES = [
  'Beauty & Wellness',
  'Health & Medical',
  'Fitness',
  'Professional',
  'Events',
  'Other',
]

export const SERVICE_DURATIONS = [
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '1 hour' },
  { value: 75,  label: '1 hr 15 min' },
  { value: 90,  label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' },
]

/** Format a date string (YYYY-MM-DD) for display */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return dateStr }
}

/** Format a peso amount */
export function formatAmount(amount) {
  return '₱' + Number(amount).toLocaleString()
}

/** Get full name from a user object */
export function fullName(user) {
  return user ? `${user.first} ${user.last}` : '—'
}

/** Get uppercase initials from a user object */
export function initials(user) {
  if (!user) return '?'
  return (user.first[0] + (user.last?.[0] ?? '')).toUpperCase()
}

/** Get today's date string YYYY-MM-DD */
export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/** Generate a new booking ID given the next sequence number */
export function makeBookingId(nextBid) {
  return 'B' + String(nextBid).padStart(4, '0')
}

/** Return true if a booking is upcoming and actionable */
export function isActionable(booking) {
  return (
    ['confirmed', 'pending', 'rescheduled'].includes(booking.status) &&
    booking.date >= todayStr()
  )
}
