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
 *
 * WHY THERE IS A LINK AND NOT A PICTURE. Click-to-chat can carry text and nothing else
 * — `wa.me?text=` has no way to attach an image, and no amount of encoding invents one.
 * What WhatsApp does do is unfurl the first URL in a message into a preview card with
 * the page's og:image on it. So the rug's own page is the attachment: the studio and
 * the customer both see the rug in the thread, and tapping it opens the full page with
 * every photograph, the specification and the size guide.
 *
 * That is why this takes a URL rather than an image path. It must be absolute and
 * publicly reachable — WhatsApp fetches it from its own servers, so a localhost or
 * preview-protected URL renders as a bare link with no picture.
 */
export function rugMessage(name: string, code: string, url?: string): string {
  const opening = `Hi, I'm interested in the ${name} rug (${code}) — could you share sizes & pricing?`
  // On its own line and last, so the preview card sits under the message rather than
  // interrupting it, and so a client that does not unfurl still shows readable text.
  return url ? `${opening}\n\n${url}` : opening
}

/**
 * The message for an enquiry covering several rugs at once — the enquiry list.
 *
 * Each rug gets its own line with its own link. WhatsApp only unfurls the FIRST URL in
 * a message, so exactly one preview card appears, but every line stays tappable — which
 * is what the studio actually needs to quote a list of three rugs without asking which
 * three. The alternative, one link to the list itself, cannot work: the list lives in
 * the customer's own browser and there is no URL that reconstructs it.
 *
 * Sizes are included only where the customer chose one. An invented size would be worse
 * than none, because the reply would quote a price for a rug nobody asked for.
 */
export function rugListMessage(
  items: { code: string; name: string; sizeLabel?: string; url?: string }[],
): string {
  const opening =
    items.length === 1
      ? "Hi, I'd like a quote for this rug:"
      : `Hi, I'd like a quote for these ${items.length} rugs:`

  const lines = items.flatMap((item) => {
    const size = item.sizeLabel ? ` — ${item.sizeLabel}` : ''
    return item.url
      ? [`${item.name} (${item.code})${size}`, item.url, '']
      : [`${item.name} (${item.code})${size}`]
  })

  return [opening, '', ...lines].join('\n').trimEnd()
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
