"use client"

import { useEffect, useRef, useState } from 'react'

interface Props {
  className?: string
  text: string
  scramble_set?: string[]
}

const default_set = ['!', '<', '-', '\\', '^', '*', '}', '|', '.', ',', ':', ';', '/', '?', '>', '~', '+', '=', '_', '@', '#', '$', '%', '&', '(', ')', '[', ']', '{', '}']

export default function TextTyper({ className, text, scramble_set = default_set }: Props) {
  const [displayText, setDisplayText] = useState(text)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function scramble() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    let iterations = 0
    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iterations) return text[index]
            return scramble_set[Math.floor(Math.random() * scramble_set.length)]
          })
          .join('')
      )
      if (iterations >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
      iterations += 1 / 3
    }, 30)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <span
      className={className}
      onMouseEnter={scramble}
    >
      {displayText}
    </span>
  )
}
