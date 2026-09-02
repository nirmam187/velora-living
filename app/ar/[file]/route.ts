/**
 * Serves a rug's 3D model, built on the spot.
 *
 *     /ar/vlr-201-5x8.glb     Android (WebXR / Scene Viewer) and the in-page 3D viewer
 *     /ar/vlr-201-9x12.usdz   iPhone and iPad (AR Quick Look)
 *
 * WHY A ROUTE AND NOT FILES ON DISK. See the note at the top of data/ar.ts: fourteen
 * rugs across nine sizes in two formats is 252 files, and the full catalogue would be
 * closer to two thousand — all of it derived from fourteen photographs. Building a
 * model is a few milliseconds of arithmetic around a JPEG that gets copied through
 * untouched, so it is cheaper to compute than to store.
 *
 * The answer never changes for a given URL, so it is served `immutable` and the CDN
 * builds each one at most once. Changing a rug's texture means changing the photograph
 * it is built from, which is a deploy.
 *
 * These headers are set here rather than in next.config.mjs, which is where they lived
 * while the models were static files. Setting them in both places would send each one
 * twice — and the Content-Type in particular has to be right: handed an
 * `application/octet-stream`, iOS downloads the file instead of opening the camera.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { FEET_TO_METRES, arSizeById, hasAr, rugShape } from '@/data/ar'
import { buildGlb } from '@/lib/ar/glb'
import { buildUsdz } from '@/lib/ar/usdz'

/** Reading the texture off disk needs Node, not the edge runtime. */
export const runtime = 'nodejs'

const CONTENT_TYPES = {
  glb: 'model/gltf-binary',
  usdz: 'model/vnd.usdz+zip',
} as const

type Format = keyof typeof CONTENT_TYPES

/**
 * Splits "vlr-201-5x8.glb" into its three parts.
 *
 * Deliberately strict. The code and size are checked against data/ar.ts rather than
 * merely pattern-matched, so this can only ever read a texture the site actually
 * publishes — the filename reaches the filesystem, and a request for
 * `../../.env-5x8.glb` should be a 404 long before it reaches `readFile`.
 */
function parse(file: string) {
  const match = /^(vlr-[0-9a-z]+)-(\d+x\d+)\.(glb|usdz)$/.exec(file)
  if (!match) return null

  const [, slug, sizeId, format] = match as unknown as [string, string, string, Format]
  const code = slug.toUpperCase()
  if (!hasAr(code)) return null

  const size = arSizeById(sizeId)
  if (!size) return null

  return { slug, code, size, format }
}

export async function GET(
  _request: Request,
  { params }: { params: { file: string } },
) {
  const parsed = parse(params.file)
  if (!parsed) {
    return new NextResponse('Not found', { status: 404 })
  }

  const { slug, code, size, format } = parsed

  let texture: Uint8Array
  try {
    texture = new Uint8Array(
      await readFile(path.join(process.cwd(), 'ar-textures', `${slug}.jpg`)),
    )
  } catch {
    // The code is on the list in data/ar.ts but its texture is missing — someone added
    // a rug there without running flatten.py. A 404 is the honest answer, and the rug
    // viewer's button is driven by the same list, so this should be unreachable.
    console.error(`[ar] no texture for ${code}`)
    return new NextResponse('Not found', { status: 404 })
  }

  // True metric size. This is the whole point of the feature: get it wrong and the
  // rug still appears on the customer's floor, confidently, at the wrong size.
  const widthM = +(size.widthFt * FEET_TO_METRES).toFixed(6)
  const lengthM = +(size.lengthFt * FEET_TO_METRES).toFixed(6)
  const name = `${code} — ${size.label}`

  // Round and oval rugs get an elliptical mesh inscribed in the same box. See
  // data/ar.ts for why they are all ellipses rather than some of them circles.
  const shape = rugShape(code)

  const model =
    format === 'glb'
      ? buildGlb({ widthM, lengthM, texture, name, shape })
      : buildUsdz({ widthM, lengthM, texture, name, stem: `${slug}-${size.id}`, shape })

  // NextResponse's body type is the DOM one, which does not admit a Uint8Array even
  // though the Node runtime accepts it happily. Handing over the underlying buffer
  // keeps the types honest; both builders allocate exactly-sized arrays, so the
  // fallback copy below is unreachable in practice and cheap insurance if that changes.
  const body =
    model.byteOffset === 0 && model.byteLength === model.buffer.byteLength
      ? (model.buffer as ArrayBuffer)
      : (model.slice().buffer as ArrayBuffer)

  return new NextResponse(body, {
    headers: {
      'Content-Type': CONTENT_TYPES[format],
      'Content-Length': String(model.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
