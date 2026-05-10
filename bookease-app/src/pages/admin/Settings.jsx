// ============================================================
//  Admin — Settings page
// ============================================================

import { useState }  from 'react'
import { useApp }    from '../../context/AppContext'
import { toast }     from '../../hooks/useToast'
import Toggle        from '../../components/ui/Toggle'

export default function Settings() {
  const { db, dispatch } = useApp()
  const [form, setForm]  = useState({ ...db.settings })

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setHourField(idx, key, value) {
    setForm((prev) => ({
      ...prev,
      hours: prev.hours.map((h, i) => (i === idx ? { ...h, [key]: value } : h)),
    }))
  }

  function save() {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    toast('Settings saved ✦')
  }

  return (
    <div className="fade-up" style={{ maxWidth: 700 }}>
      <div className="section-header">
        <div className="section-title">Settings</div>
      </div>

      {/* ── Business Profile ──────────────────────────────── */}
      <div className="card card-p mb-16">
        <div className="font-display" style={{ fontSize: '1.05rem', marginBottom: 16 }}>
          Business Profile
        </div>

        <div className="form-row">
          <div className="field">
            <label className="field-label">Business Name</label>
            <input className="input" value={form.bizName} onChange={(e) => setField('bizName', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" type="email" value={form.bizEmail} onChange={(e) => setField('bizEmail', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Phone</label>
            <input className="input" value={form.bizPhone} onChange={(e) => setField('bizPhone', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Address</label>
            <input className="input" value={form.bizAddress} onChange={(e) => setField('bizAddress', e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={save}>Save Profile</button>
      </div>

      {/* ── Booking Rules ─────────────────────────────────── */}
      <div className="card card-p mb-16">
        <div className="font-display" style={{ fontSize: '1.05rem', marginBottom: 16 }}>
          Booking Rules
        </div>

        <div className="form-row mb-16">
          <div className="field">
            <label className="field-label">Advance Booking (days)</label>
            <input
              type="number"
              className="input"
              value={form.advance}
              onChange={(e) => setField('advance', +e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Cancellation Window (hrs)</label>
            <input
              type="number"
              className="input"
              value={form.cancelWindow}
              onChange={(e) => setField('cancelWindow', +e.target.value)}
            />
          </div>
        </div>

        {[
          { key: 'emailOn', label: 'Email Confirmations', desc: 'Send booking confirmation emails' },
          { key: 'smsOn',   label: 'SMS Reminders',       desc: 'Send reminders 24 h before appointment' },
          { key: 'payOn',   label: 'Online Payments',     desc: 'Accept card and e-wallet payments' },
        ].map(({ key, label, desc }) => (
          <div
            key={key}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderTop: '1px solid var(--border)' }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</div>
              <div className="text-xs text-muted">{desc}</div>
            </div>
            <Toggle on={form[key]} onToggle={() => setField(key, !form[key])} />
          </div>
        ))}

        <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={save}>
          Save Rules
        </button>
      </div>

      {/* ── Working Hours ─────────────────────────────────── */}
      <div className="card card-p">
        <div className="font-display" style={{ fontSize: '1.05rem', marginBottom: 16 }}>
          Working Hours
        </div>

        {form.hours.map((h, idx) => (
          <div
            key={h.day}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}
          >
            <div style={{ width: 90, fontWeight: 600, fontSize: '0.82rem', flexShrink: 0 }}>{h.day}</div>
            <Toggle on={h.open} onToggle={() => setHourField(idx, 'open', !h.open)} />
            {h.open ? (
              <div className="flex-center" style={{ gap: 8 }}>
                <input type="time" className="input" style={{ width: 110 }} value={h.start} onChange={(e) => setHourField(idx, 'start', e.target.value)} />
                <span className="text-muted text-small">to</span>
                <input type="time" className="input" style={{ width: 110 }} value={h.end}   onChange={(e) => setHourField(idx, 'end',   e.target.value)} />
              </div>
            ) : (
              <span className="text-muted text-small">Closed</span>
            )}
          </div>
        ))}

        <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={save}>
          Save Hours
        </button>
      </div>
    </div>
  )
}
