import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), {
    status: 303,
  })
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}

/** Guards against a stray GET leaving someone apparently logged in. */
export async function GET(request: Request) {
  return POST(request)
}
