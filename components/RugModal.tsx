'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRugViewer } from './RugViewerContext'
import { useEnquiry } from './EnquiryContext'
import { collections } from '@/data/products'
import { techniqueByName } from '@/data/craft'
import { sizeRange } from '@/data/sizes'

/** Elements that can hold focus, for the focus trap. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function RugModal() {
  const { current, scope, close, next, previous } = useRugViewer()
  const { openEnquiry } = useEnquiry()

  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  /** The element that had focus before opening, so it can be restored on close. */
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const isOpen = current !== null

  // Every photograph of this rug: the catalogue shot first, then room shots.
  const views = useMemo(() => {
    if (!current) return []
    return [
      { src: current.image, alt: current.alt },
      ...(current.styled ?? []).map((photo) => ({ src: photo.src, alt: photo.alt })),
    ]
  }, [current])

  const [viewIndex, setViewIndex] = useState(0)

  // Paging to another rug must start again on its catalogue shot.
  useEffect(() => {
    setViewIndex(0)
  }, [current?.code])

  const view = views[viewIndex] ?? views[0]

  // Remember what to give focus back to, and move focus into the dialog.
  useEffect(() => {
    if (!isOpen) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    // Defer so the panel exists before we focus it.
    const id = window.requestAnimationFrame(() => closeRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
    // Only on open, not on every rug change — paging shouldn't steal focus back.
  }, [isOpen])

  useEffect(() => {
    if (isOpen) return
    const target = returnFocusRef.current
    returnFocusRef.current = null
    target?.focus?.()
  }, [isOpen])

  // Lock the page behind the dialog without letting it jump: the scrollbar is
  // replaced by equivalent padding.
  useEffect(() => {
    if (!isOpen) return
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [isOpen])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        previous()
        return
      }
      if (event.key !== 'Tab') return

      // Focus trap — Tab cycles within the dialog.
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) return

      const first = items[0]!
      const last = items[items.length - 1]!

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [isOpen, close, next, previous],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onKeyDown])

  if (!current) return null

  const position = scope.indexOf(current.code)
  const collectionLabel =
    collections.find((c) => c.id === current.collection)?.label ?? ''
  const technique = techniqueByName(current.weave)

  return (
    <div
      className="rug-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rug-modal-title"
      onMouseDown={(event) => {
        // Only a click that starts and ends on the backdrop dismisses, so a drag
        // that finishes outside the panel doesn't close it accidentally.
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="rug-modal-panel" ref={panelRef}>
        <button
          type="button"
          className="rm-close"
          onClick={close}
          aria-label="Close"
          ref={closeRef}
        >
          <span aria-hidden="true">✕</span>
        </button>

        <div className="rm-visual">
          {view && (
            <Image
              key={view.src}
              src={view.src}
              alt={view.alt}
              fill
              sizes="(max-width: 860px) 100vw, 46vw"
              priority
            />
          )}

          {views.length > 1 && (
            <div className="rm-thumbs">
              {views.map((photo, index) => (
                <button
                  type="button"
                  key={photo.src}
                  className={`rm-thumb${index === viewIndex ? ' is-active' : ''}`}
                  onClick={() => setViewIndex(index)}
                  aria-label={
                    index === 0
                      ? `Show ${current.name} on its own`
                      : `Show ${current.name} in a room, photo ${index} of ${views.length - 1}`
                  }
                  aria-pressed={index === viewIndex}
                >
                  <Image src={photo.src} alt="" fill sizes="64px" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rm-body">
          <div className="rm-eyebrow">{collectionLabel}</div>
          <div className="rm-code">{current.code}</div>
          <h2 id="rug-modal-title">{current.name}</h2>
          <p className="rm-desc">{current.description}</p>

          <dl className="rm-specs">
            <div>
              <dt>Weave</dt>
              <dd>{current.weave}</dd>
            </div>
            <div>
              <dt>Yarn</dt>
              <dd>{current.materials.join(' · ')}</dd>
            </div>
            <div>
              <dt>Sizes</dt>
              <dd>{sizeRange}, or custom</dd>
            </div>
          </dl>

          {technique && <p className="rm-technique">{technique.detail}</p>}

          <div className="rm-actions">
            <button
              type="button"
              className="cta-btn"
              onClick={() => {
                close()
                openEnquiry(current.code)
              }}
            >
              Enquire About This Rug
            </button>
            <a
              href="#sizes"
              className="rm-link"
              onClick={() => {
                close()
              }}
            >
              See the size guide
            </a>
          </div>
        </div>

        <div className="rm-nav">
          <button type="button" onClick={previous} aria-label="Previous rug">
            <span aria-hidden="true">‹</span>
          </button>
          <span className="rm-count" aria-live="polite">
            {position + 1} / {scope.length}
          </span>
          <button type="button" onClick={next} aria-label="Next rug">
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </div>
  )
}
