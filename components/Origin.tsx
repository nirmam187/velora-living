import Image from 'next/image'
import Reveal from './Reveal'
import { site } from '@/lib/site'

const STORY = [
  {
    initial: 'B',
    title: 'Crafted in Bhadohi & Mirzapur',
    body: 'Known as the carpet-weaving capital of India, Bhadohi and Mirzapur are home to generations of skilled artisans. Every Velora Living rug is hand-tufted with precision, care, and an eye for detail.',
  },
  {
    initial: 'J',
    title: 'Designed in Jaipur',
    body: 'The Pink City inspires our designs with its rich cultural heritage and artistic legacy. Our Jaipur-based design studio blends classic patterns with modern sensibilities to create rugs that are both timeless and versatile.',
  },
]

const CITIES = [
  { src: '/images/places/bhadohi.jpg', alt: 'Bhadohi, India', caption: 'Bhadohi' },
  { src: '/images/places/mirzapur.jpg', alt: 'Mirzapur, India', caption: 'Mirzapur' },
  {
    src: '/images/places/jaipur-hawa-mahal.jpg',
    alt: 'Jaipur, India — Hawa Mahal',
    caption: 'Jaipur',
  },
]

export default function Origin() {
  return (
    <section className="origin" id="origin">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">Where Heritage Meets Home</div>
            <h2>Woven in Bhadohi &amp; Mirzapur. Designed in Jaipur.</h2>
          </div>
          <p>
            At Velora Living, we believe a rug is more than a décor piece —
            it&apos;s the soul of a space.
          </p>
        </Reveal>

        <div className="origin-grid">
          <div>
            {STORY.map((item) => (
              <Reveal className="origin-item" key={item.initial}>
                <div className="oi-icon" aria-hidden="true">
                  {item.initial}
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </Reveal>
            ))}

            <Reveal className="insta-box">
              <div className="ic" aria-hidden="true">
                IG
              </div>
              <div>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Velora Living on Instagram, ${site.instagramHandle}`}
                >
                  {site.instagramHandle}
                </a>
                <p>
                  Online, inspired, effortless — follow us for new arrivals, styling
                  inspiration and behind-the-scenes.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="city-strip">
              {CITIES.map((city) => (
                <figure key={city.caption}>
                  <Image
                    src={city.src}
                    alt={city.alt}
                    fill
                    sizes="(max-width: 980px) 33vw, 16vw"
                    loading="lazy"
                  />
                  <figcaption>{city.caption}</figcaption>
                </figure>
              ))}
            </div>
            <div
              style={{
                aspectRatio: '16/10',
                overflow: 'hidden',
                marginTop: 2,
                position: 'relative',
              }}
            >
              <Image
                src="/images/craft/artisan-hand-knotting.jpg"
                alt="Artisan hand-knotting a rug in Bhadohi"
                fill
                sizes="(max-width: 980px) 100vw, 48vw"
                style={{ objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
