import Image from 'next/image'
import Reveal from './Reveal'
import { techniques, materials } from '@/data/craft'

export default function Craft() {
  return (
    <section className="craft" id="craft">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">Craftsmanship</div>
            <h2>Built on tradition, made for today</h2>
          </div>
          <p>
            Every Velora rug is made using one of three time-honoured techniques,
            blending heritage with modern living.
          </p>
        </Reveal>

        <Reveal className="craft-grid">
          {techniques.map((technique) => (
            <div className="craft-card" key={technique.name}>
              <div
                className={
                  technique.isDiagram ? 'craft-photo is-diagram' : 'craft-photo'
                }
              >
                {technique.isDiagram ? (
                  // Already vector — next/image would only add a proxy hop.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={technique.image}
                    alt={technique.alt}
                    width={technique.width}
                    height={technique.height}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <Image
                    src={technique.image}
                    alt={technique.alt}
                    fill
                    sizes="(max-width: 980px) 100vw, 30vw"
                    loading="lazy"
                  />
                )}
              </div>
              <h3>{technique.name}</h3>
              <p>{technique.blurb}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="sec-head" style={{ marginBottom: 34 }}>
          <div>
            <div className="eyebrow">Premium Materials</div>
            <h2 style={{ fontSize: '1.6rem' }}>
              Crafted with the finest natural fibers
            </h2>
          </div>
          <p>
            We use only premium yarns — New Zealand wool, Bikaneri wool, blended wool
            and silk — to ensure durability, softness and timeless beauty in every rug.
          </p>
        </Reveal>

        <Reveal className="mat-row">
          {materials.map((material) => (
            <div className="mat-card" key={material.name}>
              <div className="mat-photo">
                <Image
                  src={material.image}
                  alt={material.alt}
                  fill
                  sizes="(max-width: 560px) 45vw, (max-width: 980px) 45vw, 22vw"
                  loading="lazy"
                />
              </div>
              <span>{material.name}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
