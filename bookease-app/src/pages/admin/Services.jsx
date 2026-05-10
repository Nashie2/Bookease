// ============================================================
//  Admin — Services management page
// ============================================================

import { useState } from 'react'
import { useApp }   from '../../context/AppContext'
import { toast }    from '../../hooks/useToast'
import Modal        from '../../components/ui/Modal'
import Toggle       from '../../components/ui/Toggle'
import { SERVICE_CATEGORIES, SERVICE_DURATIONS, formatAmount } from '../../utils/helpers'
import { Camera } from 'lucide-react'

const EMPTY_FORM = { name: '', price: '', duration: '60', desc: '', cat: 'Beauty & Wellness', icon: '' }

export default function Services() {
  const { db, dispatch } = useApp()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState(null)   // null = adding new
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [errors,    setErrors]    = useState({})

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(svc) {
    setEditing(svc)
    setForm({ name: svc.name, price: String(svc.price), duration: String(svc.duration), desc: svc.desc, cat: svc.cat, icon: svc.icon })
    setErrors({})
    setModalOpen(true)
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast('Image must be less than 2MB', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => setField('icon', event.target.result)
    reader.readAsDataURL(file)
  }

  function renderIcon(icon) {
    if (!icon) return '⚙️'
    if (icon.startsWith('http') || icon.startsWith('data:image')) {
      return <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
    }
    return icon
  }

  function validate() {
    const e = {}
    if (!form.name.trim())                        e.name  = 'Required'
    if (!form.price || isNaN(+form.price) || +form.price <= 0) e.price = 'Valid price required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const payload = {
      name:     form.name.trim(),
      price:    +form.price,
      duration: +form.duration,
      desc:     form.desc,
      cat:      form.cat,
      icon:     form.icon || '⚙️',
    }
    if (editing) {
      dispatch({ type: 'UPDATE_SERVICE', id: editing.id, payload })
      toast('Service updated')
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: { id: 's' + Date.now(), ...payload, active: true } })
      toast('Service added')
    }
    setModalOpen(false)
  }

  function handleDelete(svc) {
    if (!confirm(`Delete "${svc.name}"?`)) return
    dispatch({ type: 'DELETE_SERVICE', id: svc.id })
    toast('Service deleted', 'error')
  }

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">Services</div>
          <div className="section-subtitle">{db.services.length} services listed</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Service</button>
      </div>

      <div className="services-grid">
        {db.services.map((svc) => (
          <div key={svc.id} className="service-card" style={{ cursor: 'default' }}>
            <div className="service-thumb">{renderIcon(svc.icon)}</div>
            <div className="service-body">
              <div className="flex-between mb-16" style={{ alignItems: 'flex-start' }}>
                <div className="service-name" style={{ flex: 1 }}>{svc.name}</div>
                <Toggle
                  on={svc.active}
                  onToggle={() => {
                    dispatch({ type: 'UPDATE_SERVICE', id: svc.id, payload: { active: !svc.active } })
                    toast(svc.active ? 'Service disabled' : 'Service enabled')
                  }}
                />
              </div>

              <p className="service-desc">{svc.desc}</p>

              <div className="service-footer" style={{ marginBottom: 12 }}>
                <span className="service-price">{formatAmount(svc.price)}</span>
                <span className="service-dur">⏱ {svc.duration} min</span>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className="tag">{svc.cat}</span>
                <span className={`badge ${svc.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                  {svc.active ? 'Active' : 'Inactive'}
                </span>
                <span className="tag">{db.bookings.filter((b) => b.serviceId === svc.id).length} bookings</span>
              </div>

              <div className="flex-center">
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(svc)}>✏ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(svc)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Service' : 'Add Service'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Service</button>
          </>
        }
      >
        <div className="field">
          <label className="field-label">Service Name <span className="req">*</span></label>
          <input className={`input${errors.name ? ' error' : ''}`} placeholder="e.g. Haircut & Style" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          {errors.name && <div className="field-error">⚠ {errors.name}</div>}
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label">Price (₱) <span className="req">*</span></label>
            <input type="number" className={`input${errors.price ? ' error' : ''}`} placeholder="500" value={form.price} onChange={(e) => setField('price', e.target.value)} />
            {errors.price && <div className="field-error">⚠ {errors.price}</div>}
          </div>
          <div className="field">
            <label className="field-label">Duration</label>
            <select className="select" value={form.duration} onChange={(e) => setField('duration', e.target.value)}>
              {SERVICE_DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Description</label>
          <textarea className="textarea" placeholder="Brief description…" value={form.desc} onChange={(e) => setField('desc', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label">Category</label>
            <select className="select" value={form.cat} onChange={(e) => setField('cat', e.target.value)}>
              {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Icon (Emoji or URL)</label>
            <div className="flex-center" style={{ gap: 8 }}>
              <input className="input" placeholder="✂️ or https://..." value={form.icon} onChange={(e) => setField('icon', e.target.value)} />
              <label className="btn btn-outline btn-sm flex-center" style={{ height: 42, padding: '0 12px', cursor: 'pointer' }}>
                <Camera size={16} />
                <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
