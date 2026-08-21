import Reveal from './Reveal'

const NOTES = [
  {
    quote:
      'The rug anchored our entire living room — the colours are richer in person than any photo could show.',
    name: 'Aditi R.',
    place: 'Bengaluru',
  },
  {
    quote:
      "You can feel the difference the moment you walk on it. Worth every rupee, and it'll outlive the sofa.",
    name: 'Karan M.',
    place: 'Mumbai',
  },
  {
    quote:
      'Our designer sourced three options from Velora — we ended up wanting all three for different rooms.',
    name: 'Studio Nine Interiors',
    place: 'Ahmedabad',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">Client Notes</div>
            <h2>Spaces our rugs now call home</h2>
          </div>
        </Reveal>

        <Reveal className="test-grid">
          {NOTES.map((note) => (
            <figure className="test-card" key={note.name}>
              <blockquote>
                <p className="quote">&ldquo;{note.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="who">
                <div className="avatar" aria-hidden="true">
                  {note.name.charAt(0)}
                </div>
                <div>
                  <div className="name">{note.name}</div>
                  <div className="place">{note.place}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
