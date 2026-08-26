'use client'

import Image from 'next/image'
import { useRef, useState, type FormEvent } from 'react'
import Reveal from './Reveal'
import { collections, productByCode, productsIn } from '@/data/products'
import { catalogueLabel, catalogueStyles, catalogueIn, rugByCode } from '@/data/catalogue'
import { useEnquiry } from './EnquiryContext'
import { site } from '@/lib/site'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; name: string }
  | { kind: 'error'; message: string }

const EMPTY_ERRORS: Record<string, string> = {}

export default function Enquire() {
  const { rugCode, setRugCode } = useEnquiry()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>(EMPTY_ERRORS)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const statusRef = useRef<HTMLDivElement>(null)

  const selected = rugCode ? rugByCode(rugCode) : undefined
  const sending = status.kind === 'sending'

  /** Mirrors lib/validation.ts. The server re-checks all of this regardless. */
  function validate(): Record<string, string> {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'That email address does not look right.'
    if (phone.trim() && !/^[0-9+()\-.\s]+$/.test(phone.trim()))
      next.phone = 'Please use digits, spaces and + ( ) - only.'
    if (message.trim().length < 10)
      next.message = 'Please add a little detail — at least 10 characters.'
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      document.getElementById(`enq-${first}`)?.focus()
      return
    }

    setStatus({ kind: 'sending' })

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          rugCode,
          website,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        if (data.fields) setErrors(data.fields)
        setStatus({
          kind: 'error',
          message:
            data.error ?? 'Something went wrong. Please try again in a moment.',
        })
        statusRef.current?.focus()
        return
      }

      setStatus({ kind: 'done', name: name.trim().split(' ')[0] ?? name.trim() })
    } catch {
      setStatus({
        kind: 'error',
        message:
          'We could not reach the studio. Please check your connection, or write to ' +
          site.email +
          '.',
      })
      statusRef.current?.focus()
    }
  }

  function reset() {
    setName('')
    setEmail('')
    setPhone('')
    setMessage('')
    setErrors(EMPTY_ERRORS)
    setStatus({ kind: 'idle' })
  }

  const fallback = productByCode('VLR-119')!
  const visual = selected ?? { image: fallback.image, alt: fallback.alt }

  return (
    <section className="enquire" id="enquire">
      <div className="wrap">
        <Reveal className="sec-head">
          <div>
            <div className="eyebrow">Enquire</div>
            <h2>Tell us about your space</h2>
          </div>
          <p>
            Sizes, materials, lead times or a custom commission — write to us and
            someone from the studio replies within one working day.
          </p>
        </Reveal>

        <div className="enq-grid">
          <Reveal>
            <figure className="enq-visual">
              <Image
                src={visual.image}
                alt={visual.alt}
                fill
                sizes="(max-width: 980px) 340px, 32vw"
                loading="lazy"
              />
              <figcaption>
                {selected ? `${selected.label} · ${selected.code}` : 'Made to order'}
              </figcaption>
            </figure>
            <div className="enq-aside">
              <p>
                Prefer to talk? We are fastest on Instagram —{' '}
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--gold)', fontWeight: 500 }}
                >
                  {site.instagramHandle}
                </a>
                . Or email{' '}
                <a href={`mailto:${site.email}`} style={{ color: 'var(--gold)' }}>
                  {site.email}
                </a>
                .
              </p>
            </div>
          </Reveal>

          <Reveal>
            {status.kind === 'done' ? (
              <div className="enq-done" role="status" aria-live="polite">
                <h3>Thank you, {status.name}</h3>
                <p>
                  Your enquiry is with us and a confirmation is on its way to your
                  inbox. Someone from the studio will reply within one working day.
                </p>
                <p>
                  If it hasn&apos;t arrived shortly, do check your spam folder — or
                  reach us on Instagram at {site.instagramHandle}.
                </p>
                <button type="button" className="again" onClick={reset}>
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form className="enq-form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="enq-name">Name</label>
                  <input
                    id="enq-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'enq-name-err' : undefined}
                    disabled={sending}
                  />
                  {errors.name && (
                    <span className="err" id="enq-name-err">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="enq-email">Email</label>
                  <input
                    id="enq-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'enq-email-err' : undefined}
                    disabled={sending}
                  />
                  {errors.email && (
                    <span className="err" id="enq-email-err">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="enq-phone">
                    Phone <span className="opt">(optional)</span>
                  </label>
                  <input
                    id="enq-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'enq-phone-err' : undefined}
                    disabled={sending}
                  />
                  {errors.phone && (
                    <span className="err" id="enq-phone-err">
                      {errors.phone}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="enq-rugCode">Rug</label>
                  <select
                    id="enq-rugCode"
                    name="rugCode"
                    value={rugCode}
                    onChange={(event) => setRugCode(event.target.value)}
                    disabled={sending}
                  >
                    <option value="">No particular rug yet</option>
                    {collections.map((collection) => (
                      <optgroup key={collection.id} label={collection.label}>
                        {productsIn(collection.id).map((product) => (
                          <option key={product.code} value={product.code}>
                            {product.name} · {product.code}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    {catalogueStyles.map((style) => (
                      <optgroup
                        key={style.id}
                        label={`Full Range — ${style.label}`}
                      >
                        {catalogueIn(style.id).map((rug) => (
                          <option key={rug.code} value={rug.code}>
                            {catalogueLabel(rug)} · {rug.code}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="field full">
                  <label htmlFor="enq-message">Message</label>
                  <textarea
                    id="enq-message"
                    name="message"
                    placeholder="The room, the size you have in mind, or anything you'd like to know."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'enq-message-err' : undefined}
                    disabled={sending}
                  />
                  {errors.message && (
                    <span className="err" id="enq-message-err">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Honeypot. Off-screen, never focusable, never announced. */}
                <div className="hp" aria-hidden="true">
                  <label htmlFor="enq-website">Leave this field empty</label>
                  <input
                    id="enq-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </div>

                <div
                  ref={statusRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                  className={
                    status.kind === 'error' ? 'form-status bad' : 'form-status'
                  }
                  style={status.kind === 'error' ? undefined : { display: 'none' }}
                >
                  {status.kind === 'error' && (
                    <>
                      <span className="mark" aria-hidden="true">
                        !
                      </span>
                      <span>{status.message}</span>
                    </>
                  )}
                </div>

                <div className="enq-submit">
                  <button type="submit" className="cta-btn" disabled={sending}>
                    {sending ? 'Sending…' : 'Send Enquiry'}
                  </button>
                  <span className="enq-note">
                    We reply within one working day. No mailing list, no sharing.
                  </span>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
