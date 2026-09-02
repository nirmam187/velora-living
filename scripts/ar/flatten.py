#!/usr/bin/env python3
"""
Turns a rug photographed at an angle into the flat, rectangular texture that AR needs.

WHY THIS EXISTS. Every photograph in this repo is a perspective shot — the catalogue
rugs angled on a studio floor, the curated ones styled in a room. AR wraps an image
onto a flat plane, so feeding it one of those directly would produce a rug whose
pattern is stretched at one end and squashed at the other. This script finds the four
corners of the rug in the photograph and un-warps the quadrilateral they describe back
into a true rectangle.

WHAT IT CANNOT FIX. The lighting of the original shot is baked into the result: if one
end of the rug was closer to the window it stays brighter. The far edge also carries
fewer source pixels than the near edge, so it ends up slightly softer once stretched to
the same width. Both are acceptable for a preview a customer holds up in their living
room; neither would pass for a product photograph.

USAGE
    python3 scripts/ar/flatten.py public/images/catalogue/vlr-206.jpg out.jpg
    python3 scripts/ar/flatten.py in.jpg out.jpg --corners 120,80 900,95 980,560 40,540
    python3 scripts/ar/flatten.py in.jpg out.jpg --debug corners.jpg

Corners, when given by hand, are x,y pixel pairs in this order:
    top-left  top-right  bottom-right  bottom-left
"""

from __future__ import annotations

import argparse
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

# Output texture size. 5:8 is the most-ordered rug proportion (see data/sizes.ts) and
# the aspect ratio the AR models are built at.
DEFAULT_WIDTH = 1000
DEFAULT_HEIGHT = 1600


