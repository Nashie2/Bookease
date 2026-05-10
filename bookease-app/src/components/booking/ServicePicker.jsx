// ============================================================
//  ServicePicker — Booking wizard step 1
// ============================================================

import { useApp } from '../../context/AppContext'
import { formatAmount } from '../../utils/helpers'

export default function ServicePicker({ selectedId, onSelect, onNext, onCancel }) {
  const { db } = useApp()
  const activeServices = db.services.filter((s) => s.active)

  return (
    <div className="fade-up">
      <div className="mb-20">
        <div className="font-display" style={{ fontSize: '1.2rem', marginBottom: 4 }}>
          Choose a service
        </div>
        <p className="text-muted text-small">Select the service you'd like to book</p>
      </div>

      <div className="services-grid">
        {activeServices.map((svc) => (
          <div
            key={svc.id}
            className={`service-card${selectedId === svc.id ? ' selected' : ''}`}
            onClick={() => onSelect(svc.id)}
          >
            <div className="service-thumb">{svc.icon}</div>
            <div className="service-body">
              <div className="service-name">{svc.name}</div>
              <p className="service-desc">{svc.desc}</p>
              <div className="service-footer">
                <span className="service-price">{formatAmount(svc.price)}</span>
                <span className="service-dur">⏱ {svc.duration} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-between" style={{ marginTop: 24 }}>
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={!selectedId} onClick={onNext}>
          Next: Date &amp; Time →
        </button>
      </div>
    </div>
  )
}
