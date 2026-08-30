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

    The rug is the one large object on an otherwise empty pale floor, so it can be
    separated on brightness and colour alone: floors in these photographs are pale and
    almost neutral, while wool is either darker, more saturated, or both. Everything
    that is neither is treated as background.

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
    # rather than assuming pure white — several of these were shot on grey concrete.
    edge = np.concatenate([
        brightness[0, :], brightness[-1, :], brightness[:, 0], brightness[:, -1],
    ])
    background = float(np.median(edge))

    mask = (brightness < background - 18) | (saturation > 34)

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
        '--debug', metavar='FILE',
        help='Also write a copy of the source with the detected corners marked, so a '
             'bad detection is obvious before it reaches a model.',
    )
    args = parser.parse_args()

    image = Image.open(args.source).convert('RGB')

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
        flat.save(args.output, quality=88)
        print(f'source already flat — cropped {box} and scaled')
        print(f'wrote {args.output}  ({args.width}x{args.height})')
        return

    if args.corners:
        corners = []
        for pair in args.corners:
            x, _, y = pair.partition(',')
            corners.append((float(x), float(y)))
        origin = 'given'
    else:
        corners = detect_corners(image)
        origin = 'detected'

    print(f'{origin} corners (TL TR BR BL):')
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
    flat.save(args.output, quality=88)
    print(f'wrote {args.output}  ({args.width}x{args.height})')


if __name__ == '__main__':
    sys.exit(main())
