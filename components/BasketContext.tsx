'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * The enquiry list — this shop's cart.
 *
 * WHY IT IS A LIST AND NOT A CART. No price is published anywhere on this site, on
 * purpose: /terms says so, and every rug is quoted per rug and per size because that is
 * how they are actually sold. So there is nothing to total and nothing to check out.
 * What a customer genuinely needs is to gather the four rugs they are deciding between,
 * say what size they want each one in, and send that to the studio in one message
 * instead of four. That is what this holds.
 *
 * It behaves like a cart in every way that matters to a shopper — a counter in the
 * header, a drawer, and it is still there tomorrow — because those are the affordances
 * people already know. It just ends in a conversation rather than a card form.
 *
 * WHAT IS STORED, AND WHY IT IS DENORMALISED. Each item carries its own name, image and
 * link rather than only a code. Storing codes alone would mean the drawer has to look
 * every one up, which would pull the whole hundred-and-twelve-rug catalogue into the
 * JavaScript of every page that shows a basket counter. The cost is that a rug renamed
 * between visits keeps its old name in someone's list until they re-add it, which is a
 * far smaller problem than a slower site.
 */

export interface BasketItem {
  code: string
  name: string
  /** Path to the rug's page, e.g. "/rugs/vlr-201". Made absolute when sent. */
  href: string
  image: string
  alt: string
  /** The size the customer picked, e.g. "5 × 8 ft". Absent until they choose one. */
  sizeLabel?: string
  /** Epoch ms, so the list can be shown newest-last without a separate index. */
  addedAt: number
}

interface BasketContextValue {
  items: BasketItem[]
  count: number
  /** False until the stored list has been read, so nothing renders a wrong count. */
  ready: boolean
  has: (code: string) => boolean
  add: (item: Omit<BasketItem, 'addedAt'>) => void
  remove: (code: string) => void
  setSize: (code: string, sizeLabel: string | undefined) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

const BasketContext = createContext<BasketContextValue | null>(null)

/** Versioned, so a future change of shape can be ignored rather than crash a drawer. */
const STORAGE_KEY = 'velora-enquiry-list-v1'

function read(): BasketItem[] {
  // Every one of these can throw or lie: private windows, cleared site data, a browser
  // set to block storage, or JSON left by an older version of this code. An empty list
  // is always a safe answer, and a shop that white-screens because of a stale key is
  // not.
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is BasketItem =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as BasketItem).code === 'string' &&
        typeof (item as BasketItem).name === 'string' &&
        typeof (item as BasketItem).href === 'string',
    )
  } catch {
    return []
  }
}

function write(items: BasketItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or blocked. The list still works for this visit; it just will not
    // survive a reload. Losing it silently is better than interrupting the visitor.
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([])
  const [ready, setReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Read after mount, never during render. The server has no localStorage, so seeding
  // state from it directly would make the first client render disagree with the HTML
  // and React would throw away the markup.
  useEffect(() => {
    setItems(read())
    setReady(true)
  }, [])

  // Keep other tabs in step. Someone browsing rugs in three tabs — which is exactly how
  // people shop — should not find three different lists.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setItems(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: BasketItem[]) => {
    setItems(next)
    write(next)
  }, [])

  const add = useCallback(
    (item: Omit<BasketItem, 'addedAt'>) => {
      setItems((current) => {
        // Adding a rug already on the list updates its size rather than duplicating it.
        // Two lines for the same rug would make the studio ask which one was meant.
        const existing = current.find((entry) => entry.code === item.code)
        const next = existing
          ? current.map((entry) =>
              entry.code === item.code ? { ...entry, ...item } : entry,
            )
          : [...current, { ...item, addedAt: Date.now() }]
        write(next)
        return next
      })
      setIsOpen(true)
    },
    [],
  )

  const remove = useCallback(
    (code: string) =>
      setItems((current) => {
        const next = current.filter((entry) => entry.code !== code)
        write(next)
        return next
      }),
    [],
  )

  const setSize = useCallback(
    (code: string, sizeLabel: string | undefined) =>
      setItems((current) => {
        const next = current.map((entry) =>
          entry.code === code ? { ...entry, sizeLabel } : entry,
        )
        write(next)
        return next
      }),
    [],
  )

  const clear = useCallback(() => persist([]), [persist])

  const value = useMemo<BasketContextValue>(
    () => ({
      items,
      count: items.length,
      ready,
      has: (code: string) => items.some((entry) => entry.code === code),
      add,
      remove,
      setSize,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [items, ready, add, remove, setSize, clear, isOpen],
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

export function useBasket(): BasketContextValue {
  const context = useContext(BasketContext)
  if (!context) throw new Error('useBasket must be used inside a BasketProvider')
  return context
}
