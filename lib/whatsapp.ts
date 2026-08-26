/**
 * Click-to-WhatsApp.
 *
 * Every CTA on the site opens a WhatsApp conversation with the studio, pre-filled
 * with a message the visitor can send as-is. This is the primary conversion path
 * for Meta ad traffic: an ad click that lands on a chat converts far better than
 * one that lands on a form, because the visitor never has to type anything.
 *
 * The number lives here and nowhere else. It is public information printed on the
 * page, so it is not an env var — but it IS the studio's real WhatsApp Business
 * line, so change it in one place if it ever moves.
 */

/** International format, digits only — the shape wa.me expects. No +, no spaces. */
export const whatsappNumber = '919879535039'

/** Human-readable, for anywhere the number is displayed rather than linked. */
export const whatsappDisplay = '+91 98795 35039'

/** What a visitor sends when no particular rug is in view. */
export const generalMessage = "Hi, I'd like to know more about Velora Living rugs."

/**
 * The pre-filled message for a specific rug.
 *
 * Naming the rug matters more than it looks: the studio sees the code in the very
 * first message, so a reply can quote real sizes and pricing without a round trip
 * asking "which one?".
 */
export function rugMessage(name: string, code: string): string {
  return `Hi, I'm interested in the ${name} rug (${code}) — could you share sizes & pricing?`
}

/** The message for a size enquiry raised from the size guide. */
export function sizeMessage(size: string): string {
  return `Hi, I'd like to know more about Velora Living rugs in ${size} — could you share options & pricing?`
}

/**
 * Builds the deep link.
 *
 * `wa.me` is Meta's own redirector: on a phone it opens the WhatsApp app, on a
 * desktop it opens WhatsApp Web or the desktop client. Using it rather than
 * `whatsapp://` means the link degrades to a working web page instead of a dead
 * scheme when WhatsApp isn't installed.
 */
export function whatsappLink(message: string = generalMessage): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
