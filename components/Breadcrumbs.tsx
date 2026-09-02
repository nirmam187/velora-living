import Link from 'next/link'
import { siteUrl } from '@/lib/site'

export interface Crumb {
  label: string
  /** Omitted on the last crumb — you do not link the page you are on. */
  href?: string
}

/**
 * The trail above a page heading.
 *
 * Two jobs, and the second is the reason this emits JSON-LD as well as markup. For a
 * visitor it says where they are in a range of a hundred and twelve rugs. For Google it
 * is what turns a result from a bare URL into "Velora Living › Full Range › Plain &
 * Textured › VLR-201", which is most of what makes a listing look like an established
 * shop rather than a page someone put up last week.
 *
 * The structured data mirrors the visible trail exactly. Emitting a breadcrumb list
 * that disagrees with what is on the page is a manual-action risk, not a clever trick.
 */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const base = siteUrl()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${base}${crumb.href}` } : {}),
    })),
  }

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1
            return (
              <li key={crumb.label}>
                {crumb.href && !last ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                )}
                {!last && (
                  <span className="crumb-sep" aria-hidden="true">
                    ›
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
