import { site, siteUrl } from './site'

/**
 * Email bodies. The tone follows the site: warm, understated, unhurried, no
 * exclamation marks, no marketing shout. Every template returns both an HTML and a
 * plain-text part — some clients render only text, and a text part meaningfully
 * improves deliverability.
 */

const CREAM = '#F5F0E6'
const INK = '#1A1815'
const INK_SOFT = '#3A362F'
const GOLD = '#B08A3E'
const LINE = 'rgba(26,24,21,0.14)'

/** Escapes user-supplied text before it goes anywhere near an HTML body. */
export function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Shared shell: centred card, brand type, generous whitespace. */
function shell(inner: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.name)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CREAM};border:1px solid ${LINE};">
        <tr>
          <td style="padding:26px 32px;border-bottom:1px solid ${LINE};">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:19px;letter-spacing:0.04em;color:${INK};">Velora</div>
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:${GOLD};margin-top:3px;">Living</div>
          </td>
        </tr>
        <tr><td style="padding:32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:${INK_SOFT};">
${inner}
        </td></tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid ${LINE};font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:rgba(26,24,21,0.55);">
            ${esc(site.name)} · ${esc(site.location)}<br>
            <a href="${site.instagram}" style="color:${GOLD};text-decoration:none;">${esc(site.instagramHandle)}</a>
            &nbsp;·&nbsp;
            <a href="mailto:${site.email}" style="color:${GOLD};text-decoration:none;">${esc(site.email)}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:23px;line-height:1.25;color:${INK};">${esc(text)}</h1>`
}

function para(html: string): string {
  return `<p style="margin:0 0 16px;">${html}</p>`
}

export interface EnquiryData {
  name: string
  email: string
  phone?: string | null
  message: string
  rugCode?: string | null
  rugName?: string | null
  id: string
  createdAt: Date
}

/** Sent to the business owner when an enquiry arrives. */
export function ownerNotification(d: EnquiryData) {
  const about = d.rugCode
    ? `${d.rugName ?? 'Rug'} (${d.rugCode})`
    : 'General enquiry'

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;width:96px;vertical-align:top;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${GOLD};">${esc(label)}</td>
      <td style="padding:8px 0;vertical-align:top;color:${INK};">${value}</td>
    </tr>`

  const inner = `
${heading('New enquiry')}
${para(`A new enquiry came in through the website.`)}
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:14px;">
  ${row('About', esc(about))}
  ${row('Name', esc(d.name))}
  ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:${INK};">${esc(d.email)}</a>`)}
  ${d.phone ? row('Phone', `<a href="tel:${esc(d.phone.replace(/\s/g, ''))}" style="color:${INK};">${esc(d.phone)}</a>`) : ''}
  ${row('Received', esc(d.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })))}
</table>
<div style="border-left:2px solid ${GOLD};padding:2px 0 2px 16px;margin:0 0 22px;white-space:pre-wrap;color:${INK};">${esc(d.message)}</div>
${para(`<a href="mailto:${esc(d.email)}?subject=${encodeURIComponent(`Re: your enquiry — ${site.name}`)}" style="display:inline-block;background:${INK};color:${CREAM};text-decoration:none;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;padding:11px 22px;">Reply to ${esc(d.name.split(' ')[0] ?? d.name)}</a>`)}
<p style="margin:22px 0 0;font-size:12px;color:rgba(26,24,21,0.5);">Reference ${esc(d.id)}</p>`

  const text = [
    'New enquiry',
    '',
    `About:    ${about}`,
    `Name:     ${d.name}`,
    `Email:    ${d.email}`,
    d.phone ? `Phone:    ${d.phone}` : null,
    `Received: ${d.createdAt.toISOString()}`,
    '',
    d.message,
    '',
    `Reference ${d.id}`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    subject: d.rugCode
      ? `Enquiry — ${d.rugName ?? d.rugCode} (${d.rugCode}) — ${d.name}`
      : `Enquiry — ${d.name}`,
    html: shell(inner, `${d.name} enquired about ${about}`),
    text,
  }
}

/** Auto-reply sent to the customer, confirming we have their enquiry. */
export function customerAutoReply(d: EnquiryData) {
  const firstName = d.name.split(' ')[0] ?? d.name

  const aboutLine = d.rugCode
    ? para(
        `You asked about <strong style="color:${INK};font-weight:500;">${esc(d.rugName ?? d.rugCode)}</strong> (${esc(d.rugCode)}). We'll come back to you with sizes, materials and pricing for it.`,
      )
    : para(
        `We'll read what you've sent properly and come back with something useful rather than a form reply.`,
      )

  const inner = `
${heading(`Thank you, ${firstName}`)}
${para(`Your enquiry has reached us, and someone from the studio will reply within one working day.`)}
${aboutLine}
${para(`Every Velora rug is made to order in Bhadohi and Mirzapur, so if the size you need isn't one of our nine standard sizes, do say — custom sizes and shapes are available on every design.`)}
<div style="border-top:1px solid ${LINE};margin:24px 0 20px;"></div>
${para(`<span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${GOLD};">What you sent us</span>`)}
<div style="border-left:2px solid ${LINE};padding:2px 0 2px 16px;margin:0 0 22px;white-space:pre-wrap;color:${INK_SOFT};">${esc(d.message)}</div>
${para(`In the meantime, we post new arrivals and finished rooms on Instagram — <a href="${site.instagram}" style="color:${GOLD};text-decoration:none;font-weight:500;">${esc(site.instagramHandle)}</a>.`)}
${para(`Warmly,<br><span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:${GOLD};">The Velora Living studio</span>`)}`

  const text = `Thank you, ${firstName}

