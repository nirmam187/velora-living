import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import RugCard from '@/components/RugCard'
import StoreFooter from '@/components/StoreFooter'
import StoreHeader from '@/components/StoreHeader'
import { rugs } from '@/data/rugs'
import { collections } from '@/data/products'
import { siteUrl } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return collections.map((collection) => ({ id: collection.id }))
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const collection = collections.find((c) => c.id === params.id)
  if (!collection) return {}
  const count = rugs.filter((rug) => rug.collection === collection.id).length
  return {
    title: `${collection.label} — Velora Living`,
    description: `${count} handwoven rugs in the ${collection.label} collection, made to order in nine standard sizes or woven to your measurements.`,
    alternates: { canonical: `${siteUrl()}/collections/${collection.id}` },
  }
}

export default function CollectionPage({ params }: { params: { id: string } }) {
  const collection = collections.find((c) => c.id === params.id)
  if (!collection) notFound()

  const members = rugs.filter((rug) => rug.collection === collection.id)

  return (
    <>
      <StoreHeader />
      <main className="store-page">
        <div className="wrap">
          <Breadcrumbs
            trail={[
              { label: 'Home', href: '/' },
              { label: 'Collections', href: '/collections' },
              { label: collection.label },
            ]}
          />

          <header className="store-head">
            <h1>{collection.label}</h1>
            <p>
              {members.length} {members.length === 1 ? 'rug' : 'rugs'} — each woven to
              order, in any size you need.
            </p>
          </header>

          <div className="rug-grid">
            {members.map((rug, index) => (
              <RugCard key={rug.code} rug={rug} priority={index < 4} />
            ))}
          </div>

          <p className="related-more">
            <Link href="/rugs">See the full range of {rugs.length} rugs →</Link>
          </p>
        </div>
      </main>
      <StoreFooter />
    </>
  )
}
