import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/lib/site'

/**
 * The frame for the pages that are not the home page: the legal pages and the 404.
 *
 * Deliberately not the real <Header /> and <Footer />. Those are built for a
 * single long page — every link in them is a `#fragment`, and the footer reaches
 * into EnquiryContext to scroll to a form that does not exist here. Reusing them
 * would mean either mounting providers around static text or shipping a nav full
 * of links that go nowhere, and a nav full of dead links is exactly what section 5
 * of the brief is about.
 *
 * So: the brand, a way home, and the legal row. Nothing that can break.
 */
export default function PageShell({
  title,
  intro,
  children,
}: {
  title: string
  /** One line under the heading. Optional — the 404 uses it, the legal pages do not. */
  intro?: string
  children: React.ReactNode
}) {
  const year = new Date().getFullYear()

  return (
    <>
      <header>
        <div className="nav">
          <Link href="/" className="brandmark">
            <Image
              src="/images/brand/velora-monogram.jpg"
              alt="Velora Living monogram"
              width={44}
              height={44}
              priority
            />
            <div className="brand-word">
              <div className="name">Velora</div>
              <div className="sub">Living</div>
            </div>
          </Link>
          <nav className="links" aria-label="Primary">
            <Link href="/collections">Collections</Link>
            <Link href="/rugs">Full Range</Link>
            <Link href="/#craft">Craftsmanship</Link>
            <Link href="/#enquire">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="legal-page">
        <div className="wrap">
          <h1>{title}</h1>
          {intro && <p className="legal-intro">{intro}</p>}
          {children}
        </div>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-bottom" style={{ marginTop: 0, borderTop: 'none' }}>
            <p>© {year} Velora Living. Where heritage meets home.</p>
            <div className="legal">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
