import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import RugCard from '@/components/RugCard'
import RugDetail from '@/components/RugDetail'
import StoreFooter from '@/components/StoreFooter'
import StoreHeader from '@/components/StoreHeader'
import { relatedRugs, rugBySlug, rugSlugs, type RugView } from '@/data/rugs'
import { siteUrl } from '@/lib/site'

/**
 * A rug's own page.
 *
 * WHY THIS EXISTS AT ALL. Until now every one of the hundred and twelve rugs lived in a
 * modal on the home page, which meant no rug had a URL. Nothing could be linked, sent,
 * bookmarked, indexed by Google, or previewed in a WhatsApp thread — and a shop where
 * you cannot send someone a link to the thing you want to buy does not read as a shop.
 * This is the page the rest of the work hangs off: the WhatsApp preview card, the
 * sitemap, the breadcrumbs and, next, the enquiry list.
 *
 * Statically generated, all hundred and twelve of them. The data is compiled into the
 * bundle and none of it changes between deploys, so there is nothing to revalidate and
 * every rug is a file on a CDN.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return rugSlugs.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const rug = rugBySlug(params.slug)
  if (!rug) return {}

  const base = siteUrl()
  const image = `${base}${rug.photos[0]!.src}`
  const title = `${rug.name} (${rug.code}) — ${rug.category}`
  const description = specSentence(rug)

  return {
    title,
    description,
    alternates: { canonical: `${base}${rug.href}` },
    openGraph: {
      type: 'website',
      url: `${base}${rug.href}`,
      title,
      description,
      siteName: 'Velora Living',
      // The whole point of the WhatsApp change: this is the picture that appears in
      // the chat when someone sends the link. WhatsApp fetches it from its own
      // servers, so it must be absolute.
      images: [{ url: image, alt: rug.photos[0]!.alt }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

/**
 * One sentence describing the rug, used as the meta description and the OG blurb.
 *
 * The descriptions in the data are inconsistent about their full stops — some end with
 * one, some do not — so each clause is trimmed before joining. Otherwise a rug whose
 * description already ended in a period reads "...quiet elegance.. Hand Tufted", which
 * is the kind of small wrongness that shows up in a Google result and a WhatsApp
 * preview card and makes a shop look unattended.
 */
function specSentence(rug: RugView): string {
  const parts = [rug.description]
  if (rug.weave) {
    const yarn = rug.materials?.length ? ` in ${rug.materials.join(' and ')}` : ''
    parts.push(`${rug.weave}${yarn}`)
  }
  parts.push('Made to order in nine standard sizes, or woven to your measurements')
  return `${parts.map((part) => part.trim().replace(/\.+$/, '')).join('. ')}.`
}

export default function RugPage({ params }: { params: { slug: string } }) {
  const rug = rugBySlug(params.slug)
  // dynamicParams is false, so an unknown slug is a 404 before it reaches here. The
  // guard is for the type, and for the day someone removes a rug from the data.
  if (!rug) notFound()

  const related = relatedRugs(rug, 4)
  const base = siteUrl()

  /*
    Product structured data, without `offers`.

    StructuredData.tsx makes the same call for the home page and the reasoning holds
    here: no price is published anywhere on this site, and a made-up one in the markup
    is worse than none — it is what Google shows in a result, and it would contradict
    /terms. `offers` goes in the day there are real prices to put in it.
  */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: rug.name,
    sku: rug.code,
    description: specSentence(rug),
    image: rug.photos.map((photo) => `${base}${photo.src}`),
    brand: { '@type': 'Brand', name: 'Velora Living' },
    category: rug.category,
    ...(rug.materials?.length ? { material: rug.materials.join(', ') } : {}),
  }

  return (
    <>
      <StoreHeader />

      <main className="store-page">
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { label: 'Home', href: '/' },
              rug.group === 'curated'
                ? { label: 'Collections', href: '/collections' }
                : { label: 'Full Range', href: '/rugs' },
              rug.group === 'curated' && rug.collection
                ? { label: rug.category, href: `/collections/${rug.collection}` }
                : { label: rug.category.replace(/^Full Range — /, ''), href: `/rugs?style=${rug.style}` },
              { label: rug.code },
            ]}
          />

          <RugDetail rug={rug} url={`${base}${rug.href}`} />

          {related.length > 0 && (
            <section className="related">
              <h2>More like this</h2>
              <div className="rug-grid">
                {related.map((other) => (
                  <RugCard key={other.code} rug={other} />
                ))}
              </div>
              <p className="related-more">
                <Link href={rug.group === 'curated' ? '/collections' : '/rugs'}>
                  See the whole range →
                </Link>
              </p>
            </section>
          )}
        </div>
      </main>

      <StoreFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
