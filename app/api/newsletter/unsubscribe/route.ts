import { prisma } from '@/lib/db'
import { verifyUnsubscribeToken } from '@/lib/tokens'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * One-click unsubscribe, linked from the footer of the welcome email. The token is
 * an HMAC of the address, so a link cannot be forged for someone else's email.
 * Returns a small branded page rather than JSON — a person clicked this.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')?.toLowerCase() ?? ''
  const token = url.searchParams.get('token') ?? ''

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return page(
      'That link is not valid',
      `It may have been altered in transit. Write to ${site.email} and we will take you off the list by hand.`,
      400,
    )
  }

  try {
    await prisma.subscriber.updateMany({
      where: { email },
      data: { unsubscribed: true },
    })
  } catch (error) {
    console.error('[unsubscribe] failed:', error)
    return page(
      'Something went wrong',
      `Please write to ${site.email} and we will take you off the list by hand.`,
      500,
    )
  }

  return page(
    'You have been unsubscribed',
    `We will not email ${email} again. If this was a mistake, you can rejoin from the foot of our website any time.`,
    200,
  )
}

function page(title: string, body: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} — Velora Living</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#F5F0E6;color:#3A362F;font-family:'Jost',Helvetica,Arial,sans-serif;padding:24px;}
  .card{max-width:460px;text-align:center;}
  .mark{font-family:Georgia,serif;font-size:20px;color:#1A1815;letter-spacing:0.04em;}
  .sub{font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:#B08A3E;margin-top:3px;}
  h1{font-family:Georgia,serif;font-weight:500;font-size:26px;color:#1A1815;margin:32px 0 14px;}
  p{line-height:1.65;margin:0 0 26px;}
  a{display:inline-block;background:#1A1815;color:#F5F0E6;text-decoration:none;font-size:12px;
    letter-spacing:0.08em;text-transform:uppercase;padding:12px 24px;}
</style>
</head>
<body>
  <div class="card">
    <div class="mark">Velora</div><div class="sub">Living</div>
    <h1>${title}</h1>
    <p>${body}</p>
    <a href="/">Back to the website</a>
  </div>
</body>
</html>`

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
