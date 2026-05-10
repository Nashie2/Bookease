// ============================================================
//  User — Profile page  (view + edit modal)
// ============================================================

import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { toast } from '../../hooks/useToast'
import Modal from '../../components/ui/Modal'
import { formatDate, formatAmount, fullName, initials } from '../../utils/helpers'
import { Edit2, Camera } from 'lucide-react'
import Avatar from '../../components/ui/Avatar'

export default function Profile({ editModalOpen, onCloseEditModal }) {
  const { db, dispatch, currentUser } = useApp()

  const [form, setForm] = useState({
    first: currentUser.first,
    last: currentUser.last,
    phone: currentUser.phone ?? '',
    curPwd: '',
    newPwd: '',
  })

  const myBookings = db.bookings.filter((b) => b.userId === currentUser.id)
  const spent = myBookings
    .filter((b) => ['confirmed', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + b.amount, 0)

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast('Image must be less than 10mb', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      dispatch({
        type: 'UPDATE_USER',
        id: currentUser.id,
        payload: { avatar: event.target.result }
      })
      toast('Profile photo updated!')
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (form.newPwd) {
      if (form.newPwd.length < 6) { toast('Password must be at least 6 characters', 'error'); return }
      if (form.curPwd !== currentUser.password) { toast('Current password is incorrect', 'error'); return }
    }

    dispatch({
      type: 'UPDATE_USER',
      id: currentUser.id,
      payload: {
        first: form.first,
        last: form.last,
        phone: form.phone,
        ...(form.newPwd ? { password: form.newPwd } : {}),
      },
    })

    toast('Profile updated')
    onCloseEditModal()
  }

  const details = [
    ['Email', currentUser.email],
    ['Phone', currentUser.phone ?? '—'],
    ['Member since', formatDate(currentUser.created)],
    ['Total bookings', myBookings.length],
    ['Total spent', formatAmount(spent)],
  ]

  return (
    <div className="fade-up" style={{ maxWidth: 560 }}>
      <div className="section-header">
        <div className="section-title">My Profile</div>
      </div>

      <div className="card card-p mb-16">
        {/* Avatar + name */}
        <div className="flex-center mb-20" style={{ gap: 18 }}>
          <div style={{ position: 'relative' }}>
            <Avatar user={currentUser} size="lg" />
            <label style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--surface)', padding: 6, borderRadius: '50%', cursor: 'pointer', border: '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex' }}>
              <Camera size={14} color="var(--ink-3)" />
              <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
            </label>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.4rem' }}>{fullName(currentUser)}</div>
            <div className="text-muted text-small">{currentUser.email}</div>
            <span className="badge badge-user" style={{ marginTop: 6 }}>Customer</span>
          </div>
        </div>

        <div className="divider" />

        {/* Details list */}
        {details.map(([label, value]) => (
          <div
            key={label}
            style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.86rem' }}
          >
            <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
          </div>
        ))}

        <button className="btn btn-primary btn-sm flex-center" style={{ marginTop: 18, justifyContent: 'center' }} onClick={() => onCloseEditModal(true)}>
          <Edit2 size={14} style={{ marginRight: 4 }} /> Edit Profile
        </button>
      </div>

      {/* Edit modal — opened from parent or the button above */}
      <Modal
        open={editModalOpen}
        onClose={onCloseEditModal}
        title="Edit Profile"
        footer={
          <>
            <button className="btn btn-outline" onClick={onCloseEditModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </>
        }
      >
        <div className="form-row">
          <div className="field">
            <label className="field-label">First Name</label>
            <input className="input" value={form.first} onChange={(e) => setField('first', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Last Name</label>
            <input className="input" value={form.last} onChange={(e) => setField('last', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
        </div>

        <div className="divider" />
        <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 12 }}>Change Password (optional)</div>

        <div className="field">
          <label className="field-label">Current Password</label>
          <input type="password" className="input" placeholder="••••••••" value={form.curPwd} onChange={(e) => setField('curPwd', e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">New Password</label>
          <input type="password" className="input" placeholder="Min 6 characters" value={form.newPwd} onChange={(e) => setField('newPwd', e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}
