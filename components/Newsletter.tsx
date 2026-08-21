'use client'

import { useState, type FormEvent } from 'react'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'ok'; message: string }
  | { kind: 'error'; message: string }

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const sending = status.kind === 'sending'
  const done = status.kind === 'ok'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || done) return

    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus({
        kind: 'error',
        message: 'That email address does not look right.',
      })
      return
    }

    setStatus({ kind: 'sending' })

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, website }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        setStatus({
          kind: 'error',
          message: data.error ?? 'Something went wrong. Please try again shortly.',
        })
        return
      }

      setStatus({
        kind: 'ok',
        message: data.alreadySubscribed
          ? "You're already on the list — good to have you."
          : 'Welcome — check your inbox for a note from us.',
      })
    } catch {
      setStatus({
        kind: 'error',
        message: 'We could not reach the studio. Please check your connection.',
      })
    }
  }

  return (
    <section className="newsletter">
      <div className="wrap">
        <h2>Get first look at new arrivals</h2>
        <p>
          Join our list for early access to new collections, styling guides and a 10%
          welcome discount.
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="nl-email" className="sr-only">
            Your email address
          </label>
          <input
            id="nl-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Your email address"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (status.kind === 'error') setStatus({ kind: 'idle' })
            }}
            disabled={sending || done}
            required
            aria-invalid={status.kind === 'error'}
            aria-describedby="nl-status"
          />

          {/* Honeypot — positioned off-screen, never shown to a real visitor. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="nl-website">Leave this field empty</label>
            <input
              id="nl-website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <button type="submit" disabled={sending || done}>
            {done ? 'Subscribed ✓' : sending ? 'Sending…' : 'Subscribe'}
          </button>
        </form>

        {/*
          One line does double duty: the reassurance note by default, the result
          after a submit. Announcing the outcome in place of the note — rather than
          adding a second line — keeps the band exactly the height it is in the
          original design and avoids any layout shift on submit.
        */}
        <div
          id="nl-status"
          role="status"
          aria-live="polite"
          className={
            status.kind === 'ok'
              ? 'newsletter-note is-ok'
              : status.kind === 'error'
                ? 'newsletter-note is-bad'
                : 'newsletter-note'
          }
        >
          {status.kind === 'ok' || status.kind === 'error'
            ? status.message
            : 'No spam — just new rugs and rare restocks.'}
        </div>
      </div>
    </section>
  )
}
