import { promises as fs } from 'node:fs'
import path from 'node:path'
import { Resend } from 'resend'
import { site } from './site'

/**
 * Transactional email.
 *
 * Two providers, chosen by EMAIL_PROVIDER:
 *
 *   resend   — real delivery through Resend. Requires RESEND_API_KEY.
 *   console  — nothing leaves the machine. The rendered message is logged and
 *              written to .mail-preview/*.html so you can open it in a browser.
 *
 * When EMAIL_PROVIDER is unset the provider is inferred: `resend` if
 * RESEND_API_KEY is present, otherwise `console`. That means local dev works with
 * no configuration at all, and production starts sending the moment the key is set.
 *
 * Sending never throws into the request path. An enquiry that is safely in the
 * database is a success from the visitor's point of view even if the notification
 * email fails, so failures are logged and reported in the return value instead.
 */

export type EmailProvider = 'resend' | 'console'

export interface SendArgs {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  /** Used for the preview filename in console mode. */
  tag?: string
}

export interface SendResult {
  ok: boolean
  provider: EmailProvider
  id?: string
  error?: string
  /** Local file path in console mode. */
  previewPath?: string
}

export function emailProvider(): EmailProvider {
  const explicit = process.env.EMAIL_PROVIDER?.toLowerCase()
  if (explicit === 'resend' || explicit === 'console') return explicit
  return process.env.RESEND_API_KEY ? 'resend' : 'console'
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? 'Velora Living <onboarding@resend.dev>'
}

/** Where enquiry notifications land. */
export function ownerAddress(): string {
  return process.env.OWNER_EMAIL ?? site.email
}

let resendClient: Resend | null = null
function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    resendClient = new Resend(key)
  }
  return resendClient
}

const PREVIEW_DIR = path.join(process.cwd(), '.mail-preview')

async function writePreview(args: SendArgs): Promise<string> {
  await fs.mkdir(PREVIEW_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const slug = (args.tag ?? 'mail').replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  const file = path.join(PREVIEW_DIR, `${stamp}__${slug}.html`)
  const banner = `<!-- to: ${args.to} | subject: ${args.subject}${
    args.replyTo ? ` | reply-to: ${args.replyTo}` : ''
  } -->\n`
  await fs.writeFile(file, banner + args.html, 'utf8')
  return file
}

export async function sendMail(args: SendArgs): Promise<SendResult> {
  const provider = emailProvider()

  if (provider === 'console') {
    try {
      const previewPath = await writePreview(args)
      console.info(
        [
          '',
          '─── email (not sent — EMAIL_PROVIDER=console) ───',
          `  to:       ${args.to}`,
          `  from:     ${fromAddress()}`,
          args.replyTo ? `  reply-to: ${args.replyTo}` : null,
          `  subject:  ${args.subject}`,
          `  preview:  ${previewPath}`,
          '─────────────────────────────────────────────────',
          '',
        ]
          .filter(Boolean)
          .join('\n'),
      )
      return { ok: true, provider, previewPath }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[email] failed to write preview:', message)
      return { ok: false, provider, error: message }
    }
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: fromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    })

    if (error) {
      console.error('[email] resend rejected the message:', error)
      return { ok: false, provider, error: error.message ?? 'send failed' }
    }

    return { ok: true, provider, id: data?.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[email] send threw:', message)
    return { ok: false, provider, error: message }
  }
}
