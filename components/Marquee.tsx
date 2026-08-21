/**
 * The scrolling brand line. The track holds the phrase twice because the keyframe
 * translates by -50% — the second copy is what slides in as the first slides out,
 * which is what makes the loop seamless. The nested span is intentional: the CSS
 * puts a ✦ after every span, so nesting is what places the separators between the
 * three phrases. Both copies are hidden from assistive tech and the text is
 * announced once, below.
 */
export default function Marquee() {
  const phrase = (
    <span>
      Crafted with Passion<span>Designed with Purpose</span>Made to Inspire
    </span>
  )

  return (
    <div className="marquee">
      <div className="marquee-track" aria-hidden="true">
        {phrase}
        {phrase}
      </div>
      <span className="sr-only">
        Crafted with passion, designed with purpose, made to inspire.
      </span>
    </div>
  )
}
