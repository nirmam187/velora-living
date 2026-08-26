import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { enquirySchema, fieldErrors } from '@/lib/validation'
import { rugByCode } from '@/data/catalogue'
import { sendMail, ownerAddress } from '@/lib/email'
import { ownerNotification, customerAutoReply } from '@/lib/email-templates'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { metaCookies, sendMetaEvent } from '@/lib/meta'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
/** Never cached — every request writes. */
export const dynamic = 'force-dynamic'

/** Five enquiries per address per fifteen minutes is generous for a real person. */
const LIMIT = 5
const WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  const ip = clientIp(request.headers)

  const limit = rateLimit(`enquiry:${ip}`, LIMIT, WINDOW_MS)
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          `That's a few enquiries in quick succession. Please wait a few minutes, or write to us directly at ${site.email}.`,
      },
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

  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Please check the highlighted fields.',
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    )
  }

  const data = parsed.data

  // Honeypot. Answer exactly like a success so a bot learns nothing, but write
  // nothing and send nothing.
  if (data.website) {
    console.warn(`[enquiry] honeypot triggered from ${ip}`)
    return NextResponse.json({ ok: true, id: null })
  }

  const rug = data.rugCode ? rugByCode(data.rugCode) : undefined

  // Which ad produced this, if any. Captured in the browser on arrival and sent
  // back with the form — see lib/utm.ts.
  const attribution = data.attribution ?? {}

  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        rugCode: rug?.code ?? null,
        rugName: rug?.label ?? null,
        ip,
        userAgent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
        utmSource: attribution.utm_source ?? null,
        utmMedium: attribution.utm_medium ?? null,
        utmCampaign: attribution.utm_campaign ?? null,
        utmContent: attribution.utm_content ?? null,
        utmTerm: attribution.utm_term ?? null,
        fbclid: attribution.fbclid ?? null,
        referrer: attribution.referrer ?? null,
        landingPage: attribution.landingPage ?? null,
      },
    })

    // The enquiry is safely stored at this point. Email is best-effort from here:
    // a delivery failure must not turn a captured lead into an error for the user.
    const payload = {
      id: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
      rugCode: enquiry.rugCode,
      rugName: enquiry.rugName,
      createdAt: enquiry.createdAt,
    }

    const owner = ownerNotification(payload)
    const reply = customerAutoReply(payload)

    const [notify, autoReply] = await Promise.all([
      sendMail({
        to: ownerAddress(),
        subject: owner.subject,
        html: owner.html,
        text: owner.text,
        replyTo: enquiry.email,
        tag: 'enquiry-owner',
      }),
      sendMail({
        to: enquiry.email,
        subject: reply.subject,
        html: reply.html,
        text: reply.text,
        tag: 'enquiry-autoreply',
      }),
    ])

    if (!notify.ok || !autoReply.ok) {
      console.error(
        `[enquiry] ${enquiry.id} stored but email incomplete — owner:${notify.ok} autoReply:${autoReply.ok}`,
      )
    }

    /*
      Server-side `Lead`. Fired here and nowhere earlier: this line is only reached
      once the enquiry is durably in the database and both emails have been
      attempted, so the conversion Meta optimises against is a real, answerable
      lead rather than a button press.

      A failed EMAIL does not suppress it. The lead exists, it is stored, and the
      owner can see it in /admin — withholding the conversion because a transport
      hiccuped would quietly starve the ad account of signal for a reason that has
      nothing to do with the customer. The failure is logged loudly just above.

      Awaited rather than fired and forgotten: a serverless function can be frozen
      the instant it returns a response, which would kill an in-flight request.
    */
    const { fbp, fbc } = metaCookies(request.headers)
    await sendMetaEvent({
      eventName: 'Lead',
      // Falls back to the enquiry's own id when the browser Pixel never loaded.
      // Still unique, still stable, so a retry cannot double-count.
      eventId: data.eventId || `enquiry-${enquiry.id}`,
      sourceUrl: request.headers.get('referer'),
      user: {
        email: enquiry.email,
        phone: enquiry.phone,
        ip,
        userAgent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
        fbp,
        fbc,
      },
      customData: rug
        ? {
            content_ids: [rug.code],
            content_name: rug.label,
            content_category: rug.category,
          }
        : undefined,
    })

    return NextResponse.json({ ok: true, id: enquiry.id })
  } catch (error) {
    console.error('[enquiry] failed:', error)
    return NextResponse.json(
      {
        ok: false,
        error:
          `Something went wrong on our side and your enquiry wasn't saved. Please try again, or email ${site.email}.`,
      },
      { status: 500 },
    )
  }
}
