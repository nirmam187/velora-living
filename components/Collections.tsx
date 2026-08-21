'use client'

import { useId, useMemo, useRef, useState } from 'react'
import Reveal from './Reveal'
import CollectionRow from './CollectionRow'
import {
  collections,
  productsIn,
  type CollectionId,
  type Material,
  type Weave,
} from '@/data/products'

const WEAVES: Weave[] = ['Hand Tufted', 'Hand Woven', 'Machine Made']
const MATERIALS: Material[] = [
  'New Zealand Wool',
  'Bikaneri Wool',
  'Blended Wool',
  'Silk Blend',
]

/** Shorter labels — the full material names are too long for a chip row. */
const MATERIAL_LABEL: Record<Material, string> = {
  'New Zealand Wool': 'NZ Wool',
  'Bikaneri Wool': 'Bikaneri',
  'Blended Wool': 'Blended',
  'Silk Blend': 'Silk',
}

export default function Collections() {
  const [active, setActive] = useState<CollectionId>('classic')
  const [weave, setWeave] = useState<Weave | null>(null)
  const [material, setMaterial] = useState<Material | null>(null)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const shown = useMemo(() => {
    return productsIn(active).filter((product) => {
      if (weave && product.weave !== weave) return false
      if (material && !product.materials.includes(material)) return false
      return true
    })
  }, [active, weave, material])

  const inCollection = productsIn(active)
  /** Only offer a filter that would actually match something in this collection. */
  const availableWeaves = WEAVES.filter((w) =>
    inCollection.some((p) => p.weave === w),
  )
  const availableMaterials = MATERIALS.filter((m) =>
    inCollection.some((p) => p.materials.includes(m)),
  )

  const filtered = weave !== null || material !== null

  /** Left/Right move between tabs, as expected of a tablist. */
  function onTabKeyDown(event: React.KeyboardEvent, index: number) {
    const delta =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (delta === 0) return
    event.preventDefault()
    const nextIndex = (index + delta + collections.length) % collections.length
    const nextTab = collections[nextIndex]
    if (!nextTab) return
    setActive(nextTab.id)
    setWeave(null)
    setMaterial(null)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section id="collections">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">The Collections</div>
            <h2>A style for every room, a story in every weave</h2>
          </div>
          <p>
            Two collections, sixteen designs — from Persian-inspired classics to
            free-form modern art underfoot.
          </p>
        </Reveal>

        <Reveal className="coll-tabs">
          <div role="tablist" aria-label="Collections" style={{ display: 'contents' }}>
            {collections.map((collection, index) => {
              const selected = active === collection.id
              return (
                <button
                  key={collection.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${collection.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${collection.id}`}
                  tabIndex={selected ? 0 : -1}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  className={selected ? 'coll-tab active' : 'coll-tab'}
                  onClick={() => {
                    setActive(collection.id)
                    setWeave(null)
                    setMaterial(null)
                  }}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  {collection.label}
                </button>
              )
            })}
          </div>
        </Reveal>

        <Reveal className="coll-filters">
          <div className="filter-group" role="group" aria-label="Filter by weave">
            <span className="filter-label">Weave</span>
            <button
              type="button"
              className={weave === null ? 'chip is-on' : 'chip'}
              aria-pressed={weave === null}
              onClick={() => setWeave(null)}
            >
              All
            </button>
            {availableWeaves.map((option) => (
              <button
                key={option}
                type="button"
                className={weave === option ? 'chip is-on' : 'chip'}
                aria-pressed={weave === option}
                onClick={() => setWeave(weave === option ? null : option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="filter-group" role="group" aria-label="Filter by yarn">
            <span className="filter-label">Yarn</span>
            <button
              type="button"
              className={material === null ? 'chip is-on' : 'chip'}
              aria-pressed={material === null}
              onClick={() => setMaterial(null)}
            >
              All
            </button>
            {availableMaterials.map((option) => (
              <button
                key={option}
                type="button"
                className={material === option ? 'chip is-on' : 'chip'}
                aria-pressed={material === option}
                onClick={() => setMaterial(material === option ? null : option)}
              >
                {MATERIAL_LABEL[option]}
              </button>
            ))}
          </div>

          <p className="filter-count" role="status" aria-live="polite">
            {shown.length} of {inCollection.length}
            {filtered && (
              <button
                type="button"
                className="filter-clear"
                onClick={() => {
                  setWeave(null)
                  setMaterial(null)
                }}
              >
                Clear
              </button>
            )}
          </p>
        </Reveal>

        {collections.map((collection) => {
          const selected = active === collection.id
          return (
            <div
              key={collection.id}
              id={`${baseId}-panel-${collection.id}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${collection.id}`}
              hidden={!selected}
              className={selected ? 'coll-group active' : 'coll-group'}
            >
              {selected && <CollectionRow products={shown} />}
            </div>
          )
        })}
      </div>
    </section>
  )
}
