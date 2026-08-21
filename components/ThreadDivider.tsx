'use client'

import { useEffect, useRef, useState } from 'react'
import { observeOnce } from './Reveal'

/**
 * The gold thread that draws itself across the page between the hero and the
 * collections. The stroke-dashoffset animation is held paused until the divider
 * scrolls into view, so it is never missed by someone arriving further down.
 */
export default function ThreadDivider() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeOnce(el, () => setInView(true))
  }, [])

  return (
    <div ref={ref} className={inView ? 'thread-divider in' : 'thread-divider'}>
      <svg
        viewBox="0 0 1280 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="thread-path"
          d="M0 30 Q 160 5, 320 30 T 640 30 T 960 30 T 1280 30"
          stroke="#B08A3E"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
    </div>
  )
}
