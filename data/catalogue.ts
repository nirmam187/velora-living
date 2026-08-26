/**
 * The Velora Living full range — every rug we can currently supply, as
 * photographed in the warehouse.
 *
 * This is deliberately SEPARATE from data/products.ts. Those twenty are the
 * curated, studio-photographed pieces that carry a full specification. The rugs
 * below are catalogue reference shots: a customer can see the design and enquire
 * by code, but no weave or yarn is claimed for them, because we do not have that
 * data yet and inventing it on a page people order from would be a lie.
 *
 * WHEN THE SPEC SHEET ARRIVES: fill in `name`, `weave` and `materials` on an
 * entry and the card, the modal and the enquiry form all start showing them —
 * every consumer already treats those three fields as optional. Nothing else
 * needs to change.
 *
 * `style` is a visual grouping only (how the rug looks), not a construction
 * claim. It drives the filter buttons on the Full Range section.
 */

import { productByCode, type Material, type Weave } from './products'

export type CatalogueStyle = 'traditional' | 'modern' | 'plain'

export interface CatalogueRug {
  /** Catalogue code, unique across this file AND data/products.ts. */
  code: string
  /** Path under /public. Rendered through next/image. */
  image: string
  /** Descriptive alt text. Required — never leave this empty. */
  alt: string
  /** What the photograph shows. Written from the photo, not from a spec sheet. */
  description: string
  /** Visual grouping, used by the Full Range filters. Not a construction claim. */
  style: CatalogueStyle
  /** Intrinsic dimensions of the file on disk, needed by next/image. */
  width: number
  height: number

  /* ---- All optional until the real product data arrives. ---- */
  /** A proper product name, once this rug has one. */
  name?: string
  weave?: Weave
  materials?: Material[]
}

export const catalogueStyles: { id: CatalogueStyle; label: string }[] = [
  { id: 'traditional', label: 'Traditional' },
  { id: 'modern', label: 'Modern' },
  { id: 'plain', label: 'Plain & Textured' },
]

