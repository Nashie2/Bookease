// ============================================================
//  Admin — All Bookings page
// ============================================================

import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import { toast }    from '../../hooks/useToast'
import Modal        from '../../components/ui/Modal'
import Badge        from '../../components/ui/Badge'
import EmptyState   from '../../components/ui/EmptyState'
import Avatar       from '../../components/ui/Avatar'
import { BOOKING_STATUSES, formatDate, formatAmount, fullName, initials } from '../../utils/helpers'

export default function Bookings() {
  const { db, dispatch } = useApp()

  const [search,    setSearch]    = useState('')
  const [statusFilter,  setStatusFilter]  = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [viewing,   setViewing]   = useState(null)
  const [editStatus, setEditStatus] = useState('')

  // ── Filtered list ─────────────────────────────────────────
  const filtered = [...db.bookings]
    .sort((a, b) => b.id.localeCompare(a.id))
    .filter((b) => {
      if (statusFilter  && b.status    !== statusFilter)  return false
      if (serviceFilter && b.serviceId !== serviceFilter) return false
      if (search) {
        const q   = search.toLowerCase()
        const usr = db.users.find((u) => u.id === b.userId)
        const svc = db.services.find((s) => s.id === b.serviceId)
        return (
          fullName(usr).toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (svc?.name ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })

  // ── CSV export ────────────────────────────────────────────
  function exportCSV() {
    const header = ['ID', 'Customer', 'Email', 'Service', 'Date', 'Time', 'Status', 'Amount', 'Notes']
    const rows = db.bookings.map((b) => {
      const u = db.users.find((x) => x.id === b.userId)
      const s = db.services.find((x) => x.id === b.serviceId)
      return [b.id, fullName(u), u?.email ?? '', s?.name ?? '', b.date, b.time, b.status, b.amount, b.notes]
    })
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a   = document.createElement('a')
    a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'bookings_export.csv'
    a.click()
    toast('Exported bookings_export.csv')
  }

  function openView(booking) {
    setViewing(booking)
    setEditStatus(booking.status)
  }

  function saveStatus() {
    dispatch({ type: 'UPDATE_BOOKING', id: viewing.id, payload: { status: editStatus } })
    toast('Status updated')
    setViewing(null)
  }

  const viewSvc = viewing ? db.services.find((s) => s.id === viewing.serviceId) : null
  const viewUsr = viewing ? db.users.find((u) => u.id === viewing.userId)       : null

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">All Bookings</div>
          <div className="section-subtitle">{db.bookings.length} total bookings</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
      </div>

      {/* Filters */}
      <div className="card card-p mb-16" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', pointerEvents: 'none' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings…"
              style={{ width: '100%', paddingLeft: 30, background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px 8px 30px', fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font-body)' }}
            />
          </div>
          <select className="select" style={{ flex: '0 0 150px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="select" style={{ flex: '0 0 180px' }} value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
            <option value="">All Services</option>
            {db.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Amount</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8}><EmptyState icon="◈" title="No bookings found" /></td></tr>
            )}
            {filtered.map((b) => {
              const svc = db.services.find((s) => s.id === b.serviceId)
              const usr = db.users.find((u) => u.id === b.userId)
              return (
                <tr key={b.id}>
                  <td className="td-mono">{b.id}</td>
                  <td>
                    <div className="flex-center">
                      <Avatar user={usr} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{fullName(usr)}</div>
                        <div className="text-xs text-muted">{usr?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag">{svc?.icon} {svc?.name}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(b.date)}</td>
                  <td style={{ fontSize: '0.8rem' }}>{b.time}</td>
                  <td><Badge status={b.status} /></td>
                  <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{formatAmount(b.amount)}</td>
                  <td>
                    <div className="flex-center">
                      <button className="btn btn-outline btn-xs" onClick={() => openView(b)}>View</button>
                      {b.status === 'pending' && (
                        <button className="btn btn-success btn-xs" onClick={() => { dispatch({ type: 'UPDATE_BOOKING', id: b.id, payload: { status: 'confirmed' } }); toast('Confirmed!') }}>✓</button>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="btn btn-amber btn-xs" onClick={() => { dispatch({ type: 'UPDATE_BOOKING', id: b.id, payload: { status: 'completed' } }); toast('Marked complete!') }}>Done</button>
                      )}
                      {!['cancelled', 'completed'].includes(b.status) && (
                        <button className="btn btn-danger btn-xs" onClick={() => { dispatch({ type: 'UPDATE_BOOKING', id: b.id, payload: { status: 'cancelled' } }); toast('Cancelled', 'error') }}>✕</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Booking Details"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setViewing(null)}>Close</button>
            {viewing && !['cancelled', 'completed'].includes(viewing.status) && (
              <button className="btn btn-primary" onClick={saveStatus}>Save Status</button>
            )}
          </>
        }
      >
        {viewing && (
          <div>
            <div className="grid-2 mb-20">
              {[
                ['Booking ID', viewing.id],
                ['Created',    formatDate(viewing.created)],
                ['Service',    `${viewSvc?.icon ?? ''} ${viewSvc?.name ?? '—'}`],
                ['Amount',     formatAmount(viewing.amount)],
                ['Date',       formatDate(viewing.date)],
                ['Time',       viewing.time],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-3)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="flex-center mb-16">
              <Avatar user={viewUsr} />
              <div>
                <div style={{ fontWeight: 700 }}>{fullName(viewUsr)}</div>
                <div className="text-xs text-muted">{viewUsr?.email} · {viewUsr?.phone}</div>
              </div>
            </div>

            {viewing.notes && (
              <div className="info-box mb-16">
                <span>📝</span><span>{viewing.notes}</span>
              </div>
            )}

            {!['cancelled', 'completed'].includes(viewing.status) && (
              <div className="field">
                <label className="field-label">Update Status</label>
                <select className="select" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
