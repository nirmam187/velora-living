'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * One IntersectionObserver for the whole page rather than one per element.
 *
 * There are around twenty reveals on the homepage. Constructing an observer each
 * carried a measurable cost during hydration, which lands squarely in the hero
 * image's render delay. A single shared observer with a lookup from element to
 * callback does the same job for a fraction of the work.
 *
 * The observer is created lazily on first use, so it never runs on the server.
 */
type RevealCallback = () => void

let sharedObserver: IntersectionObserver | null = null
const callbacks = new WeakMap<Element, RevealCallback>()

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const run = callbacks.get(entry.target)
          if (run) {
            callbacks.delete(entry.target)
            sharedObserver?.unobserve(entry.target)
            run()
          }
        }
      },
      { threshold: 0.15 },
    )
  }
  return sharedObserver
}

export function observeOnce(element: Element, onEnter: RevealCallback): () => void {
  const observer = getObserver()
  if (!observer) {
    // No IntersectionObserver: show immediately rather than leave content hidden.
    onEnter()
    return () => {}
  }
  callbacks.set(element, onEnter)
  observer.observe(element)
  return () => {
    callbacks.delete(element)
    observer.unobserve(element)
  }
}

interface RevealProps {
  /** Classes applied alongside `reveal`, e.g. "sec-head" or "promise-grid". */
  className?: string
  children: ReactNode
  style?: React.CSSProperties
  id?: string
}

/**
 * Fades a block up as it scrolls into view — the same effect the original site
 * produced with a single IntersectionObserver over every `.reveal` element.
 *
 * Children are rendered untouched, so server components can be passed straight
 * through; only this wrapper ships to the browser.
 */
export default function Reveal({ className = '', children, style, id }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeOnce(el, () => setInView(true))
  }, [])

  const classes = ['reveal', className, inView ? 'in' : ''].filter(Boolean).join(' ')

  return (
    <div ref={ref} id={id} className={classes} style={style}>
      {children}
    </div>
  )
}
