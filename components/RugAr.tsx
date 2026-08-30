'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { newEventId, trackPixel } from '@/lib/meta-pixel'

/*
  "See it in your room" — the rug placed on the customer's own floor, at true size.

  HOW IT REACHES EACH PLATFORM. There is no single web AR API that works everywhere,
  so this leans on the two native viewers instead of fighting them:

    iPhone / iPad   AR Quick Look, via a .usdz. The only route Safari offers, and the
                    best AR experience on the web — Apple's own renderer, room-scale
                    tracking, no permission prompt beyond the camera.
    Android         WebXR where the browser has it, Google's Scene Viewer where it
                    doesn't, both from the same .glb.
    Everything else Falls back to an orbitable 3D view of the rug. No camera, but the
                    visitor still gets to turn it over and see the pile catch the light.

  <model-viewer> is the piece that picks between them. It is a 1 MB script, which is
  why it is imported dynamically the moment someone asks for AR and never before: the
  home page's whole JS budget is 122 kB, and loading this eagerly would multiply that
  by nine for a feature most visitors will not touch.

  SIZE IS THE WHOLE POINT. The models are built at true metric size (see
  scripts/ar/build_models.py), so what the customer sees on their floor is how much
  floor the rug will actually cover. That is the question AR is here to answer.
*/

/** Matches the models produced by scripts/ar/build_models.py. */
export interface ArRug {
  code: string
  /** Display name, shown in the sheet and read out by Quick Look. */
  name: string
  /** Size the models were built at, e.g. "5 × 8 ft". */
  size: string
}

type Status = 'idle' | 'loading' | 'ready' | 'failed'

export default function RugAr({ rug, onClose }: { rug: ArRug; onClose: () => void }) {
  const [status, setStatus] = useState<Status>('idle')
  /**
   * Whether this device can actually put the rug on a floor. False on every desktop,
   * and on the handful of phones whose browser has neither WebXR nor a native viewer.
   * Read from the element rather than sniffed from the user agent, because only
   * model-viewer knows which of the three routes it managed to negotiate.
   */
  const [canPlace, setCanPlace] = useState(false)
  const viewerRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // The custom element is registered globally the first time any rug opens AR, and
  // stays registered for the rest of the session — hence the guard rather than a
  // straight import on every mount.
  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    if (customElements.get('model-viewer')) {
      setStatus('ready')
      return
    }

    import('@google/model-viewer')
      .then(() => {
        if (!cancelled) setStatus('ready')
      })
      .catch((error) => {
        console.error('[ar] model-viewer failed to load', error)
        if (!cancelled) setStatus('failed')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Report the intent. Someone holding a rug up against their own floor is a long way
  // down the funnel, and Meta should be optimising towards them.
  useEffect(() => {
    trackPixel(
      'ViewContent',
      {
        content_ids: [rug.code],
        content_name: rug.name,
        content_category: 'AR preview',
        content_type: 'product',
      },
      newEventId(),
    )
  }, [rug.code, rug.name])

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [close])

  // Same scroll lock the rug viewer uses, for the same reason.
  useEffect(() => {
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => closeRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [])

  // model-viewer does not hide a custom AR button by itself, so offering it on a
  // desktop would mean a prominent control that does nothing when clicked. Ask the
  // element once the model is up, and render the button only if the answer is yes.
  useEffect(() => {
    const viewer = viewerRef.current as (HTMLElement & { canActivateAR?: boolean }) | null
    if (status !== 'ready' || !viewer) return
    const check = () => setCanPlace(Boolean(viewer.canActivateAR))
    check()
    viewer.addEventListener('load', check)
    return () => viewer.removeEventListener('load', check)
  }, [status])

  const slug = rug.code.toLowerCase().replace(/^vlr-/, 'vlr-')

  return (
    <div
      className="ar-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={`See ${rug.name} in your room`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="ar-panel">
        <button
          type="button"
          className="rm-close"
          onClick={close}
          aria-label="Close"
          ref={closeRef}
        >
          <span aria-hidden="true">✕</span>
        </button>

        <div className="ar-stage">
          {status === 'ready' ? (
            <model-viewer
              ref={viewerRef}
              src={`/ar/${slug}.glb`}
              ios-src={`/ar/${slug}.usdz`}
              alt={`${rug.name}, a Velora Living rug, shown in three dimensions`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              /* The rug must never be resized by pinching: a rug shown at the wrong
                 size answers the customer's question incorrectly, which is worse than
                 not answering it. */
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls
              touch-action="pan-y"
              /* Opens on a three-quarter view rather than straight down — a rug seen
                 from directly above is a flat rectangle and reads as a photograph. */
              camera-orbit="35deg 62deg 4m"
              min-camera-orbit="auto 0deg auto"
              max-camera-orbit="auto 89deg auto"
              shadow-intensity="1"
              shadow-softness="0.8"
              exposure="1"
              environment-image="neutral"
              loading="eager"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            >
              {canPlace && (
                <button slot="ar-button" className="ar-launch" type="button">
                  View in your room
                </button>
              )}
            </model-viewer>
          ) : (
            <div className="ar-status" role="status">
              {status === 'failed'
                ? 'The 3D viewer could not load. Check your connection and try again.'
                : 'Preparing the rug…'}
            </div>
          )}
        </div>

        <div className="ar-info">
          <div className="ar-meta">
            <span className="num">{rug.code}</span>
            <h2>{rug.name}</h2>
            <p>
              Shown at <strong>{rug.size}</strong>, true to size.{' '}
              {canPlace ? (
                <>
                  Drag to turn it; tap <em>View in your room</em> to place it on your
                  own floor.
                </>
              ) : (
                <>
                  Drag to turn it. To stand it on your own floor, open this page on a
                  phone or tablet — that is where the camera lives.
                </>
              )}
            </p>
          </div>
          {/*
            Said plainly rather than hidden behind a tooltip. The colours came off a
            photograph of the real rug, so they are close — but a screen is not wool,
            and someone matching a rug to a sofa deserves to know that before they
            order rather than after.
          */}
          <p className="ar-caveat">
            Colours on screen are a guide, not an exact match. Ask us for a physical
            sample before you commit.
          </p>
        </div>
      </div>
    </div>
  )
}
