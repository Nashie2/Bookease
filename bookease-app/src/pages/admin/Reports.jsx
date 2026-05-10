// ============================================================
//  Admin — Reports & Analytics page
// ============================================================

import { useApp }       from '../../context/AppContext'
import StatCard         from '../../components/ui/StatCard'
import BarChart         from '../../components/ui/BarChart'
import ProgressBar      from '../../components/ui/ProgressBar'
import { BOOKING_STATUSES, formatAmount } from '../../utils/helpers'

const STATUS_COLORS = {
  confirmed:   'var(--teal)',
  pending:     'var(--amber)',
  completed:   'var(--sky)',
  cancelled:   'var(--rose)',
  rescheduled: '#7e56c8',
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Reports() {
  const { db } = useApp()

  // ── KPIs ─────────────────────────────────────────────────
  const completed = db.bookings.filter((b) => ['confirmed', 'completed'].includes(b.status))
  const revenue   = completed.reduce((sum, b) => sum + b.amount, 0)
  const avgValue  = completed.length ? Math.round(revenue / completed.length) : 0

  const cancelRate = db.bookings.length
    ? Math.round(db.bookings.filter((b) => b.status === 'cancelled').length / db.bookings.length * 100)
    : 0

  const uniqueCustomers = [...new Set(db.bookings.map((b) => b.userId))]
  const repeatRate = uniqueCustomers.length
    ? Math.round(uniqueCustomers.filter((id) => db.bookings.filter((b) => b.userId === id).length > 1).length / uniqueCustomers.length * 100)
    : 0

  // ── Monthly bookings (last 6 months) ─────────────────────
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(now)
    d.setMonth(d.getMonth() - (5 - i))
    const ym   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      label: MONTH_NAMES[d.getMonth()],
      value: db.bookings.filter((b) => b.date.startsWith(ym)).length,
    }
  })

  const total = db.bookings.length || 1

  const serviceData = db.services
    .map((s) => ({ ...s, count: db.bookings.filter((b) => b.serviceId === s.id).length }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="fade-up">
      <div className="section-header">
        <div className="section-title">Reports &amp; Analytics</div>
      </div>

      {/* KPIs */}
      <div className="stats-grid mb-20">
        <StatCard label="Total Revenue"      value={formatAmount(revenue)} icon="₱" color="var(--teal)"  bg="var(--teal-dim)" />
        <StatCard label="Avg Booking Value"  value={formatAmount(avgValue)} icon="📈" color="var(--sky)" bg="var(--sky-dim)" />
        <StatCard label="Repeat Customers"   value={`${repeatRate}%`} icon="🔄" color="var(--amber)" bg="var(--amber-dim)" />
        <StatCard label="Cancellation Rate"  value={`${cancelRate}%`} icon="❌" color="var(--rose)"  bg="var(--rose-dim)" />
      </div>

      <div className="grid-2 mb-20">
        {/* Monthly chart */}
        <div className="card card-p">
          <div className="section-title mb-16">Monthly Bookings</div>
          <BarChart data={monthlyData} height={150} accentIndex={5} />
        </div>

        {/* By service */}
        <div className="card card-p">
          <div className="section-title mb-16">Bookings by Service</div>
          {serviceData.map((s) => {
            const icon = s.icon?.startsWith('http') || s.icon?.startsWith('data:image') ? (
              <img src={s.icon} alt="" style={{ width: 14, height: 14, borderRadius: '2px', objectFit: 'cover' }} />
            ) : (
              <span>{s.icon || '⚙️'}</span>
            )
            const label = (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {icon} {s.name}
              </span>
            )
            return <ProgressBar key={s.id} label={label} value={s.count} total={total} />
          })}
        </div>
      </div>

      {/* Status distribution */}
      <div className="card card-p">
        <div className="section-title mb-16">Status Distribution</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {BOOKING_STATUSES.map((status) => {
            const count = db.bookings.filter((b) => b.status === status).length
            const pct   = Math.round((count / total) * 100)
            const color = STATUS_COLORS[status]
            return (
              <div
                key={status}
                style={{
                  flex: '1 1 130px',
                  background: `${color}10`,
                  border: `1px solid ${color}25`,
                  borderRadius: 'var(--radius)',
                  padding: '16px 18px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color, fontWeight: 400 }}>{count}</div>
                <div style={{ fontSize: '0.72rem', color, textTransform: 'capitalize', fontWeight: 700, marginTop: 2 }}>{status}</div>
                <div style={{ fontSize: '0.68rem', color, opacity: 0.65 }}>{pct}% of total</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
