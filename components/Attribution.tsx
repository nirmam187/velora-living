'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/utm'

/**
 * Records which ad brought this visitor, once, on arrival.
 *
 * Renders nothing. It exists as a component only because the capture has to
 * happen in the browser after mount, and it is deliberately separate from
 * <MetaPixel /> so that attribution keeps working before the Pixel is configured —
 * the two answer different questions and must not share a kill switch.
 */
export default function Attribution() {
  useEffect(() => {
    captureAttribution()
  }, [])

  return null
}
