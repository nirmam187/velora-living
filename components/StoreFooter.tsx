import Link from 'next/link'
import { site } from '@/lib/site'
import { catalogueStyles } from '@/data/catalogue'
import { collections } from '@/data/products'

/**
 * The footer for the store pages.
 *
 * Not <Footer />, for the reason PageShell already gives: that one reaches into
 * EnquiryContext to open a form that only exists on the home page. This one is static,
 * so it can be rendered on the server and cannot break on a page that has no providers.
 *
 * It carries the range as real links rather than a single "Shop" entry. A footer that
 * lists the collections and styles is how a visitor — and a crawler — discovers that
 * there are a hundred and twelve rugs here rather than the sixteen on the home page.
 */
export default function StoreFooter() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="wrap">
        <div className="store-foot">
          <div>
            <h3>Collections</h3>
            <ul>
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link href={`/collections/${collection.id}`}>{collection.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>The Full Range</h3>
            <ul>
              <li>
                <Link href="/rugs">Every rug</Link>
              </li>
              {catalogueStyles.map((style) => (
                <li key={style.id}>
                  <Link href={`/rugs?style=${style.id}`}>{style.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>The Studio</h3>
            <ul>
              <li>
                <Link href="/#origin">Our Story</Link>
              </li>
              <li>
                <Link href="/#craft">Craftsmanship</Link>
              </li>
              <li>
                <Link href="/#sizes">Size Guide</Link>
              </li>
              <li>
                <Link href="/#enquire">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Velora Living</h3>
            <p className="store-foot-note">
              Handwoven in Bhadohi &amp; Mirzapur, designed in Jaipur. Every rug is made
              to order, in any size you need.
            </p>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              {site.instagramHandle}
            </a>
          </div>
        </div>

        <div className="foot-bottom">
          <p>
            © {year} {site.name}. {site.tagline}.
          </p>
          <div className="legal">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
