'use client'

import { useEffect, useState } from 'react'

/** Appears once you are well down the page. Returns you to the hero. */
export default function BackToTop() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setShown(window.scrollY > window.innerHeight * 1.5)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <button
      type="button"
      className={shown ? 'back-to-top is-shown' : 'back-to-top'}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}
