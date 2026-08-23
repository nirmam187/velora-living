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

/** An extra photograph of the rug in a room, shown in the rug viewer. */
export interface StyledPhoto {
  /** Path under /public. */
  src: string
  alt: string
  width: number
  height: number
}

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
  /**
   * Extra room photographs. The rug viewer shows these as a thumbnail strip
   * beneath the main image, so a rug can be seen in situ as well as flat.
   */
  styled?: StyledPhoto[]
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

  {
    code: 'VLR-121',
    name: 'Afreen',
    collection: 'classic',
    description:
      'A Persian floral field on soft sky blue, framed by a hand-drawn camel border.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-121-afreen.jpg',
    alt: 'Afreen rug, blue Persian floral field with a camel and ivory border',
    width: 823,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-121-afreen-styled-1.jpg',
        alt: 'Afreen rug beneath a carved coffee table in a panelled sitting room with a tan leather chesterfield',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-121-afreen-styled-2.jpg',
        alt: 'Afreen rug in a sunlit living room with a leather sofa and a navy velvet armchair',
        width: 1400,
        height: 933,
      },
    ],
    inGallery: true,
    galleryAlt: 'Afreen rug styled in a classic living room',
  },
  {
    code: 'VLR-125',
    name: 'Gul',
    collection: 'classic',
    description:
      'Oversized roses drawn tone on tone in dusty rose and blush — floral, but quietly so.',
    materials: ['Blended Wool', 'Silk Blend'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-125-gul.jpg',
    alt: 'Gul rug, blush roses on a dusty rose ground',
    width: 959,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-125-gul-styled-1.jpg',
        alt: 'Gul rug anchoring a cream sectional and round oak table in a light-filled living room',
        width: 1400,
        height: 1050,
      },
    ],
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
  {
    code: 'VLR-122',
    name: 'Candy',
    collection: 'modern',
    description:
      'Ribboned waves of clay, indigo and ivory that ripple right across the floor.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-122-candy.jpg',
    alt: 'Candy rug, rippling waves of clay pink, blue and ivory',
    width: 986,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-122-candy-styled-1.jpg',
        alt: 'Candy rug under a curved bouclé sofa in a bright, arched-window living room',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-122-candy-styled-2.jpg',
        alt: 'Candy rug running the length of a calm neutral bedroom',
        width: 1400,
        height: 1072,
      },
      {
        src: '/images/rugs/vlr-122-candy-styled-3.jpg',
        alt: 'Candy rug in a warm, lamp-lit room with a navy velvet sofa',
        width: 1400,
        height: 1120,
      },
    ],
    inGallery: true,
    galleryAlt: 'Candy rug styled in a modern living room',
  },
  {
    code: 'VLR-123',
    name: 'Coastal',
    collection: 'modern',
    description:
      'A weathered shoreline in wool — turquoise water breaking against charcoal and sand.',
    materials: ['Blended Wool', 'Silk Blend'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-123-coastal.jpg',
    alt: 'Coastal rug, turquoise abstract shoreline against charcoal and sand',
    width: 949,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-123-coastal-styled-1.jpg',
        alt: 'Coastal rug in a concrete-floored living room with a charcoal sofa and teal armchair',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-123-coastal-styled-2.jpg',
        alt: 'Coastal rug beside a low platform bed in a soft grey bedroom',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-123-coastal-styled-3.jpg',
        alt: 'Close view of the Coastal rug pile, turquoise dissolving into stone grey',
        width: 1400,
        height: 1400,
      },
    ],
    inGallery: true,
    galleryAlt: 'Coastal rug styled in a modern interior',
  },
  {
    code: 'VLR-124',
    name: 'Garden Whispers',
    collection: 'modern',
    description:
      'Big graphic blooms in teal, sage and olive, carved into an ivory ground.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-124-garden-whispers.jpg',
    alt: 'Garden Whispers rug, bold teal and olive blooms on ivory',
    width: 980,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-124-garden-whispers-styled-1.jpg',
        alt: 'Garden Whispers rug under a round oak table in a sunlit living room',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-124-garden-whispers-styled-2.jpg',
        alt: 'Garden Whispers rug beside a linen-dressed bed in a bright bedroom',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-124-garden-whispers-styled-3.jpg',
        alt: 'Close view of the Garden Whispers pile, showing the carved outline around each bloom',
        width: 1400,
        height: 1400,
      },
    ],
    inGallery: true,
    galleryAlt: 'Garden Whispers rug styled in an interior',
  },
  {
    code: 'VLR-126',
    name: 'Jazz',
    collection: 'modern',
    description:
      'Retro arcs in rust, olive, ochre and navy, looping across a cream ground.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-126-jazz.jpg',
    alt: 'Jazz rug, retro rust, olive and navy arcs on cream',
    width: 957,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-126-jazz-styled-1.jpg',
        alt: 'Jazz rug under a bouclé sectional and walnut coffee table',
        width: 1400,
        height: 1050,
      },
      {
        src: '/images/rugs/vlr-126-jazz-styled-2.jpg',
        alt: 'Jazz rug beneath a round dining table in an olive-walled dining room',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-126-jazz-styled-3.jpg',
        alt: 'Jazz rug as a hallway runner beside a walnut console',
        width: 1400,
        height: 1400,
      },
      {
        src: '/images/rugs/vlr-126-jazz-styled-4.jpg',
        alt: 'Close view of the Jazz rug pile, showing the banded arcs in cut wool',
        width: 1400,
        height: 1400,
      },
    ],
    inGallery: true,
    galleryAlt: 'Jazz rug styled in an interior',
  },
  {
    code: 'VLR-127',
    name: 'Magnolia',
    collection: 'modern',
    description:
      'Colour blocked in blush, sage and cobalt — a quiet grid with a painterly hand.',
    materials: ['New Zealand Wool'],
    weave: 'Hand Tufted',
    image: '/images/rugs/vlr-127-magnolia.jpg',
    alt: 'Magnolia rug, blocks of blush, sage, cobalt and grey on ivory',
    width: 955,
    height: 1400,
    styled: [
      {
        src: '/images/rugs/vlr-127-magnolia-styled-1.jpg',
        alt: 'Magnolia rug under a cream sofa and round table in a sunlit living room',
        width: 1400,
        height: 933,
      },
      {
        src: '/images/rugs/vlr-127-magnolia-styled-2.jpg',
        alt: 'Close view of the Magnolia rug, sunlight falling across the colour blocks',
        width: 1400,
        height: 1400,
      },
    ],
    inGallery: true,
    galleryAlt: 'Magnolia rug styled in an interior',
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
  'VLR-124',
  'VLR-117',
  'VLR-122',
  'VLR-02',
  'VLR-126',
  'VLR-118',
  'VLR-121',
  'VLR-115',
  'VLR-123',
  'VLR-10',
  'VLR-127',
] as const

/**
 * The photograph the gallery strip shows. "In the Wild" is about rooms, so a
 * rug with room photography leads with one; the rest fall back to the catalogue
 * shot.
 */
export function galleryImageFor(product: Product): { src: string; alt: string } {
  const styled = product.styled?.[0]
  const src = styled?.src ?? product.image
  const alt = product.galleryAlt ?? styled?.alt ?? product.alt
  return { src, alt }
}

export function galleryProducts(): Product[] {
  return galleryOrder
    .map((code) => productByCode(code))
    .filter((p): p is Product => Boolean(p))
}

export const spotlightProduct = productByCode(SPOTLIGHT_CODE)!
