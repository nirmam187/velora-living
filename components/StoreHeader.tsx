'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import WhatsAppCta from './WhatsAppCta'
import WhatsAppIcon from './WhatsAppIcon'

/**
 * The header for every page that is not the home page.
 *
 * WHY NOT <Header />. That one is built for a single long document: every link in it
 * is a bare `#fragment`, which on /rugs/vlr-201 would scroll to nothing. The links
 * here are absolute, so they work from anywhere on the site, and the two that now have
 * real pages of their own — the range and the collections — point at those rather than
 * at a section of the home page.
 *
 * Same markup and class names as the home page's header, deliberately. A store whose
 * chrome shifts between the landing page and a product page reads as two sites stapled
 * together, which is the exact impression this work exists to remove.
 */
const NAV_LINKS = [
  { href: '/collections', label: 'Collections' },
  { href: '/rugs', label: 'Full Range' },
  { href: '/#craft', label: 'Craftsmanship' },
  { href: '/#origin', label: 'Our Story' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#enquire', label: 'Contact' },
]

export default function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
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
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-icons">
          <WhatsAppCta className="cta-btn gold wa-btn">
            <WhatsAppIcon size={16} />
            <span className="wa-btn-text">Chat on WhatsApp</span>
          </WhatsAppCta>
          <button
            className="burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="store-mmenu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={menuOpen ? 'mobile-menu open' : 'mobile-menu'} id="store-mmenu">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