export const catalogue: CatalogueRug[] = [
  {
    code: 'VLR-201',
    image: '/images/catalogue/vlr-201.jpg',
    alt: 'VLR-201 — a plain charcoal-grey rug with a soft sheen',
    description: 'Charcoal, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-202',
    image: '/images/catalogue/vlr-202.jpg',
    alt: 'VLR-202 — a plain rug in dusty mauve',
    description: 'Dusty mauve, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-203',
    image: '/images/catalogue/vlr-203.jpg',
    alt: 'VLR-203 — a plain rug in denim blue',
    description: 'Denim blue, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-204',
    image: '/images/catalogue/vlr-204.jpg',
    alt: 'VLR-204 — a plain rug in soft seafoam green',
    description: 'Seafoam, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-205',
    image: '/images/catalogue/vlr-205.jpg',
    alt: 'VLR-205 — a plain rug in deep plum',
    description: 'Deep plum, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-206',
    image: '/images/catalogue/vlr-206.jpg',
    alt: 'VLR-206 — a red traditional floral rug with a green border',
    description: 'Red and green floral',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-207',
    image: '/images/catalogue/vlr-207.jpg',
    alt: 'VLR-207 — a cream and taupe rug in a rippling organic pattern',
    description: 'Cream and taupe ripple',
    style: 'modern',
    width: 562,
    height: 1000,
  },
  {
    code: 'VLR-208',
    image: '/images/catalogue/vlr-208.jpg',
    alt: 'VLR-208 — an oval black Persian rug with a central medallion',
    description: 'Oval black medallion',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-209',
    image: '/images/catalogue/vlr-209.jpg',
    alt: 'VLR-209 — an oval ivory Persian rug with a red border',
    description: 'Oval ivory floral',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-210',
    image: '/images/catalogue/vlr-210.jpg',
    alt: 'VLR-210 — an oval navy rug with a medallion and ivory border',
    description: 'Oval navy medallion',
    style: 'traditional',
    width: 842,
    height: 540,
  },
  {
    code: 'VLR-211',
    image: '/images/catalogue/vlr-211.jpg',
    alt: 'VLR-211 — a cream rug with blue and tan fan motifs',
    description: 'Cream fan motif',
    style: 'modern',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-212',
    image: '/images/catalogue/vlr-212.jpg',
    alt: 'VLR-212 — a burgundy Persian rug in an allover pattern',
    description: 'Burgundy allover',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-213',
    image: '/images/catalogue/vlr-213.jpg',
    alt: 'VLR-213 — an oval black rug with a rosette medallion and ivory border',
    description: 'Oval black rosette',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-214',
    image: '/images/catalogue/vlr-214.jpg',
    alt: 'VLR-214 — an ivory Persian rug with red floral panels',
    description: 'Ivory panel',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-215',
    image: '/images/catalogue/vlr-215.jpg',
    alt: 'VLR-215 — a cream rug scattered with small pink and blue flowers',
    description: 'Scattered meadow',
    style: 'modern',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-216',
    image: '/images/catalogue/vlr-216.jpg',
    alt: 'VLR-216 — a round red rug with a central medallion',
    description: 'Round red medallion',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-217',
    image: '/images/catalogue/vlr-217.jpg',
    alt: 'VLR-217 — a black-ground Persian rug with a bordered heritage pattern',
    description: 'Black heritage',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-218',
    image: '/images/catalogue/vlr-218.jpg',
    alt: 'VLR-218 — an ivory Persian rug with a bordered heritage pattern',
    description: 'Ivory heritage',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-219',
    image: '/images/catalogue/vlr-219.jpg',
    alt: 'VLR-219 — a round ivory rug with a rosette medallion and red border',
    description: 'Round ivory rosette',
    style: 'traditional',
    width: 838,
    height: 529,
  },
  {
    code: 'VLR-220',
    image: '/images/catalogue/vlr-220.jpg',
    alt: 'VLR-220 — a black Persian rug in an allover floral pattern',
    description: 'Black allover',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-221',
    image: '/images/catalogue/vlr-221.jpg',
    alt: 'VLR-221 — a round chocolate-brown rug with a central medallion',
    description: 'Round chocolate medallion',
    style: 'traditional',
    width: 1000,
    height: 562,
  },
  {
    code: 'VLR-222',
    image: '/images/catalogue/vlr-222.jpg',
    alt: 'VLR-222 — a plain rug in ink black',
    description: 'Ink black, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-223',
    image: '/images/catalogue/vlr-223.jpg',
    alt: 'VLR-223 — a plain rug in ivory',
    description: 'Ivory, plain',
    style: 'plain',
    width: 1000,
    height: 750,
  },
  {
    code: 'VLR-224',
    image: '/images/catalogue/vlr-224.jpg',
    alt: 'VLR-224 — a plain rug in jet black',
    description: 'Jet black, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-225',
    image: '/images/catalogue/vlr-225.jpg',
    alt: 'VLR-225 — a plain rug in navy',
    description: 'Navy, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-226',
    image: '/images/catalogue/vlr-226.jpg',
    alt: 'VLR-226 — a plain rug in slate blue',
    description: 'Slate blue, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-227',
    image: '/images/catalogue/vlr-227.jpg',
    alt: 'VLR-227 — a plain rug in warm taupe',
    description: 'Taupe, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-228',
    image: '/images/catalogue/vlr-228.jpg',
    alt: 'VLR-228 — a plain rug in camel',
    description: 'Camel, plain',
    style: 'plain',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-229',
    image: '/images/catalogue/vlr-229.jpg',
    alt: 'VLR-229 — a red Persian rug with a broad ivory border',
    description: 'Red bordered Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-230',
    image: '/images/catalogue/vlr-230.jpg',
    alt: 'VLR-230 — a faded grey and ivory rug with a vintage medallion',
    description: 'Vintage grey medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-231',
    image: '/images/catalogue/vlr-231.jpg',
    alt: 'VLR-231 — an ivory and grey tribal medallion rug with fringed ends',
    description: 'Fringed tribal medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-232',
    image: '/images/catalogue/vlr-232.jpg',
    alt: 'VLR-232 — an ivory rug with a tribal medallion in muted tones',
    description: 'Ivory tribal medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-233',
    image: '/images/catalogue/vlr-233.jpg',
    alt: 'VLR-233 — an ivory Persian rug in a fine allover pattern',
    description: 'Ivory allover Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-234',
    image: '/images/catalogue/vlr-234.jpg',
    alt: 'VLR-234 — a distressed grey rug in a diamond lattice',
    description: 'Grey diamond lattice',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-235',
    image: '/images/catalogue/vlr-235.jpg',
    alt: 'VLR-235 — a grey and blue rug with a brushed, painterly surface',
    description: 'Brushed grey',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-236',
    image: '/images/catalogue/vlr-236.jpg',
    alt: 'VLR-236 — an ivory and grey lattice rug with rust accents',
    description: 'Lattice with rust',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-237',
    image: '/images/catalogue/vlr-237.jpg',
    alt: 'VLR-237 — a grey rug with a tribal medallion',
    description: 'Grey tribal medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-238',
    image: '/images/catalogue/vlr-238.jpg',
    alt: 'VLR-238 — a navy Persian rug in an allover pattern',
    description: 'Navy allover Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-239',
    image: '/images/catalogue/vlr-239.jpg',
    alt: 'VLR-239 — a blue Persian rug with a central medallion',
    description: 'Blue medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-240',
    image: '/images/catalogue/vlr-240.jpg',
    alt: 'VLR-240 — a grey rug in faceted geometric triangles',
    description: 'Grey facets',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-241',
    image: '/images/catalogue/vlr-241.jpg',
    alt: 'VLR-241 — a navy rug with a distressed lattice',
    description: 'Navy lattice',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-242',
    image: '/images/catalogue/vlr-242.jpg',
    alt: 'VLR-242 — a navy and grey rug in faceted triangles',
    description: 'Navy facets',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-243',
    image: '/images/catalogue/vlr-243.jpg',
    alt: 'VLR-243 — a navy Persian rug with a large medallion',
    description: 'Navy medallion Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-244',
    image: '/images/catalogue/vlr-244.jpg',
    alt: 'VLR-244 — an ivory and beige rug with a weathered surface',
    description: 'Weathered ivory',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-245',
    image: '/images/catalogue/vlr-245.jpg',
    alt: 'VLR-245 — an ivory Persian rug with a central medallion',
    description: 'Ivory medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-246',
    image: '/images/catalogue/vlr-246.jpg',
    alt: 'VLR-246 — a blue rug scattered with diamond motifs',
    description: 'Blue diamonds',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-247',
    image: '/images/catalogue/vlr-247.jpg',
    alt: 'VLR-247 — a grey rug with a weathered, woven surface',
    description: 'Weathered grey',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-248',
    image: '/images/catalogue/vlr-248.jpg',
    alt: 'VLR-248 — a navy rug with a weathered, woven surface',
    description: 'Weathered navy',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-249',
    image: '/images/catalogue/vlr-249.jpg',
    alt: 'VLR-249 — an ivory rug in faceted triangles with red accents',
    description: 'Ivory facets',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-250',
    image: '/images/catalogue/vlr-250.jpg',
    alt: 'VLR-250 — a red Persian rug with a central medallion',
    description: 'Red medallion Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-251',
    image: '/images/catalogue/vlr-251.jpg',
    alt: 'VLR-251 — a grey rug with a faded vintage medallion',
    description: 'Grey vintage medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-252',
    image: '/images/catalogue/vlr-252.jpg',
    alt: 'VLR-252 — a navy and white rug in vertical streaks',
    description: 'Indigo streaks',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-253',
    image: '/images/catalogue/vlr-253.jpg',
    alt: 'VLR-253 — an ivory rug washed with rust and grey',
    description: 'Rust wash',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-254',
    image: '/images/catalogue/vlr-254.jpg',
    alt: 'VLR-254 — an ivory rug with a navy medallion',
    description: 'Ivory and navy medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-255',
    image: '/images/catalogue/vlr-255.jpg',
    alt: 'VLR-255 — a faded grey and blue Persian rug',
    description: 'Faded blue Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-256',
    image: '/images/catalogue/vlr-256.jpg',
    alt: 'VLR-256 — a deep red Persian rug with a central medallion',
    description: 'Deep red medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-257',
    image: '/images/catalogue/vlr-257.jpg',
    alt: 'VLR-257 — an ivory Persian rug with blue allover detail',
    description: 'Ivory and blue allover',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-258',
    image: '/images/catalogue/vlr-258.jpg',
    alt: 'VLR-258 — an ivory Persian rug with red allover detail',
    description: 'Ivory and red allover',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-259',
    image: '/images/catalogue/vlr-259.jpg',
    alt: 'VLR-259 — a grey and black rug with a broken lattice',
    description: 'Charcoal lattice',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-260',
    image: '/images/catalogue/vlr-260.jpg',
    alt: 'VLR-260 — a red Persian rug with twin medallions',
    description: 'Twin medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-261',
    image: '/images/catalogue/vlr-261.jpg',
    alt: 'VLR-261 — an ivory rug with a Moroccan diamond trellis',
    description: 'Ivory Moroccan diamond',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-262',
    image: '/images/catalogue/vlr-262.jpg',
    alt: 'VLR-262 — a blue Persian rug in an allover pattern',
    description: 'Blue allover Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-263',
    image: '/images/catalogue/vlr-263.jpg',
    alt: 'VLR-263 — an ivory rug with a Moroccan trellis in earth tones',
    description: 'Moroccan trellis',
    style: 'modern',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-264',
    image: '/images/catalogue/vlr-264.jpg',
    alt: 'VLR-264 — a grey and blue rug with a central medallion',
    description: 'Grey blue medallion',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-265',
    image: '/images/catalogue/vlr-265.jpg',
    alt: 'VLR-265 — a grey rug with broad brushstroke marks',
    description: 'Grey brushstroke',
    style: 'modern',
    width: 1000,
    height: 980,
  },
  {
    code: 'VLR-266',
    image: '/images/catalogue/vlr-266.jpg',
    alt: 'VLR-266 — a red Persian rug with an elaborate border',
    description: 'Red bordered heritage',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-267',
    image: '/images/catalogue/vlr-267.jpg',
    alt: 'VLR-267 — a grey and blue Persian rug in an allover pattern',
    description: 'Grey allover Persian',
    style: 'traditional',
    width: 1000,
    height: 1000,
  },
  {
    code: 'VLR-268',
    image: '/images/catalogue/vlr-268.jpg',
    alt: 'VLR-268 — a faded blush rug with a fine medallion',
    description: 'Blush medallion',
    style: 'traditional',
    width: 1000,
    height: 750,
  },
  {
    code: 'VLR-269',
    image: '/images/catalogue/vlr-269.jpg',
    alt: 'VLR-269 — a faded blush rug in an allover pattern',
    description: 'Blush allover',
    style: 'traditional',
    width: 750,
    height: 1000,
  },
  {
    code: 'VLR-270',
    image: '/images/catalogue/vlr-270.jpg',
    alt: 'VLR-270 — a faded blush rug in an allover pattern with coral tones',
    description: 'Blush allover, coral',
    style: 'traditional',
    width: 1000,
    height: 750,
  },
  {
    code: 'VLR-271',
    image: '/images/catalogue/vlr-271.jpg',
    alt: 'VLR-271 — a softly faded blush rug in an allover pattern',
    description: 'Blush allover, soft',
    style: 'traditional',
    width: 750,
    height: 1000,
  },
  {
    code: 'VLR-272',
    image: '/images/catalogue/vlr-272.jpg',
    alt: 'VLR-272 — a faded blush rug with a mandala medallion',
    description: 'Blush mandala',
    style: 'traditional',
    width: 1000,
    height: 750,
  },
  {
    code: 'VLR-273',
    image: '/images/catalogue/vlr-273.jpg',
    alt: 'VLR-273 — a blush and grey rug with a mandala medallion',
    description: 'Blush and grey mandala',
    style: 'traditional',
    width: 750,
    height: 1000,
  },
  {
    code: 'VLR-274',
    image: '/images/catalogue/vlr-274.jpg',
    alt: 'VLR-274 — a painterly abstract rug in teal and rust',
    description: 'Teal and rust abstract',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-275',
    image: '/images/catalogue/vlr-275.jpg',
    alt: 'VLR-275 — a blue and grey rug in an abstract patchwork',
    description: 'Patchwork blue',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-276',
    image: '/images/catalogue/vlr-276.jpg',
    alt: 'VLR-276 — a blue and tan rug in intersecting planes',
    description: 'Blue planes',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-277',
    image: '/images/catalogue/vlr-277.jpg',
    alt: 'VLR-277 — a blue and white rug with a marbled surface',
    description: 'Marbled blue',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-278',
    image: '/images/catalogue/vlr-278.jpg',
    alt: 'VLR-278 — an aqua and ivory rug in a watery abstract',
    description: 'Aqua wash',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-279',
    image: '/images/catalogue/vlr-279.jpg',
    alt: 'VLR-279 — a grey and blue abstract rug',
    description: 'Grey blue abstract',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-280',
    image: '/images/catalogue/vlr-280.jpg',
    alt: 'VLR-280 — an indigo and white rug with a marbled surface',
    description: 'Marbled indigo',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-281',
    image: '/images/catalogue/vlr-281.jpg',
    alt: 'VLR-281 — a blue rug with gold marbled swirls',
    description: 'Gold marble swirl',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-282',
    image: '/images/catalogue/vlr-282.jpg',
    alt: 'VLR-282 — a rust and blue abstract rug on ivory',
    description: 'Rust and blue abstract',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-283',
    image: '/images/catalogue/vlr-283.jpg',
    alt: 'VLR-283 — an ivory rug washed with crimson',
    description: 'Crimson wash',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-284',
    image: '/images/catalogue/vlr-284.jpg',
    alt: 'VLR-284 — a plain rug in pale sage',
    description: 'Pale sage, plain',
    style: 'plain',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-285',
    image: '/images/catalogue/vlr-285.jpg',
    alt: 'VLR-285 — a blue rug with a copper geometric web',
    description: 'Copper web',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-286',
    image: '/images/catalogue/vlr-286.jpg',
    alt: 'VLR-286 — a blue and tan rug with marbled swirls',
    description: 'Blue marble swirl',
    style: 'modern',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-287',
    image: '/images/catalogue/vlr-287.jpg',
    alt: 'VLR-287 — a plain rug in silver grey with a soft sheen',
    description: 'Silver grey, plain',
    style: 'plain',
    width: 1000,
    height: 729,
  },
  {
    code: 'VLR-288',
    image: '/images/catalogue/vlr-288.jpg',
    alt: 'VLR-288 — a beige and brown rug in fine horizontal striations',
    description: 'Striated sand',
    style: 'modern',
    width: 488,
    height: 663,
  },
  {
    code: 'VLR-289',
    image: '/images/catalogue/vlr-289.jpg',
    alt: 'VLR-289 — a grey and beige rug in soft colour blocks',
    description: 'Grey colour block',
    style: 'modern',
    width: 540,
    height: 649,
  },
]