def detect_corners(image: Image.Image) -> list[tuple[float, float]]:
    """
    Finds the rug's four corners in a studio shot.

    The rug is the one large object on an otherwise empty floor, so it can be separated
    on brightness and colour alone: the floor in these photographs is flat and almost
    neutral, while wool is either a different brightness, more saturated, or both.
    Everything that is neither is treated as background.

    The brightness test runs in whichever direction this photograph needs. Most of the
    catalogue is dark wool on a pale floor, but not all of it — VLR-223 is an ivory rug
    shot on black, and a test that only looked for pixels DARKER than the background
    found nothing at all there. Comparing the absolute difference covers both, and
    costs nothing on the shots that were already working: the largest-blob step below
    throws away the handful of floor highlights it lets in.

    From that mask the corners fall out of two sums. For any convex quadrilateral the
    top-left point minimises x+y and the bottom-right maximises it, while the top-right
    maximises x-y and the bottom-left minimises it. This is the standard trick and it
    holds for the trapezoids these photographs produce; it would NOT hold for a rug
    rotated far enough that two corners swap roles, which is why --corners exists.
    """
    small = image.convert('RGB')
    # Work at a reduced size: corner positions scale back up cleanly, and this keeps a
    # 1000x1000 source to a few hundred thousand pixels to scan.
    scale = 4
    w, h = small.size
    small = small.resize((w // scale, h // scale), Image.BILINEAR)
    pixels = np.asarray(small).astype(np.int16)

    brightness = pixels.mean(axis=2)
    # Distance from grey. A pale floor is near-neutral; dyed wool rarely is.
    saturation = pixels.max(axis=2) - pixels.min(axis=2)

    # Sample the border to learn what this photograph's background actually looks like,
    # rather than assuming pure white — several of these were shot on grey concrete and
    # VLR-223 on black.
    edge = np.concatenate([
        brightness[0, :], brightness[-1, :], brightness[:, 0], brightness[:, -1],
    ])
    background = float(np.median(edge))

    mask = (np.abs(brightness - background) > 18) | (saturation > 34)

    if mask.sum() < 50:
        raise SystemExit(
            'Could not separate the rug from the background. Pass --corners by hand.'
        )

    # Keep only the largest connected blob.
    #
    # This matters more than it sounds. These warehouse floors have painted lines and
    # seams running across them, and a dark line touching the frame edge will drag a
    # corner right off the rug — which is exactly what happened on VLR-206 before this
    # step existed. The rug is reliably the biggest single object in shot, so taking
    # the largest component throws the floor markings away without any thresholds to
    # tune per photograph.
    #
    # Closed first, so a pale highlight running across the pile cannot split one rug
    # into two smaller blobs and hand the title to a floor line.
    closed = ndimage.binary_closing(mask, structure=np.ones((5, 5)))
    labels, count = ndimage.label(closed)
    if count == 0:
        raise SystemExit('Nothing found to measure. Pass --corners by hand.')
    sizes = ndimage.sum(closed, labels, range(1, count + 1))
    mask = labels == (int(np.argmax(sizes)) + 1)

    ys, xs = np.nonzero(mask)
    if ys.size < 50:
        raise SystemExit('Rug outline too sparse to trust. Pass --corners by hand.')

    plus, minus = xs + ys, xs - ys
    corners = [
        (xs[np.argmin(plus)], ys[np.argmin(plus)]),    # top-left
        (xs[np.argmax(minus)], ys[np.argmax(minus)]),  # top-right
        (xs[np.argmax(plus)], ys[np.argmax(plus)]),    # bottom-right
        (xs[np.argmin(minus)], ys[np.argmin(minus)]),  # bottom-left
    ]
    return [(float(x * scale), float(y * scale)) for x, y in corners]


def perspective_coefficients(
    source: list[tuple[float, float]],
    width: int,
    height: int,
) -> tuple[float, ...]:
    """
    Solves the eight unknowns of the homography.

    PIL's PERSPECTIVE transform maps *output* coordinates back to *input* ones, so the
    system is built in that direction: for each of the four output corners we know the
    input point it should sample from, which is two equations each, eight in total.
    """
    target = [(0, 0), (width, 0), (width, height), (0, height)]

    matrix = []
    for (tx, ty), (sx, sy) in zip(target, source):
        matrix.append([tx, ty, 1, 0, 0, 0, -sx * tx, -sx * ty])
        matrix.append([0, 0, 0, tx, ty, 1, -sy * tx, -sy * ty])

    a = np.array(matrix, dtype=np.float64)
    b = np.array([coord for point in source for coord in point], dtype=np.float64)
    return tuple(np.linalg.solve(a, b))


def ellipse_quad(image: Image.Image) -> list[tuple[float, float]]:
    """
    Finds the bounding parallelogram of a ROUND or OVAL rug.

    Corner detection is no use here. It works by taking the extremes of x+y and x-y,
    which on an ellipse lands on four tangent points rather than four corners — feed
    those to the un-warp and the rug is sheared into a diamond.

    So the rug is measured instead of cornered. The mask's second moments give the
    centroid and the two principal axes of whatever shape it is; for a filled ellipse
    the variance along an axis is a quarter of the semi-axis squared, so the semi-axes
    fall straight out of the eigenvalues. The quad returned is the parallelogram that
    just touches the ellipse along those axes, which is exactly the region the texture
    needs: un-warped to a rectangle, the rug becomes the ellipse inscribed in it, and
    the mesh in lib/ar/glb.ts samples nothing outside that.

    Returned MAJOR AXIS FIRST — the long side of the rug maps to the long side of the
    texture. Without that, a landscape oval photographed on the floor would be squeezed
    into a portrait model and the pattern stretched the wrong way.

    This is an affine fit: it does not model the perspective foreshortening that makes
    the near half of a tilted rug bigger than the far half. On these warehouse shots,
    taken from standing height at a moderate angle, the residual is small — and far
    smaller than the shear that cornering an ellipse produces.
    """
    small = image.convert('RGB')
    scale = 4
    w, h = small.size
    small = small.resize((w // scale, h // scale), Image.BILINEAR)
    pixels = np.asarray(small).astype(np.int16)

    brightness = pixels.mean(axis=2)
    saturation = pixels.max(axis=2) - pixels.min(axis=2)
    edge = np.concatenate([
        brightness[0, :], brightness[-1, :], brightness[:, 0], brightness[:, -1],
    ])
    background = float(np.median(edge))
    mask = (np.abs(brightness - background) > 18) | (saturation > 34)

    closed = ndimage.binary_closing(mask, structure=np.ones((5, 5)))
    labels, count = ndimage.label(closed)
    if count == 0:
        raise SystemExit('Nothing found to measure. Pass --corners by hand.')
    sizes = ndimage.sum(closed, labels, range(1, count + 1))
    mask = labels == (int(np.argmax(sizes)) + 1)
    # Fill the middle: a pale field inside a dark border can leave the centre unmasked,
    # and a ring has completely different moments from the disc it should be.
    mask = ndimage.binary_fill_holes(mask)

    ys, xs = np.nonzero(mask)
    if ys.size < 50:
        raise SystemExit('Rug outline too sparse to trust. Pass --corners by hand.')

    cx, cy = xs.mean(), ys.mean()
    cov = np.cov(np.vstack([xs - cx, ys - cy]))
    values, vectors = np.linalg.eigh(cov)
    order = np.argsort(values)[::-1]            # major axis first
    values, vectors = values[order], vectors[:, order]
    # Semi-axis of a filled ellipse is twice the standard deviation along that axis.
    semi = 2.0 * np.sqrt(np.maximum(values, 1e-9))

    major = vectors[:, 0] * semi[0]
    minor = vectors[:, 1] * semi[1]
    centre = np.array([cx, cy])

    # Ordered so the MAJOR axis runs down the output image: TL TR BR BL with the
    # major axis vertical.
    corners = [
        centre - major - minor,
        centre - major + minor,
        centre + major + minor,
        centre + major - minor,
    ]
    return [(float(x * scale), float(y * scale)) for x, y in corners]


DEFAULT_INSET = 0.03

# JPEG quality for the output texture.
#
# This number is paid twice: once in the repository, and once by every customer, because
# the texture is embedded whole inside each .glb and .usdz the phone downloads. Across
# the 89 rugs, 88 costs 38 MB and 82 costs 30 MB for a difference invisible on wool seen
# at arm's length through a camera. `optimize` and `progressive` are free — they change
# the encoding, not the pixels.
DEFAULT_QUALITY = 82


def inset_quad(
    corners: list[tuple[float, float]],
    fraction: float,
) -> list[tuple[float, float]]:
    """
    Pulls the four corners in towards the middle of the rug.

    WHY THIS IS NOT OPTIONAL. Corner detection lands ON the rug's edge, give or take a
    pixel, and a pixel of floor at the FAR edge is not a pixel of floor in the output:
    that edge is the most perspective-compressed part of the photograph, so a two-pixel
    sliver of background there gets stretched across dozens of rows of the texture. The
    result is a bright or dark band ruled across one end of the rug — subtle in a
    thumbnail, and impossible to miss once the rug is lying on your floor at full size.

    Measured across all fourteen Plain & Textured rugs, every single one showed a sharp
    step at the top edge with no inset (median jump of 145 levels, worst 179). At three
    per cent it is gone on thirteen and marginal on the fourteenth. Five per cent buys
    nothing further and eats more of the rug, so three is the default.

    Scaling towards the centroid rather than trimming the output is deliberate: it
    takes the inset in SOURCE pixels, so the squashed far edge and the roomy near edge
    each give up the same amount of real rug rather than the same number of output rows.
    """
    if fraction <= 0:
        return corners
    cx = sum(x for x, _ in corners) / 4
    cy = sum(y for _, y in corners) / 4
    return [
        (cx + (x - cx) * (1 - fraction), cy + (y - cy) * (1 - fraction))
        for x, y in corners
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source')
    parser.add_argument('output')
    parser.add_argument('--width', type=int, default=DEFAULT_WIDTH)
    parser.add_argument('--height', type=int, default=DEFAULT_HEIGHT)
    parser.add_argument(
        '--corners', nargs=4, metavar='X,Y',
        help='Four x,y pairs: top-left top-right bottom-right bottom-left. '
             'Use this for room shots, where automatic detection has furniture to '
             'contend with.',
    )
    parser.add_argument(
        '--flat', action='store_true',
        help='The source is ALREADY a straight-on, full-bleed shot of the rug — the '
             'Topshot photographs of VLR-121 to VLR-127 are exactly this. Skips corner '
             'detection and un-warping entirely and just fits the image to the target '
             'aspect ratio, which keeps every pixel of an image that needs no repair.',
    )
    parser.add_argument(
        '--crop', metavar='L,T,R,B',
        help='Trim the source to this pixel box before doing anything else. These are '
             'warehouse photographs: several have stacked stock, a doorway or a pair of '
             'legs at the frame edge, and anything that is not floor competes with the '
             'rug for the largest-blob test. Cropping it away is more honest than '
             'tuning a threshold until it goes away.',
    )
    parser.add_argument(
        '--shape', choices=('rect', 'ellipse'), default='rect',
        help='Rug outline. "ellipse" fits the rug as an oval and returns the '
             'parallelogram around it, so the texture holds the rug inscribed. Use it '
             'for every round and oval rug — cornering an ellipse shears it.',
    )
    parser.add_argument(
        '--inset', type=float, default=DEFAULT_INSET,
        help='Pull the detected corners this fraction towards the centre before '
             'un-warping, to keep background out of the texture. Default '
             f'{DEFAULT_INSET}. Pass 0 to disable — useful when checking a detection.',
    )
    parser.add_argument(
        '--quality', type=int, default=DEFAULT_QUALITY,
        help=f'JPEG quality of the output texture. Default {DEFAULT_QUALITY}. Paid for '
             'twice — in the repository and in every model a customer downloads.',
    )
    parser.add_argument(
        '--debug', metavar='FILE',
        help='Also write a copy of the source with the detected corners marked, so a '
             'bad detection is obvious before it reaches a model.',
    )
    args = parser.parse_args()

    image = Image.open(args.source).convert('RGB')

    if args.crop:
        left, top, right, bottom = (int(v) for v in args.crop.split(','))
        image = image.crop((left, top, right, bottom))
        print(f'cropped to {image.size[0]}x{image.size[1]}')

    if args.flat:
        # Centre-crop to the target ratio, then scale. Cropping rather than stretching:
        # squashing a rug's border to fit a different proportion is the exact distortion
        # this whole script exists to remove.
        target = args.width / args.height
        w, h = image.size
        if w / h > target:
            new_w = int(round(h * target))
            box = ((w - new_w) // 2, 0, (w - new_w) // 2 + new_w, h)
        else:
            new_h = int(round(w / target))
            box = (0, (h - new_h) // 2, w, (h - new_h) // 2 + new_h)
        flat = image.crop(box).resize((args.width, args.height), Image.LANCZOS)
        flat.save(args.output, quality=args.quality, optimize=True, progressive=True)
        print(f'source already flat — cropped {box} and scaled')
        print(f'wrote {args.output}  ({args.width}x{args.height})')
        return

    if args.corners:
        corners = []
        for pair in args.corners:
            x, _, y = pair.partition(',')
            corners.append((float(x), float(y)))
        origin = 'given'
    elif args.shape == 'ellipse':
        corners = ellipse_quad(image)
        origin = 'fitted (ellipse)'
    else:
        corners = detect_corners(image)
        origin = 'detected'

    print(f'{origin} corners (TL TR BR BL):')
    for name, (x, y) in zip(('TL', 'TR', 'BR', 'BL'), corners):
        print(f'  {name}: {x:.0f}, {y:.0f}')

    corners = inset_quad(corners, args.inset)
    if args.inset:
        print(f'inset {args.inset:.0%} — corners used (TL TR BR BL):')
        for name, (x, y) in zip(('TL', 'TR', 'BR', 'BL'), corners):
            print(f'  {name}: {x:.0f}, {y:.0f}')

    if args.debug:
        from PIL import ImageDraw
        marked = image.copy()
        draw = ImageDraw.Draw(marked)
        draw.polygon(corners, outline=(255, 0, 0), width=4)
        for (x, y), name in zip(corners, ('TL', 'TR', 'BR', 'BL')):
            draw.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(255, 0, 0))
            draw.text((x + 12, y - 6), name, fill=(255, 0, 0))
        marked.save(args.debug, quality=88)
        print(f'wrote {args.debug}')

    coefficients = perspective_coefficients(corners, args.width, args.height)
    flat = image.transform(
        (args.width, args.height),
        Image.PERSPECTIVE,
        coefficients,
        Image.BICUBIC,
    )
    flat.save(args.output, quality=args.quality, optimize=True, progressive=True)
    print(f'wrote {args.output}  ({args.width}x{args.height})')


if __name__ == '__main__':
    sys.exit(main())
