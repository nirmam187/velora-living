import type { Metadata } from 'next'
import ArDemo from './ArDemo'

/*
  A prototype page, deliberately kept off the navigation and out of the sitemap.

  It exists so the AR work can be looked at and judged before any decision is made
  about rolling it across all 110 rugs. The three rugs on it were chosen to cover the
  three kinds of source photograph this catalogue actually contains — see the notes on
  the page itself. Delete this route once AR lives inside the rug viewer.
*/

export const metadata: Metadata = {
  title: 'AR preview (prototype)',
  // Not for customers yet, and definitely not for Google.
  robots: { index: false, follow: false },
}

export default function ArDemoPage() {
  return <ArDemo />
}
