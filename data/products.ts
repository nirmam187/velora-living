/**
 * The Velora Living rug catalogue — the single source of truth for every rug
 * shown on the site. Nothing about a rug is hard-coded in a component.
 *
 * TO ADD A RUG: append an entry to `products` below, drop its photo into
 * `public/images/rugs/`, and you're done. The collections section, the enquiry
 * form's rug dropdown, and the sitemap all read from this array, so a new rug
 * appears everywhere at once. Order within a collection is the display order.
 *
 * TO FEATURE A DIFFERENT RUG in the spotlight section, change `SPOTLIGHT_CODE`.
 */

export type CollectionId = 'classic' | 'modern'

export type Weave = 'Hand Tufted' | 'Hand Woven' | 'Machine Made'

export type Material =
  | 'New Zealand Wool'
  | 'Bikaneri Wool'
  | 'Blended Wool'
  | 'Silk Blend'

export interface Product {
  /** Catalogue code shown above the rug name, e.g. "VLR-119". Must be unique. */
  code: string
  name: string
  collection: CollectionId
  /** One-line description shown on the collection card. */
  description: string
  materials: Material[]
  weave: Weave
  /** Path under /public. Rendered through next/image. */
  image: string
  /** Descriptive alt text. Required — never leave this empty. */
  alt: string
  /** Intrinsic dimensions of the source file, needed by next/image. */
  width: number
  height: number
  /** Optional second photograph, used by the spotlight section. */
  detailImage?: string
  detailAlt?: string
  detailWidth?: number
  detailHeight?: number
  /** Longer copy, used by the spotlight section when this rug is featured. */
  story?: string[]
  /** Set true to include the rug in the "In the Wild" gallery strip. */
  inGallery?: boolean
  galleryAlt?: string
}

export interface Collection {
  id: CollectionId
  /** Tab label in the collections section. */
  label: string
}

export const collections: Collection[] = [
  { id: 'classic', label: 'Classic Heritage' },
  { id: 'modern', label: 'Modern Heritage' },
]

