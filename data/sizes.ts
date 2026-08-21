/**
 * The nine standard sizes, with the detail the size guide needs.
 *
 * `feet` is the label shown on the chip. `cm` is rounded to the nearest
 * centimetre from 1 ft = 30.48 cm. `note` is the practical room guidance — size is
 * the question every rug buyer actually has, and the advice below is the standard
 * furniture-placement rule rather than anything invented.
 *
 * Order matters: smallest to largest. The chip proportions in the size ladder are
 * derived from this array's length, so adding a size rescales the row automatically.
 */

export interface RugSize {
  /** Chip label, e.g. "5'x8'". */
  feet: string
  /** Long form for the detail panel, e.g. "5 × 8 ft". */
  feetLong: string
  cm: string
  widthFt: number
  lengthFt: number
  /** Where this size works, in plain language. */
  note: string
  /** Short room tag shown beside the measurements. */
  room: string
}

export const rugSizes: RugSize[] = [
  {
    feet: "2'x3'",
    feetLong: '2 × 3 ft',
    cm: '61 × 91 cm',
    widthFt: 2,
    lengthFt: 3,
    room: 'Bedside · Entryway',
    note: 'A landing spot rather than a floor covering — beside a bed, inside a front door, or in front of a basin.',
  },
  {
    feet: "3'x5'",
    feetLong: '3 × 5 ft',
    cm: '91 × 152 cm',
    widthFt: 3,
    lengthFt: 5,
    room: 'Entryway · Reading corner',
    note: 'Anchors a single armchair with a side table, or gives an entrance hall some warmth without crowding it.',
  },
  {
    feet: "4'x6'",
    feetLong: '4 × 6 ft',
    cm: '122 × 183 cm',
    widthFt: 4,
    lengthFt: 6,
    room: 'Small living room',
    note: 'Sits under a coffee table on its own, with the sofa just off the edge. Also works at the foot of a bed.',
  },
  {
    feet: "5'x8'",
    feetLong: '5 × 8 ft',
    cm: '152 × 244 cm',
    widthFt: 5,
    lengthFt: 8,
    room: 'Apartment living room',
    note: 'The most-ordered size. Put the front legs of the sofa on the rug and the coffee table fully on — the room reads as one zone.',
  },
  {
    feet: "6'x9'",
    feetLong: '6 × 9 ft',
    cm: '183 × 274 cm',
    widthFt: 6,
    lengthFt: 9,
    room: 'Living room · Dining for 4',
    note: 'Front legs of every seat on the rug. Under a four-seat dining table it leaves room to pull chairs out.',
  },
  {
    feet: "8'x10'",
    feetLong: '8 × 10 ft',
    cm: '244 × 305 cm',
    widthFt: 8,
    lengthFt: 10,
    room: 'Living room · Dining for 6',
    note: 'A generous living-room size — sofa and both armchairs land on it. Comfortable under a six-seat table.',
  },
  {
    feet: "9'x12'",
    feetLong: '9 × 12 ft',
    cm: '274 × 366 cm',
    widthFt: 9,
    lengthFt: 12,
    room: 'Large living room',
    note: 'Everything sits fully on the rug, with a border of floor showing all round. The most forgiving size to style.',
  },
  {
    feet: "10'x14'",
    feetLong: '10 × 14 ft',
    cm: '305 × 427 cm',
    widthFt: 10,
    lengthFt: 14,
    room: 'Open-plan living',
    note: 'Defines a seating area inside a larger open-plan room without touching the walls.',
  },
  {
    feet: "12'x15'",
    feetLong: '12 × 15 ft',
    cm: '366 × 457 cm',
    widthFt: 12,
    lengthFt: 15,
    room: 'Grand / open-plan',
    note: 'Our largest standard size. Beyond this, or for any other shape, we weave to your measurements.',
  },
]

/** Plain labels, in order — used by the size ladder and the rug quick-view. */
export const sizeLabels = rugSizes.map((size) => size.feet)

/** The range shown as "2×3′ – 12×15′". */
export const sizeRange = `${rugSizes[0]!.feet} – ${rugSizes[rugSizes.length - 1]!.feet}`
