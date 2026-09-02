import Image from 'next/image'
import Link from 'next/link'
import AddToBasket from './AddToBasket'
import type { RugView } from '@/data/rugs'

/**
 * One rug in a grid.
 *
 * A whole-card link rather than a card with a link inside it: the entire tile is the
 * target, which is what a shopper expects and what makes this usable with a thumb. The
 * markup stays an <a> around content, so it still middle-clicks and long-presses into a
 * new tab like any other link.
 *
 * The "In your room" flag is here rather than only on the rug page because it is the
 * answer to a question the visitor has BEFORE they open anything — which of these can I
 * actually stand on my floor? Fourteen of a hundred and twelve can, and without a mark
 * on the grid the only way to find them was to open rugs until one had the button.
 */
export default function RugCard({
  rug,
  priority = false,
}: {
  rug: RugView
  /** Set on the first row so the largest contentful paint is not a lazy image. */
  priority?: boolean
}) {
  const photo = rug.photos[0]!

  return (
    <Link
      href={rug.href}
      className="rug-card"
      /* What RugFilter filters on. A data attribute rather than a class so the styling
         hook and the grouping stay separate concerns. */
      data-style={rug.style ?? rug.collection}
    >
      <div className="rug-card-shot">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 560px) 50vw, (max-width: 900px) 33vw, 25vw"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
        {rug.ar && (
          <span className="rug-card-ar" title="Can be viewed in your room">
            In your room
          </span>
        )}
        <AddToBasket
          compact
          rug={{
            code: rug.code,
            name: rug.name,
            href: rug.href,
            image: photo.src,
            alt: photo.alt,
          }}
        />
      </div>
      <div className="rug-card-body">
        <span className="num">{rug.code}</span>
        <h3>{rug.name}</h3>
        <p>{rug.category}</p>
      </div>
    </Link>
  )
}
