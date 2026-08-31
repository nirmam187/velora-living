/**
 * Which rugs can be stood on a customer's floor, and at what sizes.
 *
 * HOW A RUG GETS HERE. One flattened photograph, `ar-textures/<code>.jpg`, produced by
 * `scripts/ar/flatten.py`. That is the whole input. The `.glb` for Android and the
 * `.usdz` for iPhone are written on demand by `app/ar/[file]/route.ts` from that
 * texture and a size, so nothing is committed but the photograph.
 *
 * WHY IT IS BUILT PER REQUEST RATHER THAN COMMITTED. The prototype shipped three rugs
 * at one size as six files. Nine sizes across a hundred and ten rugs is close to two
 * thousand files and something like 150 MB — several times the size of the entire
 * repository, to hold nothing but the same fourteen photographs rearranged. A rug is
 * four vertices and a JPEG; generating that on request costs a few milliseconds and
 * the answer is immutable, so it is cached at the edge and built at most once.
 *
 * WHY THESE FOURTEEN. They are the Plain & Textured rugs, and they are the ones where
 * a single texture can honestly serve every size. A plain or all-over-textured rug
 * woven at 9x12 looks like the same wool covering more floor, which is exactly what
 * stretching one texture across a larger quad shows. A BORDERED OR MEDALLION RUG DOES
 * NOT WORK THIS WAY — its border stays roughly the same width as the rug grows, so
 * stretching one texture would thicken the border along with everything else and show
 * the customer a rug that is not the one they would receive. Extending AR to the
 * traditional and modern rugs needs either a texture per size or a border-aware
 * build; it is not a matter of adding codes to the list below.
 *
 * TO ADD A PLAIN RUG:
 *   python3 scripts/ar/flatten.py public/images/catalogue/vlr-xxx.jpg ar-textures/vlr-xxx.jpg
 *   node scripts/ar/check_models.mjs
 * then add its code below. Nothing else needs changing.
 */

import { rugSizes } from './sizes'

export const FEET_TO_METRES = 0.3048

/** A size a rug can be shown at, in the form the model builders want. */
export interface ArSize {
  /** URL-safe identifier, e.g. "5x8". Appears in the model filename. */
  id: string
  /** Human label, e.g. "5 × 8 ft". */
  label: string
  widthFt: number
  lengthFt: number
}

/**
 * Every standard size is offered. There is no per-size cost now that the models are
 * generated, and size is the entire question AR is here to answer — offering only the
 * popular ones would leave the customer asking "will 9x12 fit?" with nowhere to look.
 */
export const arSizes: ArSize[] = rugSizes.map((size) => ({
  id: `${size.widthFt}x${size.lengthFt}`,
  label: size.feetLong,
  widthFt: size.widthFt,
  lengthFt: size.lengthFt,
}))

/** What the sheet opens on: the most-ordered size, and the one the copy quotes. */
export const defaultArSize = arSizes.find((size) => size.id === '5x8') ?? arSizes[0]!

export function arSizeById(id: string): ArSize | undefined {
  return arSizes.find((size) => size.id === id)
}

/**
 * The rugs with a texture in `ar-textures/`.
 *
 * Codes only. Everything else about a rug — its name, its photograph — already lives
 * in data/catalogue.ts, and duplicating any of it here would just be a second copy to
 * keep in step.
 */
const AR_RUGS: readonly string[] = [
  'VLR-201',
  'VLR-202',
  'VLR-203',
  'VLR-204',
  'VLR-205',
  'VLR-222',
  'VLR-223',
  'VLR-224',
  'VLR-225',
  'VLR-226',
  'VLR-227',
  'VLR-228',
  'VLR-284',
  'VLR-287',
]

const arCodes = new Set(AR_RUGS)

/** Whether this rug can be shown in a room. False for most of the catalogue. */
export function hasAr(code: string): boolean {
  return arCodes.has(code)
}

/** How many rugs currently have AR. Used in copy. */
export const arRugCount = AR_RUGS.length

/**
 * The URL of a model. One shape for both formats, because the route parses it back.
 *
 * The size is in the path rather than a query string on purpose: AR Quick Look and
 * Scene Viewer are handed this URL by the operating system, and a path is the thing
 * every layer between here and there caches without being asked twice.
 */
export function arModelUrl(code: string, sizeId: string, format: 'glb' | 'usdz'): string {
  return `/ar/${code.toLowerCase()}-${sizeId}.${format}`
}
