import Image from 'next/image'
import Reveal from './Reveal'
import CountUp from './CountUp'

const STATS = [
  { num: '16', label: 'Signature designs' },
  { num: '3', label: 'Weaving techniques' },
  { num: '2×3′–12×15′', label: 'Plus custom sizes' },
]

export default function Hero() {
  return (
    <section className="hero" style={{ padding: 0 }}>
      <Reveal className="hero-copy">
        <div className="eyebrow">Curating Beautiful Spaces</div>
        <h1>
          Timeless heritage, <em>crafted for today</em>
        </h1>
        <p>
          Velora Living brings handcrafted rugs from India&apos;s carpet-weaving
          capital into modern homes — rooted in Bhadohi &amp; Mirzapur artistry,
          designed in Jaipur.
        </p>
        <div className="hero-cta">
          <a href="#collections" className="cta-btn">
            Explore Collections
          </a>
          <a href="#craft" className="cta-btn line">
            See the Craftsmanship
          </a>
        </div>
        <div className="hero-stats">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="num">
                <CountUp value={stat.num} />
              </div>
              <div className="lbl">{stat.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="hero-visual">
        <div className="corner tl" />
        <div className="corner br" />
        {/*
          Intrinsic width/height rather than `fill` — deliberately.

          `fill` positions the image absolutely, taking it out of flow, and the hero
          then collapses to its 92vh min-height. In the original the image sits in
          normal flow, so at this column width its own 752×1093 aspect ratio makes the
          hero 994px tall on a 900px viewport — taller than the min-height. Switching
          to `fill` shortened the hero by 166px and cropped the photograph differently.

          This is also the largest-contentful-paint element, so it loads eagerly.
        */}
        <Image
          src="/images/hero/bold-floral-living-room.jpg"
          alt="Velora Living bold floral hand-tufted rug styled in a living room"
          width={752}
          height={1093}
          sizes="(max-width: 980px) 100vw, 48vw"
          quality={82}
          priority
        />
      </div>
    </section>
  )
}
