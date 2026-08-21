'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface EnquiryContextValue {
  /** Rug code the form is currently pre-filled with, or '' for a general enquiry. */
  rugCode: string
  setRugCode: (code: string) => void
  /**
   * Scrolls to the enquiry section, optionally pre-selecting a rug. Called by every
   * "Enquire Now" / "Enquire About This Rug" button on the page.
   */
  openEnquiry: (code?: string) => void
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null)

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [rugCode, setRugCode] = useState('')

  const openEnquiry = useCallback((code?: string) => {
    if (code !== undefined) setRugCode(code)

    const target = document.getElementById('enquire')
    if (!target) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })

    // Move focus to the first field once the scroll has settled, so keyboard and
    // screen-reader users land in the form rather than back at the top of the page.
    window.setTimeout(
      () => {
        document.getElementById('enq-name')?.focus({ preventScroll: true })
      },
      reduceMotion ? 0 : 600,
    )
  }, [])

  const value = useMemo(
    () => ({ rugCode, setRugCode, openEnquiry }),
    [rugCode, openEnquiry],
  )

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
}

export function useEnquiry(): EnquiryContextValue {
  const context = useContext(EnquiryContext)
  if (!context) {
    throw new Error('useEnquiry must be used inside an EnquiryProvider')
  }
  return context
}
