'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useEnquiry } from './EnquiryContext'

const NAV_LINKS = [
  { href: '#collections', label: 'Collections' },
  { href: '#craft', label: 'Craftsmanship' },
  { href: '#origin', label: 'Our Story' },
  { href: '#gallery', label: 'Gallery' },
  // Points at the enquiry form rather than the footer, so "Contact" lands on
  // something you can actually act on.
  { href: '#enquire', label: 'Contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { openEnquiry } = useEnquiry()

  return (
    <header>
      <div className="nav">
        <a href="#top" className="brandmark">
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
        </a>

        <nav className="links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-icons">
          <button
            type="button"
            className="cta-btn gold"
            onClick={() => openEnquiry()}
          >
            Enquire Now
          </button>
          <button
            className="burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mmenu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={menuOpen ? 'mobile-menu open' : 'mobile-menu'} id="mmenu">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
      </div>
    </header>
  )
}
