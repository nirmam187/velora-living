import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { newsletterSchema } from '@/lib/validation'
import { sendMail } from '@/lib/email'
import { newsletterWelcome } from '@/lib/email-templates'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { siteUrl } from '@/lib/site'
import { unsubscribeToken } from '@/lib/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LIMIT = 5
const WINDOW_MS = 10 * 60 * 1000

export async function POST(request: Request) {
  const ip = clientIp(request.headers)

  const limit = rateLimit(`newsletter:${ip}`, LIMIT, WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Please wait a few minutes before trying again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'We could not read that submission.' },
      { status: 400 },
    )
  }

  const parsed = newsletterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsed.error.issues[0]?.message ??
          'That email address does not look right.',
      },
      { status: 400 },
    )
  }

  const { email, website } = parsed.data

  if (website) {
    console.warn(`[newsletter] honeypot triggered from ${ip}`)
    return NextResponse.json({ ok: true, alreadySubscribed: false })
  }

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } })

    // Already on the list and still subscribed: say so warmly, don't re-send the
    // welcome email, and don't create a duplicate row.
    if (existing && !existing.unsubscribed) {
      return NextResponse.json({ ok: true, alreadySubscribed: true })
    }

    // Dedupe on email — a returning address updates the existing row. Someone who
    // previously unsubscribed is quietly resubscribed and welcomed again.
    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      create: { email, ip },
      update: { unsubscribed: false, ip },
    })

    const token = unsubscribeToken(subscriber.email)
    const unsubUrl = `${siteUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(
      subscriber.email,
    )}&token=${token}`

    const welcome = newsletterWelcome(subscriber.email, unsubUrl)
    const sent = await sendMail({
      to: subscriber.email,
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
      tag: 'newsletter-welcome',
    })

    if (sent.ok) {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { welcomedAt: new Date() },
      })
    } else {
      // Keep the signup — it is still a real subscriber. welcomedAt stays null so
      // the /admin list shows the welcome never went out.
      console.error(`[newsletter] ${subscriber.email} stored, welcome email failed`)
    }

    return NextResponse.json({ ok: true, alreadySubscribed: false })
  } catch (error) {
    console.error('[newsletter] failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again shortly.' },
      { status: 500 },
    )
  }
}
