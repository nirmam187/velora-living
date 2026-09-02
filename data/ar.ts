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
 * WHICH RUGS ARE HERE. Eighty-three of the hundred and twelve. What decides it is the
 * photograph, not the rug: a texture can only be recovered from a picture in which the
 * whole rug is visible and separable from the floor. Twenty-nine are missing for two
 * reasons, both of them photographic and neither fixable in code —
 *
 *   16 curated rugs   Styled room shots. The rug is among furniture and, in several,
 *                     runs off the frame. What was never photographed cannot be
 *                     recovered.
 *    6 catalogue rugs VLR-268 to VLR-273. Shot at a steep angle on mottled concrete
 *                     with the near edge outside the frame.
 *    7 catalogue rugs Round and oval. The model is a rectangle; these need a different
 *                     mesh, not a different texture.
 *
 * ONE TEXTURE, NINE SIZES — AND WHAT THAT COSTS. Every rug is offered in all nine
 * sizes, because size is the only question AR exists to answer. The geometry is always
 * true to life, so the amount of floor a rug covers is always right. The PATTERN is an
 * approximation on anything other than a plain rug: one photograph is stretched to
 * whichever size is picked, so a bordered rug shown at 12x15 has a border thicker than
 * the one that would be woven, because a real border stays roughly the same width as
 * the rug grows.
 *
 * That is a deliberate trade, made knowingly: the size answer is right and the pattern
 * answer is close. `isPlain` below marks the rugs where it is not a trade at all — a
 * plain rug really is just more of the same wool — so the viewer can say the honest
 * thing to each customer rather than the same hedge to everyone. The proper fix is
 * nine-patch scaling, holding the border band at a fixed width while the field
 * stretches; that is the next piece of work on this feature.
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
  'VLR-208',
  'VLR-209',
  'VLR-210',
  'VLR-213',
  'VLR-216',
  'VLR-219',
  'VLR-221',
  'VLR-201',
  'VLR-202',
  'VLR-203',
  'VLR-204',
  'VLR-205',
  'VLR-206',
  'VLR-207',
  'VLR-211',
  'VLR-212',
  'VLR-214',
  'VLR-215',
  'VLR-217',
  'VLR-218',
  'VLR-220',
  'VLR-222',
  'VLR-223',
  'VLR-224',
  'VLR-225',
  'VLR-226',
  'VLR-227',
  'VLR-228',
  'VLR-229',
  'VLR-230',
  'VLR-231',
  'VLR-232',
  'VLR-233',
  'VLR-234',
  'VLR-235',
  'VLR-236',
  'VLR-237',
  'VLR-238',
  'VLR-239',
  'VLR-240',
  'VLR-241',
  'VLR-242',
  'VLR-243',
  'VLR-244',
  'VLR-245',
  'VLR-246',
  'VLR-247',
  'VLR-248',
  'VLR-249',
  'VLR-250',
  'VLR-251',
  'VLR-252',
  'VLR-253',
  'VLR-254',
  'VLR-255',
  'VLR-256',
  'VLR-257',
  'VLR-258',
  'VLR-259',
  'VLR-260',
  'VLR-261',
  'VLR-262',
  'VLR-263',
  'VLR-264',
  'VLR-265',
  'VLR-266',
  'VLR-267',
  'VLR-274',
  'VLR-275',
  'VLR-276',
  'VLR-277',
  'VLR-278',
  'VLR-279',
  'VLR-280',
  'VLR-281',
  'VLR-282',
  'VLR-283',
  'VLR-284',
  'VLR-285',
  'VLR-286',
  'VLR-287',
  'VLR-288',
  'VLR-289',
  'VLR-121',
  'VLR-125',
  'VLR-122',
  'VLR-123',
  'VLR-124',
  'VLR-126',
  'VLR-127',
]

const arCodes = new Set(AR_RUGS)

/** Whether this rug can be shown in a room. False for most of the catalogue. */
export function hasAr(code: string): boolean {
  return arCodes.has(code)
}

/** How many rugs currently have AR. Used in copy. */
export const arRugCount = AR_RUGS.length

/**
 * The rugs where stretching one texture across nine sizes is not an approximation.
 *
 * A plain or all-over-textured rug woven larger really is just more of the same wool,
 * so what the customer sees at any size is what they would receive. Everything else
 * carries a border or a medallion that would not scale that way — see the note at the
 * top of this file — and the viewer says so rather than pretending otherwise.
 */
const PLAIN = new Set<string>([
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
])

export function isPlainRug(code: string): boolean {
  return PLAIN.has(code)
}

/**
 * The rugs that are not rectangles.
 *
 * The catalogue calls three of these "Round" and four "Oval", but every photograph shows
 * an ellipse — the descriptions are loose, and a true circle would just be an ellipse
 * with equal axes anyway. So they are all modelled as ellipses inscribed in the chosen
 * size, which also means they can use the same nine sizes as everything else: an oval
 * rug is sold as width by length exactly like a rectangular one.
 */
const ELLIPSE = new Set<string>([
  'VLR-208',
  'VLR-209',
  'VLR-210',
  'VLR-213',
  'VLR-216',
  'VLR-219',
  'VLR-221',
])

export type RugShape = 'rect' | 'ellipse'

export function rugShape(code: string): RugShape {
  return ELLIPSE.has(code) ? 'ellipse' : 'rect'
}

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
