'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

interface FiltersProps {
  tab: 'enquiries' | 'subscribers'
  params: { tab?: string; range?: string; from?: string; to?: string }
}

const PRESETS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

/**
 * Date filter bar. Presets update the URL immediately; the custom range applies on
 * submit. Everything lives in the query string so a filtered view can be
 * bookmarked, shared, or reloaded without losing state.
 */
export default function Filters({ tab, params }: FiltersProps) {
  const router = useRouter()
  const [from, setFrom] = useState(params.from ?? '')
  const [to, setTo] = useState(params.to ?? '')

  const customActive = Boolean(params.from || params.to)
  const activePreset = customActive ? '' : (params.range ?? '30')

  function go(next: Record<string, string>) {
    const query = new URLSearchParams()
    query.set('tab', tab)
    for (const [key, value] of Object.entries(next)) {
      if (value) query.set(key, value)
    }
    router.push(`/admin?${query.toString()}`)
  }

  function applyCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    go({ from, to })
  }

  function clearCustom() {
    setFrom('')
    setTo('')
    go({ range: '30' })
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-4 border border-line bg-cream-deep/40 px-4 py-4">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => {
              setFrom('')
              setTo('')
              go({ range: preset.value })
            }}
            aria-pressed={activePreset === preset.value}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
              activePreset === preset.value
                ? 'border-ink bg-ink text-cream'
                : 'border-line text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={applyCustom} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="from"
            className="text-[10px] uppercase tracking-[0.14em] text-ink-soft"
          >
            From
          </label>
          <input
            id="from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="border border-line bg-cream px-3 py-1.5 text-sm outline-none focus-visible:border-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="to"
            className="text-[10px] uppercase tracking-[0.14em] text-ink-soft"
          >
            To
          </label>
          <input
            id="to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="border border-line bg-cream px-3 py-1.5 text-sm outline-none focus-visible:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={!from && !to}
          className="border border-ink bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-cream transition-colors hover:bg-transparent hover:text-ink disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-cream"
        >
          Apply
        </button>
        {customActive && (
          <button
            type="button"
            onClick={clearCustom}
            className="px-1 py-1.5 text-[11px] uppercase tracking-[0.1em] text-gold underline decoration-gold/40 underline-offset-4"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  )
}
