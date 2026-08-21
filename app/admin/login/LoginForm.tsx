'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'Sign in failed.')
        setBusy(false)
        return
      }

      // refresh() re-runs the server component so the new cookie is picked up.
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('Could not reach the server.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-[11px] uppercase tracking-[0.16em] text-ink-soft"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (error) setError('')
          }}
          disabled={busy}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'password-error' : undefined}
          className="rounded-sm border border-line bg-cream px-4 py-3 text-[15px] outline-none transition-colors focus-visible:border-gold disabled:opacity-60"
        />
      </div>

      {error && (
        <p id="password-error" role="alert" className="text-sm text-rust">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-sm border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-[0.08em] text-cream transition-colors hover:bg-transparent hover:text-ink disabled:opacity-60 disabled:hover:bg-ink disabled:hover:text-cream"
      >
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
