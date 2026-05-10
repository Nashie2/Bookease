// ============================================================
//  Landing Page
// ============================================================

const FEATURES = [
  { icon: '📅', title: 'Smart Scheduling',     desc: 'Real-time slot availability with conflict detection and instant confirmation.' },
  { icon: '🔐', title: 'Dual Portals',          desc: 'Separate, secure logins for administrators and customers — each beautifully tailored.' },
  { icon: '📊', title: 'Live Analytics',         desc: 'Revenue tracking, booking trends, and customer insights updated in real time.' },
  { icon: '👥', title: 'Customer CRM',           desc: 'Full customer profiles with booking history, preferences, and spend summaries.' },
  { icon: '🔔', title: 'Instant Confirmations',  desc: 'Automatic confirmations and reminders that reduce no-shows and improve trust.' },
  { icon: '📱', title: 'Fully Responsive',       desc: 'A beautiful, functional experience on every device — from desktop to mobile.' },
]

export default function Landing({ onGoAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 48px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, background: 'var(--teal)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>✦</div>
          BookEase
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ color: 'rgba(255,255,255,.55)' }} onClick={() => onGoAuth('user')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => onGoAuth('user')}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '60px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,122,110,.2) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(26,122,110,.5)', color: '#5dd4c4', fontSize: '0.73rem', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 26, background: 'rgba(26,122,110,.08)', animation: 'fadeUp .6s ease .1s both' }}
        >
          ✦ Platform-Based Booking System
        </div>

        <h1
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)', fontWeight: 400, lineHeight: 1.07, letterSpacing: '-0.025em', marginBottom: 20, animation: 'fadeUp .7s ease .2s both' }}
        >
          Book services with<br />
          <em style={{ fontStyle: 'italic', color: '#5dd4c4' }}>effortless precision</em>
        </h1>

        <p
          style={{ fontSize: '1rem', color: 'rgba(255,255,255,.5)', maxWidth: 520, lineHeight: 1.75, marginBottom: 38, animation: 'fadeUp .7s ease .3s both' }}
        >
          A modern booking platform connecting customers with service providers. Schedule appointments, track bookings, and grow your business — all in one elegant interface.
        </p>

        <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp .7s ease .4s both' }}>
          <button className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 30px' }} onClick={() => onGoAuth('user')}>
            Book an Appointment
          </button>
          <button
            className="btn btn-outline"
            style={{ color: 'rgba(255,255,255,.65)', borderColor: 'rgba(255,255,255,.18)', fontSize: '0.95rem', padding: '13px 30px' }}
            onClick={() => onGoAuth('admin')}
          >
            Admin Portal →
          </button>
        </div>
      </div>

      {/* ── Features ──────────────────────────────────────── */}
      <div style={{ padding: '72px 48px', background: '#111410', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#fff', marginBottom: 8 }}>
            Everything your business needs
          </div>
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.85rem' }}>
            Powerful tools for customers and administrators alike
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 22, maxWidth: 900, margin: '0 auto' }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{ padding: 24, border: '1px solid rgba(255,255,255,.07)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,.02)', transition: 'var(--transition)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(26,122,110,.4)'; e.currentTarget.style.background = 'rgba(26,122,110,.06)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'rgba(255,255,255,.02)'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ fontSize: '1.7rem', marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,.4)', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div style={{ padding: '24px 48px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'var(--teal)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>✦</div>
          BookEase
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.25)' }}>© 2025 BookEase Platform · All rights reserved</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => onGoAuth('user')}>Customer Login</button>
          <button className="btn btn-ghost" style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.75rem', padding: '5px 10px' }} onClick={() => onGoAuth('admin')}>Admin Login</button>
        </div>
      </div>
    </div>
  )
}
