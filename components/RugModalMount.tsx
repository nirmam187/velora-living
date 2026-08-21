'use client'

import dynamic from 'next/dynamic'
import { useRugViewer } from './RugViewerContext'

/**
 * The quick-view is a fair amount of JavaScript that most visitors never open, and
 * it sits on the same page as the largest-contentful-paint image. Loading it on
 * demand keeps it out of the initial bundle: the chunk is only fetched the first
 * time someone actually opens a rug.
 *
 * `ssr: false` because the dialog has nothing to contribute to the server-rendered
 * HTML — it renders nothing until a rug is selected.
 */
const RugModal = dynamic(() => import('./RugModal'), { ssr: false })

export default function RugModalMount() {
  const { current } = useRugViewer()
  if (!current) return null
  return <RugModal />
}
