// ============================================================
//  Toast — notification container
// ============================================================

import { useToastQueue } from '../../hooks/useToast'

export default function ToastContainer() {
  const { toasts } = useToastQueue()

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
