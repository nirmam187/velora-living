/**
 * The Craftsmanship section — weaving techniques and yarn materials.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REPLACING THE TECHNIQUE ARTWORK WITH REAL PHOTOGRAPHS
 *
 * The three technique tiles currently use drawn diagrams rather than photographs.
 * The originals in the single-file site were crops of a brochure screenshot and
 * contained almost no image — two of them were cropped paragraphs of body text.
 *
 * When you have real photographs from Bhadohi or Mirzapur, for each entry below:
 *   1. drop the file into public/images/craft/
 *   2. point `image` at it
 *   3. set `isDiagram: false` and update `width`/`height` to the file's real size
 *   4. rewrite `alt` to describe the actual photograph
 *
 * Aim for square-ish images at 800px or more on the short side — the tiles are
 * displayed at 1:1 and go up to ~380px wide, so 800px covers retina screens.
 * Good subjects: a tufting gun against the backing cloth, hands passing weft on
 * a loom, yarn cones on a creel, a rug being sheared or washed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Technique {
  /** Matches Product['weave'] in data/products.ts, so rugs can be filtered by it. */
  name: 'Hand Tufted' | 'Hand Woven' | 'Machine Made'
  blurb: string
  image: string
  alt: string
  width: number
  height: number
  /**
   * True while `image` is a drawn diagram rather than a photograph. Diagrams are
   * rendered as a plain <img> — they are already vector and need no optimisation.
   * Set false once a real photo is in place so it goes through next/image.
   */
  isDiagram: boolean
  /** Shown in the rug quick-view when a rug uses this technique. */
  detail: string
}

export const techniques: Technique[] = [
  {
    name: 'Hand Tufted',
    blurb:
      'Expertly hand-tufted for rich texture, precision and lasting comfort.',
    image: '/images/craft/technique-hand-tufted.svg',
    alt: 'Diagram of hand tufting: loops of yarn punched through a backing cloth',
    width: 200,
    height: 200,
    isDiagram: true,
    detail:
      'Yarn is punched through a stretched backing with a hand-held tufting gun, then sheared level and finished with a canvas backing.',
  },
  {
    name: 'Hand Woven',
    blurb:
      'Traditionally hand-woven for intricate detail, strength and heirloom quality.',
    image: '/images/craft/technique-hand-woven.svg',
    alt: 'Diagram of hand weaving: weft yarns passing over and under the warp on a loom',
    width: 200,
    height: 200,
    isDiagram: true,
    detail:
      'Weft is passed over and under a tensioned warp entirely by hand on a pit or vertical loom — the slowest of the three, and the most durable.',
  },
  {
    name: 'Machine Made',
    blurb:
      'Precisely machine-made for consistent quality, design and durability.',
    image: '/images/craft/technique-machine-made.svg',
    alt: 'Diagram of machine weaving: a precisely repeated grid of identical stitches',
    width: 200,
    height: 200,
    isDiagram: true,
    detail:
      'Woven on a power loom to an exact repeat, which keeps larger sizes consistent and brings the price down.',
  },
]

export interface MaterialSwatch {
  /** Matches Product['materials'] in data/products.ts. */
  name: 'New Zealand Wool' | 'Bikaneri Wool' | 'Blended Wool' | 'Silk Blend'
  image: string
  alt: string
  width: number
  height: number
}

/**
 * These four are real photographs of Velora pile, recovered from the original
 * file. Three were small and have been upscaled, so they are a little soft — worth
 * reshooting alongside the technique photos when you get the chance.
 */
export const materials: MaterialSwatch[] = [
  {
    name: 'New Zealand Wool',
    image: '/images/materials/new-zealand-wool.jpg',
    alt: 'Close-up of chunky New Zealand wool pile in undyed cream',
    width: 480,
    height: 480,
  },
  {
    name: 'Bikaneri Wool',
    image: '/images/materials/bikaneri-wool.jpg',
    alt: 'Close-up of looped Bikaneri wool pile in soft ivory',
    width: 480,
    height: 480,
  },
  {
    name: 'Blended Wool',
    image: '/images/materials/blended-wool.jpg',
    alt: 'Close-up of blended wool pile with a soft rose sheen',
    width: 480,
    height: 480,
  },
  {
    name: 'Silk Blend',
    image: '/images/materials/silk-blend.jpg',
    alt: 'Close-up of a silk-blend rug pile showing a raised rose motif',
    width: 480,
    height: 480,
  },
]

export function techniqueByName(name: string): Technique | undefined {
  return techniques.find((t) => t.name === name)
}
