'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** Final value. Rendered verbatim if it isn't a plain number. */
  value: string
  durationMs?: number
}

/**
 * Counts a hero stat up from zero the first time it scrolls into view.
 *
 * Falls back to the final value immediately for anything non-numeric (the size
 * range "2×3′–12×15′") and for anyone who has asked for reduced motion. The
 * element reserves its final width with min-width, so the layout never shifts as
 * the digits change.
 */
export default function CountUp({ value, durationMs = 1100 }: CountUpProps) {
  const target = Number(value)
  const numeric = Number.isFinite(target) && value.trim() !== ''

  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(numeric ? 0 : null)

  useEffect(() => {
    if (!numeric) return
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setDisplay(target)
      return
    }

    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.disconnect()

          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs)
            // Ease-out cubic: fast at first, settling gently on the final number.
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.round(target * eased))
            if (t < 1) frame = requestAnimationFrame(tick)
          }
          frame = requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [numeric, target, durationMs])

  if (!numeric) return <span ref={ref}>{value}</span>

  return (
    // min-width reserves room for the final number so the row doesn't reflow as
    // digits are added. An earlier version rendered a hidden duplicate of the value
    // to do this, which made the element's text read "1616" to anything reading the
    // DOM rather than the pixels.
    <span
      ref={ref}
      className="countup"
      style={{ minWidth: `${value.length}ch` }}
    >
      {display}
    </span>
  )
}
