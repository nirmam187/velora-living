import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import StoreFooter from '@/components/StoreFooter'
import StoreHeader from '@/components/StoreHeader'
import { rugs } from '@/data/rugs'
import { collections } from '@/data/products'
import { siteUrl } from '@/lib/site'

/** The curated collections, each as a doorway rather than a tab on the home page. */
export const metadata: Metadata = {
  title: 'Collections — Velora Living',
  description:
    'Classic Heritage and Modern Heritage: the curated Velora Living rugs, each with a full specification, room photography and made-to-order sizing.',
  alternates: { canonical: `${siteUrl()}/collections` },
}

export default function CollectionsPage() {
  return (
    <>
      <StoreHeader />
      <main className="store-page">
        <div className="wrap">
          <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Collections' }]} />

          <header className="store-head">
            <h1>Collections</h1>
            <p>
              The curated pieces — photographed in full, specified down to the yarn, and
              woven to order in any size.
            </p>
          </header>

          <div className="collection-cards">
            {collections.map((collection) => {
              const members = rugs.filter((rug) => rug.collection === collection.id)
              const cover = members[0]
              if (!cover) return null
              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="collection-card"
                >
                  <div className="collection-card-shot">
                    <Image
                      src={cover.photos[0]!.src}
                      alt={cover.photos[0]!.alt}
                      fill
                      sizes="(max-width: 800px) 100vw, 50vw"
                    />
                  </div>
                  <div className="collection-card-body">
                    <h2>{collection.label}</h2>
                    <p>
                      {members.length} {members.length === 1 ? 'rug' : 'rugs'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <p className="related-more">
            <Link href="/rugs">Or browse all {rugs.length} rugs →</Link>
          </p>
        </div>
      </main>
      <StoreFooter />
    </>
  )
}
