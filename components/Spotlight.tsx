'use client'

import Image from 'next/image'
import Reveal from './Reveal'
import { spotlightProduct } from '@/data/products'
import { useEnquiry } from './EnquiryContext'

/** The featured rug. Which rug appears here is set by SPOTLIGHT_CODE in data/products.ts. */
export default function Spotlight() {
  const { openEnquiry } = useEnquiry()
  const product = spotlightProduct

  const image = product.detailImage ?? product.image
  const alt = product.detailAlt ?? product.alt

  return (
    <section className="spotlight" id="spotlight">
      <div className="wrap spot-grid">
        <Reveal className="spot-visual">
          <Image src={image} alt={alt} fill sizes="(max-width: 980px) 100vw, 40vw" />
        </Reveal>

        <Reveal className="spot-copy">
          <div className="eyebrow">Modern Heritage Collection</div>
          <h2>
            {product.name} — soft florals, quiet elegance
          </h2>
          {product.story?.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
          <div className="signature">
            &ldquo;Each rug is thoughtfully crafted to add warmth, beauty, and
            character to modern living.&rdquo;
          </div>
          <div className="hero-cta" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="cta-btn"
              onClick={() => openEnquiry(product.code)}
            >
              Enquire About This Rug
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
