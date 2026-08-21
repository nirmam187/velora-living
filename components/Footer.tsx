'use client'

import Image from 'next/image'
import { site } from '@/lib/site'
import { useEnquiry } from './EnquiryContext'

export default function Footer() {
  const { openEnquiry } = useEnquiry()
  const year = new Date().getFullYear()

  return (
    <footer id="contact">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brandmark">
              <Image
                src="/images/brand/velora-monogram.jpg"
                alt="Velora Living monogram"
                width={40}
                height={40}
                loading="lazy"
              />
              <div className="brand-word">
                <div className="name" style={{ color: 'var(--cream)' }}>
                  Velora
                </div>
                <div className="sub">Living</div>
              </div>
            </div>
            <p>
              Handwoven rugs for homes with intention. Crafted with passion, designed
              with purpose, made to inspire.
            </p>
            {/*
              The visible "IG"/"P" are decorative shorthands. Rather than an
              aria-label that contradicts them (WCAG 2.5.3 Label in Name — an
              accessible name of "Instagram" against visible text "IG" fails), the
              glyph is hidden from assistive tech and the real name is supplied by a
              visually-hidden sibling. Screen readers announce "Instagram"; sighted
              users see the monogram; nothing about the layout changes.
            */}
            <div className="foot-social">
              <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">IG</span>
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true">P</span>
                <span className="sr-only">Pinterest</span>
              </a>
            </div>
          </div>

          <div className="foot-col">
            <h3>Shop</h3>
            <a href="#collections">Classic Heritage</a>
            <a href="#collections">Modern Heritage</a>
            <a href="#sizes">Custom Sizes</a>
          </div>

          <div className="foot-col">
            <h3>Company</h3>
            <a href="#origin">Our Story</a>
            <a href="#craft">Craftsmanship</a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>

          <div className="foot-col">
            <h3>Get in Touch</h3>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <p>{site.location}</p>
            <p>We&apos;re online-first — reach us fastest on Instagram.</p>
            <button
              type="button"
              className="cta-btn gold"
              style={{ marginTop: 4 }}
              onClick={() => openEnquiry()}
            >
              Send an Enquiry
            </button>
          </div>
        </div>

        <div className="foot-bottom">
          <p>© {year} Velora Living. Where heritage meets home.</p>
          {/* These were placeholders in the original markup and still are — the
              copy is yours to write. See "Still to do" in the README. */}
          <div className="legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Shipping &amp; Returns</a>
            <a href="#">Care Guide</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
