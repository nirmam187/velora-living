'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { arModelUrl, arSizes, defaultArSize, isPlainRug, type ArSize } from '@/data/ar'
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

  SIZE IS THE WHOLE POINT, AND IT IS THE CONTROL. The models are built at true metric
  size by app/ar/[file]/route.ts, so what the customer sees on their floor is how much
  floor the rug will actually cover. That is the question AR is here to answer — which
  is why the size picker below is the one piece of chrome in the sheet, rather than
  something buried in the copy. Pinch-to-resize stays disabled: the size should change
  because the customer chose a different rug, not because their fingers slipped.
*/

/** The rug being shown. Sizes come from data/ar.ts and are the same for every rug. */
export interface ArRug {
  code: string
  /** Display name, shown in the sheet and read out by Quick Look. */
  name: string
}

type Status = 'idle' | 'loading' | 'ready' | 'failed'

export default function RugAr({ rug, onClose }: { rug: ArRug; onClose: () => void }) {
  const [status, setStatus] = useState<Status>('idle')
  const [size, setSize] = useState<ArSize>(defaultArSize)
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
  // down the funnel, and Meta should be optimising towards them. Reported once per
  // rug, not once per size — changing size is the same person still considering the
  // same rug, and counting it again would tell Meta a story that isn't true.
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
  //
  // Re-asked on every size change, because changing size swaps the model out and the
  // question is answered per-model.
  useEffect(() => {
    const viewer = viewerRef.current as (HTMLElement & { canActivateAR?: boolean }) | null
    if (status !== 'ready' || !viewer) return
    const check = () => setCanPlace(Boolean(viewer.canActivateAR))
    check()
    viewer.addEventListener('load', check)
    return () => viewer.removeEventListener('load', check)
  }, [status, size.id])

  /*
    The camera pulls back as the rug grows, so a 12x15 does not open half outside the
    frame and a 2x3 is not a speck. model-viewer will frame a model for you, but only
    once and only on load, and the reframing it does on a source swap is not something
    to rely on — so the distance is stated. Roughly the diagonal, which keeps the rug
    at a consistent size on screen whatever its real size, and lets the SIZE PICKER
    rather than the apparent size be what tells the customer what changed.
  */
  const orbitDistance = Math.hypot(size.widthFt, size.lengthFt) * 0.42

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
              /*
                Keyed on the size so a change tears the element down and builds a new
                one. model-viewer does reload on a src change, but the iOS handoff
                reads ios-src at tap time and has been known to keep the model it was
                built with — and handing someone a 9x12 rug that arrives as a 5x8 is
                the one failure this feature must not have.
              */
              key={size.id}
              ref={viewerRef}
              src={arModelUrl(rug.code, size.id, 'glb')}
              ios-src={arModelUrl(rug.code, size.id, 'usdz')}
              alt={`${rug.name}, a Velora Living rug, shown at ${size.label} in three dimensions`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              /* The rug must never be resized by pinching: a rug shown at the wrong
                 size answers the customer's question incorrectly, which is worse than
                 not answering it. The picker below is how size changes. */
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls
              touch-action="pan-y"
              /* Opens on a three-quarter view rather than straight down — a rug seen
                 from directly above is a flat rectangle and reads as a photograph. */
              camera-orbit={`35deg 62deg ${orbitDistance.toFixed(2)}m`}
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
          </div>

          {/*
            Radio buttons rather than a <select>: on a phone this is the control the
            whole feature turns on, and a native select would put the answer behind a
            tap and a scroll. Nine chips fit.
          */}
          <fieldset className="ar-sizes">
            <legend>Size — shown true to life</legend>
            <div className="ar-size-row">
              {arSizes.map((option) => (
                <label
                  key={option.id}
                  className={`ar-size${option.id === size.id ? ' is-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="ar-size"
                    value={option.id}
                    checked={option.id === size.id}
                    onChange={() => setSize(option)}
                  />
                  <span>{option.label.replace(/ ft$/, '')}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="ar-guidance">
            {canPlace ? (
              <>
                Drag to turn it; tap <em>View in your room</em> to place it on your own
                floor at {size.label}.
              </>
            ) : (
              <>
                Drag to turn it. To stand it on your own floor at {size.label}, open
                this page on a phone or tablet — that is where the camera lives.
              </>
            )}
          </p>

          {/*
            Two honest caveats, said plainly rather than hidden behind a tooltip.

            The colour one: the colours came off a photograph of the real rug, so they
            are close — but a screen is not wool, and someone matching a rug to a sofa
            deserves to know that before they order rather than after.

            The size one: these are the plain and textured rugs, and one photograph is
            stretched to whichever size is picked. For a plain rug that is what the
            real thing does — more of the same wool. It would NOT be true of a bordered
            rug, which is why those are not offered here yet. See data/ar.ts.
          */}
          <p className="ar-caveat">
            Colours on screen are a guide, not an exact match. Ask us for a physical
            sample before you commit.
            {!isPlainRug(rug.code) && (
              <>
                {' '}
                The size is exact; the pattern is shown at the proportions it was
                photographed in, so at the largest sizes the border will look wider here
                than on the woven rug.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
