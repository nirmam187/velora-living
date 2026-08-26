'use client'

import Image from 'next/image'
import Reveal from './Reveal'
import { collections, spotlightProduct } from '@/data/products'
import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'
import { rugMessage } from '@/lib/whatsapp'

/** The featured rug. Which rug appears here is set by SPOTLIGHT_CODE in data/products.ts. */
export default function Spotlight() {
  const product = spotlightProduct
  const category =
    collections.find((c) => c.id === product.collection)?.label ?? product.collection

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
            <WhatsAppCta
              className="cta-btn wa-btn"
              message={rugMessage(product.name, product.code)}
              contentId={product.code}
              contentName={product.name}
              contentCategory={category}
              aria-label={`Enquire on WhatsApp about ${product.name}`}
            >
              <WhatsAppIcon size={17} />
              Enquire on WhatsApp
            </WhatsAppCta>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
