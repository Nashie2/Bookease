// ============================================================
//  DATABASE LAYER — localStorage persistence
//  Provides seed data, load/save helpers, and the db reducer
// ============================================================

const DB_KEY = 'bookease_db_v3'

// ── Seed data ─────────────────────────────────────────────────
function createSeedData() {
  const services = [
    { id: 's1', name: 'Haircut & Style',    price: 350, duration: 60,  desc: 'Professional cut and precision styling for all hair types.',              cat: 'Beauty & Wellness', icon: '✂️',  active: true },
    { id: 's2', name: 'Full Body Massage',  price: 800, duration: 90,  desc: 'Deep-tissue relaxation massage using premium essential oils.',             cat: 'Beauty & Wellness', icon: '💆',  active: true },
    { id: 's3', name: 'Dental Check-up',    price: 500, duration: 60,  desc: 'Comprehensive dental exam, cleaning and consultation.',                    cat: 'Health & Medical',  icon: '🦷',  active: true },
    { id: 's4', name: 'Yoga Session',       price: 400, duration: 60,  desc: 'Private or group yoga for all skill levels.',                             cat: 'Fitness',           icon: '🧘',  active: true },
    { id: 's5', name: 'Personal Training',  price: 700, duration: 60,  desc: 'One-on-one coaching and custom workout programming.',                      cat: 'Fitness',           icon: '🏋️', active: true },
    { id: 's6', name: 'Facial Treatment',   price: 600, duration: 75,  desc: 'Deep-cleansing facial with hydration and brightening treatment.',          cat: 'Beauty & Wellness', icon: '✨',  active: true },
  ]

  const users = [
    { id: 'u1', first: 'Admin',  last: 'User',      email: 'admin@bookease.com', password: 'admin123', role: 'admin', phone: '+63 912 000 0001', created: '2025-01-01' },
    { id: 'u2', first: 'Nash',  last: 'Vincent',    email: 'Nash@email.com',   password: 'user123',  role: 'user',  phone: '+63 912 111 2222', created: '2025-01-10' },
    { id: 'u3', first: 'Rovill',   last: 'Antivo', email: 'Rovill@email.com',    password: 'user123',  role: 'user',  phone: '+63 917 333 4444', created: '2025-02-01' },
    { id: 'u4', first: 'Jazrelle',    last: 'Ontoy',     email: 'Jazrelle@email.com',     password: 'user123',  role: 'user',  phone: '+63 926 555 6666', created: '2025-02-15' },
  ]

  const statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'completed', 'cancelled']
  const userIds  = ['u2', 'u3', 'u4']
  const prices   = { s1: 350, s2: 800, s3: 500, s4: 400, s5: 700, s6: 600 }
  const hours    = [9, 10, 11, 13, 14, 15, 16, 17]

  const bookings = services.flatMap((svc, si) =>
    Array.from({ length: 4 }, (_, i) => {
      const idx = si * 4 + i
      const d   = new Date()
      d.setDate(d.getDate() + Math.floor(Math.random() * 50) - 25)
      const h = hours[idx % hours.length]
      return {
        id:        'B' + String(idx + 1).padStart(4, '0'),
        serviceId: svc.id,
        userId:    userIds[idx % 3],
        date:      d.toISOString().slice(0, 10),
        time:      `${String(h).padStart(2, '0')}:00`,
        status:    statuses[idx % statuses.length],
        amount:    prices[svc.id],
        notes:     idx % 6 === 0 ? 'Please prepare materials in advance.' : '',
        created:   new Date(d.getTime() - 86400000 * 3).toISOString().slice(0, 10),
      }
    })
  ).sort((a, b) => a.date.localeCompare(b.date))

  const settings = {
    bizName:      'BookEase Platform',
    bizEmail:     'admin@bookease.com',
    bizPhone:     '+63 912 000 0001',
    bizAddress:   'Dapitan City, Zamboanga del Norte',
    advance:      30,
    cancelWindow: 24,
    emailOn:      true,
    smsOn:        false,
    payOn:        true,
    hours: [
      { day: 'Monday',    open: true,  start: '09:00', end: '18:00' },
      { day: 'Tuesday',   open: true,  start: '09:00', end: '18:00' },
      { day: 'Wednesday', open: true,  start: '09:00', end: '18:00' },
      { day: 'Thursday',  open: true,  start: '09:00', end: '18:00' },
      { day: 'Friday',    open: true,  start: '09:00', end: '17:00' },
      { day: 'Saturday',  open: true,  start: '10:00', end: '15:00' },
      { day: 'Sunday',    open: false, start: '10:00', end: '14:00' },
    ],
  }

  return { users, services, bookings, settings, nextBid: bookings.length + 1 }
}

// ── Persistence helpers ────────────────────────────────────────
export function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    return raw ? JSON.parse(raw) : createSeedData()
  } catch {
    return createSeedData()
  }
}

export function saveDB(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { /* quota exceeded */ }
}

// ── Reducer ────────────────────────────────────────────────────
export function dbReducer(state, action) {
  let next

  switch (action.type) {
    case 'ADD_BOOKING':
      next = { ...state, bookings: [...state.bookings, action.payload], nextBid: state.nextBid + 1 }
      break
    case 'UPDATE_BOOKING':
      next = { ...state, bookings: state.bookings.map(b => b.id === action.id ? { ...b, ...action.payload } : b) }
      break
    case 'DELETE_BOOKING':
      next = { ...state, bookings: state.bookings.filter(b => b.id !== action.id) }
      break
    case 'ADD_SERVICE':
      next = { ...state, services: [...state.services, action.payload] }
      break
    case 'UPDATE_SERVICE':
      next = { ...state, services: state.services.map(s => s.id === action.id ? { ...s, ...action.payload } : s) }
      break
    case 'DELETE_SERVICE':
      next = { ...state, services: state.services.filter(s => s.id !== action.id) }
      break
    case 'ADD_USER':
      next = { ...state, users: [...state.users, action.payload] }
      break
    case 'UPDATE_USER':
      next = { ...state, users: state.users.map(u => u.id === action.id ? { ...u, ...action.payload } : u) }
      break
    case 'UPDATE_SETTINGS':
      next = { ...state, settings: { ...state.settings, ...action.payload } }
      break
    default:
      return state
  }

  saveDB(next)
  return next
}
