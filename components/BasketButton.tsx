'use client'

import { useBasket } from './BasketContext'

/**
 * The counter in the header.
 *
 * Rendered on every page, and deliberately hidden while the list is empty. A shop that
 * shows "0" in the corner of every page is telling the visitor about a feature they are
 * not using; one that appears the moment something is added is telling them their
 * action worked. `ready` guards the first paint — the list is read from storage after
 * mount, so without it a returning customer would see the badge flash from empty to
 * three.
 */
export default function BasketButton({ className }: { className?: string }) {
  const { count, ready, open } = useBasket()

  if (!ready || count === 0) return null

  return (
    <button
      type="button"
      className={className ? `basket-btn ${className}` : 'basket-btn'}
      onClick={open}
      aria-label={`Open your enquiry list, ${count} ${count === 1 ? 'rug' : 'rugs'}`}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16l-1.2 12.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9L4 7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9 7V5.6A3 3 0 0 1 12 3a3 3 0 0 1 3 2.6V7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      <span className="basket-count">{count}</span>
    </button>
  )
}
