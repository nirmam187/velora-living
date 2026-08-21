'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Product } from '@/data/products'
import { useRugViewer } from './RugViewerContext'

interface CollectionRowProps {
  products: Product[]
}

/** How far a pointer must travel before we treat it as a drag rather than a click. */
const DRAG_THRESHOLD = 6

export default function CollectionRow({ products }: CollectionRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { open } = useRugViewer()

  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [progress, setProgress] = useState(0)
  const [overflowing, setOverflowing] = useState(false)

  // Drag state is held in a ref so moving the pointer doesn't re-render.
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setOverflowing(max > 4)
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft >= max - 2)
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0)
  }, [])

  const codeKey = products.map((p) => p.code).join(',')

  // Changing a filter shrinks then regrows the row, and Chrome's scroll anchoring
  // reacts by pushing scrollLeft to the far end — so clearing a filter would leave
  // you looking at the last card. Reset to the start whenever the set changes,
  // which is also what you want after filtering.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = 0
    measure()
  }, [codeKey, measure])

  useEffect(() => {
    measure()
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [measure, products])

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.coll-card')
    // Fall back to most of a viewport if the row is somehow empty.
    const step = card ? card.offsetWidth + 22 : el.clientWidth * 0.8
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: step * direction, behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Left mouse button or touch only, and never on a real control.
    if (event.button !== 0) return
    const el = scrollRef.current
    if (!el) return
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return
    const el = scrollRef.current
    if (!el) return
    const dx = event.clientX - drag.current.startX
    if (!drag.current.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true
      el.setPointerCapture?.(event.pointerId)
    }
    if (drag.current.moved) {
      el.scrollLeft = drag.current.startScroll - dx
    }
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current
    if (el?.hasPointerCapture?.(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }
    drag.current.active = false
    // Cleared on the next tick so the click handler can still see that a drag
    // happened and suppress itself.
    window.setTimeout(() => {
      drag.current.moved = false
    }, 0)
  }

  const codes = products.map((p) => p.code)

  if (products.length === 0) {
    return (
      <p className="coll-empty">
        No rugs match that combination yet — clear a filter to see more.
      </p>
    )
  }

  return (
    <div className="coll-row">
      <div
        className={`coll-scroll${drag.current.active ? ' is-dragging' : ''}`}
        ref={scrollRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {products.map((product) => (
          // The trigger is an overlay button stretched across the whole card rather
          // than a <button> wrapping the content. A button may only contain phrasing
          // content, so wrapping would have forced the rug name from an <h3> down to
          // a <span> and cost the page sixteen real headings.
          <article className="coll-card" key={product.code}>
            <div className="coll-swatch">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                sizes="280px"
                loading="lazy"
                draggable={false}
              />
              <span className="coll-zoom" aria-hidden="true">
                View
              </span>
            </div>
            <div className="coll-info">
              <div className="num">{product.code}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
            <button
              type="button"
              className="coll-open"
              onClick={() => {
                // A drag that ended on this card must not also open it.
                if (drag.current.moved) return
                open(product.code, codes)
              }}
              aria-label={`View ${product.name}, ${product.code}`}
            />
          </article>
        ))}
      </div>

      {overflowing && (
        <div className="coll-controls">
          <div className="coll-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }} />
          </div>
          <div className="coll-arrows">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              aria-label="Scroll collection left"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              aria-label="Scroll collection right"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
