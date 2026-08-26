import { z } from 'zod'
import { products } from '@/data/products'
import { catalogue } from '@/data/catalogue'

/**
 * Shared between the browser and the route handlers, so the two can never drift.
 * The client validates for fast feedback; the server validates because the client
 * can be bypassed entirely.
 */

/** Both lists: a visitor can enquire about a curated rug or a catalogue one. */
const validCodes = [
  ...products.map((p) => p.code),
  ...catalogue.map((r) => r.code),
]

/** Collapses whitespace and trims — users paste all sorts of things into forms. */
const tidy = (v: unknown) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : v

export const enquirySchema = z.object({
  name: z.preprocess(
    tidy,
    z
      .string()
      .min(2, 'Please tell us your name.')
      .max(80, 'That name is too long.'),
  ),
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z
      .string()
      .min(1, 'Please enter your email address.')
      .email('That email address does not look right.')
      .max(160, 'That email address is too long.'),
  ),
  phone: z.preprocess(
    tidy,
    z
      .string()
      .max(30, 'That phone number is too long.')
      .regex(
        /^[0-9+()\-.\s]*$/,
        'Please use digits, spaces and + ( ) - only.',
      )
      .optional()
      .or(z.literal('')),
  ),
  message: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z
      .string()
      .min(10, 'Please add a little detail — at least 10 characters.')
      .max(4000, 'That message is too long. Please keep it under 4000 characters.'),
  ),
  /** Present only when the enquiry came from a specific rug's CTA. */
  rugCode: z
    .string()
    .refine((v) => v === '' || validCodes.includes(v), 'Unknown rug code.')
    .optional()
    .or(z.literal('')),
  /**
   * Honeypot. Real users never see this field, so anything in it is a bot.
   * It deliberately accepts any value: rejecting it here would return a
   * validation error naming the field, which tells a bot exactly which input to
   * leave alone next time. The route handler checks it instead and answers with
   * a plain success.
   */
  website: z.string().max(500).optional(),
})

export type EnquiryInput = z.infer<typeof enquirySchema>

export const newsletterSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z
      .string()
      .min(1, 'Please enter your email address.')
      .email('That email address does not look right.')
      .max(160, 'That email address is too long.'),
  ),
  /** Honeypot — see the note on enquirySchema.website. */
  website: z.string().max(500).optional(),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

/** Turns a ZodError into `{ field: message }` for rendering next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    if (!out[key]) out[key] = issue.message
  }
  return out
}
