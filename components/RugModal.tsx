'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRugViewer } from './RugViewerContext'
import { useEnquiry } from './EnquiryContext'
import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'
import RugAr from './RugAr'
import { hasAr } from '@/data/ar'
import { collections } from '@/data/products'
import { rugMessage } from '@/lib/whatsapp'
import { publicUrl } from '@/lib/site'
import { trackViewContent } from '@/lib/meta-pixel'
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

  /** Set while the AR sheet is up, so this dialog stops competing with it. */
  const [arOpen, setArOpen] = useState(false)

  /** False for the rugs with no flattened texture yet — most of them. */
  const arAvailable = current ? hasAr(current.code) : false

  // Paging to another rug must start again on its catalogue shot, and must never
  // leave the AR sheet open showing the rug you just paged away from.
  useEffect(() => {
    setViewIndex(0)
    setArOpen(false)
  }, [current?.code])

  // Opening the viewer is the moment a visitor shows interest in one particular
  // rug, so that is what gets reported — once per rug, including each one paged
  // through, because paging is browsing and Meta should see it as such.
  useEffect(() => {
    if (!current) return
    trackViewContent({
      code: current.code,
      label: current.name,
      category:
        collections.find((c) => c.id === current.collection)?.label ??
        current.collection,
    })
  }, [current])

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
      // The AR sheet sits on top and runs its own Escape handling and focus. Left
      // active, this dialog would close underneath it on the first Escape and keep
      // Tab trapped in a panel the visitor can no longer see.
      if (!isOpen || arOpen) return

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
    [isOpen, arOpen, close, next, previous],
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

          {/*
            WhatsApp first. The modal is deliberately NOT closed on the way out:
            the link opens in a new tab, and tearing the dialog down inside the
            click handler risks unmounting the anchor before the browser has
            followed it. Coming back to the tab lands you on the same rug.
          */}
          <div className="rm-actions">
            <WhatsAppCta
              className="cta-btn wa-btn"
              message={rugMessage(
                current.name,
                current.code,
                publicUrl(`/rugs/${current.code.toLowerCase()}`),
              )}
              contentId={current.code}
              contentName={current.name}
              contentCategory={
                collections.find((c) => c.id === current.collection)?.label ??
                current.collection
              }
              aria-label={`Enquire on WhatsApp about ${current.name}`}
            >
              <WhatsAppIcon size={17} />
              Enquire on WhatsApp
            </WhatsAppCta>
            {/* Only for rugs that actually have a texture. A "see it in your
                room" that leads to a missing file is worse than no button. */}
            {arAvailable && (
              <button
                type="button"
                className="rm-link"
                onClick={() => setArOpen(true)}
              >
                See it in your room
              </button>
            )}
            <button
              type="button"
              className="rm-link"
              onClick={() => {
                close()
                openEnquiry(current.code)
              }}
            >
              Or send an enquiry form
            </button>
            {/* The rug's own page — every photograph, the full specification, and an
                address that can be sent to someone. The modal is a quick look; this is
                the product page. */}
            <a href={`/rugs/${current.code.toLowerCase()}`} className="rm-link">
              View full details
            </a>
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

      {arOpen && arAvailable && (
        <RugAr
          rug={{ code: current.code, name: current.name }}
          onClose={() => setArOpen(false)}
        />
      )}
    </div>
  )
}
