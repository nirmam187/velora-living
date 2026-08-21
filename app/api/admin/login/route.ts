import { NextResponse } from 'next/server'
import { createAdminSession, safeEqual } from '@/lib/tokens'
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE_MS,
  adminPassword,
} from '@/lib/admin-auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Ten attempts per address per fifteen minutes. */
const LIMIT = 10
const WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  const ip = clientIp(request.headers)

  const limit = rateLimit(`admin-login:${ip}`, LIMIT, WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  const expected = adminPassword()
  if (!expected) {
    console.error('[admin] ADMIN_PASSWORD is not set — refusing all logins')
    return NextResponse.json(
      {
        ok: false,
        error:
          'The admin area is not configured. Set ADMIN_PASSWORD in the environment.',
      },
      { status: 503 },
    )
  }

  let password = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Bad request.' },
      { status: 400 },
    )
  }

  if (!safeEqual(password, expected)) {
    return NextResponse.json(
      { ok: false, error: 'That password is not right.' },
      { status: 401 },
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_MAX_AGE_MS / 1000),
  })
  return response
}
