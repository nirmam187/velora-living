import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { isAdmin, adminPassword } from '@/lib/admin-auth'
import { emailProvider } from '@/lib/email'
import Filters from './Filters'

export const dynamic = 'force-dynamic'

type Tab = 'enquiries' | 'subscribers'

interface SearchParams {
  tab?: string
  range?: string
  from?: string
  to?: string
}

/** Presets offered in the filter bar, plus the custom range. */
const RANGES: Record<string, number | null> = {
  '7': 7,
  '30': 30,
  '90': 90,
  all: null,
}

/**
 * Resolves the search params into a Prisma `createdAt` filter.
 * An explicit from/to always wins over a preset.
 */
function dateFilter(params: SearchParams) {
  const { from, to } = params

  if (from || to) {
    const gte = from ? new Date(`${from}T00:00:00`) : undefined
    const lte = to ? new Date(`${to}T23:59:59.999`) : undefined
    const valid = (d?: Date) => (d && !Number.isNaN(d.getTime()) ? d : undefined)
    const range = { gte: valid(gte), lte: valid(lte) }
    if (range.gte || range.lte) return range
  }

  const days = RANGES[params.range ?? '30']
  if (days === null || days === undefined) return undefined

  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)
  return { gte: since }
}

/** Marks an enquiry followed-up, or un-marks it. Called from the row's button. */
async function toggleHandled(formData: FormData) {
  'use server'

  if (!isAdmin()) return

  const id = String(formData.get('id') ?? '')
  const next = String(formData.get('next') ?? '') === 'true'
  if (!id) return

  await prisma.enquiry.update({ where: { id }, data: { handled: next } })
  revalidatePath('/admin')
}

