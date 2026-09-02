'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

export interface BrowseFilter {
  id: string
  label: string
}

/**
 * The filter tabs above a rug grid.
 *
 * WHY THIS WRAPS THE GRID INSTEAD OF RENDERING IT. The obvious version — a client
 * component that holds the rug list and maps over it — costs the page its content.
 * `useSearchParams` opts its subtree out of prerendering, so the built HTML for /rugs
 * contained a Suspense fallback and not one of the hundred and twelve cards. Google
 * runs JavaScript and would probably have got there in the end, but "probably" is a
 * poor bet for the page whose entire job is letting a crawler find every rug, and it
 * would have meant an empty grid for the first paint on a slow phone.
 *
 * So the cards stay server-rendered and are passed in as `children`, which a client
 * component may do — it never re-renders them, it only decides which are shown. The
 * filtering is a data attribute plus a CSS rule, so it costs nothing and works on the
 * markup that is already in the document.
 *
 * The chosen filter lives in the URL, which is what makes /rugs?style=plain a real
 * address: the footer links to it, it can be sent to someone, and Back returns to the
 * same set rather than resetting. `replace` rather than `push`, so flicking through
 * four filters does not bury the previous page under four history entries.
 */
export default function RugFilter({
  filters,
  counts,
  total,
  paramName = 'style',
  children,
}: {
  filters: BrowseFilter[]
  /** How many rugs each filter matches, for the count beside the tabs. */
  counts: Record<string, number>
  total: number
  paramName?: string
  children: ReactNode
}) {
  const router = useRouter()
  const params = useSearchParams()
  const active = params.get(paramName) ?? 'all'
  const shown = active === 'all' ? total : (counts[active] ?? 0)

  function choose(id: string) {
    const next = new URLSearchParams(params.toString())
    if (id === 'all') next.delete(paramName)
    else next.set(paramName, id)
    const query = next.toString()
    router.replace(query ? `?${query}` : '?', { scroll: false })
  }

  return (
    <>
      <div className="fr-tabs" role="group" aria-label="Filter rugs">
        {[{ id: 'all', label: 'All' }, ...filters].map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={filter.id === active ? 'is-active' : undefined}
            aria-pressed={filter.id === active}
            onClick={() => choose(filter.id)}
          >
            {filter.label}
          </button>
        ))}
        <span className="fr-count" aria-live="polite">
          {shown} {shown === 1 ? 'rug' : 'rugs'}
        </span>
      </div>

      <div className="rug-grid" data-filter={active}>
        {children}
      </div>
    </>
  )
}
