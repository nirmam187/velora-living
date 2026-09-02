import type { Metadata } from 'next'
import { Suspense } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'
import RugCard from '@/components/RugCard'
import RugFilter from '@/components/RugFilter'
import StoreFooter from '@/components/StoreFooter'
import StoreHeader from '@/components/StoreHeader'
import { catalogueStyles } from '@/data/catalogue'
import { rugs } from '@/data/rugs'
import { siteUrl } from '@/lib/site'

/**
 * The whole range, as a page.
 *
 * The home page's Full Range section shows the same rugs, but it is a section: it
 * cannot be linked to by style, it does not appear in search results as itself, and it
 * resets every time someone reloads. This is the address a customer gets sent, and the
 * one Google indexes.
 *
 * Statically rendered with the filtering done in the browser. A hundred and twelve
 * cards is a small page, and generating a variant per filter would be four near
 * identical documents for no benefit.
 */
export const metadata: Metadata = {
  title: 'The Full Range — every Velora Living rug',
  description:
    'All 112 handwoven rugs: traditional, modern, plain and textured. Made to order in nine standard sizes or woven to your measurements.',
  alternates: { canonical: `${siteUrl()}/rugs` },
}

export default function RugsPage() {
  const cards = rugs.map((rug, index) => (
    <RugCard key={rug.code} rug={rug} priority={index < 4} />
  ))

  // Counted once here rather than in the browser, so the number beside the tabs is
  // right in the HTML before any JavaScript runs.
  const counts = catalogueStyles.reduce<Record<string, number>>((acc, style) => {
    acc[style.id] = rugs.filter((rug) => rug.style === style.id).length
    return acc
  }, {})

  return (
    <>
      <StoreHeader />
      <main className="store-page">
        <div className="wrap">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Full Range' }]} />

          <header className="store-head">
            <h1>The Full Range</h1>
            <p>
              Every rug we can currently supply — {rugs.length} in all. Each one is woven
              to order, so any of them can be made in the size your room needs.
            </p>
          </header>

          {/*
            The cards are rendered here, on the server, and passed into the filter as
            children — so all hundred and twelve are in the static HTML for a crawler
            and for the first paint. RugFilter only decides which are visible. The
            Suspense boundary is still required: RugFilter reads the query string, and
            without it that would opt this whole route into dynamic rendering.
          */}
          <Suspense fallback={<div className="rug-grid">{cards}</div>}>
            <RugFilter
              filters={catalogueStyles}
              counts={counts}
              total={rugs.length}
            >
              {cards}
            </RugFilter>
          </Suspense>
        </div>
      </main>
      <StoreFooter />
    </>
  )
}
