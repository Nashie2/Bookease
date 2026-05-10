// ============================================================
//  Admin — Customers management page
// ============================================================

import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import { toast }    from '../../hooks/useToast'
import Modal        from '../../components/ui/Modal'
import EmptyState   from '../../components/ui/EmptyState'
import Avatar       from '../../components/ui/Avatar'
import { formatDate, formatAmount, fullName, initials } from '../../utils/helpers'

export default function Customers() {
  const { db, dispatch } = useApp()

  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({ first: '', last: '', email: '', phone: '', password: '' })
  const [errors,  setErrors]  = useState({})

  const customers = db.users
    .filter((u) => u.role === 'user')
    .filter((u) => {
      if (!search) return true
      const q = search.toLowerCase()
      return fullName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })

  function openEdit(user) {
    setEditing(user)
    setForm({ first: user.first, last: user.last, email: user.email, phone: user.phone ?? '', password: '' })
    setErrors({})
    setModal(true)
  }

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }

  function handleSave() {
    const e = {}
    if (!form.first.trim()) e.first = 'Required'
    if (!form.last.trim())  e.last  = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    setErrors(e)
    if (Object.keys(e).length) return

    dispatch({
      type: 'UPDATE_USER',
      id:   editing.id,
      payload: {
        first: form.first,
        last:  form.last,
        email: form.email,
        phone: form.phone,
        ...(form.password ? { password: form.password } : {}),
      },
    })
    toast('Customer updated')
    setModal(false)
  }

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">Customers</div>
          <div className="section-subtitle">{db.users.filter((u) => u.role === 'user').length} registered</div>
        </div>
      </div>

      {/* Search */}
      <div className="card card-p mb-16" style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers…"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px 8px 30px', fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font-body)' }}
          />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Customer</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Spent</th></tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr><td colSpan={5}><EmptyState icon="◎" title="No customers found" /></td></tr>
            )}
            {customers.map((u) => {
              const bks   = db.bookings.filter((b) => b.userId === u.id)
              const spent = bks.reduce((sum, b) => sum + b.amount, 0)
              return (
                <tr key={u.id}>
                  <td>
                    <div className="flex-center">
                      <Avatar user={u} style={{ marginRight: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{fullName(u)}</span>
                    </div>
                  </td>
                  <td className="text-muted text-small">{u.email}</td>
                  <td className="text-muted text-small">{u.phone ?? '—'}</td>
                  <td style={{ fontWeight: 700 }}>{bks.length}</td>
                  <td style={{ fontWeight: 700, color: 'var(--teal)' }}>{formatAmount(spent)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Edit Customer"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="form-row">
          <div className="field">
            <label className="field-label">First Name</label>
            <input className={`input${errors.first ? ' error' : ''}`} value={form.first} onChange={(e) => setField('first', e.target.value)} />
            {errors.first && <div className="field-error">⚠ {errors.first}</div>}
          </div>
          <div className="field">
            <label className="field-label">Last Name</label>
            <input className={`input${errors.last ? ' error' : ''}`} value={form.last} onChange={(e) => setField('last', e.target.value)} />
            {errors.last && <div className="field-error">⚠ {errors.last}</div>}
          </div>
        </div>
        <div className="field">
          <label className="field-label">Email</label>
          <input type="email" className={`input${errors.email ? ' error' : ''}`} value={form.email} onChange={(e) => setField('email', e.target.value)} />
          {errors.email && <div className="field-error">⚠ {errors.email}</div>}
        </div>
        <div className="field">
          <label className="field-label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">
            New Password{' '}
            <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: 'var(--ink-4)' }}>(leave blank to keep)</span>
          </label>
          <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={(e) => setField('password', e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}