Your enquiry has reached us, and someone from the studio will reply within one working day.

${
  d.rugCode
    ? `You asked about ${d.rugName ?? d.rugCode} (${d.rugCode}). We'll come back to you with sizes, materials and pricing for it.`
    : `We'll read what you've sent properly and come back with something useful rather than a form reply.`
}

Every Velora rug is made to order in Bhadohi and Mirzapur, so if the size you need isn't one of our nine standard sizes, do say — custom sizes and shapes are available on every design.

What you sent us:
${d.message}

In the meantime, we post new arrivals and finished rooms on Instagram — ${site.instagramHandle} (${site.instagram}).

Warmly,
The Velora Living studio
${site.email}`

  return {
    subject: `We have your enquiry — ${site.name}`,
    html: shell(inner, 'We have your enquiry and will reply within one working day.'),
    text,
  }
}

/** Welcome email for a new newsletter subscriber. */
export function newsletterWelcome(email: string, unsubscribeUrl: string) {
  const inner = `
${heading('Welcome to Velora Living')}
${para(`You're on the list. From here you'll be first to see new arrivals, the occasional styling guide, and restocks of pieces that rarely sit still for long.`)}
${para(`As a thank you, here's <strong style="color:${INK};font-weight:500;">10% off your first rug</strong> — just mention <span style="font-family:Georgia,serif;letter-spacing:0.08em;color:${GOLD};">WELCOME10</span> when you enquire.`)}
${para(`We send rarely, and only when there's genuinely something worth showing you.`)}
<div style="border-top:1px solid ${LINE};margin:24px 0 20px;"></div>
${para(`<a href="${site.instagram}" style="color:${GOLD};text-decoration:none;font-weight:500;">Follow ${esc(site.instagramHandle)}</a> for the day-to-day — looms, colour trials, and rooms our rugs have moved into.`)}
${para(`Warmly,<br><span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;color:${GOLD};">The Velora Living studio</span>`)}
<p style="margin:24px 0 0;font-size:11px;color:rgba(26,24,21,0.5);">
  You're receiving this because ${esc(email)} was entered on ${esc(new URL(siteUrl()).host)}.
  <a href="${esc(unsubscribeUrl)}" style="color:rgba(26,24,21,0.5);">Unsubscribe</a>.
</p>`

  const text = `Welcome to Velora Living

You're on the list. From here you'll be first to see new arrivals, the occasional styling guide, and restocks of pieces that rarely sit still for long.

As a thank you, here's 10% off your first rug — just mention WELCOME10 when you enquire.

We send rarely, and only when there's genuinely something worth showing you.

Follow ${site.instagramHandle} (${site.instagram}) for the day-to-day — looms, colour trials, and rooms our rugs have moved into.

Warmly,
The Velora Living studio

You're receiving this because ${email} was entered on ${new URL(siteUrl()).host}.
Unsubscribe: ${unsubscribeUrl}`

  return {
    subject: `Welcome to Velora Living — and 10% off your first rug`,
    html: shell(inner, "You're on the list. Here's 10% off your first rug."),
    text,
  }
}
