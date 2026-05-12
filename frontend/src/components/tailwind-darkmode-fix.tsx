"use client"

import { useEffect } from 'react'

export default function TailwindDarkmodeFix() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function handler(e: MediaQueryListEvent | MediaQueryList) {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return null
}
