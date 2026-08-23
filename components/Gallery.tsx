'use client'

import Image from 'next/image'
import Reveal from './Reveal'
import { galleryImageFor, galleryProducts } from '@/data/products'
import { site } from '@/lib/site'
import { useRugViewer } from './RugViewerContext'

export default function Gallery() {
  const { open } = useRugViewer()
  const shown = galleryProducts()
  const codes = shown.map((p) => p.code)

  return (
    <section id="gallery" style={{ paddingTop: 0 }}>
      <Reveal className="sec-head wrap" style={{ marginBottom: 30 }}>
        <div>
          <div className="eyebrow">In the Wild</div>
          <h2>Velora rugs, styled by you</h2>
        </div>
        <p>
          Tag{' '}
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--gold)' }}
          >
            {site.instagramHandle}
          </a>{' '}
          — we feature our favourite spaces every week.
        </p>
      </Reveal>

      <Reveal className="gallery-strip">
        {shown.map((product) => {
          const photo = galleryImageFor(product)
          return (
            <button
              type="button"
              className="g-item"
              key={product.code}
              onClick={() => open(product.code, codes)}
              aria-label={`View ${product.name}, ${product.code}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 980px) 33vw, 17vw"
                loading="lazy"
              />
            </button>
          )
        })}
      </Reveal>
    </section>
  )
}