export const products: Product[] = [
  // ---------------------------------------------------------------- classic
  {
    code: 'VLR-01',
    name: 'Traditional Floral',
    collection: 'classic',
    description:
      'Rich floral patterns framed with a bold border, perfect for timeless, elegant interiors.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-01-traditional-floral.jpg',
    alt: 'VLR-01 traditional floral rug',
    width: 623,
    height: 595,
  },
  {
    code: 'VLR-02',
    name: 'Round Medallion',
    collection: 'classic',
    description:
      'Classic round design with intricate detailing, ideal for a soft statement in any space.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-02-round-medallion.jpg',
    alt: 'VLR-02 round classic rug',
    width: 623,
    height: 595,
    inGallery: true,
    galleryAlt: 'Round medallion rug styled in an interior',
  },
  {
    code: 'VLR-03',
    name: 'Ivory Rosette',
    collection: 'classic',
    description:
      'Timeless round design with elegant floral motifs and a rich traditional border.',
    materials: ['Blended Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-03-ivory-rosette.jpg',
    alt: 'VLR-03 round ivory rug',
    width: 623,
    height: 595,
  },
  {
    code: 'VLR-04',
    name: 'Heritage Medallion',
    collection: 'classic',
    description:
      'Classic medallion pattern with a refined border, adding warmth and sophistication.',
    materials: ['New Zealand Wool', 'Silk Blend'],
    weave: 'Hand Woven',
    image: '/images/rugs/vlr-04-heritage-medallion.jpg',
    alt: 'VLR-04 medallion rug',
    width: 623,
    height: 595,
  },
  {
    code: 'VLR-05',
    name: 'Ivory & Red Floral',
    collection: 'classic',
    description:
      'Elegant floral design with a soft ivory base and a rich red traditional border.',
    materials: ['Bikaneri Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-05-ivory-red-floral.jpg',
    alt: 'VLR-05 ivory red floral rug',
    width: 623,
    height: 595,
  },
  {
    code: 'VLR-06',
    name: 'Crimson & Sage',
    collection: 'classic',
    description:
      'Bold traditional pattern in rich red and green tones, framed with a heritage border.',
    materials: ['Bikaneri Wool'],
    weave: 'Hand Woven',
    image: '/images/rugs/vlr-06-crimson-sage.jpg',
    alt: 'VLR-06 red green traditional rug',
    width: 623,
    height: 595,
  },

  // ----------------------------------------------------------------- modern
  {
    code: 'VLR-119',
    name: 'Rose Meadow',
    collection: 'modern',
    description:
      'Soft florals and muted tones create a sense of calm and quiet elegance.',
    materials: ['Blended Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-119-rose-meadow.jpg',
    alt: 'Rose Meadow rug in a living room',
    width: 451,
    height: 373,
    detailImage: '/images/rugs/vlr-119-rose-meadow-detail.jpg',
    detailAlt: 'Rose Meadow rug detail, close up of woven pile',
    detailWidth: 261,
    detailHeight: 373,
    story: [
      "At Velora Living, we believe a rug is more than a décor piece — it's the soul of a space. Rooted in India's rich weaving traditions, Rose Meadow brings together timeless artistry, premium materials, and contemporary elegance.",
      "Woven in blended wool with muted rose tones, it's thoughtfully crafted to add warmth, beauty and character to modern living — available from 2×3′ up to 12×15′, or fully custom to your room.",
    ],
  },
  {
    code: 'VLR-115',
    name: 'Waveform',
    collection: 'modern',
    description:
      'A flowing rhythm of colour and movement, brought into perfect balance.',
    materials: ['Blended Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-115-waveform.jpg',
    alt: 'Waveform rug in a living room',
    width: 466,
    height: 360,
    inGallery: true,
    galleryAlt: 'Waveform rug styled in an interior',
  },
  {
    code: 'VLR-116',
    name: 'Modern Grid',
    collection: 'modern',
    description:
      'A balanced composition of colour and form — structure and softness in harmony.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-116-modern-grid.jpg',
    alt: 'Modern Grid rug in a living room',
    width: 510,
    height: 330,
  },
  {
    code: 'VLR-117',
    name: 'Botanica',
    collection: 'modern',
    description:
      "Inspired by nature's quiet beauty — organic forms in refreshing tones.",
    materials: ['Blended Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-117-botanica.jpg',
    alt: 'Botanica rug in a living room',
    width: 506,
    height: 332,
    inGallery: true,
    galleryAlt: 'Botanica rug styled in an interior',
  },
  {
    code: 'VLR-118',
    name: 'Arc & Hue',
    collection: 'modern',
    description: 'A celebration of curve and colour, bold yet balanced.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-118-arc-and-hue.jpg',
    alt: 'Arc and Hue rug in a living room',
    width: 504,
    height: 334,
    inGallery: true,
    galleryAlt: 'Arc and Hue rug styled in an interior',
  },
  {
    code: 'VLR-120',
    name: 'Aqua Abstract',
    collection: 'modern',
    description:
      'A contemporary blend of colour and texture, bringing depth and character.',
    materials: ['Blended Wool', 'Silk Blend'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-120-aqua-abstract.jpg',
    alt: 'Aqua Abstract rug in a living room',
    width: 506,
    height: 332,
  },
  {
    code: 'VLR-7',
    name: 'Textured Houndstooth',
    collection: 'modern',
    description:
      'Subtle depth in a soft, neutral palette for quiet contemporary rooms.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Woven',
    image: '/images/rugs/vlr-07-textured-houndstooth.jpg',
    alt: 'VLR-07 houndstooth textured rug',
    width: 683,
    height: 542,
  },
  {
    code: 'VLR-8',
    name: 'Concentric Square',
    collection: 'modern',
    description: 'A modern pattern adding elegance and structure to any space.',
    materials: ['Blended Wool'],
    weave: 'Machine Made',
    image: '/images/rugs/vlr-08-concentric-square.jpg',
    alt: 'VLR-08 concentric square rug',
    width: 683,
    height: 542,
  },
  {
    code: 'VLR-9',
    name: 'Bold Bloom',
    collection: 'modern',
    description: 'A vibrant floral expression, crafted to energise and inspire.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-09-bold-bloom.jpg',
    alt: 'VLR-09 bold floral rug',
    width: 623,
    height: 595,
    inGallery: true,
    galleryAlt: 'Bold Bloom rug styled in an interior',
  },
  {
    code: 'VLR-10',
    name: 'Marble Swirl',
    collection: 'modern',
    description:
      'A dynamic swirl of colour and movement for statement-making interiors.',
    materials: ['Blended Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-10-marble-swirl.jpg',
    alt: 'VLR-10 marbled swirl rug',
    width: 623,
    height: 595,
    inGallery: true,
    galleryAlt: 'Marble swirl rug styled in an interior',
  },
]

/** The rug featured in the spotlight section. Change this to feature another. */
export const SPOTLIGHT_CODE = 'VLR-119'

/**
 * Standard sizes offered on every design, smallest to largest.
 * The measurements and room guidance behind these labels live in data/sizes.ts —
 * that is the file to edit if the size ladder changes.
 */
export { sizeLabels as sizes, rugSizes, sizeRange } from './sizes'

export function productsIn(collection: CollectionId): Product[] {
  return products.filter((p) => p.collection === collection)
}

export function productByCode(code: string): Product | undefined {
  return products.find((p) => p.code === code)
}

/** The gallery strip, in the order the original site showed it. */
export const galleryOrder = [
  'VLR-9',
  'VLR-117',
  'VLR-02',
  'VLR-118',
  'VLR-115',
  'VLR-10',
] as const

export function galleryProducts(): Product[] {
  return galleryOrder
    .map((code) => productByCode(code))
    .filter((p): p is Product => Boolean(p))
}

export const spotlightProduct = productByCode(SPOTLIGHT_CODE)!
