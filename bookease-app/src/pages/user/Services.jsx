// ============================================================
//  User — Browse Services page
// ============================================================

import { useApp } from '../../context/AppContext'
import { formatAmount } from '../../utils/helpers'
import { Clock, Star } from 'lucide-react'

export default function Services({ onNavigate }) {
  const { db } = useApp()
  const active = db.services.filter((s) => s.active)

  function renderIcon(icon) {
    if (!icon) return <Star size={32} strokeWidth={1.5} />
    if (icon.startsWith('http') || icon.startsWith('data:image')) {
      return <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
    }
    return <span style={{ fontSize: '2rem' }}>{icon}</span>
  }

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <div className="section-title">Available Services</div>
          <div className="section-subtitle">Click a service to book an appointment</div>
        </div>
      </div>

      <div className="services-grid">
        {active.map((svc) => (
          <div key={svc.id} className="service-card" onClick={() => onNavigate('book')}>
            <div className="service-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', overflow: 'hidden' }}>
              {renderIcon(svc.icon)}
            </div>
            <div className="service-body">
              <div className="service-name">{svc.name}</div>
              <p className="service-desc">{svc.desc}</p>
              <div className="service-footer" style={{ marginBottom: 12 }}>
                <span className="service-price">{formatAmount(svc.price)}</span>
                <span className="service-dur" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> {svc.duration} min
                </span>
              </div>
              <div className="flex-between">
                <span className="tag">{svc.cat}</span>
                <button className="btn btn-primary btn-sm">Book Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
