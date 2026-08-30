/**
 * Which rugs can be stood on a customer's floor.
 *
 * A rug only appears here once its two models exist in `public/ar/` — a `.glb` for
 * Android and the 3D viewer, a `.usdz` for iPhone. Both are built by
 * `scripts/ar/build_models.py` from a flattened photograph; see `scripts/ar/flatten.py`
 * for how the photograph is squared up first.
 *
 * WHY A LIST RATHER THAN A FLAG ON EVERY RUG. Three of the hundred and ten have models
 * so far, and the button must not appear on the other hundred and seven — a "see it in
 * your room" that leads to a missing file is worse than no button at all. Keeping the
 * whitelist here means the rug viewer asks one question and the answer is never a
 * guess.
 *
 * TO ADD A RUG:
 *   python3 scripts/ar/flatten.py <photo> /tmp/flat.jpg            # add --flat if the
 *                                                                  # photo is already
 *                                                                  # straight-on
 *   python3 scripts/ar/build_models.py /tmp/flat.jpg public/ar/vlr-xxx --size 5x8
 * then add its code below. Nothing else needs changing.
 */

export interface ArModel {
  /** Rug code, matching data/products.ts or data/catalogue.ts. */
  code: string
  /**
   * The size the models were built at, written for a human. Every model is currently
   * 5 x 8 ft — the most-ordered size — because one file per rug per size does not
   * scale to nine sizes across a hundred and ten rugs. Deciding how to offer the other
   * sizes is the main thing still open on this feature.
   */
  size: string
}

const MODELS: readonly ArModel[] = [
  { code: 'VLR-121', size: '5 × 8 ft' },
  { code: 'VLR-206', size: '5 × 8 ft' },
  { code: 'VLR-244', size: '5 × 8 ft' },
]

const byCode = new Map(MODELS.map((model) => [model.code, model]))

/** The model for a rug, or undefined when it has none yet. */
export function arModelFor(code: string): ArModel | undefined {
  return byCode.get(code)
}

/** How many rugs currently have AR. Used by the prototype page's copy. */
export const arModelCount = MODELS.length
