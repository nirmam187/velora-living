/**
 * One rug, whichever list it came from.
 *
 * WHY THIS EXISTS. The range is described by two files that disagree about how much
 * they know. data/products.ts holds the twenty-three curated rugs with a full
 * specification — weave, yarn, room photographs, sometimes a story. data/catalogue.ts
 * holds the eighty-nine Full Range rugs, which have a photograph and an honest
 * description of it and nothing else, because no spec sheet exists for them yet.
 *
 * That split is right for the data and wrong for a page. A customer landing on
 * /rugs/vlr-201 does not care which array a rug lives in, and neither does a rug page,
 * a sitemap, a breadcrumb or a WhatsApp preview. So this module presents both as one
 * shape, with the fields that only the curated rugs have marked optional — the page
 * renders what is there and omits what is not, rather than inventing a weave for a rug
 * nobody has measured.
 *
 * RELATIONSHIP TO `rugByCode` IN catalogue.ts. That function does the same join much
 * more narrowly, for the enquiry API and the confirmation emails, and it predates this
 * one. It is deliberately left alone: it is on the path that writes to the database and
 * sends mail, and widening it to serve pages would put page concerns on that path. If
 * the two ever need to agree about something, they should agree here.
 */

import {
  catalogue,
  catalogueLabel,
  catalogueStyles,
  type CatalogueRug,
  type CatalogueStyle,
} from './catalogue'
import {
  collections,
  products,
  type CollectionId,
  type Material,
  type Product,
  type Weave,
} from './products'
import { hasAr } from './ar'

/** A photograph of the rug. The first is the catalogue shot; the rest are room shots. */
export interface RugPhoto {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface RugView {
  /** Catalogue code as written in the data, e.g. "VLR-201". */
  code: string
  /** URL segment — the code, lowercased. */
  slug: string
  /** Canonical path to this rug's page. */
  href: string
  /** What to call it: the product name, or the description of the photograph. */
  name: string
  /** One line about the rug. */
  description: string
  /** Display grouping, e.g. "Classic Heritage" or "Full Range — Plain & Textured". */
  category: string
  /** Which list it came from. Drives breadcrumbs and the "more like this" row. */
  group: 'curated' | 'catalogue'
  collection?: CollectionId
  style?: CatalogueStyle
  /** Every photograph, catalogue shot first. Never empty. */
  photos: RugPhoto[]

  /* ---- Known only for the curated rugs. Absent is not "unknown-but-probably". ---- */
  weave?: Weave
  materials?: Material[]
  story?: string[]

  /** Whether this rug can be stood on a customer's floor. See data/ar.ts. */
  ar: boolean
}

function fromProduct(product: Product): RugView {
  const photos: RugPhoto[] = [
    {
      src: product.image,
      alt: product.alt,
      width: product.width,
      height: product.height,
    },
    ...(product.styled ?? []).map((photo) => ({
      src: photo.src,
      alt: photo.alt,
      width: photo.width,
      height: photo.height,
    })),
  ]
  return {
    code: product.code,
    slug: product.code.toLowerCase(),
    href: `/rugs/${product.code.toLowerCase()}`,
    name: product.name,
    description: product.description,
    category:
      collections.find((c) => c.id === product.collection)?.label ?? product.collection,
    group: 'curated',
    collection: product.collection,
    photos,
    weave: product.weave,
    materials: product.materials,
    story: product.story,
    ar: hasAr(product.code),
  }
}

function fromCatalogue(rug: CatalogueRug): RugView {
  return {
    code: rug.code,
    slug: rug.code.toLowerCase(),
    href: `/rugs/${rug.code.toLowerCase()}`,
    name: catalogueLabel(rug),
    description: rug.description,
    category: `Full Range — ${
      catalogueStyles.find((s) => s.id === rug.style)?.label ?? rug.style
    }`,
    group: 'catalogue',
    style: rug.style,
    photos: [{ src: rug.image, alt: rug.alt, width: rug.width, height: rug.height }],
    // These three are optional on a catalogue rug and usually absent. Passing them
    // through rather than defaulting means a rug that HAS been measured starts showing
    // its spec the moment someone fills it in, with no code change.
    weave: rug.weave,
    materials: rug.materials,
    ar: hasAr(rug.code),
  }
}

/**
 * Every rug on the site, curated first.
 *
 * Built once at module load. The arrays are static data compiled into the bundle, so
 * there is nothing to invalidate and no reason to rebuild this per request.
 */
export const rugs: RugView[] = [
  ...products.map(fromProduct),
  ...catalogue.map(fromCatalogue),
]

const bySlug = new Map(rugs.map((rug) => [rug.slug, rug]))
const byCode = new Map(rugs.map((rug) => [rug.code, rug]))

// Two rugs sharing a slug would mean one of them silently unreachable — a 404 on a real
// product, which is the kind of fault that hides for months. The codes come from two
// separately maintained files, so this is checked rather than assumed.
if (bySlug.size !== rugs.length) {
  const seen = new Set<string>()
  const duplicates = rugs
    .map((rug) => rug.slug)
    .filter((slug) => (seen.has(slug) ? true : (seen.add(slug), false)))
  throw new Error(
    `Duplicate rug slug(s): ${[...new Set(duplicates)].join(', ')}. ` +
      'Rug codes must be unique across data/products.ts and data/catalogue.ts.',
  )
}

export function rugBySlug(slug: string): RugView | undefined {
  return bySlug.get(slug.toLowerCase())
}

export function rugViewByCode(code: string): RugView | undefined {
  return byCode.get(code)
}

/**
 * Other rugs to show at the foot of a rug page.
 *
 * Nearest first: same collection or style, then anything else, so a visitor looking at
 * a plain charcoal rug is offered the other plain ones before a Persian floral. Falls
 * through to the rest of the range rather than returning a short list, because an empty
 * "you might also like" row looks like a broken page.
 */
export function relatedRugs(rug: RugView, count = 4): RugView[] {
  const sameGroup = (other: RugView) =>
    rug.group === 'curated'
      ? other.collection === rug.collection
      : other.style === rug.style

  const others = rugs.filter((other) => other.code !== rug.code)
  const near = others.filter(sameGroup)
  const rest = others.filter((other) => !sameGroup(other))
  return [...near, ...rest].slice(0, count)
}

/** Every slug, for generateStaticParams. */
export const rugSlugs: string[] = rugs.map((rug) => rug.slug)
