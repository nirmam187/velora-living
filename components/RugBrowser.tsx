'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import RugCard from './RugCard'
import type { RugView } from '@/data/rugs'

export interface BrowseFilter {
  id: string
  label: string
}

/**
 * The filterable grid behind /rugs.
 *
 * The chosen filter lives in the URL rather than in component state, which is what
 * makes /rugs?style=plain a real address: the footer links straight to it, a visitor can
 * send it to someone, and coming back via the browser's Back button lands on the same
 * set of rugs rather than resetting to everything. `replace` rather than `push` so
 * flicking between four filters does not bury the previous page under four history
 * entries.
 */
export default function RugBrowser({
  rugs,
  filters,
  paramName = 'style',
}: {
  rugs: RugView[]
  filters: BrowseFilter[]
  paramName?: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const active = params.get(paramName) ?? 'all'

  const visible = useMemo(
    () =>
      active === 'all'
        ? rugs
        : rugs.filter((rug) => rug.style === active || rug.collection === active),
    [rugs, active],
  )

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
          {visible.length} {visible.length === 1 ? 'rug' : 'rugs'}
        </span>
      </div>

      <div className="rug-grid">
        {visible.map((rug, index) => (
          <RugCard key={rug.code} rug={rug} priority={index < 4} />
        ))}
      </div>
    </>
  )
}
