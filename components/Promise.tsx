import Reveal from './Reveal'

const PROMISES = [
  {
    n: '01',
    title: 'Premium Quality',
    body: 'We use the finest materials for long-lasting beauty and comfort.',
  },
  {
    n: '02',
    title: 'Artisan Crafted',
    body: 'Each rug is a testament to the skill, dedication and heritage of Indian artisans.',
  },
  {
    n: '03',
    title: 'Timeless Designs',
    body: 'Classic motifs and contemporary palettes designed to suit every space.',
  },
  {
    n: '04',
    title: 'Made for Modern Living',
    body: "Versatile, durable and easy to style — perfect for today's homes.",
  },
]

export default function Promise() {
  return (
    <section className="promise">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              Why Choose Velora Living
            </div>
            <h2 style={{ color: 'var(--cream)' }}>Our promise, in four parts</h2>
          </div>
        </Reveal>

        <Reveal className="promise-grid">
          {PROMISES.map((promise) => (
            <div className="promise-card" key={promise.n}>
              <div className="pn" aria-hidden="true">
                {promise.n}
              </div>
              <h3>{promise.title}</h3>
              <p>{promise.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
