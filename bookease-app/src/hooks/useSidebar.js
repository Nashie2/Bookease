// ============================================================
//  SIDEBAR HOOK — Responsive open/close state
// ============================================================

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) setIsOpen(true)
      else setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggle  = () => setIsOpen(v => !v)
  const close   = () => setIsOpen(false)

  return { isOpen, toggle, close }
}
