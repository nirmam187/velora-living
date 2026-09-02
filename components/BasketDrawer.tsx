'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { useBasket } from './BasketContext'
import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'
import { rugSizes } from '@/data/sizes'
import { publicUrl } from '@/lib/site'
import { rugListMessage } from '@/lib/whatsapp'

/**
 * The enquiry list, as a drawer.
 *
 * Two ways out, in the order they convert. WhatsApp first, carrying every rug and every
 * chosen size in one message — that is the path this business actually closes on, and
 * the whole reason for collecting a list rather than sending four separate enquiries.
 * The form second, for anyone who would rather not open WhatsApp.
 *
 * The size control is a plain <select> rather than the chip row the AR sheet uses. Nine
 * chips per rug across a five-rug list would be forty-five targets in a narrow drawer;
 * a select is one, and it is the control every shopper already knows from a cart. The
 * empty option is real and stays selectable — "not sure yet" is a legitimate answer, and
 * forcing a size would put a number in front of the studio that the customer never
 * meant.
 */
export default function BasketDrawer() {
  const { items, isOpen, close, remove, setSize, clear } = useBasket()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const handleClose = useCallback(() => close(), [close])

  // Same dialog manners as the rug viewer: remember where focus came from, take it,
  // give it back on close, and lock the page behind without letting it jump.
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

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const message = rugListMessage(
    items.map((item) => ({
      code: item.code,
      name: item.name,
      sizeLabel: item.sizeLabel,
      url: publicUrl(item.href),
    })),
  )

  return (
    <div
      className="basket-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Your enquiry list"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <div className="basket-panel" ref={panelRef}>
        <div className="basket-head">
          <div>
            <h2>Your enquiry list</h2>
            <p>
              {items.length === 0
                ? 'Nothing here yet'
                : `${items.length} ${items.length === 1 ? 'rug' : 'rugs'} — send them to us in one message`}
            </p>
          </div>
          <button
            type="button"
            className="rm-close"
            onClick={handleClose}
            aria-label="Close"
            ref={closeRef}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="basket-empty">
            <p>
              Add rugs as you browse and they will collect here, so you can ask about all
              of them at once rather than one at a time.
            </p>
            <Link href="/rugs" className="cta-btn" onClick={handleClose}>
              Browse the range
            </Link>
          </div>
        ) : (
          <>
            <ul className="basket-items">
              {items.map((item) => (
                <li key={item.code}>
                  <Link href={item.href} className="basket-item-shot" onClick={handleClose}>
                    <Image src={item.image} alt={item.alt} fill sizes="84px" />
                  </Link>
                  <div className="basket-item-body">
                    <span className="num">{item.code}</span>
                    <Link href={item.href} onClick={handleClose}>
                      <h3>{item.name}</h3>
                    </Link>
                    <label className="basket-size">
                      <span>Size</span>
                      <select
                        value={item.sizeLabel ?? ''}
                        onChange={(event) =>
                          setSize(item.code, event.target.value || undefined)
                        }
                      >
                        <option value="">Not sure yet</option>
                        {rugSizes.map((size) => (
                          <option key={size.feet} value={size.feetLong}>
                            {size.feetLong} ({size.cm})
                          </option>
                        ))}
                        <option value="Custom size">Custom size</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="basket-remove"
                    onClick={() => remove(item.code)}
                    aria-label={`Remove ${item.name} from your enquiry list`}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="basket-foot">
              <WhatsAppCta
                className="cta-btn wa-btn"
                message={message}
                contentId={items.map((item) => item.code).join(',')}
                contentName={`Enquiry list — ${items.length} rugs`}
                contentCategory="Enquiry list"
                aria-label={`Send your list of ${items.length} rugs on WhatsApp`}
              >
                <WhatsAppIcon size={17} />
                Send {items.length === 1 ? 'this rug' : `these ${items.length} rugs`} on
                WhatsApp
              </WhatsAppCta>

              {/*
                The form takes the same list as text. The enquiry API stores one rug code
                against an enquiry, so the first rug is recorded there and every rug is
                written into the message — which is what the studio reads anyway. Better
                than silently dropping four of five rugs to fit the column.
              */}
              <Link
                href={`/?list=${encodeURIComponent(
                  // code:size per rug, so the form path carries exactly what the
                  // WhatsApp path does. Without the size the studio would get a list
                  // of rugs and have to ask how big — which is the round trip the
                  // enquiry list exists to remove.
                  items
                    .map((item) => (item.sizeLabel ? `${item.code}:${item.sizeLabel}` : item.code))
                    .join(','),
                )}#enquire`}
                className="rm-link"
                onClick={handleClose}
              >
                Or send it as a form instead
              </Link>

              <button type="button" className="basket-clear" onClick={clear}>
                Clear list
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
