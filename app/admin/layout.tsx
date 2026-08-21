import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin',
  // Belt and braces alongside robots.ts — this area must never be indexed.
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-cream text-ink">{children}</div>
}