/** Fast lookup by code, for the enquiry form and the API route. */
const byCode = new Map(catalogue.map((rug) => [rug.code, rug]))

export function catalogueByCode(code: string): CatalogueRug | undefined {
  return byCode.get(code)
}

export function catalogueIn(style: CatalogueStyle): CatalogueRug[] {
  return catalogue.filter((rug) => rug.style === style)
}

/**
 * The label to show for a catalogue rug: its real product name once it has one,
 * otherwise the description of the photograph.
 */
export function catalogueLabel(rug: CatalogueRug): string {
  return rug.name ?? rug.description
}

/**
 * Look a code up across BOTH the curated products and this catalogue.
 * The enquiry form, the API route and the confirmation emails all take a bare
 * code from the browser, and it can now name a rug from either list.
 */
export function rugByCode(code: string): {
  code: string
  image: string
  alt: string
  /** The curated name, or the catalogue description as a stand-in. */
  label: string
} | undefined {
  const product = productByCode(code)
  if (product) {
    return {
      code: product.code,
      image: product.image,
      alt: product.alt,
      label: product.name,
    }
  }
  const rug = byCode.get(code)
  if (!rug) return undefined
  return {
    code: rug.code,
    image: rug.image,
    alt: rug.alt,
    label: catalogueLabel(rug),
  }
}
