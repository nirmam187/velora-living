'use client'

import { useEffect, useState } from 'react'

/**
 * A hairline gold rule under the sticky header showing how far down the page you
 * are. Purely decorative, so it is hidden from assistive technology and does not
 * render at all for anyone who has asked for reduced motion.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnabled(true)

    let frame = 0
    const update = () => {
      frame = 0
      const max =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      // One update per frame at most — scroll fires far more often than that.
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  if (!enabled) return null

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
