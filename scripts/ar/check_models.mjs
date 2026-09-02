/**
 * Checks the TypeScript model builders against Apple's own validator.
 *
 * The models used to be built by scripts/ar/build_models.py and committed. They are now
 * written by lib/ar/glb.ts and lib/ar/usdz.ts and generated per request, which means
 * nobody looks at them before a customer does — so they get checked here instead.
 *
 * For every rug texture in ar-textures/, at every size, this asserts:
 *   - the .usdz passes `usdchecker --arkit`, Apple's own conformance check;
 *   - its entries are stored uncompressed and 64-byte aligned, which is what lets
 *     Quick Look memory-map the archive;
 *   - the .glb parses as glTF 2.0 and its vertices are at the true metric size.
 *
 * USAGE
 *     node scripts/ar/check_models.mjs            # every texture, the default size
 *     node scripts/ar/check_models.mjs --all      # every texture at all nine sizes
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// The app is compiled by Next, which resolves `./sizes` to `./sizes.ts` for you. Plain
// Node does not, so the two lines below teach it the same trick — otherwise this script
// could only check the builders against a second, hand-copied list of sizes, which is
// exactly the copy that would drift and let a wrong-sized rug through.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) {
      const candidate = new URL(specifier + '.ts', context.parentURL)
      if (existsSync(fileURLToPath(candidate))) return next(candidate.href, context)
    }
    return next(specifier, context)
  },
})

const { buildGlb } = await import('../../lib/ar/glb.ts')
const { buildUsdz } = await import('../../lib/ar/usdz.ts')
const { arSizes, FEET_TO_METRES, rugShape } = await import('../../data/ar.ts')

const all = process.argv.includes('--all')
const work = mkdtempSync(join(tmpdir(), 'ar-check-'))
const textures = readdirSync('ar-textures').filter((f) => f.endsWith('.jpg'))
if (textures.length === 0) throw new Error('no textures in ar-textures/')

let checked = 0
const failures = []

function fail(what, why) {
  failures.push(`${what}: ${why}`)
}

/** Walks the zip's local headers, the way Quick Look does. */
function inspectZip(bytes, label) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 0
  const names = []
  while (offset + 4 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const method = view.getUint16(offset + 8, true)
    const size = view.getUint32(offset + 18, true)
    const nameLength = view.getUint16(offset + 26, true)
    const extraLength = view.getUint16(offset + 28, true)
    const name = new TextDecoder().decode(
      bytes.subarray(offset + 30, offset + 30 + nameLength),
    )
    const dataAt = offset + 30 + nameLength + extraLength
    if (method !== 0) fail(label, `${name} is compressed (method ${method})`)
    if (dataAt % 64 !== 0) fail(label, `${name} data starts at ${dataAt}, not 64-byte aligned`)
    names.push(name)
    offset = dataAt + size
  }
  if (names.length !== 2) fail(label, `expected 2 entries, walked ${names.length}`)
  if (!names[0]?.endsWith('.usda')) fail(label, `first entry is ${names[0]}, not the .usda`)
  return names
}

function inspectGlb(bytes, label, widthM, lengthM, shape) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint32(0, true) !== 0x46546c67) return fail(label, 'not a glTF magic')
  if (view.getUint32(4, true) !== 2) return fail(label, 'not glTF version 2')
  if (view.getUint32(8, true) !== bytes.length) return fail(label, 'header length disagrees with file')
  const jsonLength = view.getUint32(12, true)
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)))
  const accessor = json.accessors[0]
  const [minX, , minZ] = accessor.min
  const [maxX, , maxZ] = accessor.max
  const gotW = +(maxX - minX).toFixed(6)
  const gotL = +(maxZ - minZ).toFixed(6)
  if (Math.abs(gotW - widthM) > 1e-6 || Math.abs(gotL - lengthM) > 1e-6) {
    fail(label, `size is ${gotW} x ${gotL} m, expected ${widthM} x ${lengthM}`)
  }
  if (json.images[0].mimeType !== 'image/jpeg') fail(label, 'texture is not a jpeg')
  if (!json.materials[0].doubleSided) fail(label, 'material is not double-sided')

  // A rectangle is 4 vertices; an ellipse is a fan of RIM_SEGMENTS + 1. Getting this
  // wrong would ship a round rug as a rectangle, which is exactly the fault the
  // elliptical mesh exists to prevent — and it would look plausible in a thumbnail.
  const vertices = accessor.count
  if (shape === 'rect' && vertices !== 4) fail(label, `rect mesh has ${vertices} vertices, expected 4`)
  if (shape === 'ellipse' && vertices < 32) fail(label, `ellipse mesh has only ${vertices} vertices`)
}

const sizes = all ? arSizes : arSizes.filter((s) => s.id === '5x8')

for (const file of textures) {
  const stem = file.replace(/\.jpg$/, '')
  const texture = new Uint8Array(readFileSync(join('ar-textures', file)))
  for (const size of sizes) {
    const widthM = +(size.widthFt * FEET_TO_METRES).toFixed(6)
    const lengthM = +(size.lengthFt * FEET_TO_METRES).toFixed(6)
    const label = `${stem} ${size.id}`

    const shape = rugShape(stem.toUpperCase())

    inspectGlb(
      buildGlb({ widthM, lengthM, texture, name: stem.toUpperCase(), shape }),
      label,
      widthM,
      lengthM,
      shape,
    )

    const usdz = buildUsdz({ widthM, lengthM, texture, name: stem.toUpperCase(), stem, shape })
    inspectZip(usdz, label)
    const path = join(work, `${stem}-${size.id}.usdz`)
    writeFileSync(path, usdz)
    // usdchecker prints a "Validation Result" banner either way and reports the
    // verdict on the last line, so the verdict is what gets read — not merely whether
    // it wrote anything.
    try {
      const out = execFileSync('usdchecker', ['--arkit', path], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      if (!/^Success!$/m.test(out)) fail(label, `usdchecker --arkit: ${out.trim()}`)
    } catch (error) {
      fail(label, `usdchecker --arkit failed:\n${error.stdout ?? ''}${error.stderr ?? ''}`)
    }
    checked++
  }
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n`)
  for (const line of failures) console.error(`  ✗ ${line}`)
  process.exit(1)
}
const ellipses = textures.filter((f) => rugShape(f.replace(/\.jpg$/, '').toUpperCase()) === 'ellipse').length
console.log(
  `✓ ${checked} model pair(s) across ${textures.length} rug(s) ` +
    `(${ellipses} elliptical) — usdchecker --arkit clean, 64-byte aligned, true to size`,
)
