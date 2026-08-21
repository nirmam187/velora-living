'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from '@/data/products'

interface RugViewerValue {
  /** The rug currently open in the quick-view, or null when closed. */
  current: Product | null
  /** Codes the viewer can page through — the list the rug was opened from. */
  scope: string[]
  open: (code: string, scope?: string[]) => void
  close: () => void
  next: () => void
  previous: () => void
}

const RugViewerContext = createContext<RugViewerValue | null>(null)

const ALL_CODES = products.map((p) => p.code)

export function RugViewerProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(null)
  const [scope, setScope] = useState<string[]>(ALL_CODES)

  const open = useCallback((nextCode: string, nextScope?: string[]) => {
    // Paging stays inside whatever list the visitor was looking at, so opening a
    // rug from the filtered Modern row pages through that row and not the whole
    // catalogue. Falls back to everything if a scope isn't supplied.
    setScope(nextScope && nextScope.length > 0 ? nextScope : ALL_CODES)
    setCode(nextCode)
  }, [])

  const close = useCallback(() => setCode(null), [])

  const step = useCallback(
    (delta: number) => {
      setCode((currentCode) => {
        if (!currentCode) return currentCode
        const index = scope.indexOf(currentCode)
        if (index === -1) return currentCode
        // Wraps, so the arrows never dead-end.
        const nextIndex = (index + delta + scope.length) % scope.length
        return scope[nextIndex] ?? currentCode
      })
    },
    [scope],
  )

  const next = useCallback(() => step(1), [step])
  const previous = useCallback(() => step(-1), [step])

  const current = useMemo(
    () => (code ? (products.find((p) => p.code === code) ?? null) : null),
    [code],
  )

  const value = useMemo(
    () => ({ current, scope, open, close, next, previous }),
    [current, scope, open, close, next, previous],
  )

  return (
    <RugViewerContext.Provider value={value}>{children}</RugViewerContext.Provider>
  )
}

export function useRugViewer(): RugViewerValue {
  const context = useContext(RugViewerContext)
  if (!context) {
    throw new Error('useRugViewer must be used inside a RugViewerProvider')
  }
  return context
}
