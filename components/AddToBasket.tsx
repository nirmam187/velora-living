'use client'

import { useBasket, type BasketItem } from './BasketContext'

/**
 * "Add to enquiry list" — the add-to-cart of a shop that quotes rather than prices.
 *
 * Once a rug is on the list the button becomes a way back INTO the list rather than a
 * disabled stub or a second identical button. A shopper who taps add twice is telling
 * you they want to see what they have got, so that is what the second tap does.
 *
 * The size is not chosen here. On a rug page the customer is still deciding, and making
 * them pick a size before they can save a rug is the friction that stops lists getting
 * built at all — so it is picked later, per rug, in the drawer, where they can see the
 * whole shortlist at once and change their mind.
 */
export default function AddToBasket({
  rug,
  compact = false,
}: {
  rug: Omit<BasketItem, 'addedAt' | 'sizeLabel'>
  /** The small square button used on grid cards. */
  compact?: boolean
}) {
  const { add, has, open, ready } = useBasket()
  const added = ready && has(rug.code)

  function onClick(event: React.MouseEvent) {
    // Cards wrap the whole tile in a link, so without this the page navigates to the
    // rug instead of adding it.
    event.preventDefault()
    event.stopPropagation()
    if (added) open()
    else add(rug)
  }

  if (compact) {
    return (
      <button
        type="button"
        className={`card-add${added ? ' is-added' : ''}`}
        onClick={onClick}
        aria-label={
          added ? `${rug.name} is on your enquiry list` : `Add ${rug.name} to your enquiry list`
        }
        title={added ? 'On your enquiry list' : 'Add to enquiry list'}
      >
        <span aria-hidden="true">{added ? '✓' : '+'}</span>
      </button>
    )
  }

  return (
    <button type="button" className="cta-btn line basket-add" onClick={onClick}>
      {added ? 'On your list — view it' : 'Add to enquiry list'}
    </button>
  )
}
