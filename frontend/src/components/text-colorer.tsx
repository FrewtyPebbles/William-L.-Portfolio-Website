"use client"

import { useEffect, useRef } from 'react'

interface Props {
  className?: string
  text: string
}

export default function TextColorer({ className, text }: Props) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const span = spanRef.current
      if (!span) return
      const rect = span.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2
      const dx = (x - cx) / cx
      const dy = (y - cy) / cy
      const hue = (Math.atan2(dy, dx) * 180) / Math.PI + 180
      span.style.color = `hsl(${hue}, 100%, 50%)`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <span ref={spanRef} className={className}>
      {text}
    </span>
  )
}
