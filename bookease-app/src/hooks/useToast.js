// ============================================================
//  TOAST HOOK — Simple notification queue
// ============================================================

import { useState, useCallback } from 'react'

let _addToast = () => {}
export const toast = (message, type = 'success') => _addToast(message, type)

export function useToastQueue() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3800)
  }, [])

  // Expose addToast globally so non-component code can call toast()
  _addToast = addToast

  return { toasts }
}
