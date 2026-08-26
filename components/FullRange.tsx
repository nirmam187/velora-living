'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Reveal from './Reveal'
import {
  catalogue,
  catalogueLabel,
  catalogueStyles,
  type CatalogueRug,
  type CatalogueStyle,
} from '@/data/catalogue'
import { useEnquiry } from './EnquiryContext'
import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'
import { rugMessage } from '@/lib/whatsapp'
import { trackViewContent } from '@/lib/meta-pixel'
import { sizeRange } from '@/data/sizes'

/** Cards rendered before the visitor asks for more. Eighty-nine at once is a lot of image. */
const PAGE = 24

type Filter = CatalogueStyle | 'all'

export default function FullRange() {
  const { openEnquiry } = useEnquiry()

  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE)
  const [openCode, setOpenCode] = useState<string | null>(null)

  const visible = useMemo(
    () => (filter === 'all' ? catalogue : catalogue.filter((r) => r.style === filter)),
    [filter],
  )

  // A new filter starts again at the top of its own list.
  function changeFilter(next: Filter) {
    setFilter(next)
    setShown(PAGE)
  }

  const page = visible.slice(0, shown)
  const remaining = visible.length - page.length

  const current = openCode ? (visible.find((r) => r.code === openCode) ?? null) : null
  const position = current ? visible.indexOf(current) : -1

  const close = useCallback(() => setOpenCode(null), [])

  /** Doubles as Meta's `content_category` — see rugByCode in data/catalogue.ts. */
  const categoryOf = (rug: CatalogueRug) =>
    `Full Range — ${catalogueStyles.find((s) => s.id === rug.style)?.label ?? rug.style}`

  // Same signal the curated viewer sends: opening a rug is a view, scrolling past
  // one of eighty-nine cards is not.
  useEffect(() => {
    if (!current) return
    trackViewContent({
      code: current.code,
      label: catalogueLabel(current),
      category: categoryOf(current),
    })
  }, [current])

  const step = useCallback(
    (delta: number) => {
      setOpenCode((code) => {
        if (!code) return code
        const index = visible.findIndex((r) => r.code === code)
        if (index === -1) return code
        // Wraps, so the arrows never dead-end.
        const next = (index + delta + visible.length) % visible.length
        return visible[next]?.code ?? code
      })
    },
    [visible],
  )

  // Keep the lightbox on the keyboard: Escape closes, arrows page.
  useEffect(() => {
    if (!current) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [current, close, step])

  // Lock the page behind the lightbox without letting it jump: the scrollbar is
  // replaced by equivalent padding.
  useEffect(() => {
    if (!current) return
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
  }, [current])

  // Give focus to the close button on open, and hand it back on close.
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const isOpen = current !== null

  useEffect(() => {
    if (!isOpen) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    const id = window.requestAnimationFrame(() => closeRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) return
    const target = returnFocusRef.current
    returnFocusRef.current = null
    target?.focus?.()
  }, [isOpen])

  return (
    <section className="full-range" id="full-range">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">The Full Range</div>
            <h2>Every design we can weave for you</h2>
          </div>
          <p>
            {catalogue.length} designs currently on the floor, photographed as they
            are. Sizes run {sizeRange}, or fully custom — tell us the code and
            we&rsquo;ll come back with materials, sizes and pricing.
          </p>
        </Reveal>

        <Reveal className="fr-filters">
          <div className="fr-tabs" role="group" aria-label="Filter the full range">
            <button
              type="button"
              className={filter === 'all' ? 'is-on' : undefined}
              onClick={() => changeFilter('all')}
              aria-pressed={filter === 'all'}
            >
              All
            </button>
            {catalogueStyles.map((style) => (
              <button
                type="button"
                key={style.id}
                className={filter === style.id ? 'is-on' : undefined}
                onClick={() => changeFilter(style.id)}
                aria-pressed={filter === style.id}
              >
                {style.label}
              </button>
            ))}
          </div>
          <p className="fr-count" aria-live="polite">
            Showing {page.length} of {visible.length}
          </p>
        </Reveal>

        <div className="fr-grid">
          {page.map((rug) => (
            <article className="fr-card" key={rug.code}>
              <div className="fr-shot">
                <Image
                  src={rug.image}
                  alt={rug.alt}
                  fill
                  sizes="(max-width: 560px) 50vw, (max-width: 980px) 33vw, 22vw"
                  loading="lazy"
                />
                <span className="fr-zoom" aria-hidden="true">
                  View
                </span>
              </div>
              <div className="fr-info">
                <span className="num">{rug.code}</span>
                <span className="desc">{catalogueLabel(rug)}</span>
              </div>
              <button
                type="button"
                className="fr-open"
                onClick={() => setOpenCode(rug.code)}
                aria-label={`View ${rug.code}, ${catalogueLabel(rug)}`}
              />
            </article>
          ))}
        </div>

        {remaining > 0 && (
          <div className="fr-more">
            <button
              type="button"
              className="cta-btn line"
              onClick={() => setShown((n) => n + PAGE)}
            >
              Show {Math.min(remaining, PAGE)} more
            </button>
          </div>
        )}
      </div>

      {current && (
        <div
          className="rug-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fr-modal-title"
          onMouseDown={(event) => {
            // Only a click that starts and ends on the backdrop dismisses.
            if (event.target === event.currentTarget) close()
          }}
        >
          <div className="rug-modal-panel">
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
              <Image
                key={current.image}
                src={current.image}
                alt={current.alt}
                fill
                sizes="(max-width: 860px) 100vw, 46vw"
                priority
              />
            </div>

            <div className="rm-body">
              <div className="rm-eyebrow">The Full Range</div>
              <div className="rm-code">{current.code}</div>
              <h2 id="fr-modal-title">{catalogueLabel(current)}</h2>

              <dl className="rm-specs">
                {current.weave && (
                  <div>
                    <dt>Weave</dt>
                    <dd>{current.weave}</dd>
                  </div>
                )}
                {current.materials && current.materials.length > 0 && (
                  <div>
                    <dt>Yarn</dt>
                    <dd>{current.materials.join(' · ')}</dd>
                  </div>
                )}
                <div>
                  <dt>Sizes</dt>
                  <dd>{sizeRange}, or custom</dd>
                </div>
              </dl>

              {/* No weave or yarn is claimed until the spec sheet is loaded — see
                  the note at the top of data/catalogue.ts. */}
              {!current.weave && (
                <p className="rm-technique">
                  This one is photographed straight from the floor. Ask us about{' '}
                  {current.code} and we&rsquo;ll confirm the weave, the yarn and
                  what it costs in your size.
                </p>
              )}

              {/* WhatsApp first, and the dialog stays open behind it — see the
                  note on the same block in RugModal.tsx. */}
              <div className="rm-actions">
                <WhatsAppCta
                  className="cta-btn wa-btn"
                  message={rugMessage(catalogueLabel(current), current.code)}
                  contentId={current.code}
                  contentName={catalogueLabel(current)}
                  contentCategory={categoryOf(current)}
                  aria-label={`Enquire on WhatsApp about ${current.code}`}
                >
                  <WhatsAppIcon size={17} />
                  Enquire on WhatsApp
                </WhatsAppCta>
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
                <a href="#sizes" className="rm-link" onClick={close}>
                  See the size guide
                </a>
              </div>
            </div>

            <div className="rm-nav">
              <button type="button" onClick={() => step(-1)} aria-label="Previous rug">
                <span aria-hidden="true">‹</span>
              </button>
              <span className="rm-count" aria-live="polite">
                {position + 1} / {visible.length}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Next rug">
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