function formatDate(value: Date): string {
  return value.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  if (!isAdmin()) redirect('/admin/login')

  const tab: Tab = searchParams.tab === 'subscribers' ? 'subscribers' : 'enquiries'
  const createdAt = dateFilter(searchParams)
  const where = createdAt ? { createdAt } : {}

  const [enquiries, subscribers, totalEnquiries, totalSubscribers, unhandled] =
    await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      prisma.enquiry.count(),
      prisma.subscriber.count({ where: { unsubscribed: false } }),
      prisma.enquiry.count({ where: { handled: false } }),
    ])

  const rows = tab === 'enquiries' ? enquiries.length : subscribers.length
  const configured = Boolean(adminPassword())

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="font-display text-xl tracking-[0.04em]">Velora</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.35em] text-gold">
            Living — studio admin
          </div>
        </div>
        <div className="flex items-center gap-5 text-xs text-ink-soft">
          <a href="/" className="underline decoration-line underline-offset-4 hover:text-ink">
            View site
          </a>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="underline decoration-line underline-offset-4 hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {emailProvider() === 'console' && (
        <p className="mb-6 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
          <strong className="font-medium text-ink">Email is in preview mode.</strong>{' '}
          Nothing is being delivered — messages are written to{' '}
          <code className="text-[13px]">.mail-preview/</code>. Set{' '}
          <code className="text-[13px]">RESEND_API_KEY</code> to start sending for
          real.
        </p>
      )}

      {!configured && (
        <p className="mb-6 rounded-sm border border-rust/40 bg-rust/10 px-4 py-3 text-sm text-rust">
          ADMIN_PASSWORD is not set. Logins are disabled until it is.
        </p>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Enquiries, all time" value={totalEnquiries} />
        <Stat label="Awaiting reply" value={unhandled} accent={unhandled > 0} />
        <Stat label="Subscribers" value={totalSubscribers} />
      </div>

      <nav className="mb-6 flex gap-2" aria-label="Records">
        <TabLink
          active={tab === 'enquiries'}
          href={buildHref(searchParams, { tab: 'enquiries' })}
          label={`Enquiries (${enquiries.length})`}
        />
        <TabLink
          active={tab === 'subscribers'}
          href={buildHref(searchParams, { tab: 'subscribers' })}
          label={`Newsletter (${subscribers.length})`}
        />
      </nav>

      <Filters tab={tab} params={searchParams} />

      <p className="mb-4 text-xs text-ink-soft">
        Showing {rows} {rows === 1 ? 'record' : 'records'}
        {rows === 500 ? ' (capped at 500 — narrow the date range to see more)' : ''}.
      </p>

      {tab === 'enquiries' ? (
        enquiries.length === 0 ? (
          <Empty what="enquiries" />
        ) : (
          <ul className="flex flex-col gap-3">
            {enquiries.map((enquiry) => (
              <li
                key={enquiry.id}
                className={`rounded-sm border p-5 ${
                  enquiry.handled
                    ? 'border-line bg-cream-deep/40'
                    : 'border-line bg-cream-deep/70'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg">{enquiry.name}</span>
                      {enquiry.rugCode && (
                        <span className="border border-gold/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-gold">
                          {enquiry.rugName ?? enquiry.rugCode} · {enquiry.rugCode}
                        </span>
                      )}
                      {enquiry.handled && (
                        <span className="text-[10px] uppercase tracking-[0.12em] text-emerald">
                          ✓ Handled
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="underline decoration-line underline-offset-4 hover:text-ink"
                      >
                        {enquiry.email}
                      </a>
                      {enquiry.phone && (
                        <a
                          href={`tel:${enquiry.phone.replace(/\s/g, '')}`}
                          className="underline decoration-line underline-offset-4 hover:text-ink"
                        >
                          {enquiry.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <time
                    dateTime={enquiry.createdAt.toISOString()}
                    className="whitespace-nowrap text-xs text-ink-soft"
                  >
                    {formatDate(enquiry.createdAt)}
                  </time>
                </div>

                <p className="mb-4 whitespace-pre-wrap border-l-2 border-gold pl-4 text-[15px] leading-relaxed">
                  {enquiry.message}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <form action={toggleHandled}>
                    <input type="hidden" name="id" value={enquiry.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={String(!enquiry.handled)}
                    />
                    <button
                      type="submit"
                      className="border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      {enquiry.handled ? 'Mark unhandled' : 'Mark handled'}
                    </button>
                  </form>
                  <a
                    href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                      'Re: your enquiry — Velora Living',
                    )}`}
                    className="text-[11px] uppercase tracking-[0.1em] text-gold underline decoration-gold/40 underline-offset-4"
                  >
                    Reply
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : subscribers.length === 0 ? (
        <Empty what="subscribers" />
      ) : (
        <div className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-cream-deep text-left">
                <Th>Email</Th>
                <Th>Joined</Th>
                <Th>Welcome sent</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${subscriber.email}`}
                      className="underline decoration-line underline-offset-4 hover:text-ink"
                    >
                      {subscriber.email}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {formatDate(subscriber.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {subscriber.welcomedAt ? formatDate(subscriber.welcomedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {subscriber.unsubscribed ? (
                      <span className="text-rust">Unsubscribed</span>
                    ) : (
                      <span className="text-emerald">Subscribed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="border border-line bg-cream-deep/50 px-4 py-4">
      <div
        className={`font-display text-2xl ${accent ? 'text-gold' : 'text-ink'}`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </div>
    </div>
  )
}

function TabLink({
  active,
  href,
  label,
}: {
  active: boolean
  href: string
  label: string
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`border px-4 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${
        active
          ? 'border-ink bg-ink text-cream'
          : 'border-line text-ink-soft hover:border-ink hover:text-ink'
      }`}
    >
      {label}
    </a>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft">
      {children}
    </th>
  )
}

function Empty({ what }: { what: string }) {
  return (
    <p className="border border-dashed border-line px-6 py-14 text-center text-sm text-ink-soft">
      No {what} in this date range.
    </p>
  )
}

/** Merges overrides into the current query string. */
function buildHref(params: SearchParams, overrides: Partial<SearchParams>): string {
  const merged = { ...params, ...overrides }
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(merged)) {
    if (value) query.set(key, value)
  }
  const string = query.toString()
  return string ? `/admin?${string}` : '/admin'
}
